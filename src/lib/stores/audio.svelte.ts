// Audio engine store - manages AudioContext and sound generation
let audioContext: AudioContext | null = null;
let masterGainNode: GainNode | null = null;
let reverbWetGain: GainNode | null = null;

// Active oscillators tracking for cleanup
const activeOscillators = new Set<OscillatorNode>();

// Track currently playing chords for continuous playback
interface ActiveChord {
	oscillators: OscillatorNode[];
	gains: GainNode[];
	chordGain: GainNode;
	frequencies: number[];
	pointerId: number;
}
// Map to track multiple active chords by pointer ID
const activeChords = new Map<number, ActiveChord>();

// Reactive state using Svelte 5 runes
export const audioState = $state({
	isInitialized: false,
	isPlaying: false,
	masterVolume: 0.8,
	reverbMix: 0.25,
	activeNoteCount: 0,
	contextState: "suspended" as AudioContextState,
});

// Synthesize a reverb impulse response: exponentially decaying stereo noise.
// No audio assets required, and the tail length/decay give a small-hall feel.
function createImpulseResponse(
	ctx: AudioContext,
	duration = 2.5,
	decay = 3,
): AudioBuffer {
	const length = Math.max(1, Math.floor(ctx.sampleRate * duration));
	const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
	for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
		const data = buffer.getChannelData(channel);
		for (let i = 0; i < length; i++) {
			data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** decay;
		}
	}
	return buffer;
}

// Initialize audio context lazily (on first user interaction)
function initializeAudio(): AudioContext {
	if (!audioContext) {
		audioContext = new (
			window.AudioContext ||
			(window as unknown as { webkitAudioContext: typeof AudioContext })
				.webkitAudioContext
		)();

		// Create master gain for volume control
		masterGainNode = audioContext.createGain();
		masterGainNode.gain.value = audioState.masterVolume;

		// Master chain: dry signal passes straight through; a parallel
		// convolver adds the reverb tail, blended by the wet gain.
		//   masterGain ─┬────────────────────────→ destination
		//               └→ convolver → wetGain ──→ destination
		masterGainNode.connect(audioContext.destination);
		const convolver = audioContext.createConvolver();
		convolver.buffer = createImpulseResponse(audioContext);
		reverbWetGain = audioContext.createGain();
		reverbWetGain.gain.value = audioState.reverbMix;
		masterGainNode.connect(convolver);
		convolver.connect(reverbWetGain);
		reverbWetGain.connect(audioContext.destination);

		// Update reactive state
		audioState.isInitialized = true;
		audioState.contextState = audioContext.state;

		// Listen for context state changes
		audioContext.onstatechange = () => {
			if (audioContext) {
				audioState.contextState = audioContext.state;
			}
		};
	}
	return audioContext;
}

// Update volume on the audio node when setting master volume
function updateMasterGainVolume(): void {
	if (masterGainNode && audioContext) {
		masterGainNode.gain.setValueAtTime(
			audioState.masterVolume,
			audioContext.currentTime,
		);
	}
}

// Unlock audio on the first user gesture (iOS Safari requires a sound to be
// scheduled inside the gesture before the context will produce audio). Plays
// a 10ms silent oscillator on the store's own context and resumes it.
export function unlockAudio(): void {
	try {
		const ctx = initializeAudio();
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		gain.gain.value = 0; // Silent
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.start();
		osc.stop(ctx.currentTime + 0.01);
		if (ctx.state === "suspended") {
			ctx.resume();
		}
	} catch (e) {
		console.error("Failed to unlock audio:", e);
	}
}

// Reactive volume control (0-1)
export function setMasterVolume(volume: number): void {
	audioState.masterVolume = Math.max(0, Math.min(1, volume));
	updateMasterGainVolume();
}

// Remembers the last audible mix so toggling reverb back on restores it
let lastAudibleReverbMix = 0.25;

// Reactive reverb wet-mix control (0-1); 0 is fully dry
export function setReverbMix(mix: number): void {
	audioState.reverbMix = Math.max(0, Math.min(1, mix));
	if (audioState.reverbMix > 0) {
		lastAudibleReverbMix = audioState.reverbMix;
	}
	if (reverbWetGain && audioContext) {
		reverbWetGain.gain.setValueAtTime(
			audioState.reverbMix,
			audioContext.currentTime,
		);
	}
}

// On/off toggle (keyboard shortcut): off = fully dry, on = last audible mix
export function toggleReverb(): void {
	setReverbMix(audioState.reverbMix > 0 ? 0 : lastAudibleReverbMix);
}

// The AudioContext clock, for scheduling ahead (metronome); null before init
export function audioTime(): number | null {
	return audioContext ? audioContext.currentTime : null;
}

// Shared white-noise buffer for the click voice, built once per context
let clickNoiseBuffer: AudioBuffer | null = null;
function getClickNoiseBuffer(ctx: AudioContext): AudioBuffer {
	if (!clickNoiseBuffer) {
		const length = Math.max(1, Math.floor(ctx.sampleRate * 0.05));
		clickNoiseBuffer = ctx.createBuffer(1, length, ctx.sampleRate);
		const data = clickNoiseBuffer.getChannelData(0);
		for (let i = 0; i < length; i++) {
			data[i] = Math.random() * 2 - 1;
		}
	}
	return clickNoiseBuffer;
}

// Schedule a short metronome click at an exact context time. The voice is a
// ~15ms band-passed noise burst: noise has no pitch and the burst is too
// short for pitch perception to engage, so the click reads as a dry tick
// rather than a tone. The accent is brighter and louder, not higher-pitched.
// Clicks connect straight to the destination (not through the master chain)
// so they stay out of the reverb, scaled by master volume.
export function scheduleClick(atTime: number, accent = false): void {
	if (!audioContext) return;

	const source = audioContext.createBufferSource();
	source.buffer = getClickNoiseBuffer(audioContext);

	// Low Q = broad band = dry; higher center frequency = brighter accent
	const filter = audioContext.createBiquadFilter();
	filter.type = "bandpass";
	filter.frequency.setValueAtTime(accent ? 6000 : 3500, atTime);
	filter.Q.value = 1.2;

	const gain = audioContext.createGain();
	const peak = 0.5 * audioState.masterVolume * (accent ? 1.5 : 1);
	gain.gain.setValueAtTime(peak, atTime);
	gain.gain.exponentialRampToValueAtTime(0.001, atTime + 0.015);

	source.connect(filter);
	filter.connect(gain);
	gain.connect(audioContext.destination);
	source.start(atTime);
	source.stop(atTime + 0.02);
	source.onended = () => {
		source.disconnect();
		filter.disconnect();
		gain.disconnect();
	};
}

// Suspend audio while the page is hidden, resume when it returns
function handleVisibilityChange(): void {
	if (!audioContext) return;
	if (document.hidden) {
		audioContext.suspend();
	} else if (audioContext.state === "suspended") {
		audioContext.resume();
	}
}

// Module-level listener: this store is a singleton that outlives any
// component, so <svelte:document> is not applicable here
if (typeof document !== "undefined") {
	document.addEventListener("visibilitychange", handleVisibilityChange);
}

// True when the pointer is already sounding exactly these frequencies
function isAlreadyPlaying(pointerId: number, frequencies: number[]): boolean {
	const existing = activeChords.get(pointerId);
	return (
		existing !== undefined &&
		existing.frequencies.length === frequencies.length &&
		existing.frequencies.every((f, i) => f === frequencies[i])
	);
}

// Resume a suspended context; false if playback should be abandoned
async function resumeIfSuspended(ctx: AudioContext): Promise<boolean> {
	if (ctx.state !== "suspended") return true;
	try {
		await ctx.resume();
		// Small delay after resume
		await new Promise((resolve) => setTimeout(resolve, 50));
		return true;
	} catch (e) {
		console.error("Failed to resume audio context:", e);
		return false;
	}
}

// Create, connect, and start one oscillator + envelope gain per frequency.
// Cleanup is handled manually by stopChordById (no onended handlers).
function startOscillators(
	ctx: AudioContext,
	chordGain: GainNode,
	frequencies: number[],
	oscillatorType: OscillatorType,
): { oscillators: OscillatorNode[]; gains: GainNode[] } {
	const oscillators: OscillatorNode[] = [];
	const gains: GainNode[] = [];

	for (const frequency of frequencies) {
		const oscillator = ctx.createOscillator();
		const noteGain = ctx.createGain();

		oscillator.type = oscillatorType;
		oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

		// Connect: oscillator -> noteGain -> chordGain -> master
		oscillator.connect(noteGain);
		noteGain.connect(chordGain);

		// Individual note envelope (slight attack to avoid clicks)
		noteGain.gain.setValueAtTime(0, ctx.currentTime);
		noteGain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.01);

		oscillator.start(ctx.currentTime);

		activeOscillators.add(oscillator);
		oscillators.push(oscillator);
		gains.push(noteGain);
	}

	return { oscillators, gains };
}

// Start playing a chord continuously (until stopped)
export async function startChord(
	frequencies: number[],
	oscillatorType: OscillatorType,
	pointerId: number,
): Promise<void> {
	// Same chord on the same pointer: don't restart
	if (isAlreadyPlaying(pointerId, frequencies)) return;

	// Stop any chord currently playing with this pointer ID
	stopChordById(pointerId);

	// Initialize audio if needed (synchronously during user gesture)
	if (!audioContext) {
		initializeAudio();
	}
	if (!audioContext || !masterGainNode) return;
	if (!(await resumeIfSuspended(audioContext))) return;

	// Gain node for this chord (envelope + mixing), volume normalized by
	// note count, with an immediate attack for responsive feel
	const chordGain = audioContext.createGain();
	chordGain.connect(masterGainNode);
	const noteVolume = 0.3 / Math.sqrt(frequencies.length);
	chordGain.gain.setValueAtTime(0, audioContext.currentTime);
	chordGain.gain.linearRampToValueAtTime(
		noteVolume,
		audioContext.currentTime + 0.01,
	);

	const { oscillators, gains } = startOscillators(
		audioContext,
		chordGain,
		frequencies,
		oscillatorType,
	);

	activeChords.set(pointerId, {
		oscillators,
		gains,
		chordGain,
		frequencies,
		pointerId,
	});

	audioState.activeNoteCount = activeOscillators.size;
	audioState.isPlaying = true;
}

// Stop a specific chord by pointer ID
export function stopChordById(pointerId: number): void {
	if (!audioContext) return;

	const chord = activeChords.get(pointerId);
	if (!chord) return;

	// A stopping chord is no longer "playing": remove its entry immediately
	// so startChord's same-chord dedup cannot match it. (Deferring this to
	// the cleanup timer made repeated identical chords — quarter-note C C C C
	// in playback — skip every second hit, and once caused stuck drones when
	// a replacement chord reused the pointer ID mid-fade.) Node teardown
	// still happens on the timer below, via this closure's reference.
	activeChords.delete(pointerId);

	const fadeTime = 0.05;
	const currentTime = audioContext.currentTime;

	// Stop oscillators
	for (const osc of chord.oscillators) {
		try {
			osc.stop(currentTime + fadeTime);
			activeOscillators.delete(osc);
		} catch {
			// Already stopped
		}
	}

	try {
		// Fade out for smooth stop
		chord.chordGain.gain.cancelScheduledValues(currentTime);
		chord.chordGain.gain.setValueAtTime(
			chord.chordGain.gain.value,
			currentTime,
		);
		chord.chordGain.gain.exponentialRampToValueAtTime(
			0.001,
			currentTime + fadeTime,
		);
	} catch {
		// Gain might already be disconnected
	}

	// Clean up connections after fade
	setTimeout(
		() => {
			for (const gain of chord.gains) {
				try {
					gain.disconnect();
				} catch {
					// Already disconnected
				}
			}
			try {
				chord.chordGain.disconnect();
			} catch {
				// Already disconnected
			}
			audioState.activeNoteCount = activeOscillators.size;
			audioState.isPlaying = activeOscillators.size > 0;
		},
		fadeTime * 1000 + 50,
	);
}

// Stop all currently playing chords
export function stopChord(): void {
	if (!audioContext) return;

	// Stop each chord individually
	for (const [pointerId] of activeChords) {
		stopChordById(pointerId);
	}
}

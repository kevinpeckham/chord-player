// Audio engine store - manages AudioContext and sound generation
let audioContext: AudioContext | null = null;
let masterGainNode: GainNode | null = null;

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
	activeNoteCount: 0,
	contextState: "suspended" as AudioContextState,
	hasHadFirstInteraction: false,
});

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
		masterGainNode.connect(audioContext.destination);
		masterGainNode.gain.value = audioState.masterVolume;

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

// Reactive volume control (0-1)
export function setMasterVolume(volume: number): void {
	audioState.masterVolume = Math.max(0, Math.min(1, volume));
	updateMasterGainVolume();
}

// Handle page visibility to suspend/resume audio
if (typeof document !== "undefined") {
	document.addEventListener("visibilitychange", () => {
		if (document.hidden && audioContext) {
			audioContext.suspend();
		} else if (!document.hidden && audioContext?.state === "suspended") {
			audioContext.resume();
		}
	});
}

// Start playing a chord continuously (until stopped)
export async function startChord(
	frequencies: number[],
	oscillatorType: OscillatorType,
	pointerId: number,
): Promise<void> {
	// Check if this pointer is already playing these exact frequencies
	const existingChord = activeChords.get(pointerId);
	if (
		existingChord &&
		existingChord.frequencies.length === frequencies.length &&
		existingChord.frequencies.every((f, i) => f === frequencies[i])
	) {
		// Same chord, don't restart
		return;
	}

	// Stop any chord currently playing with this pointer ID
	stopChordById(pointerId);

	// Initialize audio if needed (synchronously during user gesture)
	if (!audioContext) {
		initializeAudio();
	}

	if (!audioContext || !masterGainNode) {
		return;
	}

	// Resume audio context if suspended
	if (audioContext.state === "suspended") {
		try {
			await audioContext.resume();
			// Small delay after resume
			await new Promise((resolve) => setTimeout(resolve, 50));
		} catch (e) {
			console.error("Failed to resume audio context:", e);
			return;
		}
	}

	// Create a gain node for this chord (for envelope and mixing)
	const chordGain = audioContext.createGain();
	chordGain.connect(masterGainNode);

	// Normalize volume based on number of notes
	const noteVolume = 0.3 / Math.sqrt(frequencies.length);

	// Immediate attack for responsive feel
	chordGain.gain.setValueAtTime(0, audioContext.currentTime);
	chordGain.gain.linearRampToValueAtTime(
		noteVolume,
		audioContext.currentTime + 0.01,
	);

	const oscillators: OscillatorNode[] = [];
	const gains: GainNode[] = [];

	// Create oscillators for each note
	for (const frequency of frequencies) {
		const oscillator = audioContext.createOscillator();
		const noteGain = audioContext.createGain();

		// Configure oscillator
		oscillator.type = oscillatorType;
		oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

		// Connect: oscillator -> noteGain -> chordGain -> master
		oscillator.connect(noteGain);
		noteGain.connect(chordGain);

		// Individual note envelope (slight attack to avoid clicks)
		noteGain.gain.setValueAtTime(0, audioContext.currentTime);
		noteGain.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.01);

		// Start oscillator
		oscillator.start(audioContext.currentTime);

		// Track for cleanup
		activeOscillators.add(oscillator);
		oscillators.push(oscillator);
		gains.push(noteGain);

		// Don't set up onended handler - we'll handle cleanup manually
	}

	// Store active chord info
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
			activeChords.delete(pointerId);
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

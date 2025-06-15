// Audio engine store - manages AudioContext and sound generation
let audioContext: AudioContext | null = null;
let masterGainNode: GainNode | null = null;

// Active oscillators tracking for cleanup
const activeOscillators = new Set<OscillatorNode>();

// Reactive state using Svelte 5 runes
export const audioState = $state({
	isInitialized: false,
	isPlaying: false,
	masterVolume: 0.8,
	activeNoteCount: 0,
	contextState: "suspended" as AudioContextState,
});

// Reactive derived values
export const canPlayAudio = $derived(
	audioState.isInitialized && audioState.contextState === "running",
);

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

// React to volume changes
$effect(() => {
	if (masterGainNode && audioContext) {
		masterGainNode.gain.setValueAtTime(
			audioState.masterVolume,
			audioContext.currentTime,
		);
	}
});

// React to active note count changes
$effect(() => {
	audioState.isPlaying = audioState.activeNoteCount > 0;
});

// Ensure audio context is running (handle browser autoplay policies)
export async function ensureAudioRunning(): Promise<void> {
	const ctx = initializeAudio();
	if (ctx.state === "suspended") {
		await ctx.resume();
	}
}

// Clean up finished oscillators
function cleanupOscillator(osc: OscillatorNode, gainNode: GainNode): void {
	osc.disconnect();
	gainNode.disconnect();
	activeOscillators.delete(osc);
	audioState.activeNoteCount = activeOscillators.size;
}

// Main chord playing function
export async function playChord(
	frequencies: number[],
	oscillatorType: OscillatorType,
	duration = 1.5,
): Promise<void> {
	// Ensure audio is initialized and running
	await ensureAudioRunning();

	if (!audioContext || !masterGainNode) return;

	// Create a gain node for this chord (for envelope and mixing)
	const chordGain = audioContext.createGain();
	chordGain.connect(masterGainNode);

	// Normalize volume based on number of notes
	const noteVolume = 0.3 / Math.sqrt(frequencies.length);
	chordGain.gain.setValueAtTime(noteVolume, audioContext.currentTime);

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

		// Start and schedule stop
		oscillator.start(audioContext.currentTime);
		oscillator.stop(audioContext.currentTime + duration);

		// Track for cleanup
		activeOscillators.add(oscillator);
		audioState.activeNoteCount = activeOscillators.size;

		// Clean up when done
		oscillator.onended = () => cleanupOscillator(oscillator, noteGain);
	}

	// Fade out to avoid clicks
	const fadeStart = audioContext.currentTime + duration * 0.5;
	const fadeEnd = audioContext.currentTime + duration;
	chordGain.gain.setValueAtTime(noteVolume, fadeStart);
	chordGain.gain.exponentialRampToValueAtTime(0.001, fadeEnd);

	// Clean up chord gain after fade
	setTimeout(
		() => {
			chordGain.disconnect();
		},
		duration * 1000 + 100,
	);
}

// Reactive volume control (0-1)
export function setMasterVolume(volume: number): void {
	audioState.masterVolume = Math.max(0, Math.min(1, volume));
}

// Clean up all audio resources
export function cleanup(): void {
	// Stop all active oscillators
	for (const osc of activeOscillators) {
		try {
			osc.stop();
		} catch (e) {
			// Already stopped
		}
	}
	activeOscillators.clear();
	audioState.activeNoteCount = 0;

	// Close audio context
	if (audioContext && audioContext.state !== "closed") {
		audioContext.close();
		audioContext = null;
		masterGainNode = null;
		audioState.isInitialized = false;
		audioState.contextState = "closed";
	}
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

// Audio state type for external use
export type AudioState = typeof audioState;

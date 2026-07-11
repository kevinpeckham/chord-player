// Tests for the audio engine store. jsdom has no Web Audio API, so a minimal
// AudioContext stub is installed on the global BEFORE the store module is
// imported (vi.stubGlobal + vi.resetModules + dynamic import per test).
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Web Audio stubs
// ---------------------------------------------------------------------------

class FakeAudioParam {
	value = 0;
	setValueAtTime = vi.fn((value: number) => {
		this.value = value;
		return this;
	});
	linearRampToValueAtTime = vi.fn((value: number) => {
		this.value = value;
		return this;
	});
	exponentialRampToValueAtTime = vi.fn((value: number) => {
		this.value = value;
		return this;
	});
	cancelScheduledValues = vi.fn(() => this);
}

class FakeGainNode {
	gain = new FakeAudioParam();
	connect = vi.fn();
	disconnect = vi.fn();
}

class FakeOscillatorNode {
	type: OscillatorType = "sine";
	frequency = new FakeAudioParam();
	connect = vi.fn();
	disconnect = vi.fn();
	start = vi.fn();
	stop = vi.fn();
	onended: (() => void) | null = null;
}

class FakeAudioContext {
	static instances: FakeAudioContext[] = [];
	// Allows a test to make the next context start out suspended.
	static initialState: AudioContextState = "running";

	state: AudioContextState = FakeAudioContext.initialState;
	currentTime = 0;
	destination = { connect: vi.fn(), disconnect: vi.fn() };
	onstatechange: (() => void) | null = null;
	createdGains: FakeGainNode[] = [];
	createdOscillators: FakeOscillatorNode[] = [];

	constructor() {
		FakeAudioContext.instances.push(this);
	}

	createGain() {
		const gain = new FakeGainNode();
		this.createdGains.push(gain);
		return gain;
	}

	createOscillator() {
		const osc = new FakeOscillatorNode();
		this.createdOscillators.push(osc);
		return osc;
	}

	resume = vi.fn(async () => {
		this.state = "running";
	});

	suspend = vi.fn(async () => {
		this.state = "suspended";
	});
}

type AudioStore = typeof import("$stores/audio.svelte");

// Fresh module instance per test so the module-level singletons
// (audioContext, activeChords, audioState) start clean.
async function freshStore(): Promise<AudioStore> {
	vi.resetModules();
	return import("$stores/audio.svelte");
}

const C_MAJOR = [261.63, 329.63, 392];
const A_MINOR = [220, 261.63, 329.63];

// The store's stopChordById cleanup timeout: fadeTime * 1000 + 50 = 100ms.
const CLEANUP_MS = 150;

describe("audio store", () => {
	beforeEach(() => {
		FakeAudioContext.instances = [];
		FakeAudioContext.initialState = "running";
		vi.stubGlobal("AudioContext", FakeAudioContext);
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.runOnlyPendingTimers();
		vi.useRealTimers();
		vi.unstubAllGlobals();
	});

	describe("initialization", () => {
		it("does not create an AudioContext until first playback", async () => {
			const audio = await freshStore();
			expect(audio.audioState.isInitialized).toBe(false);
			expect(FakeAudioContext.instances).toHaveLength(0);

			await audio.startChord(C_MAJOR, "sine", 1);
			expect(audio.audioState.isInitialized).toBe(true);
			expect(FakeAudioContext.instances).toHaveLength(1);
		});

		it("reuses the same AudioContext across chords (singleton)", async () => {
			const audio = await freshStore();
			await audio.startChord(C_MAJOR, "sine", 1);
			await audio.startChord(A_MINOR, "sine", 2);
			expect(FakeAudioContext.instances).toHaveLength(1);
		});

		it("wires master gain to destination with the current master volume", async () => {
			const audio = await freshStore();
			await audio.startChord(C_MAJOR, "sine", 1);
			const ctx = FakeAudioContext.instances[0];
			const masterGain = ctx.createdGains[0];
			expect(masterGain.connect).toHaveBeenCalledWith(ctx.destination);
			expect(masterGain.gain.value).toBe(audio.audioState.masterVolume);
		});

		it("resumes a suspended context before playing", async () => {
			FakeAudioContext.initialState = "suspended";
			const audio = await freshStore();
			// startChord awaits resume + a 50ms delay; advance fake timers while
			// the promise is pending.
			const pending = audio.startChord(C_MAJOR, "sine", 1);
			await vi.advanceTimersByTimeAsync(60);
			await pending;
			const ctx = FakeAudioContext.instances[0];
			expect(ctx.resume).toHaveBeenCalled();
			expect(ctx.createdOscillators).toHaveLength(C_MAJOR.length);
		});
	});

	describe("startChord", () => {
		it("creates one oscillator per frequency with the requested type", async () => {
			const audio = await freshStore();
			await audio.startChord(C_MAJOR, "sawtooth", 1);

			const ctx = FakeAudioContext.instances[0];
			expect(ctx.createdOscillators).toHaveLength(3);
			for (const [i, osc] of ctx.createdOscillators.entries()) {
				expect(osc.type).toBe("sawtooth");
				expect(osc.frequency.setValueAtTime).toHaveBeenCalledWith(
					C_MAJOR[i],
					ctx.currentTime,
				);
				expect(osc.start).toHaveBeenCalledWith(ctx.currentTime);
			}
			expect(audio.audioState.isPlaying).toBe(true);
			expect(audio.audioState.activeNoteCount).toBe(3);
		});

		it("does not restart when the same pointer replays identical frequencies", async () => {
			const audio = await freshStore();
			await audio.startChord(C_MAJOR, "sine", 1);
			const ctx = FakeAudioContext.instances[0];
			const oscCountAfterFirst = ctx.createdOscillators.length;

			await audio.startChord([...C_MAJOR], "sine", 1);
			expect(ctx.createdOscillators).toHaveLength(oscCountAfterFirst);
			// No oscillator was stopped either — playback is uninterrupted.
			for (const osc of ctx.createdOscillators) {
				expect(osc.stop).not.toHaveBeenCalled();
			}
		});

		it("stops the previous chord when the same pointer plays new frequencies", async () => {
			const audio = await freshStore();
			await audio.startChord(C_MAJOR, "sine", 1);
			const ctx = FakeAudioContext.instances[0];
			const firstOscillators = [...ctx.createdOscillators];

			await audio.startChord(A_MINOR, "sine", 1);
			for (const osc of firstOscillators) {
				expect(osc.stop).toHaveBeenCalled();
			}
			// 3 old + 3 new
			expect(ctx.createdOscillators).toHaveLength(6);
		});

		it("tracks concurrent chords from different pointers independently", async () => {
			const audio = await freshStore();
			await audio.startChord(C_MAJOR, "sine", 1);
			await audio.startChord(A_MINOR, "sine", 2);
			expect(audio.audioState.activeNoteCount).toBe(6);
			expect(audio.audioState.isPlaying).toBe(true);
		});
	});

	describe("stopChordById", () => {
		it("schedules a fade-out and stops the chord's oscillators", async () => {
			const audio = await freshStore();
			await audio.startChord(C_MAJOR, "sine", 1);
			const ctx = FakeAudioContext.instances[0];
			// gains: [0] master, [1] chordGain, then per-note gains
			const chordGain = ctx.createdGains[1];

			audio.stopChordById(1);

			for (const osc of ctx.createdOscillators) {
				expect(osc.stop).toHaveBeenCalled();
			}
			expect(chordGain.gain.cancelScheduledValues).toHaveBeenCalled();
			expect(chordGain.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(
				0.001,
				expect.any(Number),
			);
		});

		it("disconnects nodes and resets state after the cleanup timer", async () => {
			const audio = await freshStore();
			await audio.startChord(C_MAJOR, "sine", 1);
			const ctx = FakeAudioContext.instances[0];
			const chordGain = ctx.createdGains[1];
			const noteGains = ctx.createdGains.slice(2);

			audio.stopChordById(1);
			// Cleanup has not run yet.
			expect(chordGain.disconnect).not.toHaveBeenCalled();

			vi.advanceTimersByTime(CLEANUP_MS);

			expect(chordGain.disconnect).toHaveBeenCalled();
			for (const gain of noteGains) {
				expect(gain.disconnect).toHaveBeenCalled();
			}
			expect(audio.audioState.activeNoteCount).toBe(0);
			expect(audio.audioState.isPlaying).toBe(false);
		});

		it("keeps other pointers' chords playing", async () => {
			const audio = await freshStore();
			await audio.startChord(C_MAJOR, "sine", 1);
			await audio.startChord(A_MINOR, "sine", 2);

			audio.stopChordById(1);
			vi.advanceTimersByTime(CLEANUP_MS);

			expect(audio.audioState.activeNoteCount).toBe(3);
			expect(audio.audioState.isPlaying).toBe(true);
		});

		it("is a no-op for unknown pointer ids and before initialization", async () => {
			const audio = await freshStore();
			expect(() => audio.stopChordById(99)).not.toThrow();

			await audio.startChord(C_MAJOR, "sine", 1);
			expect(() => audio.stopChordById(99)).not.toThrow();
			expect(audio.audioState.isPlaying).toBe(true);
		});

		it("allows the same pointer to restart the same chord after stopping", async () => {
			const audio = await freshStore();
			await audio.startChord(C_MAJOR, "sine", 1);
			audio.stopChordById(1);
			vi.advanceTimersByTime(CLEANUP_MS);

			await audio.startChord(C_MAJOR, "sine", 1);
			const ctx = FakeAudioContext.instances[0];
			expect(ctx.createdOscillators).toHaveLength(6);
			expect(audio.audioState.isPlaying).toBe(true);
		});
	});

	describe("stopChord", () => {
		it("stops all active chords across pointers", async () => {
			const audio = await freshStore();
			await audio.startChord(C_MAJOR, "sine", 1);
			await audio.startChord(A_MINOR, "sine", 2);
			const ctx = FakeAudioContext.instances[0];

			audio.stopChord();
			for (const osc of ctx.createdOscillators) {
				expect(osc.stop).toHaveBeenCalled();
			}

			vi.advanceTimersByTime(CLEANUP_MS);
			expect(audio.audioState.activeNoteCount).toBe(0);
			expect(audio.audioState.isPlaying).toBe(false);
		});

		it("is a no-op before the audio context exists", async () => {
			const audio = await freshStore();
			expect(() => audio.stopChord()).not.toThrow();
			expect(FakeAudioContext.instances).toHaveLength(0);
		});
	});

	describe("setMasterVolume", () => {
		it("updates audioState.masterVolume", async () => {
			const audio = await freshStore();
			audio.setMasterVolume(0.42);
			expect(audio.audioState.masterVolume).toBe(0.42);
		});

		it("clamps values above 1 down to 1", async () => {
			const audio = await freshStore();
			audio.setMasterVolume(1.7);
			expect(audio.audioState.masterVolume).toBe(1);
		});

		it("clamps negative values up to 0", async () => {
			const audio = await freshStore();
			audio.setMasterVolume(-0.5);
			expect(audio.audioState.masterVolume).toBe(0);
		});

		it("accepts the boundaries 0 and 1 exactly", async () => {
			const audio = await freshStore();
			audio.setMasterVolume(0);
			expect(audio.audioState.masterVolume).toBe(0);
			audio.setMasterVolume(1);
			expect(audio.audioState.masterVolume).toBe(1);
		});

		it("applies the clamped volume to the master gain node once initialized", async () => {
			const audio = await freshStore();
			await audio.startChord(C_MAJOR, "sine", 1);
			const ctx = FakeAudioContext.instances[0];
			const masterGain = ctx.createdGains[0];

			audio.setMasterVolume(2);
			expect(masterGain.gain.setValueAtTime).toHaveBeenCalledWith(
				1,
				ctx.currentTime,
			);

			audio.setMasterVolume(0.25);
			expect(masterGain.gain.setValueAtTime).toHaveBeenLastCalledWith(
				0.25,
				ctx.currentTime,
			);
		});

		it("works before initialization without touching a gain node", async () => {
			const audio = await freshStore();
			expect(() => audio.setMasterVolume(0.3)).not.toThrow();
			expect(audio.audioState.masterVolume).toBe(0.3);
			expect(FakeAudioContext.instances).toHaveLength(0);
		});
	});
});

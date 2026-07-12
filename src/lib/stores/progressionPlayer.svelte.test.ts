// Tests for the progression player (pad playback through the app synth).

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("$stores/audio.svelte", () => ({
	startChord: vi.fn(),
	stopChordById: vi.fn(),
}));

import { startChord, stopChordById } from "$stores/audio.svelte";
import {
	addLineBreak,
	clearProgression,
	progression,
	recordChord,
} from "$stores/progression.svelte";
import {
	player,
	playProgression,
	stopPlayback,
} from "$stores/progressionPlayer.svelte";
import { settings } from "$stores/settings.svelte";

const STEP_MS = 500;
const C_NOTES = [60, 64, 67];
const G_NOTES = [55, 59, 62];

describe("progression player", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		// Reset player state BEFORE clearing mocks — stopPlayback itself
		// calls the mocked stopChordById
		stopPlayback();
		vi.clearAllMocks();
		clearProgression();
		progression.paused = false;
		settings.activeVoice = "sine";
	});

	afterEach(() => {
		stopPlayback();
		vi.runOnlyPendingTimers();
		vi.useRealTimers();
	});

	it("plays each chord in sequence with the reserved pointer id", () => {
		recordChord("C", C_NOTES);
		recordChord("G", G_NOTES);
		playProgression();

		expect(player.playing).toBe(true);
		expect(player.position).toBe(0);
		expect(startChord).toHaveBeenCalledTimes(1);
		const [frequencies, voice, pointerId] = vi.mocked(startChord).mock.calls[0];
		expect(pointerId).toBe(-1);
		expect(voice).toBe("sine");
		expect(frequencies[0]).toBeCloseTo(261.63, 1); // C4 from MIDI 60

		vi.advanceTimersByTime(STEP_MS);
		expect(player.position).toBe(1);
		expect(startChord).toHaveBeenCalledTimes(2);
	});

	it("releases each chord before the next step", () => {
		recordChord("C", C_NOTES);
		playProgression();
		expect(stopChordById).not.toHaveBeenCalledWith(-1);

		vi.advanceTimersByTime(STEP_MS - 1);
		expect(stopChordById).toHaveBeenCalledWith(-1);
	});

	it("rests on line breaks", () => {
		recordChord("C", C_NOTES);
		addLineBreak();
		recordChord("G", G_NOTES);
		playProgression();

		vi.advanceTimersByTime(STEP_MS); // now on the break
		expect(player.position).toBe(1);
		expect(startChord).toHaveBeenCalledTimes(1); // no new chord

		vi.advanceTimersByTime(STEP_MS); // now on G
		expect(startChord).toHaveBeenCalledTimes(2);
	});

	it("stops at the end and resets position", () => {
		recordChord("C", C_NOTES);
		playProgression();
		vi.advanceTimersByTime(STEP_MS);

		expect(player.playing).toBe(false);
		expect(player.position).toBe(-1);
		expect(stopChordById).toHaveBeenCalledWith(-1);
	});

	it("can be stopped mid-playback", () => {
		recordChord("C", C_NOTES);
		recordChord("G", G_NOTES);
		playProgression();

		stopPlayback();
		expect(player.playing).toBe(false);
		expect(stopChordById).toHaveBeenCalledWith(-1);

		vi.advanceTimersByTime(STEP_MS * 4);
		expect(startChord).toHaveBeenCalledTimes(1); // no further steps
	});

	it("handles entries shrinking during playback (clear)", () => {
		recordChord("C", C_NOTES);
		recordChord("G", G_NOTES);
		playProgression();

		clearProgression();
		vi.advanceTimersByTime(STEP_MS);
		expect(player.playing).toBe(false);
	});

	it("does nothing on an empty pad", () => {
		playProgression();
		expect(player.playing).toBe(false);
		expect(startChord).not.toHaveBeenCalled();
	});
});

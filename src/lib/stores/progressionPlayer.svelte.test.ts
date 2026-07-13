// Tests for the progression player (pad playback through the app synth).

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("$stores/audio.svelte", () => ({
	audioTime: vi.fn(() => Date.now() / 1000),
	scheduleClick: vi.fn(),
	startChord: vi.fn(),
	stopChordById: vi.fn(),
	unlockAudio: vi.fn(),
}));

import { scheduleClick, startChord, stopChordById } from "$stores/audio.svelte";
import {
	metronome,
	startMetronome,
	stopMetronome,
} from "$stores/metronome.svelte";
import {
	clearProgression,
	progression,
	recordChord,
	recordRest,
	setEntryBeats,
} from "$stores/progression.svelte";
import {
	pausePlayback,
	player,
	playProgression,
	setBpm,
	stopPlayback,
	toggleLoop,
} from "$stores/progressionPlayer.svelte";
import { settings } from "$stores/settings.svelte";

// One beat at the default 120 BPM
const STEP_MS = 500;
const C_NOTES = [60, 64, 67];
const G_NOTES = [55, 59, 62];

describe("progression player", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		// Reset player state BEFORE clearing mocks — stopPlayback itself
		// calls the mocked stopChordById
		stopPlayback();
		stopMetronome();
		player.loop = false;
		player.clickAlong = false;
		setBpm(120);
		vi.clearAllMocks();
		clearProgression();
		progression.recording = true;
		progression.suspended = false;
		settings.activeVoice = "sine";
		settings.metronomeAccent = false;
		settings.timeSignature = "4/4";
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

	it("suspends live jotting while the transport is engaged (punch-in)", () => {
		recordChord("C", C_NOTES);
		playProgression();

		// While playing, jotting is suspended — playing along cannot jot
		expect(progression.suspended).toBe(true);
		expect(recordChord("G", G_NOTES)).toBe(-1);
		expect(progression.entries).toHaveLength(1);

		// Natural end lifts the suspension: the next chord played appends
		vi.advanceTimersByTime(STEP_MS);
		expect(player.playing).toBe(false);
		expect(progression.suspended).toBe(false);
		expect(recordChord("G", G_NOTES)).toBe(1);
	});

	it("honors each chord's beats at the current tempo", () => {
		recordChord("C", C_NOTES);
		setEntryBeats(0, 2);
		recordChord("G", G_NOTES);
		playProgression();

		// C holds for 2 beats — still sounding after one step
		vi.advanceTimersByTime(STEP_MS);
		expect(player.position).toBe(0);
		vi.advanceTimersByTime(STEP_MS);
		expect(player.position).toBe(1);
	});

	it("scales step time with BPM", () => {
		setBpm(60); // 1000ms per beat
		recordChord("C", C_NOTES);
		recordChord("G", G_NOTES);
		playProgression();

		vi.advanceTimersByTime(500);
		expect(player.position).toBe(0); // not yet
		vi.advanceTimersByTime(500);
		expect(player.position).toBe(1);
	});

	it("sets tempo from tap intervals and resets after a long pause", async () => {
		const { tapTempo } = await import("$stores/progressionPlayer.svelte");

		// Steady taps 500ms apart → 120 BPM
		tapTempo();
		for (let i = 0; i < 3; i++) {
			vi.advanceTimersByTime(500);
			tapTempo();
		}
		expect(player.bpm).toBe(120);

		// A >2s pause starts a fresh sequence: the stale interval is ignored
		vi.advanceTimersByTime(3000);
		tapTempo(); // first tap of the new sequence — no bpm change yet
		expect(player.bpm).toBe(120);
		vi.advanceTimersByTime(1000);
		tapTempo();
		expect(player.bpm).toBe(60); // 1000ms interval
	});

	it("clamps and persists the tempo", () => {
		setBpm(999);
		expect(player.bpm).toBe(240);
		setBpm(10);
		expect(player.bpm).toBe(40);
		setBpm(96);
		expect(localStorage.getItem("fifths-progression-bpm")).toBe("96");
	});

	it("pauses at the current position and resumes from it", () => {
		recordChord("C", C_NOTES);
		recordChord("G", G_NOTES);
		recordChord("Am", [57, 60, 64]);
		playProgression();
		vi.advanceTimersByTime(STEP_MS); // now on G (index 1)

		pausePlayback();
		expect(player.playing).toBe(true);
		expect(player.paused).toBe(true);
		expect(player.position).toBe(1);
		expect(stopChordById).toHaveBeenCalledWith(-1);
		expect(progression.suspended).toBe(true); // still engaged

		const callsBefore = vi.mocked(startChord).mock.calls.length;
		vi.advanceTimersByTime(STEP_MS * 4);
		expect(vi.mocked(startChord).mock.calls.length).toBe(callsBefore); // frozen

		playProgression(); // resume
		expect(player.paused).toBe(false);
		expect(player.position).toBe(1); // replays the paused chord
		expect(vi.mocked(startChord).mock.calls.length).toBe(callsBefore + 1);
	});

	it("loops back to the top when loop is on", () => {
		recordChord("C", C_NOTES);
		recordChord("G", G_NOTES);
		toggleLoop();
		playProgression();

		vi.advanceTimersByTime(STEP_MS * 2); // past the end
		expect(player.playing).toBe(true);
		expect(player.position).toBe(0); // wrapped
		expect(progression.suspended).toBe(true); // loop never punches in

		stopPlayback();
		expect(progression.suspended).toBe(false);
	});

	it("plays no click during playback by default", () => {
		recordChord("C", C_NOTES);
		playProgression();
		vi.advanceTimersByTime(STEP_MS);
		expect(scheduleClick).not.toHaveBeenCalled();
	});

	it("schedules beat-aligned clicks during playback when clickAlong is on", () => {
		player.clickAlong = true;
		recordChord("C", C_NOTES);
		setEntryBeats(0, 2);
		recordChord("G", G_NOTES);
		playProgression();
		vi.advanceTimersByTime(STEP_MS * 3);

		// 2 beats for C + 1 for G
		const times = vi.mocked(scheduleClick).mock.calls.map(([time]) => time);
		expect(times).toHaveLength(3);
		// C's two beats are half a second apart on the audio clock
		expect(times[1] - times[0]).toBeCloseTo(0.5, 3);
	});

	it("accents playback clicks per the time signature when enabled", () => {
		player.clickAlong = true;
		settings.metronomeAccent = true;
		settings.timeSignature = "2/4";
		for (let i = 0; i < 4; i++) recordChord("C", C_NOTES);
		playProgression();
		vi.advanceTimersByTime(STEP_MS * 4);

		const accents = vi
			.mocked(scheduleClick)
			.mock.calls.map(([, accent]) => accent);
		expect(accents).toEqual([true, false, true, false]);
	});

	it("stops the live click for playback and restores it after", () => {
		recordChord("C", C_NOTES);
		startMetronome();
		expect(metronome.running).toBe(true);

		playProgression();
		expect(metronome.running).toBe(false); // live click yields

		vi.advanceTimersByTime(STEP_MS); // natural end
		expect(player.playing).toBe(false);
		expect(metronome.running).toBe(true); // restored for punch-in
		stopMetronome();
	});

	it("does not restore the live click if it was not running before", () => {
		recordChord("C", C_NOTES);
		playProgression();
		vi.advanceTimersByTime(STEP_MS);
		expect(metronome.running).toBe(false);
	});

	it("rests are silent for their beats, then playback continues", () => {
		recordChord("C", C_NOTES);
		recordRest(2);
		recordChord("G", G_NOTES);
		playProgression();

		vi.advanceTimersByTime(STEP_MS); // now on the rest
		expect(player.position).toBe(1);
		expect(startChord).toHaveBeenCalledTimes(1); // nothing new sounds

		vi.advanceTimersByTime(STEP_MS); // rest is 2 beats — still resting
		expect(player.position).toBe(1);

		vi.advanceTimersByTime(STEP_MS); // now on G
		expect(player.position).toBe(2);
		expect(startChord).toHaveBeenCalledTimes(2);
	});

	it("the playback click marks rest beats too", () => {
		player.clickAlong = true;
		recordChord("C", C_NOTES);
		recordRest(2);
		playProgression();
		vi.advanceTimersByTime(STEP_MS * 3);

		// 1 beat for C + 2 for the rest
		expect(vi.mocked(scheduleClick).mock.calls).toHaveLength(3);
	});

	it("releases each chord before the next step", () => {
		recordChord("C", C_NOTES);
		playProgression();
		expect(stopChordById).not.toHaveBeenCalledWith(-1);

		vi.advanceTimersByTime(STEP_MS - 1);
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

// Tests for the metronome's lookahead scheduler.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// audioTime is driven by the fake-timer clock so advancing timers advances
// the "audio context" clock in lockstep
vi.mock("$stores/audio.svelte", () => ({
	audioTime: vi.fn(() => Date.now() / 1000),
	scheduleClick: vi.fn(),
	unlockAudio: vi.fn(),
	startChord: vi.fn(),
	stopChordById: vi.fn(),
}));

import { scheduleClick, unlockAudio } from "$stores/audio.svelte";
import {
	metronome,
	startMetronome,
	stopMetronome,
	toggleMetronome,
} from "$stores/metronome.svelte";
import { setBpm } from "$stores/progressionPlayer.svelte";
import { settings } from "$stores/settings.svelte";

function clickCalls() {
	return vi.mocked(scheduleClick).mock.calls;
}

describe("metronome", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		stopMetronome();
		setBpm(120);
		settings.metronomeAccent = false;
		settings.timeSignature = "4/4";
		vi.clearAllMocks();
	});

	afterEach(() => {
		stopMetronome();
		vi.runOnlyPendingTimers();
		vi.useRealTimers();
	});

	it("unlocks audio and starts scheduling clicks", () => {
		startMetronome();
		expect(unlockAudio).toHaveBeenCalled();
		expect(metronome.running).toBe(true);
		// The first scheduler pass books at least the first beat
		expect(clickCalls().length).toBeGreaterThan(0);
	});

	it("schedules beats one beat-interval apart at the current tempo", () => {
		startMetronome();
		vi.advanceTimersByTime(2000); // 2s at 120 BPM ≈ 4 beats

		const times = clickCalls().map(([time]) => time);
		expect(times.length).toBeGreaterThanOrEqual(4);
		for (let i = 1; i < times.length; i++) {
			expect(times[i] - times[i - 1]).toBeCloseTo(0.5, 3); // 60/120
		}
	});

	it("plays every beat unaccented by default", () => {
		startMetronome();
		vi.advanceTimersByTime(4000); // ≈ 8 beats

		const accents = clickCalls().map(([, accent]) => accent);
		expect(accents.length).toBeGreaterThanOrEqual(8);
		expect(accents.every((accent) => accent === false)).toBe(true);
	});

	it("accents the downbeat of every 4/4 bar when the accent setting is on", () => {
		settings.metronomeAccent = true;
		startMetronome();
		vi.advanceTimersByTime(4000); // ≈ 8 beats

		const accents = clickCalls().map(([, accent]) => accent);
		expect(accents[0]).toBe(true);
		expect(accents.slice(1, 4)).toEqual([false, false, false]);
		expect(accents[4]).toBe(true);
	});

	it("follows the time signature for the accent pattern (3/4 waltz)", () => {
		settings.metronomeAccent = true;
		settings.timeSignature = "3/4";
		startMetronome();
		vi.advanceTimersByTime(3500); // ≈ 7 beats

		const accents = clickCalls()
			.slice(0, 7)
			.map(([, accent]) => accent);
		expect(accents).toEqual([true, false, false, true, false, false, true]);
	});

	it("retunes live when the tempo changes", () => {
		startMetronome();
		vi.advanceTimersByTime(1000);
		setBpm(60);
		const before = clickCalls().length;
		vi.advanceTimersByTime(2000); // 2s at 60 BPM = 2 more beats

		const times = clickCalls()
			.slice(before)
			.map(([time]) => time);
		for (let i = 1; i < times.length; i++) {
			expect(times[i] - times[i - 1]).toBeCloseTo(1, 3); // 60/60
		}
	});

	it("stops scheduling when stopped", () => {
		startMetronome();
		vi.advanceTimersByTime(1000);
		stopMetronome();
		expect(metronome.running).toBe(false);

		const calls = clickCalls().length;
		vi.advanceTimersByTime(2000);
		expect(clickCalls().length).toBe(calls);
	});

	it("toggles", () => {
		toggleMetronome();
		expect(metronome.running).toBe(true);
		toggleMetronome();
		expect(metronome.running).toBe(false);
	});
});

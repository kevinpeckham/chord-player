// Component tests for the toolbar tempo controls (bpm / tap / click).

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("$stores/audio.svelte", () => ({
	audioTime: vi.fn(() => Date.now() / 1000),
	scheduleClick: vi.fn(),
	unlockAudio: vi.fn(),
	startChord: vi.fn(),
	stopChordById: vi.fn(),
}));

import TempoControls from "$components/TempoControls.svelte";

import { metronome, stopMetronome } from "$stores/metronome.svelte";
import { player, setBpm } from "$stores/progressionPlayer.svelte";

import { fireEvent, render, screen } from "@testing-library/svelte";

describe("TempoControls", () => {
	beforeEach(() => {
		stopMetronome();
		setBpm(120);
	});

	afterEach(() => {
		stopMetronome();
	});

	it("sets the tempo from the bpm input, clamped to range", async () => {
		render(TempoControls);
		const bpm = screen.getByLabelText(
			"Tempo in beats per minute",
		) as HTMLInputElement;
		expect(bpm).toHaveValue(120);

		await fireEvent.change(bpm, { target: { value: "90" } });
		expect(player.bpm).toBe(90);

		await fireEvent.change(bpm, { target: { value: "999" } });
		expect(player.bpm).toBe(240);
	});

	it("sets the tempo from tapped intervals", async () => {
		vi.useFakeTimers();
		render(TempoControls);
		const tap = screen.getByRole("button", { name: "tap" });

		// Four taps 500ms apart = 120 BPM... tapped at 600ms = 100 BPM
		for (let i = 0; i < 4; i++) {
			await fireEvent.click(tap);
			vi.advanceTimersByTime(600);
		}
		expect(player.bpm).toBe(100);
		vi.useRealTimers();
	});

	it("toggles the click", async () => {
		render(TempoControls);
		const click = screen.getByRole("button", { name: "click" });
		expect(click).toHaveAttribute("aria-pressed", "false");

		await fireEvent.click(click);
		expect(metronome.running).toBe(true);
		expect(click).toHaveAttribute("aria-pressed", "true");

		await fireEvent.click(click);
		expect(metronome.running).toBe(false);
	});
});

// Component tests for the ProgressionPad tracker.

import ProgressionPad from "$components/ProgressionPad.svelte";

import {
	addLineBreak,
	clearProgression,
	progression,
	recordChord,
} from "$stores/progression.svelte";
import { player, setBpm, stopPlayback } from "$stores/progressionPlayer.svelte";
import { settings } from "$stores/settings.svelte";

import { fireEvent, render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

describe("ProgressionPad", () => {
	beforeEach(() => {
		stopPlayback();
		clearProgression();
		progression.recording = true;
		progression.suspended = false;
		player.loop = false;
		setBpm(120);
		settings.showProgressionPad = true;
	});

	it("renders nothing while the pad is empty", () => {
		const { container } = render(ProgressionPad);
		expect(container.querySelector("[data-progression-pad]")).toBeNull();
	});

	it("shows jotted chords in order", () => {
		recordChord("C");
		recordChord("Am");
		render(ProgressionPad);
		const pad = screen.getByLabelText("Jotted progression");
		expect(pad).toHaveTextContent("C");
		expect(pad).toHaveTextContent("Am");
	});

	it("renders line breaks as separate rows", () => {
		recordChord("C");
		addLineBreak();
		recordChord("G");
		render(ProgressionPad);
		const rows = screen
			.getByLabelText("Jotted progression")
			.querySelectorAll(":scope > div");
		expect(rows).toHaveLength(2);
		expect(rows[0]).toHaveTextContent("C");
		expect(rows[1]).toHaveTextContent("G");
	});

	it("toggles jotting with the rec button", async () => {
		const user = userEvent.setup();
		recordChord("C");
		render(ProgressionPad);

		const rec = screen.getByRole("button", { name: "● rec" });
		expect(rec).toHaveAttribute("aria-pressed", "true");
		await user.click(rec);
		expect(progression.recording).toBe(false);

		// With rec off, plays are not jotted
		recordChord("G");
		expect(progression.entries).toHaveLength(1);

		await user.click(rec);
		expect(progression.recording).toBe(true);
	});

	it("play becomes a true pause and stop resets", async () => {
		const user = userEvent.setup();
		recordChord("C", [60, 64, 67]);
		recordChord("G", [55, 59, 62]);
		render(ProgressionPad);

		await user.click(screen.getByRole("button", { name: "play" }));
		expect(player.playing).toBe(true);
		expect(progression.suspended).toBe(true);

		// The same slot is now a pause button; pausing keeps the position
		await user.click(screen.getByRole("button", { name: "pause" }));
		expect(player.paused).toBe(true);
		expect(player.position).toBeGreaterThanOrEqual(0);
		expect(progression.suspended).toBe(true); // transport still engaged

		// stop disengages the transport and lifts the jotting suspension
		await user.click(screen.getByRole("button", { name: "stop" }));
		expect(player.playing).toBe(false);
		expect(player.position).toBe(-1);
		expect(progression.suspended).toBe(false);
	});

	it("toggles loop", async () => {
		const user = userEvent.setup();
		recordChord("C", [60, 64, 67]);
		render(ProgressionPad);

		const loop = screen.getByRole("button", { name: "loop" });
		expect(loop).toHaveAttribute("aria-pressed", "false");
		await user.click(loop);
		expect(player.loop).toBe(true);
	});

	it("sets the tempo from the bpm input, clamped to range", async () => {
		recordChord("C", [60, 64, 67]);
		render(ProgressionPad);

		const bpm = screen.getByLabelText(
			"Tempo in beats per minute",
		) as HTMLInputElement;
		expect(bpm).toHaveValue(120);

		await fireEvent.change(bpm, { target: { value: "90" } });
		expect(player.bpm).toBe(90);

		await fireEvent.change(bpm, { target: { value: "999" } });
		expect(player.bpm).toBe(240);
	});

	it("dismisses the pad via the X (re-enabled from settings)", async () => {
		const user = userEvent.setup();
		recordChord("C");
		render(ProgressionPad);

		await user.click(
			screen.getByRole("button", { name: "Hide progression pad" }),
		);
		expect(settings.showProgressionPad).toBe(false);
		// Entries are kept — dismissing hides, it does not clear
		expect(progression.entries).toHaveLength(1);
	});

	it("disables play when no entry has note data", () => {
		recordChord("C"); // legacy-style, no notes
		render(ProgressionPad);
		expect(screen.getByRole("button", { name: "play" })).toBeDisabled();
	});

	it("does not surface a midi export button (hidden for now)", () => {
		recordChord("C", [60, 64, 67]);
		render(ProgressionPad);
		expect(
			screen.queryByRole("button", { name: "export midi" }),
		).not.toBeInTheDocument();
	});

	it("wires the new line, undo, and clear controls", async () => {
		const user = userEvent.setup();
		recordChord("C");
		recordChord("G");
		render(ProgressionPad);

		await user.click(screen.getByRole("button", { name: "new line" }));
		expect(progression.entries.at(-1)).toEqual({ kind: "break" });

		await user.click(screen.getByRole("button", { name: "undo" }));
		expect(progression.entries.at(-1)).toEqual({
			kind: "chord",
			label: "G",
			notes: [],
			beats: 1,
		});

		await user.click(screen.getByRole("button", { name: "clear" }));
		expect(progression.entries).toEqual([]);
	});
});

// Component tests for the ProgressionPad tracker.

import ProgressionPad from "$components/ProgressionPad.svelte";

import {
	clearProgression,
	progression,
	recordChord,
	setEntryBeats,
} from "$stores/progression.svelte";
import { player, setBpm, stopPlayback } from "$stores/progressionPlayer.svelte";
import { settings } from "$stores/settings.svelte";

import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

describe("ProgressionPad", () => {
	beforeEach(() => {
		stopPlayback();
		clearProgression();
		progression.recording = true;
		progression.suspended = false;
		player.loop = false;
		player.clickAlong = false;
		setBpm(120);
		settings.showProgressionPad = true;
		settings.timeSignature = "4/4";
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

	it("renders each measure as an unbreakable unit", () => {
		settings.timeSignature = "4/4";
		for (const label of ["C", "F", "G", "Am", "C", "F"]) {
			recordChord(label, [60]);
		}
		render(ProgressionPad);
		const groups = screen
			.getByLabelText("Jotted progression")
			.querySelectorAll("[data-measure]");
		expect(groups).toHaveLength(2);
		// Measures keep their chords together so wrapping cannot split them
		expect(groups[0]).toHaveClass("whitespace-nowrap");
		expect(groups[0].textContent).toContain("Am");
		expect(groups[1].textContent).toContain("F");
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

	it("separates measures with pipes per the time signature", () => {
		settings.timeSignature = "4/4";
		// Four 1-beat chords fill a bar; the fifth starts a new one
		for (const label of ["C", "F", "G", "Am", "C"]) {
			recordChord(label, [60]);
		}
		render(ProgressionPad);
		const chips = Array.from(
			screen.getByLabelText("Jotted progression").querySelectorAll("span"),
		).map((span) => span.textContent);
		expect(chips).toEqual(["C", "F", "G", "Am", "|", "C"]);
	});

	it("counts multi-beat chords toward the bar", async () => {
		settings.timeSignature = "4/4";
		recordChord("C", [60]);
		setEntryBeats(0, 2);
		recordChord("G", [55]);
		setEntryBeats(1, 2);
		recordChord("Am", [57]); // bar boundary before this chord
		render(ProgressionPad);

		const chips = Array.from(
			screen.getByLabelText("Jotted progression").querySelectorAll("span"),
		).map((span) => span.textContent);
		expect(chips).toEqual(["C", "G", "|", "Am"]);
	});

	it("binds the playback click checkbox", async () => {
		const user = userEvent.setup();
		recordChord("C", [60, 64, 67]);
		render(ProgressionPad);

		const clickAlong = screen.getByLabelText("Click during playback");
		expect(clickAlong).not.toBeChecked();
		await user.click(clickAlong);
		expect(player.clickAlong).toBe(true);
	});

	it("no longer hosts the tempo input (moved to the toolbar)", () => {
		recordChord("C", [60, 64, 67]);
		render(ProgressionPad);
		expect(
			screen.queryByLabelText("Tempo in beats per minute"),
		).not.toBeInTheDocument();
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

	it("wires the undo and clear controls (new line is gone)", async () => {
		const user = userEvent.setup();
		recordChord("C");
		recordChord("G");
		render(ProgressionPad);

		expect(
			screen.queryByRole("button", { name: "new line" }),
		).not.toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "undo" }));
		expect(progression.entries.at(-1)).toEqual({
			kind: "chord",
			label: "C",
			notes: [],
			beats: 1,
		});

		await user.click(screen.getByRole("button", { name: "clear" }));
		expect(progression.entries).toEqual([]);
	});
});

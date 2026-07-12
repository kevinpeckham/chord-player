// Component tests for the ProgressionPad tracker.

import ProgressionPad from "$components/ProgressionPad.svelte";

import {
	addLineBreak,
	clearProgression,
	progression,
	recordChord,
} from "$stores/progression.svelte";
import { settings } from "$stores/settings.svelte";

import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("ProgressionPad", () => {
	beforeEach(() => {
		clearProgression();
		progression.paused = false;
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

	it("toggles jotting with the pause button", async () => {
		const user = userEvent.setup();
		recordChord("C");
		render(ProgressionPad);

		const pause = screen.getByRole("button", { name: "pause" });
		expect(pause).toHaveAttribute("aria-pressed", "false");
		await user.click(pause);
		expect(progression.paused).toBe(true);

		// While paused, plays are not jotted
		recordChord("G");
		expect(progression.entries).toHaveLength(1);

		const resume = screen.getByRole("button", { name: "resume" });
		expect(resume).toHaveAttribute("aria-pressed", "true");
		await user.click(resume);
		expect(progression.paused).toBe(false);
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

	it("disables play and export when no entry has note data", () => {
		recordChord("C"); // legacy-style, no notes
		render(ProgressionPad);
		expect(screen.getByRole("button", { name: "play" })).toBeDisabled();
		expect(screen.getByRole("button", { name: "export midi" })).toBeDisabled();
	});

	it("exports the progression as a .mid download", async () => {
		const user = userEvent.setup();
		recordChord("C", [60, 64, 67]);
		render(ProgressionPad);

		const exported: Blob[] = [];
		const createObjectURL = vi.fn((blob: Blob) => {
			exported.push(blob);
			return "blob:fake";
		});
		vi.stubGlobal("URL", {
			...URL,
			createObjectURL,
			revokeObjectURL: vi.fn(),
		});
		const click = vi
			.spyOn(HTMLAnchorElement.prototype, "click")
			.mockImplementation(() => {});

		await user.click(screen.getByRole("button", { name: "export midi" }));

		expect(createObjectURL).toHaveBeenCalledTimes(1);
		expect(exported).toHaveLength(1);
		const bytes = new Uint8Array(await exported[0].arrayBuffer());
		// "MThd" — a Standard MIDI File header
		expect(Array.from(bytes.slice(0, 4))).toEqual([0x4d, 0x54, 0x68, 0x64]);

		click.mockRestore();
		vi.unstubAllGlobals();
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
		});

		await user.click(screen.getByRole("button", { name: "clear" }));
		expect(progression.entries).toEqual([]);
	});
});

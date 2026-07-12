// Component tests for the ProgressionPad tracker.

import ProgressionPad from "$components/ProgressionPad.svelte";

import {
	addLineBreak,
	clearProgression,
	progression,
	recordChord,
} from "$stores/progression.svelte";

import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

describe("ProgressionPad", () => {
	beforeEach(() => {
		clearProgression();
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

	it("wires the new line, undo, and clear controls", async () => {
		const user = userEvent.setup();
		recordChord("C");
		recordChord("G");
		render(ProgressionPad);

		await user.click(screen.getByRole("button", { name: "new line" }));
		expect(progression.entries.at(-1)).toEqual({ kind: "break" });

		await user.click(screen.getByRole("button", { name: "undo" }));
		expect(progression.entries.at(-1)).toEqual({ kind: "chord", label: "G" });

		await user.click(screen.getByRole("button", { name: "clear" }));
		expect(progression.entries).toEqual([]);
	});
});

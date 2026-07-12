// Tests for the progression pad store (jotting + localStorage persistence).

import {
	addLineBreak,
	clearProgression,
	deleteLast,
	progression,
	recordChord,
	togglePaused,
} from "$stores/progression.svelte";

import { beforeEach, describe, expect, it } from "vitest";

const STORAGE_KEY = "fifths-progression";

function stored() {
	return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
}

describe("progression store", () => {
	beforeEach(() => {
		clearProgression();
		progression.paused = false;
		localStorage.clear();
	});

	it("does not record while paused, and resumes recording after", () => {
		recordChord("C");
		togglePaused();
		expect(progression.paused).toBe(true);
		recordChord("G");
		expect(progression.entries).toEqual([{ kind: "chord", label: "C" }]);

		togglePaused();
		recordChord("Am");
		expect(progression.entries).toEqual([
			{ kind: "chord", label: "C" },
			{ kind: "chord", label: "Am" },
		]);
	});

	it("records chords in order", () => {
		recordChord("C");
		recordChord("Am");
		recordChord("F7");
		expect(progression.entries).toEqual([
			{ kind: "chord", label: "C" },
			{ kind: "chord", label: "Am" },
			{ kind: "chord", label: "F7" },
		]);
	});

	it("adds line breaks between chords but never leading or doubled", () => {
		addLineBreak(); // leading — ignored
		expect(progression.entries).toEqual([]);

		recordChord("C");
		addLineBreak();
		addLineBreak(); // doubled — ignored
		recordChord("G");
		expect(progression.entries).toEqual([
			{ kind: "chord", label: "C" },
			{ kind: "break" },
			{ kind: "chord", label: "G" },
		]);
	});

	it("deletes the most recent entry", () => {
		recordChord("C");
		recordChord("G");
		deleteLast();
		expect(progression.entries).toEqual([{ kind: "chord", label: "C" }]);
		deleteLast();
		deleteLast(); // empty — no throw
		expect(progression.entries).toEqual([]);
	});

	it("clears the pad", () => {
		recordChord("C");
		addLineBreak();
		recordChord("G");
		clearProgression();
		expect(progression.entries).toEqual([]);
		expect(stored()).toEqual([]);
	});

	it("persists every mutation to localStorage", () => {
		recordChord("C");
		expect(stored()).toEqual([{ kind: "chord", label: "C" }]);
		addLineBreak();
		recordChord("G");
		deleteLast();
		expect(stored()).toEqual([
			{ kind: "chord", label: "C" },
			{ kind: "break" },
		]);
	});
});

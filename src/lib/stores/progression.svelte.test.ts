// Tests for the progression pad store (jotting + localStorage persistence).

import {
	clearProgression,
	deleteLast,
	progression,
	recordChord,
	setEntryBeats,
	toggleRecording,
} from "$stores/progression.svelte";

import { beforeEach, describe, expect, it } from "vitest";

const STORAGE_KEY = "fifths-progression-v2";

function stored() {
	return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
}

describe("progression store", () => {
	beforeEach(() => {
		clearProgression();
		progression.recording = true;
		progression.suspended = false;
		localStorage.clear();
	});

	it("does not record with the rec toggle off, and resumes when back on", () => {
		recordChord("C");
		toggleRecording();
		expect(progression.recording).toBe(false);
		recordChord("G");
		expect(progression.entries).toEqual([
			{ kind: "chord", label: "C", notes: [], beats: 1 },
		]);

		toggleRecording();
		recordChord("Am");
		expect(progression.entries).toEqual([
			{ kind: "chord", label: "C", notes: [], beats: 1 },
			{ kind: "chord", label: "Am", notes: [], beats: 1 },
		]);
	});

	it("does not record while the transport suspends jotting", () => {
		progression.suspended = true;
		expect(recordChord("C")).toBe(-1);
		expect(progression.entries).toEqual([]);

		progression.suspended = false;
		expect(recordChord("C")).toBe(0);
	});

	it("returns the new entry's index and lets beats be set on release", () => {
		const index = recordChord("C", [60, 64, 67]);
		expect(index).toBe(0);
		setEntryBeats(index, 4);
		expect(progression.entries[0]).toEqual({
			kind: "chord",
			label: "C",
			notes: [60, 64, 67],
			beats: 4,
		});
		expect(stored()[0].beats).toBe(4);
	});

	it("ignores setEntryBeats for missing entries", () => {
		recordChord("C");
		expect(() => setEntryBeats(99, 2)).not.toThrow(); // missing
		expect(progression.entries).toHaveLength(1);
	});

	it("records chords in order", () => {
		recordChord("C");
		recordChord("Am");
		recordChord("F7");
		expect(progression.entries).toEqual([
			{ kind: "chord", label: "C", notes: [], beats: 1 },
			{ kind: "chord", label: "Am", notes: [], beats: 1 },
			{ kind: "chord", label: "F7", notes: [], beats: 1 },
		]);
	});

	it("deletes the most recent entry", () => {
		recordChord("C");
		recordChord("G");
		deleteLast();
		expect(progression.entries).toEqual([
			{ kind: "chord", label: "C", notes: [], beats: 1 },
		]);
		deleteLast();
		deleteLast(); // empty — no throw
		expect(progression.entries).toEqual([]);
	});

	it("clears the pad", () => {
		recordChord("C");
		recordChord("G");
		clearProgression();
		expect(progression.entries).toEqual([]);
		expect(stored()).toEqual([]);
	});

	it("persists every mutation to localStorage", () => {
		recordChord("C");
		expect(stored()).toEqual([
			{ kind: "chord", label: "C", notes: [], beats: 1 },
		]);
		recordChord("G");
		deleteLast();
		expect(stored()).toEqual([
			{ kind: "chord", label: "C", notes: [], beats: 1 },
		]);
	});
});

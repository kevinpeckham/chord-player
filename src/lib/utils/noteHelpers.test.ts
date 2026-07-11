import { describe, expect, it } from "vitest";
import {
	CHROMATIC_NOTES,
	CIRCLE_POSITION_TO_CHROMATIC,
	getNoteForPosition,
} from "./noteHelpers";

const SEMITONE_RATIO = 2 ** (1 / 12);

describe("CHROMATIC_NOTES", () => {
	it("contains the 12 chromatic notes from C to B", () => {
		expect(CHROMATIC_NOTES).toHaveLength(12);
		expect(CHROMATIC_NOTES[0]).toEqual({ display: "C", id: "C" });
		expect(CHROMATIC_NOTES[11]).toEqual({ display: "B", id: "B" });
	});

	it("uses the sharp symbol for displays and 's' suffix for ids", () => {
		const sharps = CHROMATIC_NOTES.filter((note) => note.display.includes("♯"));
		expect(sharps).toHaveLength(5);
		for (const note of sharps) {
			expect(note.id.endsWith("s")).toBe(true);
			expect(note.id[0]).toBe(note.display[0]);
		}
	});

	it("has unique ids", () => {
		const ids = CHROMATIC_NOTES.map((note) => note.id);
		expect(new Set(ids).size).toBe(12);
	});
});

describe("CIRCLE_POSITION_TO_CHROMATIC", () => {
	it("maps all 12 circle positions in chromatic order starting at C", () => {
		expect(CIRCLE_POSITION_TO_CHROMATIC).toEqual([
			0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
		]);
	});
});

describe("getNoteForPosition", () => {
	it("returns middle C for position 0 at the default octave", () => {
		const note = getNoteForPosition(0);
		expect(note.id).toBe("C");
		expect(note.display).toBe("C");
		expect(note.noteWithOctave).toBe("C4");
		expect(note.frequency).toBeCloseTo(261.63, 2);
	});

	it("returns A440 for position 9", () => {
		const note = getNoteForPosition(9);
		expect(note.noteWithOctave).toBe("A4");
		expect(note.frequency).toBe(440);
	});

	it("converts sharp ids to '#' notation for frequency lookup", () => {
		const cSharp = getNoteForPosition(1);
		expect(cSharp.id).toBe("Cs");
		expect(cSharp.display).toBe("C♯");
		expect(cSharp.noteWithOctave).toBe("C#4");
		expect(cSharp.frequency).toBeCloseTo(277.18, 2);

		const gSharp = getNoteForPosition(8);
		expect(gSharp.noteWithOctave).toBe("G#4");
		expect(gSharp.frequency).toBeCloseTo(415.3, 2);
	});

	it("respects the octave parameter", () => {
		const c5 = getNoteForPosition(0, 5);
		expect(c5.noteWithOctave).toBe("C5");
		expect(c5.frequency).toBeCloseTo(523.25, 2);

		const a3 = getNoteForPosition(9, 3);
		expect(a3.noteWithOctave).toBe("A3");
		expect(a3.frequency).toBe(220);
	});

	it("doubles the frequency when the octave increases by one", () => {
		for (let position = 0; position < 12; position++) {
			const low = getNoteForPosition(position, 4);
			const high = getNoteForPosition(position, 5);
			expect(high.frequency).toBeCloseTo(low.frequency * 2, 1);
		}
	});

	it("yields a defined positive frequency for every position", () => {
		for (let position = 0; position < 12; position++) {
			const note = getNoteForPosition(position);
			expect(note.frequency).toBeGreaterThan(0);
			expect(Number.isFinite(note.frequency)).toBe(true);
		}
	});

	it("spaces consecutive positions one equal-tempered semitone apart", () => {
		for (let position = 0; position < 11; position++) {
			const lower = getNoteForPosition(position);
			const upper = getNoteForPosition(position + 1);
			expect(upper.frequency / lower.frequency).toBeCloseTo(SEMITONE_RATIO, 3);
		}
	});
});

import { describe, expect, it } from "vitest";
import { generateChordEnhancements } from "./chordEnhancer";

describe("generateChordEnhancements", () => {
	const enhanced = generateChordEnhancements({
		C: ["C4", "E4", "G4"],
		Am: ["A4", "C5", "E5"],
		Ab: ["Ab4", "C5", "Eb5"],
		Gb: ["Gb4", "Bb4", "Db5"],
	});

	it("preserves the standard voicing untouched", () => {
		expect(enhanced.C.standard).toEqual(["C4", "E4", "G4"]);
		expect(enhanced.Ab.standard).toEqual(["Ab4", "C5", "Eb5"]);
	});

	it("builds a spread voicing with root down an octave and 5th up an octave", () => {
		expect(enhanced.C.spread).toEqual(["C3", "E4", "G5"]);
		expect(enhanced.Am.spread).toEqual(["A3", "C5", "E6"]);
	});

	it("handles flat note names when shifting octaves", () => {
		expect(enhanced.Ab.spread).toEqual(["Ab3", "C5", "Eb6"]);
		expect(enhanced.Gb.spread).toEqual(["Gb3", "Bb4", "Db6"]);
	});

	it("builds a bass voicing prepending the root two octaves down", () => {
		expect(enhanced.C.bass).toEqual(["C2", "C4", "E4", "G4"]);
		expect(enhanced.Gb.bass).toEqual(["Gb2", "Gb4", "Bb4", "Db5"]);
	});

	it("builds a rich voicing: sub bass, bass, 3rd, 5th, doubled root", () => {
		expect(enhanced.C.rich).toEqual(["C2", "C3", "E4", "G4", "C5"]);
		expect(enhanced.Am.rich).toEqual(["A2", "A3", "C5", "E5", "A5"]);
	});

	it("builds a rootBass voicing: root down an octave plus first inversion", () => {
		expect(enhanced.C.rootBass).toEqual(["C3", "E4", "G4", "C5"]);
		expect(enhanced.Ab.rootBass).toEqual(["Ab3", "C5", "Eb5", "Ab5"]);
	});

	it("builds first and second inversions for triads", () => {
		expect(enhanced.C.inversions?.first).toEqual(["E4", "G4", "C5"]);
		expect(enhanced.C.inversions?.second).toEqual(["G4", "C5", "E5"]);
		expect(enhanced.Am.inversions?.first).toEqual(["C5", "E5", "A5"]);
		expect(enhanced.Am.inversions?.second).toEqual(["E5", "A5", "C6"]);
	});

	it("supports multi-digit octaves when transposing", () => {
		const high = generateChordEnhancements({ C: ["C10", "E10", "G10"] });
		expect(high.C.spread).toEqual(["C9", "E10", "G11"]);
	});

	it("skips chords whose root note is not a valid note name", () => {
		const result = generateChordEnhancements({ X7: ["X4", "Y4", "Z4"] });
		expect(result.X7).toBeUndefined();
	});

	it("passes notes without an octave suffix through unchanged", () => {
		const result = generateChordEnhancements({ C: ["C", "E", "G"] });
		// transposeNoteByOctaves cannot parse "C" so it returns it untouched
		expect(result.C.spread).toEqual(["C", "E", "G"]);
		expect(result.C.bass).toEqual(["C", "C", "E", "G"]);
	});

	it("omits spread and rootBass for chords with fewer than 3 notes", () => {
		const dyad = generateChordEnhancements({ C5chord: ["C4", "G4"] });
		expect(dyad.C5chord.spread).toBeUndefined();
		expect(dyad.C5chord.rootBass).toBeUndefined();
		expect(dyad.C5chord.bass).toEqual(["C2", "C4", "G4"]);
	});

	it("omits rootBass, rich, and inversions for non-triad chord names", () => {
		const seventh = generateChordEnhancements({
			C7: ["C4", "E4", "G4", "Bb4"],
		});
		expect(seventh.C7.rootBass).toBeUndefined();
		expect(seventh.C7.rich).toBeUndefined();
		expect(seventh.C7.inversions).toBeUndefined();
		// spread and bass are still generated
		expect(seventh.C7.spread).toEqual(["C3", "E4", "G5"]);
		expect(seventh.C7.bass).toEqual(["C2", "C4", "E4", "G4", "Bb4"]);
	});

	it("accepts '#' notation chord names for rich voicings", () => {
		const sharp = generateChordEnhancements({ "C#m": ["Db4", "E4", "Ab4"] });
		expect(sharp["C#m"].rich).toEqual(["Db2", "Db3", "E4", "Ab4", "Db5"]);
	});

	// Regression: the voicing gates once used /^[A-G][b#]?m?$/, which rejected
	// the project's "s"-spelled sharp ids ("Csm", "Fsm", "Gsm"), silently
	// denying those chords rich voicings and inversions.
	it("gives rich voicings to sharp minor chords using the project's 's' id convention", () => {
		const result = generateChordEnhancements({ Csm: ["Db4", "E4", "Ab4"] });
		expect(result.Csm.rich).toBeDefined();
		expect(result.Csm.inversions).toBeDefined();
	});
});

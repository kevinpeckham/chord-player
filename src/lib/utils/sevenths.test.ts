import { describe, expect, it } from "vitest";
import { seventhChordName, withSeventh } from "./sevenths";

// Standard triad frequencies (2-decimal, A440 equal temperament)
const C_MAJOR = [261.63, 329.63, 392];
const A_MINOR = [220, 261.63, 329.63];

describe("withSeventh", () => {
	it("adds a dominant seventh (b7) to a major chord", () => {
		const c7 = withSeventh(C_MAJOR, 261.63, "major", "dominant");
		expect(c7).toHaveLength(4);
		expect(c7.slice(0, 3)).toEqual(C_MAJOR);
		expect(c7[3]).toBeCloseTo(466.16, 1); // Bb4
	});

	it("adds a major seventh to a major chord when type is major7", () => {
		const cmaj7 = withSeventh(C_MAJOR, 261.63, "major", "major7");
		expect(cmaj7[3]).toBeCloseTo(493.88, 1); // B4
	});

	it("always adds the minor seventh to minor chords, regardless of type", () => {
		const am7Dominant = withSeventh(A_MINOR, 220, "minor", "dominant");
		const am7Major = withSeventh(A_MINOR, 220, "minor", "major7");
		expect(am7Dominant[3]).toBeCloseTo(392, 1); // G4
		expect(am7Major[3]).toBeCloseTo(392, 1); // still G4
	});

	it("appends the seventh relative to the standard root even for other voicings", () => {
		// A bass voicing has a transposed low root; the seventh still sits a
		// b7 above the chord's standard root
		const bassVoicing = [65.41, 261.63, 329.63, 392]; // C2 + C major triad
		const withB7 = withSeventh(bassVoicing, 261.63, "major", "dominant");
		expect(withB7).toHaveLength(5);
		expect(withB7[4]).toBeCloseTo(466.16, 1);
	});

	it("does not mutate the input voicing", () => {
		const input = [...C_MAJOR];
		withSeventh(input, 261.63, "major", "dominant");
		expect(input).toEqual(C_MAJOR);
	});

	it("rounds the seventh to 2 decimal places", () => {
		const [, , , seventh] = withSeventh(C_MAJOR, 261.63, "major", "dominant");
		expect(seventh).toBe(Math.round(seventh * 100) / 100);
	});
});

describe("seventhChordName", () => {
	it("names dominant sevenths with a plain 7", () => {
		expect(seventhChordName("C", "major", "dominant")).toBe("C7");
	});

	it("names major sevenths maj7", () => {
		expect(seventhChordName("C", "major", "major7")).toBe("Cmaj7");
	});

	it("names minor sevenths m7 regardless of type", () => {
		expect(seventhChordName("Am", "minor", "dominant")).toBe("Am7");
		expect(seventhChordName("Am", "minor", "major7")).toBe("Am7");
	});
});

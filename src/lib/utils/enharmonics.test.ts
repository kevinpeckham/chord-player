import type { Chord, VoicingFrequencies } from "$lib/types/Chord";

import { describe, expect, it } from "vitest";
import {
	getEnharmonicChordName,
	prefersSharp,
	processChordEnharmonics,
} from "./enharmonics";

describe("prefersSharp", () => {
	it("returns true for sharp-side keys", () => {
		for (const key of ["G", "D", "A", "E", "B", "F#", "C#"]) {
			expect(prefersSharp(key)).toBe(true);
		}
	});

	it("returns false for flat-side keys", () => {
		for (const key of ["F", "Bb", "Eb", "Ab", "Db", "Gb"]) {
			expect(prefersSharp(key)).toBe(false);
		}
	});

	it("defaults C to flats", () => {
		expect(prefersSharp("C")).toBe(false);
	});
});

describe("getEnharmonicChordName", () => {
	it("converts flat names to sharps in sharp keys", () => {
		expect(getEnharmonicChordName("D♭", "A")).toBe("C♯");
		expect(getEnharmonicChordName("G♭", "G")).toBe("F♯");
		expect(getEnharmonicChordName("B♭m", "E")).toBe("A♯m");
	});

	it("converts sharp names to flats in flat keys", () => {
		expect(getEnharmonicChordName("C♯", "F")).toBe("D♭");
		expect(getEnharmonicChordName("F♯m", "Bb")).toBe("G♭m");
		expect(getEnharmonicChordName("D♯m", "Ab")).toBe("E♭m");
	});

	it("uses flats for the key of C", () => {
		expect(getEnharmonicChordName("C♯", "C")).toBe("D♭");
		expect(getEnharmonicChordName("A♯m", "C")).toBe("B♭m");
	});

	it("keeps names already using the preferred accidental", () => {
		expect(getEnharmonicChordName("C♯", "D")).toBe("C♯");
		expect(getEnharmonicChordName("B♭", "F")).toBe("B♭");
		expect(getEnharmonicChordName("G♭m", "Eb")).toBe("G♭m");
	});

	it("passes natural chords through untouched regardless of key", () => {
		for (const key of ["C", "G", "Gb"]) {
			expect(getEnharmonicChordName("C", key)).toBe("C");
			expect(getEnharmonicChordName("Am", key)).toBe("Am");
			expect(getEnharmonicChordName("F", key)).toBe("F");
		}
	});

	it("is a round trip between the two spellings", () => {
		const sharp = getEnharmonicChordName("A♭", "A"); // -> G♯
		expect(getEnharmonicChordName(sharp, "F")).toBe("A♭");
	});
});

describe("processChordEnharmonics", () => {
	const voicings: VoicingFrequencies = {
		standard: [277.18, 349.23, 415.3],
		spread: [138.59, 349.23, 830.61],
		rich: [69.3, 138.59, 349.23, 415.3, 554.37],
		bass: [69.3, 277.18, 349.23, 415.3],
		rootBass: [138.59, 349.23, 415.3, 554.37],
	};

	const chord: Chord = {
		majorDisplay: "D♭",
		majorId: "Db",
		majorNotes: ["Db4", "F4", "Ab4"],
		majorFrequencies: [277.18, 349.23, 415.3],
		majorVoicings: voicings,
		minorDisplay: "B♭m",
		minorId: "Bbm",
		minorNotes: ["Bb4", "Db5", "F5"],
		minorFrequencies: [466.16, 554.37, 698.46],
		minorVoicings: voicings,
		keySignature: "♭♭♭♭♭",
	};

	it("rewrites both display names for a sharp key center", () => {
		const processed = processChordEnharmonics(chord, "A");
		expect(processed.majorDisplay).toBe("C♯");
		expect(processed.minorDisplay).toBe("A♯m");
	});

	it("keeps flat display names for a flat key center", () => {
		const processed = processChordEnharmonics(chord, "F");
		expect(processed.majorDisplay).toBe("D♭");
		expect(processed.minorDisplay).toBe("B♭m");
	});

	it("only changes display names, preserving ids, notes, and voicings", () => {
		const processed = processChordEnharmonics(chord, "A");
		expect(processed.majorId).toBe("Db");
		expect(processed.minorId).toBe("Bbm");
		expect(processed.majorNotes).toEqual(["Db4", "F4", "Ab4"]);
		expect(processed.minorFrequencies).toEqual([466.16, 554.37, 698.46]);
		expect(processed.majorVoicings).toBe(voicings);
		expect(processed.keySignature).toBe("♭♭♭♭♭");
	});

	it("returns a new object without mutating the input", () => {
		const processed = processChordEnharmonics(chord, "A");
		expect(processed).not.toBe(chord);
		expect(chord.majorDisplay).toBe("D♭");
		expect(chord.minorDisplay).toBe("B♭m");
	});

	it("leaves natural chords unchanged in any key", () => {
		const natural: Chord = {
			...chord,
			majorDisplay: "C",
			majorId: "C",
			minorDisplay: "Am",
			minorId: "Am",
			keySignature: "",
		};
		const processed = processChordEnharmonics(natural, "B");
		expect(processed.majorDisplay).toBe("C");
		expect(processed.minorDisplay).toBe("Am");
	});
});

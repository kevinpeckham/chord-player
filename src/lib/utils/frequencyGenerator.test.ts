import { describe, expect, it } from "vitest";
import { generateFrequencyMap } from "./frequencyGenerator";

describe("generateFrequencyMap", () => {
	const map = generateFrequencyMap(0, 8);

	it("uses A440 tuning (A4 = 440 Hz)", () => {
		expect(map.A4).toBe(440);
	});

	it("computes standard reference pitches", () => {
		expect(map.C4).toBeCloseTo(261.63, 2); // middle C
		expect(map.E4).toBeCloseTo(329.63, 2);
		expect(map.G4).toBeCloseTo(392, 2);
	});

	it("doubles frequency per octave", () => {
		expect(map.A5).toBeCloseTo(map.A4 * 2, 2);
		expect(map.A3).toBeCloseTo(map.A4 / 2, 2);
	});

	it("maps enharmonic flats to the same frequency as sharps", () => {
		expect(map.Db4).toBe(map["C#4"]);
		expect(map.Bb3).toBe(map["A#3"]);
	});

	it("respects the requested octave range", () => {
		const small = generateFrequencyMap(3, 4);
		expect(small.C3).toBeDefined();
		expect(small.C4).toBeDefined();
		expect(small.C2).toBeUndefined();
		expect(small.C5).toBeUndefined();
	});

	it("omits flat aliases when enharmonics are disabled", () => {
		const noFlats = generateFrequencyMap(4, 4, false);
		expect(noFlats["C#4"]).toBeDefined();
		expect(noFlats.Db4).toBeUndefined();
	});
});

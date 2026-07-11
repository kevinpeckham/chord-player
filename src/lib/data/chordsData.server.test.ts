import { describe, expect, it } from "vitest";
import { chordsData } from "./chordsData.server";

const SEMITONE_RATIO = 2 ** (1 / 12);
const VOICING_KEYS = [
	"standard",
	"spread",
	"rich",
	"bass",
	"rootBass",
] as const;

function isRoundedTo2Decimals(value: number): boolean {
	return value === Math.round(value * 100) / 100;
}

describe("chordsData", () => {
	it("contains the 12 keys of the circle of fifths", () => {
		expect(chordsData).toHaveLength(12);
	});

	it("preserves the documented array order A,E,B,Gb,Db,Ab,Eb,Bb,F,C,G,D", () => {
		const majorIds = chordsData.map((chord) => chord.majorId);
		expect(majorIds).toEqual([
			"A",
			"E",
			"B",
			"Gb",
			"Db",
			"Ab",
			"Eb",
			"Bb",
			"F",
			"C",
			"G",
			"D",
		]);
	});

	it("places F at index 8 (the 12 o'clock position after SVG rotation)", () => {
		expect(chordsData[8].majorId).toBe("F");
		expect(chordsData[8].minorId).toBe("Dm");
	});

	it("pairs each major key with its relative minor", () => {
		const relativeMinors: Record<string, string> = {
			A: "Fsm",
			E: "Csm",
			B: "Gsm",
			Gb: "Ebm",
			Db: "Bbm",
			Ab: "Fm",
			Eb: "Cm",
			Bb: "Gm",
			F: "Dm",
			C: "Am",
			G: "Em",
			D: "Bm",
		};
		for (const chord of chordsData) {
			expect(chord.minorId).toBe(relativeMinors[chord.majorId]);
		}
	});

	it("gives every chord 3-note major and minor triads with display names", () => {
		for (const chord of chordsData) {
			expect(chord.majorDisplay).toBeTruthy();
			expect(chord.minorDisplay).toBeTruthy();
			expect(chord.majorNotes).toHaveLength(3);
			expect(chord.minorNotes).toHaveLength(3);
			expect(typeof chord.keySignature).toBe("string");
		}
	});

	it("resolves every frequency to a positive finite number", () => {
		for (const chord of chordsData) {
			for (const voicings of [chord.majorVoicings, chord.minorVoicings]) {
				for (const key of VOICING_KEYS) {
					for (const frequency of voicings[key]) {
						expect(Number.isFinite(frequency)).toBe(true);
						expect(frequency).toBeGreaterThan(0);
					}
				}
			}
		}
	});

	it("rounds every frequency to 2 decimal places", () => {
		for (const chord of chordsData) {
			for (const voicings of [chord.majorVoicings, chord.minorVoicings]) {
				for (const key of VOICING_KEYS) {
					for (const frequency of voicings[key]) {
						expect(isRoundedTo2Decimals(frequency)).toBe(true);
					}
				}
			}
		}
	});

	it("keeps top-level frequencies in sync with the standard voicing", () => {
		for (const chord of chordsData) {
			expect(chord.majorFrequencies).toEqual(chord.majorVoicings.standard);
			expect(chord.minorFrequencies).toEqual(chord.minorVoicings.standard);
			expect(chord.majorFrequencies).toHaveLength(3);
			expect(chord.minorFrequencies).toHaveLength(3);
		}
	});

	it("builds major triads with a major 3rd and perfect 5th above the root", () => {
		for (const chord of chordsData) {
			const [root, third, fifth] = chord.majorVoicings.standard;
			expect(third / root).toBeCloseTo(SEMITONE_RATIO ** 4, 3);
			expect(fifth / root).toBeCloseTo(SEMITONE_RATIO ** 7, 3);
		}
	});

	it("builds minor triads with a minor 3rd and perfect 5th above the root", () => {
		for (const chord of chordsData) {
			const [root, third, fifth] = chord.minorVoicings.standard;
			expect(third / root).toBeCloseTo(SEMITONE_RATIO ** 3, 3);
			expect(fifth / root).toBeCloseTo(SEMITONE_RATIO ** 7, 3);
		}
	});

	it("spread voicing drops the root an octave and raises the 5th an octave", () => {
		for (const chord of chordsData) {
			for (const voicings of [chord.majorVoicings, chord.minorVoicings]) {
				const [root, third, fifth] = voicings.standard;
				expect(voicings.spread).toHaveLength(3);
				expect(voicings.spread[0]).toBeCloseTo(root / 2, 1);
				expect(voicings.spread[1]).toBe(third);
				expect(voicings.spread[2]).toBeCloseTo(fifth * 2, 1);
			}
		}
	});

	it("bass voicing prepends the root two octaves down to the standard triad", () => {
		for (const chord of chordsData) {
			for (const voicings of [chord.majorVoicings, chord.minorVoicings]) {
				expect(voicings.bass).toHaveLength(4);
				expect(voicings.bass[0]).toBeCloseTo(voicings.standard[0] / 4, 1);
				expect(voicings.bass.slice(1)).toEqual(voicings.standard);
			}
		}
	});

	it("rootBass voicing is root down an octave plus the first inversion", () => {
		for (const chord of chordsData) {
			for (const voicings of [chord.majorVoicings, chord.minorVoicings]) {
				const [root, third, fifth] = voicings.standard;
				expect(voicings.rootBass).toHaveLength(4);
				expect(voicings.rootBass[0]).toBeCloseTo(root / 2, 1);
				expect(voicings.rootBass[1]).toBe(third);
				expect(voicings.rootBass[2]).toBe(fifth);
				expect(voicings.rootBass[3]).toBeCloseTo(root * 2, 1);
			}
		}
	});

	it("gives every major chord a 5-note rich voicing with stacked roots", () => {
		for (const chord of chordsData) {
			const { standard, rich } = chord.majorVoicings;
			const [root, third, fifth] = standard;
			expect(rich).toHaveLength(5);
			expect(rich[0]).toBeCloseTo(root / 4, 1); // sub bass
			expect(rich[1]).toBeCloseTo(root / 2, 1); // bass
			expect(rich[2]).toBe(third);
			expect(rich[3]).toBe(fifth);
			expect(rich[4]).toBeCloseTo(root * 2, 1); // doubled root
		}
	});

	// Regression: the rich-voicing gate in chordEnhancer.ts once rejected the
	// "s"-spelled sharp minor ids ("Fsm", "Csm", "Gsm"), so those chords fell
	// back to the 3-note standard voicing when "rich" was selected.
	it("gives every minor chord a 5-note rich voicing", () => {
		for (const chord of chordsData) {
			expect(chord.minorVoicings.rich).toHaveLength(5);
		}
	});

	it("shapes every minor rich voicing as sub-bass, bass, and doubled root", () => {
		for (const chord of chordsData) {
			const { standard, rich } = chord.minorVoicings;
			expect(rich).toHaveLength(5);
			expect(rich[0]).toBeCloseTo(standard[0] / 4, 1);
			expect(rich[4]).toBeCloseTo(standard[0] * 2, 1);
		}
	});

	it("keeps all frequencies within the generated octave range (octaves 1-7)", () => {
		const C1 = 32.7;
		const B7 = 3951.07;
		for (const chord of chordsData) {
			for (const voicings of [chord.majorVoicings, chord.minorVoicings]) {
				for (const key of VOICING_KEYS) {
					for (const frequency of voicings[key]) {
						expect(frequency).toBeGreaterThanOrEqual(C1);
						expect(frequency).toBeLessThanOrEqual(B7);
					}
				}
			}
		}
	});
});

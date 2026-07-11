/**
 * Seventh-chord helpers for the performance modifier (Shift / the 7 pad /
 * a second finger on a sounding wedge).
 *
 * Sevenths are computed at play time from the chord's standard-voicing root
 * frequency rather than precomputed in the data layer: one multiplication
 * covers every voicing style, and the frequency stays mathematically exact.
 */

export type SeventhType = "dominant" | "major7";

const SEMITONE_RATIO = 2 ** (1 / 12);

// Semitones from the chord root to its seventh. Minor chords always take the
// minor seventh (m7); major chords take b7 (dominant) or 7 (maj7) per setting.
function seventhSemitones(mode: "major" | "minor", type: SeventhType): number {
	return mode === "major" && type === "major7" ? 11 : 10;
}

// Project convention: frequencies are kept at 2-decimal precision
function round2(frequency: number): number {
	return Math.round(frequency * 100) / 100;
}

/**
 * Append the appropriate seventh to a chord voicing's frequencies.
 * @param frequencies - The voicing to extend (any voicing style)
 * @param rootFrequency - The chord's standard-voicing root (e.g. C4 for C)
 * @param mode - "major" or "minor" wedge
 * @param type - Seventh quality applied to major chords
 */
export function withSeventh(
	frequencies: number[],
	rootFrequency: number,
	mode: "major" | "minor",
	type: SeventhType,
): number[] {
	const semitones = seventhSemitones(mode, type);
	return [...frequencies, round2(rootFrequency * SEMITONE_RATIO ** semitones)];
}

/**
 * Chord-symbol display name for a seventh chord.
 * "C" → "C7" (dominant) or "Cmaj7"; "Am" → "Am7".
 */
export function seventhChordName(
	display: string,
	mode: "major" | "minor",
	type: SeventhType,
): string {
	const suffix = mode === "major" && type === "major7" ? "maj7" : "7";
	return `${display}${suffix}`;
}

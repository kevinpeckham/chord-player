// utilities
import { generateChordEnhancements } from "$utils/chordEnhancer";
import { generateFrequencyMap } from "$utils/frequencyGenerator";

// types
import type { Chord, ChordDatum, VoicingFrequencies } from "$types/Chord";

// data
import { default as chordsRaw } from "$data/chords.json";
import { default as circleRaw } from "$data/circle-of-fifths-data.json";

// typed data
const circle: ChordDatum[] = circleRaw;
const chords: { [key: string]: string[] } = chordsRaw;

// Generate frequencies in memory (octaves 1-7)
const notes = generateFrequencyMap(1, 7, true);

// Generate enhanced chord voicings in memory
const chordsEnhanced = generateChordEnhancements(chords);

// Helper to get frequencies for a set of notes
function getFrequencies(noteList: string[]): number[] {
	return noteList.map((note) => notes[note]);
}

// Resolve one chord id to its notes and frequency voicings. Voicings the
// enhancer did not generate fall back to the standard triad frequencies.
function buildChordVoicings(chordId: string): {
	notes: string[];
	frequencies: number[];
	voicings: VoicingFrequencies;
} {
	const noteVoicings = chordsEnhanced[chordId] || {
		standard: chords[chordId],
	};
	const standard = getFrequencies(noteVoicings.standard);
	const toFrequencies = (noteList?: string[]): number[] =>
		noteList ? getFrequencies(noteList) : standard;

	return {
		notes: noteVoicings.standard,
		frequencies: standard,
		voicings: {
			standard,
			spread: toFrequencies(noteVoicings.spread),
			rich: toFrequencies(noteVoicings.rich),
			bass: toFrequencies(noteVoicings.bass),
			rootBass: toFrequencies(noteVoicings.rootBass),
		},
	};
}

// derived data
export const chordsData: Chord[] = circle.map((chord) => {
	const major = buildChordVoicings(chord.majorId);
	const minor = buildChordVoicings(chord.minorId);

	return {
		...chord,
		majorNotes: major.notes,
		majorFrequencies: major.frequencies,
		majorVoicings: major.voicings,
		minorNotes: minor.notes,
		minorFrequencies: minor.frequencies,
		minorVoicings: minor.voicings,
	};
});

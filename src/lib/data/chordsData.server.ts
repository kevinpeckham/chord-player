// types
import type { ChordDatum, Chord } from "$types/Chord";

// data
import { default as circleRaw } from "$data/circle-of-fifths-data.json";
import { default as chordsRaw } from "$data/chords.json";

// utilities
import { generateFrequencyMap } from "$utils/frequencyGenerator";
import { generateChordEnhancements } from "$utils/chordEnhancer";

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

// derived data
export const chordsData = circle.reduce((acc, chord) => {
	const majorId = chord.majorId;
	const minorId = chord.minorId;
	
	// Get all voicings for major chord
	const majorVoicings = chordsEnhanced[majorId] || { standard: chords[majorId] };
	const majorNotes = majorVoicings.standard;
	const majorFrequencies = getFrequencies(majorNotes);
	
	// Get all voicings for minor chord
	const minorVoicings = chordsEnhanced[minorId] || { standard: chords[minorId] };
	const minorNotes = minorVoicings.standard;
	const minorFrequencies = getFrequencies(minorNotes);

	acc.push({
		...chord,
		majorNotes,
		majorFrequencies,
		minorNotes,
		minorFrequencies,
		// Add enhanced voicings
		majorVoicings: {
			standard: majorFrequencies,
			spread: majorVoicings.spread ? getFrequencies(majorVoicings.spread) : majorFrequencies,
			rich: majorVoicings.rich ? getFrequencies(majorVoicings.rich) : majorFrequencies,
			bass: majorVoicings.bass ? getFrequencies(majorVoicings.bass) : majorFrequencies,
		},
		minorVoicings: {
			standard: minorFrequencies,
			spread: minorVoicings.spread ? getFrequencies(minorVoicings.spread) : minorFrequencies,
			rich: minorVoicings.rich ? getFrequencies(minorVoicings.rich) : minorFrequencies,
			bass: minorVoicings.bass ? getFrequencies(minorVoicings.bass) : minorFrequencies,
		}
	});

	return acc;
}, [] as Chord[]);

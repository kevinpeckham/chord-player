// types
import type { ChordDatum, Chord } from "$types/Chord";

// data
import { default as circleRaw } from "$data/circle-of-fifths-data.json";
import { default as notesRaw } from "$data/notes.json";
import { default as chordsRaw } from "$data/chords.json";

// typed data
const circle: ChordDatum[] = circleRaw;
const notes: { [key: string]: number } = notesRaw;
const chords: { [key: string]: string[] } = chordsRaw;

// derived data
export const chordsData = circle.reduce((acc, chord) => {
	const majorId = chord.majorId;
	const majorNotes = chords[majorId];
	const majorFrequencies = majorNotes.map((note) => notes[note]);
	const minorId = chord.minorId;
	const minorNotes = chords[minorId];
	const minorFrequencies = minorNotes.map((note) => notes[note]);

	acc.push({
		...chord,
		majorNotes,
		majorFrequencies,
		minorNotes,
		minorFrequencies,
	});

	return acc;
}, [] as Chord[]);

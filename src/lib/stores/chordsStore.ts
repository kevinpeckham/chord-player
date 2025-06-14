// store function
import { readable } from "svelte/store";

// types
import type { ChordDatum } from "$types/types";

import { default as circleRaw } from "$data/circle-of-fifths-data.json";
import { default as notesRaw } from "$data/notes.json";
import { default as chordsRaw } from "$data/chords.json";

const circle: ChordDatum[] = circleRaw;
const notes: { [key: string]: number } = notesRaw;
const chords: { [key: string]: string[] } = chordsRaw;

const derived = circle.map((chord) => {
	const majorId = chord.majorId;
	const majorNotes = chords[majorId];
	const majorFrequencies = majorNotes.map((note) => notes[note]);
	const minorId = chord.minorId;
	const minorNotes = chords[minorId];
	const minorFrequencies = minorNotes.map((note) => notes[note]);

	return {
		...chord,
		majorNotes,
		majorFrequencies,
		minorNotes,
		minorFrequencies,
	};
});

export const chordsStore = readable(derived);

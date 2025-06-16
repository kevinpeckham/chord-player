/**
 * Helper utilities for individual note playback mode
 */

import { generateFrequencyMap } from "./frequencyGenerator";

// Chromatic scale notes in order (starting from C)
export const CHROMATIC_NOTES = [
	{ display: "C", id: "C" },
	{ display: "C♯", id: "Cs" },
	{ display: "D", id: "D" },
	{ display: "D♯", id: "Ds" },
	{ display: "E", id: "E" },
	{ display: "F", id: "F" },
	{ display: "F♯", id: "Fs" },
	{ display: "G", id: "G" },
	{ display: "G♯", id: "Gs" },
	{ display: "A", id: "A" },
	{ display: "A♯", id: "As" },
	{ display: "B", id: "B" },
];

// Map circle positions to chromatic notes
// For notes mode, we want chromatic order starting from C at the top
// Position 0: C, Position 1: C#, Position 2: D, etc.
export const CIRCLE_POSITION_TO_CHROMATIC = [
	0, // Position 0 -> C
	1, // Position 1 -> C#
	2, // Position 2 -> D
	3, // Position 3 -> D#
	4, // Position 4 -> E
	5, // Position 5 -> F
	6, // Position 6 -> F#
	7, // Position 7 -> G
	8, // Position 8 -> G#
	9, // Position 9 -> A
	10, // Position 10 -> A#
	11, // Position 11 -> B
];

/**
 * Get the note data for a given circle position in notes mode
 */
export function getNoteForPosition(position: number, octave = 4) {
	const chromaticIndex = CIRCLE_POSITION_TO_CHROMATIC[position];
	const note = CHROMATIC_NOTES[chromaticIndex];
	const noteWithOctave = `${note.id.replace("s", "#")}${octave}`;

	// Get frequency from the generator
	const frequencies = generateFrequencyMap(octave, octave, false);
	const frequency = frequencies[noteWithOctave];

	return {
		...note,
		frequency,
		noteWithOctave,
	};
}

/**
 * Play a single note (wrapper around the chord player)
 */
export function playNote(
	frequency: number,
	oscillatorType: OscillatorType,
	duration?: number,
) {
	// We'll import and use the playChord function with a single frequency
	// This will be called from the Instrument component
	return { frequency, oscillatorType, duration };
}

/**
 * Generate enhanced chord voicings at runtime
 */

// Define chord structures with multiple voicing options
export interface ChordDefinition {
	standard: string[];
	spread?: string[];
	rich?: string[];
	bass?: string[];
	rootBass?: string[]; // Root bass with first inversion
	inversions?: {
		first?: string[];
		second?: string[];
	};
}

/**
 * Transpose a note name by a given number of octaves
 * @param note - Note name with octave (e.g., "C4", "Ab3")
 * @param octaveShift - Number of octaves to shift (positive = up, negative = down)
 * @returns New note name with adjusted octave
 */
function transposeNoteByOctaves(note: string, octaveShift: number): string {
	const match = note.match(/^([A-G][b#]?)(\d+)$/);
	if (!match) return note;
	const [, noteName, octaveStr] = match;
	const newOctave = Number.parseInt(octaveStr) + octaveShift;
	return `${noteName}${newOctave}`;
}

/**
 * Generate enhanced chord voicings from standard chord definitions
 * Creates multiple voicing options (spread, rich, bass) for each chord
 * @param standardChords - Object mapping chord names to arrays of note names
 * @returns Object mapping chord names to enhanced voicing definitions
 */
export function generateChordEnhancements(
	standardChords: Record<string, string[]>,
): Record<string, ChordDefinition> {
	const enhanced: Record<string, ChordDefinition> = {};

	for (const [chordName, notes] of Object.entries(standardChords)) {
		// Extract root note for bass/rich voicings
		const rootNote = notes[0];
		const rootMatch = rootNote.match(/^([A-G][b#]?)/);
		if (!rootMatch) continue;
		const rootNoteName = rootMatch[1];

		// Basic structure
		enhanced[chordName] = {
			standard: notes,
		};

		// Generate spread voicing (root down 1 octave, 5th up 1 octave)
		if (notes.length >= 3) {
			enhanced[chordName].spread = [
				transposeNoteByOctaves(notes[0], -1), // Root down 1 octave
				notes[1], // 3rd stays same
				transposeNoteByOctaves(notes[2], 1), // 5th up 1 octave
			];
		}

		// Generate bass voicing (add bass note 2 octaves down)
		enhanced[chordName].bass = [
			transposeNoteByOctaves(rootNote, -2), // Bass note
			...notes, // Original chord
		];

		// Generate rich voicing for major/minor chords
		if (chordName.match(/^[A-G][b#]?m?$/)) {
			enhanced[chordName].rich = [
				transposeNoteByOctaves(rootNote, -2), // Sub bass
				transposeNoteByOctaves(rootNote, -1), // Bass
				notes[1], // 3rd
				notes[2], // 5th
				transposeNoteByOctaves(rootNote, 1), // Root doubled up
			];
		}

		// Add root bass with first inversion (root one octave down + first inversion)
		if (notes.length === 3) {
			enhanced[chordName].rootBass = [
				transposeNoteByOctaves(notes[0], -1), // Root down 1 octave
				notes[1], // 3rd (now lowest of the triad)
				notes[2], // 5th
				transposeNoteByOctaves(notes[0], 1), // Root up an octave
			];
		}

		// Add inversions for major/minor triads
		if (notes.length === 3 && chordName.match(/^[A-G][b#]?m?$/)) {
			enhanced[chordName].inversions = {
				// First inversion: 3rd in bass
				first: [
					notes[1], // 3rd
					notes[2], // 5th
					transposeNoteByOctaves(notes[0], 1), // Root up an octave
				],
				// Second inversion: 5th in bass
				second: [
					notes[2], // 5th
					transposeNoteByOctaves(notes[0], 1), // Root up an octave
					transposeNoteByOctaves(notes[1], 1), // 3rd up an octave
				],
			};
		}
	}

	return enhanced;
}

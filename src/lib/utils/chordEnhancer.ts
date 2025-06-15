/**
 * Generate enhanced chord voicings at runtime
 */

// Define chord structures with multiple voicing options
export interface ChordDefinition {
	standard: string[];
	spread?: string[];
	rich?: string[];
	bass?: string[];
	inversions?: {
		first?: string[];
		second?: string[];
	};
}

// Helper to shift notes by octaves
function shiftOctave(note: string, shift: number): string {
	const match = note.match(/^([A-G][b#]?)(\d+)$/);
	if (!match) return note;
	const [, noteName, octaveStr] = match;
	const newOctave = Number.parseInt(octaveStr) + shift;
	return `${noteName}${newOctave}`;
}

/**
 * Generate enhanced chord voicings from standard chord definitions
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
				shiftOctave(notes[0], -1), // Root down 1 octave
				notes[1], // 3rd stays same
				shiftOctave(notes[2], 1), // 5th up 1 octave
			];
		}

		// Generate bass voicing (add bass note 2 octaves down)
		enhanced[chordName].bass = [
			shiftOctave(rootNote, -2), // Bass note
			...notes, // Original chord
		];

		// Generate rich voicing for major/minor chords
		if (chordName.match(/^[A-G][b#]?m?$/)) {
			enhanced[chordName].rich = [
				shiftOctave(rootNote, -2), // Sub bass
				shiftOctave(rootNote, -1), // Bass
				notes[1], // 3rd
				notes[2], // 5th
				shiftOctave(rootNote, 1), // Root doubled up
			];
		}

		// Add inversions for major/minor triads
		if (notes.length === 3 && chordName.match(/^[A-G][b#]?m?$/)) {
			enhanced[chordName].inversions = {
				// First inversion: 3rd in bass
				first: [
					notes[1], // 3rd
					notes[2], // 5th
					shiftOctave(notes[0], 1), // Root up an octave
				],
				// Second inversion: 5th in bass
				second: [
					notes[2], // 5th
					shiftOctave(notes[0], 1), // Root up an octave
					shiftOctave(notes[1], 1), // 3rd up an octave
				],
			};
		}
	}

	return enhanced;
}

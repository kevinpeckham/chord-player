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
	const newOctave = Number.parseInt(octaveStr, 10) + octaveShift;
	return `${noteName}${newOctave}`;
}

// Simple major/minor triad names ("C", "Bbm", "Csm"); other qualities
// (7ths, dyads) only get the voicings that don't assume a triad shape
const TRIAD_NAME = /^[A-G][sb#]?m?$/;

// Spread voicing: root down 1 octave, 3rd in place, 5th up 1 octave
function spreadVoicing(notes: string[]): string[] {
	return [
		transposeNoteByOctaves(notes[0], -1),
		notes[1],
		transposeNoteByOctaves(notes[2], 1),
	];
}

// Bass voicing: the original chord under a bass note 2 octaves down
function bassVoicing(notes: string[], rootNote: string): string[] {
	return [transposeNoteByOctaves(rootNote, -2), ...notes];
}

// Rich voicing: sub-bass, bass, 3rd, 5th, and the root doubled up
function richVoicing(notes: string[], rootNote: string): string[] {
	return [
		transposeNoteByOctaves(rootNote, -2),
		transposeNoteByOctaves(rootNote, -1),
		notes[1],
		notes[2],
		transposeNoteByOctaves(rootNote, 1),
	];
}

// Root bass: root down an octave under the first inversion, root doubled up
function rootBassVoicing(notes: string[]): string[] {
	return [
		transposeNoteByOctaves(notes[0], -1),
		notes[1],
		notes[2],
		transposeNoteByOctaves(notes[0], 1),
	];
}

// First inversion (3rd in bass) and second inversion (5th in bass)
function triadInversions(notes: string[]): ChordDefinition["inversions"] {
	return {
		first: [notes[1], notes[2], transposeNoteByOctaves(notes[0], 1)],
		second: [
			notes[2],
			transposeNoteByOctaves(notes[0], 1),
			transposeNoteByOctaves(notes[1], 1),
		],
	};
}

// Build every applicable voicing for one chord
function enhanceChord(chordName: string, notes: string[]): ChordDefinition {
	const rootNote = notes[0];
	const isTriadName = TRIAD_NAME.test(chordName);
	const hasThreeNotes = notes.length === 3;

	const definition: ChordDefinition = {
		standard: notes,
		bass: bassVoicing(notes, rootNote),
	};
	if (notes.length >= 3) definition.spread = spreadVoicing(notes);
	if (isTriadName) definition.rich = richVoicing(notes, rootNote);
	if (hasThreeNotes) definition.rootBass = rootBassVoicing(notes);
	if (hasThreeNotes && isTriadName) {
		definition.inversions = triadInversions(notes);
	}
	return definition;
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
		// Skip entries whose root note is not parseable
		if (!notes[0]?.match(/^([A-G][b#]?)/)) continue;
		enhanced[chordName] = enhanceChord(chordName, notes);
	}

	return enhanced;
}

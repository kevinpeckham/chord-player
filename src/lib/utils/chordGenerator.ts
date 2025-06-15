import { calculateFrequency, shiftOctave } from "./frequencyGenerator";

// Chord interval definitions (in semitones from root)
const CHORD_INTERVALS = {
	major: [0, 4, 7], // Root, Major 3rd, Perfect 5th
	minor: [0, 3, 7], // Root, Minor 3rd, Perfect 5th
	diminished: [0, 3, 6], // Root, Minor 3rd, Diminished 5th
	augmented: [0, 4, 8], // Root, Major 3rd, Augmented 5th
	maj7: [0, 4, 7, 11], // Major 7th
	min7: [0, 3, 7, 10], // Minor 7th
	dom7: [0, 4, 7, 10], // Dominant 7th
	sus2: [0, 2, 7], // Suspended 2nd
	sus4: [0, 5, 7], // Suspended 4th
};

// Common chord voicing patterns
const VOICING_PATTERNS = {
	root: [0, 0, 0], // All notes in same octave
	firstInversion: [0, 0, 1], // 3rd in bass, 5th up an octave
	secondInversion: [0, 1, 1], // 5th in bass, root & 3rd up
	spread: [0, 1, 1], // Root position, spread voicing
	drop2: [0, -1, 0, 0], // For 7th chords, drop 2nd voice down
	close: [0, 0, 0, 0], // Close position for 7th chords
};

export interface ChordOptions {
	rootNote: string; // e.g., "C4"
	chordType: keyof typeof CHORD_INTERVALS;
	voicing?: keyof typeof VOICING_PATTERNS;
	octaveShift?: number; // Shift entire chord up/down octaves
	spread?: number; // Additional octave spread between notes
}

/**
 * Generate chord frequencies with flexible voicing options
 */
export function generateChord(options: ChordOptions): number[] {
	const {
		rootNote,
		chordType,
		voicing = "root",
		octaveShift = 0,
		spread = 0,
	} = options;

	const intervals = CHORD_INTERVALS[chordType];
	const voicingPattern = VOICING_PATTERNS[voicing] || VOICING_PATTERNS.root;

	// Parse root note
	const match = rootNote.match(/^([A-G][b#]?)(\d+)$/);
	if (!match) throw new Error(`Invalid note format: ${rootNote}`);

	const [, noteName, octaveStr] = match;
	const baseOctave = Number.parseInt(octaveStr);

	// Map note names to semitone offsets from C
	const noteOffsets: Record<string, number> = {
		C: 0,
		"C#": 1,
		Db: 1,
		D: 2,
		"D#": 3,
		Eb: 3,
		E: 4,
		F: 5,
		"F#": 6,
		Gb: 6,
		G: 7,
		"G#": 8,
		Ab: 8,
		A: 9,
		"A#": 10,
		Bb: 10,
		B: 11,
	};

	const rootOffset = noteOffsets[noteName];
	const frequencies: number[] = [];

	intervals.forEach((interval, index) => {
		// Calculate the note's semitone position
		const totalSemitones = rootOffset + interval;
		const noteOctaveShift = Math.floor(totalSemitones / 12);
		const noteWithinOctave = totalSemitones % 12;

		// Find the note name
		const noteNames = [
			"C",
			"C#",
			"D",
			"D#",
			"E",
			"F",
			"F#",
			"G",
			"G#",
			"A",
			"A#",
			"B",
		];
		const resultNoteName = noteNames[noteWithinOctave];

		// Apply voicing pattern and calculate final octave
		const voicingShift = voicingPattern[index] || 0;
		const spreadShift = spread * index;
		const finalOctave =
			baseOctave + noteOctaveShift + voicingShift + spreadShift + octaveShift;

		// Generate the frequency
		const noteString = `${resultNoteName}${finalOctave}`;
		frequencies.push(calculateFrequency(noteString));
	});

	return frequencies;
}

/**
 * Generate chord progression frequencies
 */
export function generateProgression(
	progression: string[], // e.g., ["C4", "Am3", "F4", "G4"]
	defaultOctave = 4,
): number[][] {
	return progression.map((chordSymbol) => {
		// Parse chord symbol (e.g., "C4", "Am3", "F#m5")
		const match = chordSymbol.match(/^([A-G][b#]?)([m]?)(\d*)$/);
		if (!match) throw new Error(`Invalid chord symbol: ${chordSymbol}`);

		const [, rootName, minorFlag, octaveStr] = match;
		const octave = octaveStr ? Number.parseInt(octaveStr) : defaultOctave;
		const chordType = minorFlag ? "minor" : "major";

		return generateChord({
			rootNote: `${rootName}${octave}`,
			chordType,
		});
	});
}

/**
 * Create rich, multi-octave chord voicings
 */
export function generateRichChord(
	rootNote: string,
	options: {
		bassOctaveDown?: boolean; // Add bass note octave below
		doubleRoot?: boolean; // Double the root an octave up
		spread?: boolean; // Spread notes across octaves
		addSeventh?: boolean; // Add 7th to the chord
	} = {},
): number[] {
	const { bassOctaveDown, doubleRoot, spread, addSeventh } = options;

	// Start with basic triad
	let frequencies = generateChord({
		rootNote,
		chordType: addSeventh ? "maj7" : "major",
		voicing: spread ? "spread" : "root",
	});

	// Add bass note
	if (bassOctaveDown) {
		const bassFreq = shiftOctave(frequencies[0], -1);
		frequencies = [bassFreq, ...frequencies];
	}

	// Double root
	if (doubleRoot) {
		const highRoot = shiftOctave(frequencies[0], 1);
		frequencies.push(highRoot);
	}

	return frequencies;
}

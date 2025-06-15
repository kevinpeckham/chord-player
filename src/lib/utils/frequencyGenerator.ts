/**
 * Musical frequency generation utilities
 * Based on A440 tuning standard (A4 = 440 Hz)
 */

// Constants for musical calculations
const A4_FREQUENCY = 440; // Hz
const SEMITONES_PER_OCTAVE = 12;
const TWELFTH_ROOT_OF_TWO = 2 ** (1 / 12);

// Note names in chromatic order
const NOTE_NAMES = [
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
const ENHARMONIC_MAP: Record<string, string> = {
	Db: "C#",
	Eb: "D#",
	Gb: "F#",
	Ab: "G#",
	Bb: "A#",
};

/**
 * Calculate frequency for any note using equal temperament
 * Internal helper function used by generateFrequencyMap
 * @param note - Note name (e.g., "C4", "A#5", "Db3")
 * @returns Frequency in Hz
 */
function calculateFrequency(note: string): number {
	const match = note.match(/^([A-G][b#]?)(\d+)$/);
	if (!match) throw new Error(`Invalid note format: ${note}`);

	let [, noteName, octaveStr] = match;
	const octave = Number.parseInt(octaveStr);

	// Handle enharmonic equivalents
	if (noteName in ENHARMONIC_MAP) {
		noteName = ENHARMONIC_MAP[noteName];
	}

	// Find semitone distance from C
	const noteIndex = NOTE_NAMES.indexOf(noteName.replace("#", "#"));
	if (noteIndex === -1) throw new Error(`Unknown note: ${noteName}`);

	// Calculate semitone distance from A4
	const semitonesFromA4 = (octave - 4) * SEMITONES_PER_OCTAVE + (noteIndex - 9);

	// Calculate frequency: f = 440 * 2^(n/12)
	return A4_FREQUENCY * TWELFTH_ROOT_OF_TWO ** semitonesFromA4;
}

/**
 * Generate frequencies for a range of octaves
 * @param startOctave - Starting octave (e.g., 0)
 * @param endOctave - Ending octave (e.g., 8)
 * @param includeEnharmonics - Whether to include flat note names
 * @returns Map of note names to frequencies
 */
export function generateFrequencyMap(
	startOctave = 0,
	endOctave = 8,
	includeEnharmonics = true,
): Record<string, number> {
	const frequencies: Record<string, number> = {};

	for (let octave = startOctave; octave <= endOctave; octave++) {
		for (const noteName of NOTE_NAMES) {
			const noteWithOctave = `${noteName}${octave}`;
			frequencies[noteWithOctave] = roundFrequency(
				calculateFrequency(noteWithOctave),
				2,
			);

			// Add enharmonic equivalents
			if (includeEnharmonics) {
				const flatName = Object.entries(ENHARMONIC_MAP).find(
					([, sharp]) => sharp === noteName,
				)?.[0];
				if (flatName) {
					frequencies[`${flatName}${octave}`] = frequencies[noteWithOctave];
				}
			}
		}
	}

	return frequencies;
}

/**
 * Round frequency to a specific precision
 * Internal helper function used by generateFrequencyMap
 * @param frequency - Frequency in Hz
 * @param decimalPlaces - Number of decimal places (default: 2)
 */
function roundFrequency(frequency: number, decimalPlaces = 2): number {
	const factor = 10 ** decimalPlaces;
	return Math.round(frequency * factor) / factor;
}

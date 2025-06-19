/**
 * Utility functions for handling enharmonic chord names based on key center
 */

import type { Chord } from "$lib/types/Chord";

// Define which keys prefer sharps vs flats
const SHARP_KEYS = ["G", "D", "A", "E", "B", "F#", "C#"];
const FLAT_KEYS = ["F", "Bb", "Eb", "Ab", "Db", "Gb"];

// Enharmonic equivalents (using ♭ and ♯ symbols)
const ENHARMONIC_MAP: Record<string, string> = {
	"C♯": "D♭",
	"D♭": "C♯",
	"D♯": "E♭",
	"E♭": "D♯",
	"F♯": "G♭",
	"G♭": "F♯",
	"G♯": "A♭",
	"A♭": "G♯",
	"A♯": "B♭",
	"B♭": "A♯",
	// Minor chords
	"C♯m": "D♭m",
	"D♭m": "C♯m",
	"D♯m": "E♭m",
	"E♭m": "D♯m",
	"F♯m": "G♭m",
	"G♭m": "F♯m",
	"G♯m": "A♭m",
	"A♭m": "G♯m",
	"A♯m": "B♭m",
	"B♭m": "A♯m",
};

/**
 * Determine if a key center prefers sharps or flats
 */
export function prefersSharp(keyCenter: string): boolean {
	// Handle enharmonic key centers
	const normalizedKey = keyCenter.replace("#", "").replace("b", "");

	// C can go either way, but we'll default to flats for better readability
	if (keyCenter === "C") return false;

	// Check if it's in the sharp keys list
	return SHARP_KEYS.includes(keyCenter);
}

/**
 * Get the correct enharmonic name for a chord based on the key center
 */
export function getEnharmonicChordName(
	chordName: string,
	keyCenter: string,
): string {
	// If no enharmonic equivalent exists, return original
	if (!ENHARMONIC_MAP[chordName]) {
		return chordName;
	}

	const useSharp = prefersSharp(keyCenter);
	const hasSharp = chordName.includes("♯");
	const hasFlat = chordName.includes("♭");

	// If the chord uses the preferred accidental, keep it
	if ((useSharp && hasSharp) || (!useSharp && hasFlat)) {
		return chordName;
	}

	// Otherwise, return the enharmonic equivalent
	return ENHARMONIC_MAP[chordName];
}

/**
 * Process chord data to use correct enharmonic names based on key center
 */
export function processChordEnharmonics(
	chord: Chord,
	keyCenter: string,
): Chord {
	const majorDisplay = getEnharmonicChordName(chord.majorDisplay, keyCenter);
	const minorDisplay = getEnharmonicChordName(chord.minorDisplay, keyCenter);

	return {
		...chord,
		majorDisplay,
		minorDisplay,
	};
}

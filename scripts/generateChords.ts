#!/usr/bin/env bun
/**
 * Generate enhanced chord definitions with multiple voicing options
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";

// Define chord structures with multiple voicing options
interface ChordDefinition {
	standard: string[]; // Original voicing
	spread?: string[]; // Spread voicing
	rich?: string[]; // Rich voicing with doubled notes
	bass?: string[]; // With bass note
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

// Generate comprehensive chord definitions
const chords: Record<string, ChordDefinition> = {
	// C major variations
	C: {
		standard: ["C4", "E4", "G4"],
		spread: ["C3", "E4", "G5"],
		rich: ["C2", "C3", "E4", "G4", "C5"],
		bass: ["C2", "C4", "E4", "G4"],
		inversions: {
			first: ["E4", "G4", "C5"],
			second: ["G4", "C5", "E5"],
		},
	},
	Cm: {
		standard: ["C4", "Eb4", "G4"],
		spread: ["C3", "Eb4", "G5"],
		rich: ["C2", "C3", "Eb4", "G4", "C5"],
		bass: ["C2", "C4", "Eb4", "G4"],
	},

	// C# / Db
	Db: {
		standard: ["Db4", "F4", "Ab4"],
		spread: ["Db3", "F4", "Ab5"],
		rich: ["Db2", "Db3", "F4", "Ab4", "Db5"],
		bass: ["Db2", "Db4", "F4", "Ab4"],
	},
	Csm: {
		standard: ["Db4", "E4", "Ab4"],
		spread: ["Db3", "E4", "Ab5"],
		rich: ["Db2", "Db3", "E4", "Ab4", "Db5"],
	},

	// D
	D: {
		standard: ["D4", "Gb4", "A4"],
		spread: ["D3", "Gb4", "A5"],
		rich: ["D2", "D3", "Gb4", "A4", "D5"],
		bass: ["D2", "D4", "Gb4", "A4"],
	},
	Dm: {
		standard: ["D4", "F4", "A4"],
		spread: ["D3", "F4", "A5"],
		rich: ["D2", "D3", "F4", "A4", "D5"],
	},

	// Eb
	Eb: {
		standard: ["Eb4", "G4", "Bb4"],
		spread: ["Eb3", "G4", "Bb5"],
		rich: ["Eb2", "Eb3", "G4", "Bb4", "Eb5"],
		bass: ["Eb2", "Eb4", "G4", "Bb4"],
	},
	Dsm: {
		standard: ["Eb4", "Gb4", "Bb4"],
		spread: ["Eb3", "Gb4", "Bb5"],
	},
	Ebm: {
		standard: ["Eb4", "Gb4", "Bb4"],
		spread: ["Eb3", "Gb4", "Bb5"],
		rich: ["Eb2", "Eb3", "Gb4", "Bb4", "Eb5"],
	},

	// E
	E: {
		standard: ["E4", "Ab4", "B4"],
		spread: ["E3", "Ab4", "B5"],
		rich: ["E2", "E3", "Ab4", "B4", "E5"],
		bass: ["E2", "E4", "Ab4", "B4"],
	},
	Em: {
		standard: ["E4", "G4", "B4"],
		spread: ["E3", "G4", "B5"],
		rich: ["E2", "E3", "G4", "B4", "E5"],
	},

	// F
	F: {
		standard: ["F4", "A4", "C5"],
		spread: ["F3", "A4", "C6"],
		rich: ["F2", "F3", "A4", "C5", "F5"],
		bass: ["F2", "F4", "A4", "C5"],
	},
	Fm: {
		standard: ["F4", "Ab4", "C5"],
		spread: ["F3", "Ab4", "C6"],
		rich: ["F2", "F3", "Ab4", "C5", "F5"],
	},

	// F# / Gb
	Gb: {
		standard: ["Gb4", "Bb4", "Db5"],
		spread: ["Gb3", "Bb4", "Db6"],
		rich: ["Gb2", "Gb3", "Bb4", "Db5", "Gb5"],
		bass: ["Gb2", "Gb4", "Bb4", "Db5"],
	},
	Fsm: {
		standard: ["Gb4", "A4", "Db5"],
		spread: ["Gb3", "A4", "Db6"],
	},

	// G
	G: {
		standard: ["G4", "B4", "D5"],
		spread: ["G3", "B4", "D6"],
		rich: ["G2", "G3", "B4", "D5", "G5"],
		bass: ["G2", "G4", "B4", "D5"],
	},
	Gm: {
		standard: ["G4", "Bb4", "D5"],
		spread: ["G3", "Bb4", "D6"],
		rich: ["G2", "G3", "Bb4", "D5", "G5"],
	},

	// Ab
	Ab: {
		standard: ["Ab4", "C5", "Eb5"],
		spread: ["Ab3", "C5", "Eb6"],
		rich: ["Ab2", "Ab3", "C5", "Eb5", "Ab5"],
		bass: ["Ab2", "Ab4", "C5", "Eb5"],
	},
	Gsm: {
		standard: ["Ab4", "B4", "Eb5"],
		spread: ["Ab3", "B4", "Eb6"],
	},

	// A
	A: {
		standard: ["A4", "Db5", "E5"],
		spread: ["A3", "Db5", "E6"],
		rich: ["A2", "A3", "Db5", "E5", "A5"],
		bass: ["A2", "A4", "Db5", "E5"],
	},
	Am: {
		standard: ["A4", "C5", "E5"],
		spread: ["A3", "C5", "E6"],
		rich: ["A2", "A3", "C5", "E5", "A5"],
	},

	// Bb
	Bb: {
		standard: ["Bb4", "D5", "F5"],
		spread: ["Bb3", "D5", "F6"],
		rich: ["Bb2", "Bb3", "D5", "F5", "Bb5"],
		bass: ["Bb2", "Bb4", "D5", "F5"],
	},
	Bbm: {
		standard: ["Bb4", "Db5", "F5"],
		spread: ["Bb3", "Db5", "F6"],
		rich: ["Bb2", "Bb3", "Db5", "F5", "Bb5"],
	},

	// B
	B: {
		standard: ["B4", "Eb5", "Gb5"],
		spread: ["B3", "Eb5", "Gb6"],
		rich: ["B2", "B3", "Eb5", "Gb5", "B5"],
		bass: ["B2", "B4", "Eb5", "Gb5"],
	},
	Bm: {
		standard: ["B4", "D5", "Gb5"],
		spread: ["B3", "D5", "Gb6"],
		rich: ["B2", "B3", "D5", "Gb5", "B5"],
	},
};

// Write standard chords (backward compatible)
const standardChords: Record<string, string[]> = {};
for (const [name, def] of Object.entries(chords)) {
	standardChords[name] = def.standard;
}

const standardPath = join(process.cwd(), "src/lib/data/chords.json");
writeFileSync(standardPath, JSON.stringify(standardChords, null, "\t"));
console.log(`✓ Generated standard chords: ${standardPath}`);

// Write enhanced chords
const enhancedPath = join(process.cwd(), "src/lib/data/chords-enhanced.json");
writeFileSync(enhancedPath, JSON.stringify(chords, null, "\t"));
console.log(`✓ Generated enhanced chords: ${enhancedPath}`);

// Generate chord metadata
const metadata = {
	voicingTypes: ["standard", "spread", "rich", "bass"],
	chordCount: Object.keys(chords).length,
	voicingCounts: {
		standard: Object.keys(chords).length,
		spread: Object.values(chords).filter((c) => c.spread).length,
		rich: Object.values(chords).filter((c) => c.rich).length,
		bass: Object.values(chords).filter((c) => c.bass).length,
		inversions: Object.values(chords).filter((c) => c.inversions).length,
	},
};

console.log("\nChord generation summary:");
console.log(`  Total chords: ${metadata.chordCount}`);
console.log(`  Voicing types: ${metadata.voicingTypes.join(", ")}`);
console.log(`  Chords with spread voicing: ${metadata.voicingCounts.spread}`);
console.log(`  Chords with rich voicing: ${metadata.voicingCounts.rich}`);
console.log(`  Chords with bass voicing: ${metadata.voicingCounts.bass}`);

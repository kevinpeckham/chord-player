#!/usr/bin/env bun
/**
 * Build script to generate comprehensive frequency map
 * Generates frequencies for octaves 1-7 with proper precision
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	generateFrequencyMap,
	roundFrequency,
} from "../src/lib/utils/frequencyGenerator";

// Generate frequencies for octaves 1-7
console.log("Generating frequency map for octaves 1-7...");
const frequencies = generateFrequencyMap(1, 7, true);

// Round all frequencies to 2 decimal places for consistency
const roundedFrequencies: Record<string, number> = {};
for (const [note, freq] of Object.entries(frequencies)) {
	roundedFrequencies[note] = roundFrequency(freq, 2);
}

// Sort keys for better readability (by octave, then by note)
const sortedKeys = Object.keys(roundedFrequencies).sort((a, b) => {
	const aMatch = a.match(/^([A-G][b#]?)(\d+)$/);
	const bMatch = b.match(/^([A-G][b#]?)(\d+)$/);
	if (!aMatch || !bMatch) return 0;

	const aOctave = Number.parseInt(aMatch[2]);
	const bOctave = Number.parseInt(bMatch[2]);

	if (aOctave !== bOctave) return aOctave - bOctave;

	// Note order within octave
	const noteOrder = [
		"C",
		"C#",
		"Db",
		"D",
		"D#",
		"Eb",
		"E",
		"F",
		"F#",
		"Gb",
		"G",
		"G#",
		"Ab",
		"A",
		"A#",
		"Bb",
		"B",
	];
	const aIndex = noteOrder.indexOf(aMatch[1]);
	const bIndex = noteOrder.indexOf(bMatch[1]);

	return aIndex - bIndex;
});

// Build sorted object
const sortedFrequencies: Record<string, number> = {};
sortedKeys.forEach((key) => {
	sortedFrequencies[key] = roundedFrequencies[key];
});

// Write to file
const outputPath = join(process.cwd(), "src/lib/data/notes-extended.json");
const jsonContent = JSON.stringify(sortedFrequencies, null, "\t");
writeFileSync(outputPath, jsonContent);

console.log(`✓ Generated ${Object.keys(sortedFrequencies).length} frequencies`);
console.log(`✓ Written to ${outputPath}`);

// Generate summary
const octaveCounts: Record<number, number> = {};
for (const key of sortedKeys) {
	const octave = Number.parseInt(key.match(/\d+/)![0]);
	octaveCounts[octave] = (octaveCounts[octave] || 0) + 1;
}

console.log("\nOctave distribution:");
for (const [octave, count] of Object.entries(octaveCounts)) {
	console.log(`  Octave ${octave}: ${count} notes`);
}

// Show sample frequencies
console.log("\nSample frequencies:");
console.log(`  A1: ${sortedFrequencies["A1"]} Hz (sub-bass)`);
console.log(`  A2: ${sortedFrequencies["A2"]} Hz (bass)`);
console.log(`  A3: ${sortedFrequencies["A3"]} Hz (low)`);
console.log(`  A4: ${sortedFrequencies["A4"]} Hz (concert pitch)`);
console.log(`  A5: ${sortedFrequencies["A5"]} Hz (high)`);
console.log(`  A6: ${sortedFrequencies["A6"]} Hz (very high)`);
console.log(`  A7: ${sortedFrequencies["A7"]} Hz (extreme)`);

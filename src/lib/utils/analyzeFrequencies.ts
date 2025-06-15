import notesData from "$data/notes.json";
import {
	analyzeFrequencyPrecision,
	calculateFrequency,
	roundFrequency,
} from "./frequencyGenerator";

// Analyze stored frequencies
const analysis = analyzeFrequencyPrecision(notesData);

console.log("Frequency Precision Analysis");
console.log("============================\n");

// Sort by percent error to find outliers
const sorted = [...analysis].sort((a, b) => b.percentError - a.percentError);

console.log("Top differences:");
sorted.slice(0, 5).forEach(({ note, stored, calculated, percentError }) => {
	console.log(
		`${note}: stored=${stored}, calculated=${calculated.toFixed(2)}, error=${percentError.toFixed(4)}%`,
	);
});

// Overall statistics
const avgError =
	analysis.reduce((sum, { percentError }) => sum + percentError, 0) /
	analysis.length;
const maxError = Math.max(...analysis.map(({ percentError }) => percentError));

console.log(`\nAverage error: ${avgError.toFixed(4)}%`);
console.log(`Maximum error: ${maxError.toFixed(4)}%`);

// Test mathematical generation
console.log("\n\nMathematical Generation Test");
console.log("============================");

// Generate the same notes mathematically
console.log("\nRecalculated values (2 decimal places):");
Object.keys(notesData).forEach((note) => {
	const calculated = calculateFrequency(note);
	console.log(`"${note}": ${roundFrequency(calculated, 2)},`);
});

// Show how to expand octaves
console.log("\n\nOctave Expansion Example");
console.log("========================");
console.log("C notes across octaves:");
for (let octave = 0; octave <= 8; octave++) {
	const freq = calculateFrequency(`C${octave}`);
	console.log(`C${octave}: ${freq.toFixed(2)} Hz`);
}

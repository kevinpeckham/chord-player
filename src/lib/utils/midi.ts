/**
 * MIDI utilities: note/frequency conversion and a minimal Standard MIDI File
 * (SMF format 0) writer for exporting jotted progressions. Hand-rolled and
 * dependency-free — the format is a header chunk plus one track chunk of
 * delta-timed note events.
 */

import type { ProgressionEntry } from "$stores/progression.svelte";

// A440 equal temperament: MIDI note 69 = A4 = 440 Hz
export function frequencyToMidi(frequency: number): number {
	return Math.round(69 + 12 * Math.log2(frequency / 440));
}

export function frequenciesToMidi(frequencies: number[]): number[] {
	return frequencies.map(frequencyToMidi);
}

// Inverse, rounded to the project's 2-decimal frequency convention
export function midiToFrequency(note: number): number {
	return Math.round(440 * 2 ** ((note - 69) / 12) * 100) / 100;
}

// ---------------------------------------------------------------------------
// Standard MIDI File writer
// ---------------------------------------------------------------------------

const TICKS_PER_QUARTER = 480;
const NOTE_VELOCITY = 96;

// MIDI delta times are variable-length quantities: 7 bits per byte, high bit
// set on every byte except the last
export function encodeVariableLength(value: number): number[] {
	if (value < 0) throw new Error(`negative delta time: ${value}`);
	const bytes = [value & 0x7f];
	let remaining = value >> 7;
	while (remaining > 0) {
		bytes.unshift((remaining & 0x7f) | 0x80);
		remaining >>= 7;
	}
	return bytes;
}

function uint32(value: number): number[] {
	return [
		(value >> 24) & 0xff,
		(value >> 16) & 0xff,
		(value >> 8) & 0xff,
		value & 0xff,
	];
}

function uint16(value: number): number[] {
	return [(value >> 8) & 0xff, value & 0xff];
}

/**
 * Build a format-0 .mid file from progression entries.
 * Each chord lasts one quarter note; line breaks become one-quarter rests.
 * Entries without note data (legacy jottings) are skipped.
 */
export function progressionToMidi(
	entries: ProgressionEntry[],
	tempoBpm = 120,
): Uint8Array<ArrayBuffer> {
	const events: number[] = [];

	// Tempo meta event at tick 0 (microseconds per quarter note)
	const microsPerQuarter = Math.round(60_000_000 / tempoBpm);
	events.push(
		0x00,
		0xff,
		0x51,
		0x03,
		(microsPerQuarter >> 16) & 0xff,
		(microsPerQuarter >> 8) & 0xff,
		microsPerQuarter & 0xff,
	);

	// Delta time owed to the next event (accumulates across rests/skips)
	let pendingDelta = 0;

	for (const entry of entries) {
		if (entry.kind === "break") {
			pendingDelta += TICKS_PER_QUARTER;
			continue;
		}
		if (entry.notes.length === 0) continue;

		// Note-ons: first carries the pending delta, the rest are simultaneous
		entry.notes.forEach((note, i) => {
			events.push(
				...encodeVariableLength(i === 0 ? pendingDelta : 0),
				0x90,
				note & 0x7f,
				NOTE_VELOCITY,
			);
		});
		// Note-offs one quarter note later
		entry.notes.forEach((note, i) => {
			events.push(
				...encodeVariableLength(i === 0 ? TICKS_PER_QUARTER : 0),
				0x80,
				note & 0x7f,
				0x00,
			);
		});
		pendingDelta = 0;
	}

	// End-of-track meta event
	events.push(0x00, 0xff, 0x2f, 0x00);

	const header = [
		0x4d,
		0x54,
		0x68,
		0x64, // "MThd"
		...uint32(6), // header length
		...uint16(0), // format 0
		...uint16(1), // one track
		...uint16(TICKS_PER_QUARTER),
	];
	const track = [
		0x4d,
		0x54,
		0x72,
		0x6b, // "MTrk"
		...uint32(events.length),
		...events,
	];

	return new Uint8Array([...header, ...track]);
}

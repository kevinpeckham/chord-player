import type { ProgressionEntry } from "$stores/progression.svelte";

import { describe, expect, it } from "vitest";
import {
	encodeVariableLength,
	frequenciesToMidi,
	frequencyToMidi,
	midiToFrequency,
	progressionToMidi,
} from "./midi";

const C_MAJOR_NOTES = [60, 64, 67]; // C4 E4 G4

describe("frequencyToMidi", () => {
	it("maps A440 tuning to MIDI note numbers", () => {
		expect(frequencyToMidi(440)).toBe(69); // A4
		expect(frequencyToMidi(261.63)).toBe(60); // middle C
		expect(frequencyToMidi(466.16)).toBe(70); // Bb4
		expect(frequencyToMidi(220)).toBe(57); // A3
	});

	it("maps chord frequency arrays", () => {
		expect(frequenciesToMidi([261.63, 329.63, 392])).toEqual(C_MAJOR_NOTES);
	});

	it("round-trips with midiToFrequency", () => {
		for (const note of [21, 57, 60, 69, 70, 108]) {
			expect(frequencyToMidi(midiToFrequency(note))).toBe(note);
		}
	});
});

describe("encodeVariableLength", () => {
	it("encodes 7-bit values as single bytes", () => {
		expect(encodeVariableLength(0)).toEqual([0x00]);
		expect(encodeVariableLength(127)).toEqual([0x7f]);
	});

	it("encodes multi-byte values with continuation bits", () => {
		expect(encodeVariableLength(128)).toEqual([0x81, 0x00]);
		expect(encodeVariableLength(480)).toEqual([0x83, 0x60]);
		expect(encodeVariableLength(0x0fffff)).toEqual([0xbf, 0xff, 0x7f]);
	});

	it("rejects negative deltas", () => {
		expect(() => encodeVariableLength(-1)).toThrow();
	});
});

describe("progressionToMidi", () => {
	const cChord: ProgressionEntry = {
		kind: "chord",
		label: "C",
		notes: C_MAJOR_NOTES,
		beats: 1,
	};
	const lineBreak: ProgressionEntry = { kind: "break" };

	function bytesOf(entries: ProgressionEntry[]): number[] {
		return Array.from(progressionToMidi(entries));
	}

	it("starts with a valid format-0 header at 480 ticks per quarter", () => {
		const bytes = bytesOf([cChord]);
		// "MThd", length 6, format 0, 1 track, division 480
		expect(bytes.slice(0, 14)).toEqual([
			0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, 0x01, 0xe0,
		]);
	});

	it("contains a track chunk whose declared length matches its events", () => {
		const bytes = bytesOf([cChord]);
		expect(bytes.slice(14, 18)).toEqual([0x4d, 0x54, 0x72, 0x6b]); // "MTrk"
		const declared =
			(bytes[18] << 24) | (bytes[19] << 16) | (bytes[20] << 8) | bytes[21];
		expect(bytes.length).toBe(22 + declared);
	});

	it("writes a tempo meta event for the requested BPM", () => {
		const bytes = bytesOf([cChord]);
		// 120 BPM = 500000 us per quarter = 0x07 0xA1 0x20
		expect(bytes.slice(22, 29)).toEqual([
			0x00, 0xff, 0x51, 0x03, 0x07, 0xa1, 0x20,
		]);
	});

	it("emits a note-on and note-off pair per chord note", () => {
		const bytes = bytesOf([cChord]);
		const noteOns = bytes.filter((b) => b === 0x90).length;
		const noteOffs = bytes.filter((b) => b === 0x80).length;
		expect(noteOns).toBe(3);
		expect(noteOffs).toBe(3);
	});

	it("holds each chord for one quarter note", () => {
		const bytes = bytesOf([
			{ kind: "chord", label: "A", notes: [69], beats: 1 },
		]);
		// After the tempo event: delta 0, note-on 69; delta 480, note-off 69
		expect(bytes.slice(29)).toEqual([
			0x00,
			0x90,
			69,
			96, // note on, velocity 96
			0x83,
			0x60,
			0x80,
			69,
			0, // 480 ticks later, note off
			0x00,
			0xff,
			0x2f,
			0x00, // end of track
		]);
	});

	it("holds multi-beat chords proportionally longer", () => {
		const bytes = bytesOf([
			{ kind: "chord", label: "A", notes: [69], beats: 2 },
		]);
		// Note-off delta is 2 quarters = 960 ticks = VLQ 0x87 0x40
		expect(bytes.slice(29)).toEqual([
			0x00, 0x90, 69, 96, 0x87, 0x40, 0x80, 69, 0, 0x00, 0xff, 0x2f, 0x00,
		]);
	});

	it("turns line breaks into one-quarter rests before the next chord", () => {
		const single = bytesOf([cChord, cChord]);
		const withBreak = bytesOf([cChord, lineBreak, cChord]);
		// The second chord's first note-on delta grows from 0 to 480 (1 extra
		// byte for the variable-length delta)
		expect(withBreak.length).toBe(single.length + 1);
		const secondOnDelta = withBreak.indexOf(0x90, 40);
		expect(withBreak.slice(secondOnDelta - 2, secondOnDelta)).toEqual([
			0x83, 0x60,
		]);
	});

	it("skips legacy chords without note data", () => {
		const bytes = bytesOf([{ kind: "chord", label: "C", notes: [], beats: 1 }]);
		expect(bytes.filter((b) => b === 0x90)).toHaveLength(0);
	});

	it("ends with an end-of-track meta event", () => {
		const bytes = bytesOf([cChord]);
		expect(bytes.slice(-4)).toEqual([0x00, 0xff, 0x2f, 0x00]);
	});
});

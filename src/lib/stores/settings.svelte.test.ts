// Tests for the settings rune store (module-level $state singleton).
// State persists between tests in this file, so every test resets in beforeEach.

import { settings } from "$stores/settings.svelte";

import { beforeEach, describe, expect, it } from "vitest";

const DEFAULTS = {
	activeVoice: "sine",
	chordVoicing: "standard",
	mode: "chords",
	noteOctave: 4,
	keyCenter: "C",
	keyCenterPosition: "bottom",
} as const;

function resetSettings() {
	settings.activeVoice = DEFAULTS.activeVoice;
	settings.chordVoicing = DEFAULTS.chordVoicing;
	settings.mode = DEFAULTS.mode;
	settings.noteOctave = DEFAULTS.noteOctave;
	settings.keyCenter = DEFAULTS.keyCenter;
	settings.keyCenterPosition = DEFAULTS.keyCenterPosition;
}

describe("settings store", () => {
	beforeEach(resetSettings);

	it("exposes the expected default values", () => {
		expect(settings.activeVoice).toBe("sine");
		expect(settings.chordVoicing).toBe("standard");
		expect(settings.mode).toBe("chords");
		expect(settings.noteOctave).toBe(4);
		expect(settings.keyCenter).toBe("C");
		expect(settings.keyCenterPosition).toBe("bottom");
	});

	it("lists the four oscillator voices in order", () => {
		expect(settings.availableVoices).toEqual([
			"sine",
			"triangle",
			"square",
			"sawtooth",
		]);
	});

	it("activeVoice can be set to every available voice", () => {
		for (const voice of settings.availableVoices) {
			settings.activeVoice = voice;
			expect(settings.activeVoice).toBe(voice);
		}
	});

	it("chordVoicing accepts all five voicing styles", () => {
		const voicings = [
			"standard",
			"spread",
			"rich",
			"bass",
			"rootBass",
		] as const;
		for (const voicing of voicings) {
			settings.chordVoicing = voicing;
			expect(settings.chordVoicing).toBe(voicing);
		}
	});

	it("mode toggles between chords and notes", () => {
		settings.mode = "notes";
		expect(settings.mode).toBe("notes");
		settings.mode = "chords";
		expect(settings.mode).toBe("chords");
	});

	it("noteOctave and keyCenter mutations persist", () => {
		settings.noteOctave = 7;
		settings.keyCenter = "F#";
		settings.keyCenterPosition = "top";
		expect(settings.noteOctave).toBe(7);
		expect(settings.keyCenter).toBe("F#");
		expect(settings.keyCenterPosition).toBe("top");
	});

	it("is a singleton: a second import sees mutations", async () => {
		settings.keyCenter = "A";
		const again = await import("$stores/settings.svelte");
		expect(again.settings.keyCenter).toBe("A");
		expect(again.settings).toBe(settings);
	});
});

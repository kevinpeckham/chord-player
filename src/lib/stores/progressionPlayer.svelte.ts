// Plays the jotted progression back through the app's own synth. Playback
// goes straight to the audio store with a reserved pointer ID, bypassing the
// Instrument's jotting path — so playback never re-records itself.

import { startChord, stopChordById } from "$stores/audio.svelte";
import { progression } from "$stores/progression.svelte";
import { settings } from "$stores/settings.svelte";

import { midiToFrequency } from "$utils/midi";

// Reserved pointer ID for programmatic playback (never a real pointer)
const PLAYBACK_POINTER_ID = -1;

// Uniform step timing until the transport (Phase B) brings a real BPM:
// 120 BPM quarter notes, with a short release before the next chord
const STEP_MS = 500;
const RELEASE_MS = 420;

export const player = $state({
	playing: false,
	// Index into progression.entries of the sounding chord, -1 when idle
	position: -1,
});

let stepTimeout: ReturnType<typeof setTimeout> | null = null;
let releaseTimeout: ReturnType<typeof setTimeout> | null = null;

function clearTimers(): void {
	if (stepTimeout) clearTimeout(stepTimeout);
	if (releaseTimeout) clearTimeout(releaseTimeout);
	stepTimeout = null;
	releaseTimeout = null;
}

function step(index: number): void {
	// Entries can shrink mid-playback (undo/clear) — re-check every step
	if (!player.playing || index >= progression.entries.length) {
		stopPlayback();
		return;
	}

	const entry = progression.entries[index];
	player.position = index;

	if (entry.kind === "chord" && entry.notes.length > 0) {
		startChord(
			entry.notes.map(midiToFrequency),
			settings.activeVoice as OscillatorType,
			PLAYBACK_POINTER_ID,
		);
		releaseTimeout = setTimeout(() => {
			stopChordById(PLAYBACK_POINTER_ID);
		}, RELEASE_MS);
	}
	// Breaks (and legacy note-less chords) simply rest for a step

	stepTimeout = setTimeout(() => step(index + 1), STEP_MS);
}

export function playProgression(): void {
	if (player.playing) return;
	if (progression.entries.length === 0) return;
	player.playing = true;
	step(0);
}

export function stopPlayback(): void {
	clearTimers();
	stopChordById(PLAYBACK_POINTER_ID);
	player.playing = false;
	player.position = -1;
}

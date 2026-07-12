// Plays the jotted progression back through the app's own synth. Playback
// goes straight to the audio store with a reserved pointer ID, bypassing the
// Instrument's jotting path — and while the transport is engaged, live
// jotting is suspended (progression.suspended) so playing along cannot jot
// into the progression being played. When playback reaches its natural end,
// the suspension lifts and — with ● rec on — the next chord played appends:
// a DAW-style punch-in.

import { startChord, stopChordById } from "$stores/audio.svelte";
import { progression } from "$stores/progression.svelte";
import { settings } from "$stores/settings.svelte";

import { midiToFrequency } from "$utils/midi";
import { beatMs } from "$utils/rhythm";

// Reserved pointer ID for programmatic playback (never a real pointer)
const PLAYBACK_POINTER_ID = -1;

// Fraction of a step held before release, for articulation between chords
const GATE = 0.85;

const BPM_STORAGE_KEY = "fifths-progression-bpm";
const DEFAULT_BPM = 120;
const MIN_BPM = 40;
const MAX_BPM = 240;

function loadBpm(): number {
	if (typeof localStorage === "undefined") return DEFAULT_BPM;
	const stored = Number(localStorage.getItem(BPM_STORAGE_KEY));
	return Number.isFinite(stored) && stored >= MIN_BPM && stored <= MAX_BPM
		? stored
		: DEFAULT_BPM;
}

export const player = $state({
	playing: false,
	paused: false,
	loop: false,
	bpm: loadBpm(),
	// Index into progression.entries of the sounding chord, -1 when idle
	position: -1,
});

export function setBpm(bpm: number): void {
	player.bpm = Math.max(MIN_BPM, Math.min(MAX_BPM, Math.round(bpm)));
	if (typeof localStorage !== "undefined") {
		try {
			localStorage.setItem(BPM_STORAGE_KEY, String(player.bpm));
		} catch {
			// Session-only tempo is fine
		}
	}
}

export function toggleLoop(): void {
	player.loop = !player.loop;
}

let stepTimeout: ReturnType<typeof setTimeout> | null = null;
let releaseTimeout: ReturnType<typeof setTimeout> | null = null;

function clearTimers(): void {
	if (stepTimeout) clearTimeout(stepTimeout);
	if (releaseTimeout) clearTimeout(releaseTimeout);
	stepTimeout = null;
	releaseTimeout = null;
}

function entryBeats(entry: (typeof progression.entries)[number]): number {
	return entry.kind === "chord" ? entry.beats : 1; // breaks rest one beat
}

function step(index: number): void {
	// Entries can shrink mid-playback (undo/clear) — re-check every step
	if (!player.playing) return;
	if (index >= progression.entries.length) {
		if (player.loop && progression.entries.length > 0) {
			step(0);
			return;
		}
		stopPlayback();
		return;
	}

	const entry = progression.entries[index];
	player.position = index;
	const durationMs = entryBeats(entry) * beatMs(player.bpm);

	if (entry.kind === "chord" && entry.notes.length > 0) {
		startChord(
			entry.notes.map(midiToFrequency),
			settings.activeVoice as OscillatorType,
			PLAYBACK_POINTER_ID,
		);
		releaseTimeout = setTimeout(() => {
			stopChordById(PLAYBACK_POINTER_ID);
		}, durationMs * GATE);
	}
	// Breaks (and legacy note-less chords) simply rest for their duration

	stepTimeout = setTimeout(() => step(index + 1), durationMs);
}

export function playProgression(): void {
	if (player.playing && !player.paused) return;
	if (progression.entries.length === 0) return;

	// Resume from a pause, or start from the top
	const startIndex =
		player.paused && player.position >= 0 ? player.position : 0;
	player.playing = true;
	player.paused = false;
	progression.suspended = true;
	step(startIndex);
}

// True pause: freezes the transport at the current position. Jotting stays
// suspended — the transport is still engaged.
export function pausePlayback(): void {
	if (!player.playing || player.paused) return;
	clearTimers();
	stopChordById(PLAYBACK_POINTER_ID);
	player.paused = true;
}

export function stopPlayback(): void {
	clearTimers();
	stopChordById(PLAYBACK_POINTER_ID);
	player.playing = false;
	player.paused = false;
	player.position = -1;
	// Transport disengaged: live jotting may resume (punch-in moment)
	progression.suspended = false;
}

// Progression pad store - captures played chords as a jotted progression,
// persisted to localStorage so a work-in-progress survives reloads.

import type { ChordBeats } from "$utils/rhythm";

export type ProgressionEntry =
	| { kind: "chord"; label: string; notes: number[]; beats: ChordBeats }
	| { kind: "break" };

// v2: chord entries carry MIDI note numbers (for playback and .mid export).
// The key was bumped from "fifths-progression", intentionally abandoning
// note-less v1 jottings. `beats` was added later and defaults to 1 when
// missing, so v2 data upgrades in place.
const STORAGE_KEY = "fifths-progression-v2";

function isValidEntry(entry: unknown): entry is ProgressionEntry {
	if (typeof entry !== "object" || entry === null) return false;
	const candidate = entry as Partial<ProgressionEntry> & { beats?: unknown };
	if (candidate.kind === "break") return true;
	return (
		candidate.kind === "chord" &&
		typeof candidate.label === "string" &&
		Array.isArray(candidate.notes) &&
		candidate.notes.every((note) => typeof note === "number")
	);
}

function normalizeBeats(value: unknown): ChordBeats {
	return value === 2 || value === 4 ? value : 1;
}

// Guarded for SSR/prerender, where localStorage does not exist
function loadEntries(): ProgressionEntry[] {
	if (typeof localStorage === "undefined") return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed
			.filter(isValidEntry)
			.map((entry: ProgressionEntry) =>
				entry.kind === "chord"
					? { ...entry, beats: normalizeBeats(entry.beats) }
					: entry,
			);
	} catch {
		return [];
	}
}

function persist(): void {
	if (typeof localStorage === "undefined") return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(progression.entries));
	} catch {
		// Storage may be full or blocked (private browsing) — jotting still
		// works for the session, it just won't survive a reload
	}
}

export const progression = $state({
	entries: loadEntries(),
	// The ● rec toggle: off = noodle freely without jotting (session-only)
	recording: true,
	// Set by the transport while playback runs: live jotting is suspended so
	// playing along with playback cannot jot into the progression being
	// played. Cleared when playback ends — which is what makes "press play,
	// listen to the end, keep playing" a natural punch-in.
	suspended: false,
});

// True when a played chord should be jotted right now
function shouldRecord(): boolean {
	return progression.recording && !progression.suspended;
}

// Append a played chord (called by the Instrument on each distinct chord).
// `notes` are MIDI note numbers, used for pad playback and .mid export.
// Returns the entry's index so the caller can set its beats on release,
// or -1 when not recording.
export function recordChord(label: string, notes: number[] = []): number {
	if (!shouldRecord()) return -1;
	progression.entries.push({ kind: "chord", label, notes, beats: 1 });
	persist();
	return progression.entries.length - 1;
}

// Set a chord's duration once its hold length is known (on release/slide)
export function setEntryBeats(index: number, beats: ChordBeats): void {
	const entry = progression.entries[index];
	if (!entry || entry.kind !== "chord") return;
	entry.beats = beats;
	persist();
}

// The ● rec toggle
export function toggleRecording(): void {
	progression.recording = !progression.recording;
}

// Start a new line in the jotted progression
export function addLineBreak(): void {
	// No leading or doubled breaks — they would render as empty lines
	const last = progression.entries.at(-1);
	if (!last || last.kind === "break") return;
	progression.entries.push({ kind: "break" });
	persist();
}

// Remove the most recent entry (chord or break)
export function deleteLast(): void {
	progression.entries.pop();
	persist();
}

// Wipe the pad
export function clearProgression(): void {
	progression.entries.length = 0;
	persist();
}

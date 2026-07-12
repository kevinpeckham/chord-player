// Progression pad store - captures played chords as a jotted progression,
// persisted to localStorage so a work-in-progress survives reloads.

export type ProgressionEntry =
	| { kind: "chord"; label: string; notes: number[] }
	| { kind: "break" };

// v2: chord entries carry MIDI note numbers (for playback and .mid export).
// The key was bumped from "fifths-progression", intentionally abandoning
// note-less v1 jottings.
const STORAGE_KEY = "fifths-progression-v2";

function isValidEntry(entry: unknown): entry is ProgressionEntry {
	if (typeof entry !== "object" || entry === null) return false;
	const candidate = entry as Partial<ProgressionEntry>;
	if (candidate.kind === "break") return true;
	return (
		candidate.kind === "chord" &&
		typeof candidate.label === "string" &&
		Array.isArray(candidate.notes) &&
		candidate.notes.every((note) => typeof note === "number")
	);
}

// Guarded for SSR/prerender, where localStorage does not exist
function loadEntries(): ProgressionEntry[] {
	if (typeof localStorage === "undefined") return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed.filter(isValidEntry);
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
	// While paused, played chords are not jotted (session-only, not persisted)
	paused: false,
});

// Append a played chord (called by the Instrument on each distinct chord).
// `notes` are MIDI note numbers, used for pad playback and .mid export.
export function recordChord(label: string, notes: number[] = []): void {
	if (progression.paused) return;
	progression.entries.push({ kind: "chord", label, notes });
	persist();
}

// Pause/resume jotting
export function togglePaused(): void {
	progression.paused = !progression.paused;
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

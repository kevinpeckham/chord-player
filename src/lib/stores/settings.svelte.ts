// settings store
export const settings = $state({
	activeVoice: "sine",
	availableVoices: ["sine", "triangle", "square", "sawtooth"] as const,
	chordVoicing: "standard" as
		| "standard"
		| "spread"
		| "rich"
		| "bass"
		| "rootBass",
	mode: "chords" as "chords" | "notes",
	noteOctave: 4,
	keyCenter: "C" as
		| "C"
		| "C#"
		| "D"
		| "D#"
		| "E"
		| "F"
		| "F#"
		| "G"
		| "G#"
		| "A"
		| "A#"
		| "B",
	keyCenterPosition: "bottom" as "top" | "bottom",
});

// functions to change settings
export function changeVoice(newVoice: typeof settings.activeVoice) {
	settings.activeVoice = newVoice;
}

// type for settings
export type Settings = typeof settings;

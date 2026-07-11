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
	seventhType: "dominant" as "dominant" | "major7",
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

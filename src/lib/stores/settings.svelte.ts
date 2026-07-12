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
	showProgressionPad: true,
	// Metronome: accent the downbeat of each bar (off by default — a fixed
	// accent fights odd meters unless the time signature matches)
	metronomeAccent: false,
	timeSignature: "4/4" as "2/4" | "3/4" | "4/4" | "5/4" | "6/8",
});

// Beats per bar from the time signature's numerator (drives the accent
// pattern and, later, bar-based features like the drum machine)
export function beatsPerBar(): number {
	return Number(settings.timeSignature.split("/")[0]);
}

export interface Oscillator {
	activeChord: string;
	activeVoice: string;
	voices: readonly ["sine", "triangle", "square", "sawtooth"];
}

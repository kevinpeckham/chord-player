export interface VoicingFrequencies {
	standard: number[];
	spread: number[];
	rich: number[];
	bass: number[];
	rootBass: number[];
}

export interface Chord {
	[key: string]: string | string[] | number[] | VoicingFrequencies;
	majorDisplay: string;
	majorId: string;
	majorNotes: string[];
	majorFrequencies: number[];
	majorVoicings: VoicingFrequencies;
	minorDisplay: string;
	minorId: string;
	minorNotes: string[];
	minorFrequencies: number[];
	minorVoicings: VoicingFrequencies;
	keySignature: string;
}

export interface ChordDatum {
	[key: string]: string;
	majorDisplay: string;
	majorId: string;
	minorDisplay: string;
	minorId: string;
	keySignature: string;
}

export interface Chord {
	[key: string]: string | string[] | number[];
	majorDisplay: string;
	majorId: string;
	majorNotes: string[];
	majorFrequencies: number[];
	minorDisplay: string;
	minorId: string;
	minorNotes: string[];
	minorFrequencies: number[];
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

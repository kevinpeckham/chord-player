// a great place to put some custom types
export interface ChordDatum {
  [key: string]: string;
  majorDisplay: string;
  majorId: string;
  minorDisplay: string;
  minorId: string;
  keySignature: string;
}

export interface Note {
  [key: string]: string;
}

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
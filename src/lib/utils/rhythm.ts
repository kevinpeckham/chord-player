/**
 * Rhythm helpers for the progression pad.
 *
 * Chord rhythm is derived from how long the player HELD each chord
 * (press → release), not from the gaps between chords — gaps while jotting
 * are mostly thinking time, not musical rests. Held time is quantized to a
 * clean grid of 1, 2, or 4 beats at the pad's BPM.
 */

export type ChordBeats = 1 | 2 | 4;

/** Milliseconds per beat at a given tempo */
export function beatMs(bpm: number): number {
	return 60_000 / bpm;
}

/**
 * Quantize a held duration to 1, 2, or 4 beats.
 * Anything under 1.5 beats reads as a one-beat stab; under 3 beats as a
 * half-note hold; longer holds get a full bar (in 4/4).
 */
export function beatsFromHold(heldMs: number, bpm: number): ChordBeats {
	const beats = heldMs / beatMs(bpm);
	if (beats < 1.5) return 1;
	if (beats < 3) return 2;
	return 4;
}

/**
 * Quantize the silence between a release and the next press into a rest.
 * Under half a beat is articulation (no rest); up to 8 beats quantizes to
 * 1/2/4 beats (capped at a whole 4/4 bar); anything longer reads as
 * thinking time, not music, and records nothing.
 */
export function restBeatsFromGap(gapMs: number, bpm: number): ChordBeats | 0 {
	const beats = gapMs / beatMs(bpm);
	if (beats < 0.5) return 0;
	if (beats < 1.5) return 1;
	if (beats < 3) return 2;
	if (beats <= 8) return 4;
	return 0;
}

import { describe, expect, it } from "vitest";
import { beatMs, beatsFromHold, restBeatsFromGap } from "./rhythm";

describe("beatMs", () => {
	it("converts BPM to milliseconds per beat", () => {
		expect(beatMs(120)).toBe(500);
		expect(beatMs(60)).toBe(1000);
		expect(beatMs(240)).toBe(250);
	});
});

describe("beatsFromHold", () => {
	// At 120 BPM one beat is 500ms
	it("reads short holds as one-beat stabs", () => {
		expect(beatsFromHold(80, 120)).toBe(1); // a tap
		expect(beatsFromHold(500, 120)).toBe(1);
		expect(beatsFromHold(740, 120)).toBe(1); // just under 1.5 beats
	});

	it("reads medium holds as half notes", () => {
		expect(beatsFromHold(750, 120)).toBe(2); // 1.5 beats
		expect(beatsFromHold(1000, 120)).toBe(2);
		expect(beatsFromHold(1490, 120)).toBe(2); // just under 3 beats
	});

	it("reads long holds as whole notes", () => {
		expect(beatsFromHold(1500, 120)).toBe(4); // 3 beats
		expect(beatsFromHold(4000, 120)).toBe(4);
	});

	it("scales with tempo", () => {
		// 1000ms is one beat at 60 BPM (stab) but four beats at 240 BPM
		expect(beatsFromHold(1000, 60)).toBe(1);
		expect(beatsFromHold(1000, 240)).toBe(4);
	});
});

describe("restBeatsFromGap", () => {
	// At 120 BPM one beat is 500ms
	it("ignores articulation gaps under half a beat", () => {
		expect(restBeatsFromGap(0, 120)).toBe(0);
		expect(restBeatsFromGap(240, 120)).toBe(0);
	});

	it("quantizes musical gaps to 1, 2, or 4 beats", () => {
		expect(restBeatsFromGap(500, 120)).toBe(1); // one beat of silence
		expect(restBeatsFromGap(1000, 120)).toBe(2);
		expect(restBeatsFromGap(2000, 120)).toBe(4);
		expect(restBeatsFromGap(4000, 120)).toBe(4); // capped at a bar (8 beats)
	});

	it("treats long pauses as thinking time, not rests", () => {
		expect(restBeatsFromGap(4100, 120)).toBe(0); // > 8 beats
		expect(restBeatsFromGap(30_000, 120)).toBe(0);
	});
});

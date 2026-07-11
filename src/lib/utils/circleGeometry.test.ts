import { describe, expect, it } from "vitest";
import {
	polarToCartesian,
	segmentPath,
	textCoords,
	wedgePath,
} from "./circleGeometry";

/** Parse the initial "M x,y" point of an SVG path string */
function movePoint(path: string): [number, number] {
	const match = path.match(/^M([\d.e+-]+),([\d.e+-]+)/);
	if (!match) throw new Error(`Path has no M command: ${path}`);
	return [Number.parseFloat(match[1]), Number.parseFloat(match[2])];
}

describe("polarToCartesian", () => {
	it("places 0 degrees at 3 o'clock", () => {
		const [x, y] = polarToCartesian(0, 0, 1, 0);
		expect(x).toBeCloseTo(1, 10);
		expect(y).toBeCloseTo(0, 10);
	});

	it("increases degrees clockwise in SVG space (y grows downward)", () => {
		const [x90, y90] = polarToCartesian(0, 0, 1, 90);
		expect(x90).toBeCloseTo(0, 10);
		expect(y90).toBeCloseTo(1, 10); // 6 o'clock

		const [x180, y180] = polarToCartesian(0, 0, 1, 180);
		expect(x180).toBeCloseTo(-1, 10); // 9 o'clock
		expect(y180).toBeCloseTo(0, 10);

		const [x270, y270] = polarToCartesian(0, 0, 1, 270);
		expect(x270).toBeCloseTo(0, 10);
		expect(y270).toBeCloseTo(-1, 10); // 12 o'clock
	});

	it("offsets from the given center and scales by radius", () => {
		const [x, y] = polarToCartesian(200, 200, 50, 60);
		expect(x).toBeCloseTo(200 + 50 * Math.cos(Math.PI / 3), 5);
		expect(y).toBeCloseTo(200 + 50 * Math.sin(Math.PI / 3), 5);
	});

	it("wraps around every 360 degrees", () => {
		const [x1, y1] = polarToCartesian(10, 20, 5, 45);
		const [x2, y2] = polarToCartesian(10, 20, 5, 405);
		expect(x2).toBeCloseTo(x1, 10);
		expect(y2).toBeCloseTo(y1, 10);
	});
});

describe("segmentPath", () => {
	it("produces a closed path with two arcs and a connecting line", () => {
		const path = segmentPath(200, 200, 100, 190, 0, 30);
		expect(path).toMatch(
			/^M[\d.e+-]+,[\d.e+-]+A[\d.e+-]+,[\d.e+-]+,0,[01],1,[\d.e+-]+,[\d.e+-]+L[\d.e+-]+,[\d.e+-]+A[\d.e+-]+,[\d.e+-]+,0,[01],0,[\d.e+-]+,[\d.e+-]+Z$/,
		);
	});

	it("starts at the inner radius at the start angle", () => {
		const path = segmentPath(200, 200, 100, 190, 0, 30);
		const [x, y] = movePoint(path);
		const [ex, ey] = polarToCartesian(200, 200, 100, 0);
		expect(x).toBeCloseTo(ex, 2);
		expect(y).toBeCloseTo(ey, 2);
	});

	it("embeds the inner and outer radii in the arc commands", () => {
		const path = segmentPath(200, 200, 100, 190, 0, 30);
		expect(path).toContain("A100,100,0,0,1,");
		expect(path).toContain("A190,190,0,0,0,");
	});

	it("uses the large-arc flag only for sweeps greater than 180 degrees", () => {
		const small = segmentPath(0, 0, 50, 80, 0, 90);
		expect(small).toContain("A50,50,0,0,1,");
		expect(small).toContain("A80,80,0,0,0,");

		const large = segmentPath(0, 0, 50, 80, 0, 270);
		expect(large).toContain("A50,50,0,1,1,");
		expect(large).toContain("A80,80,0,1,0,");
	});
});

describe("wedgePath", () => {
	it("matches segmentPath for a 30-degree slice centered at (200,200)", () => {
		expect(wedgePath(100, 190, 0)).toBe(segmentPath(200, 200, 100, 190, 0, 30));
		expect(wedgePath(100, 190, 5)).toBe(
			segmentPath(200, 200, 100, 190, 150, 180),
		);
	});

	it("divides the circle by totalSegments", () => {
		expect(wedgePath(50, 90, 1, 4)).toBe(
			segmentPath(200, 200, 50, 90, 90, 180),
		);
	});

	it("produces 12 distinct wedges that tile the circle", () => {
		const paths = Array.from({ length: 12 }, (_, i) => wedgePath(100, 190, i));
		expect(new Set(paths).size).toBe(12);

		// each wedge starts where the previous one ends (inner arc endpoints meet)
		for (let i = 0; i < 12; i++) {
			const [x, y] = movePoint(paths[(i + 1) % 12]);
			const [ex, ey] = polarToCartesian(200, 200, 100, 30 * (i + 1));
			expect(x).toBeCloseTo(ex, 2);
			expect(y).toBeCloseTo(ey, 2);
		}
	});
});

describe("textCoords", () => {
	it("places segment index 8 at 12 o'clock (the F position in the Circle of Fifths)", () => {
		// 30 * 8 + 15 (half segment) + 15 (rotation offset) = 270 degrees = straight up
		const [x, y] = textCoords(150, 8);
		expect(x).toBeCloseTo(200, 5);
		expect(y).toBeCloseTo(200 - 150, 5);
	});

	it("places segment index 2 at 6 o'clock", () => {
		const [x, y] = textCoords(150, 2);
		expect(x).toBeCloseTo(200, 5);
		expect(y).toBeCloseTo(200 + 150, 5);
	});

	it("places segment index 9 (C) up and to the right of center", () => {
		// 30 * 9 + 15 + 15 = 300 degrees
		const [x, y] = textCoords(100, 9);
		expect(x).toBeCloseTo(200 + 100 * Math.cos((300 * Math.PI) / 180), 5);
		expect(y).toBeCloseTo(200 + 100 * Math.sin((300 * Math.PI) / 180), 5);
	});

	it("centers text within the segment when rotation offset is zero", () => {
		// segment 0 of 12 spans 0-30 degrees; center is 15 degrees
		const [x, y] = textCoords(100, 0, 12, 0);
		expect(x).toBeCloseTo(200 + 100 * Math.cos((15 * Math.PI) / 180), 5);
		expect(y).toBeCloseTo(200 + 100 * Math.sin((15 * Math.PI) / 180), 5);
	});

	it("respects a custom segment count", () => {
		// 4 segments of 90 degrees; segment 0 center at 45 degrees (no offset)
		const [x, y] = textCoords(100, 0, 4, 0);
		expect(x).toBeCloseTo(200 + 100 * Math.cos(Math.PI / 4), 5);
		expect(y).toBeCloseTo(200 + 100 * Math.sin(Math.PI / 4), 5);
	});

	it("keeps every label at the requested radius from center", () => {
		for (let i = 0; i < 12; i++) {
			const [x, y] = textCoords(147, i);
			const distance = Math.hypot(x - 200, y - 200);
			expect(distance).toBeCloseTo(147, 5);
		}
	});
});

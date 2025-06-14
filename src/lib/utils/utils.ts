// written by Håken Lid
// https://observablehq.com/@haakenlid/svg-circle
export function polarToCartesian(
	x: number,
	y: number,
	r: number,
	degrees: number,
) {
	const radians = (degrees * Math.PI) / 180.0;
	return [x + r * Math.cos(radians), y + r * Math.sin(radians)];
}

// written by Håken Lid
export function segmentPath(
	x: number,
	y: number,
	r0: number,
	r1: number,
	d0: number,
	d1: number,
): string {
	// https://svgwg.org/specs/paths/#PathDataEllipticalArcCommands
	const arc = Math.abs(d0 - d1) > 180 ? 1 : 0;
	const point = (radius: number, degree: number) =>
		polarToCartesian(x, y, radius, degree)
			.map((n) => n.toPrecision(5))
			.join(",");
	return [
		`M${point(r0, d0)}`,
		`A${r0},${r0},0,${arc},1,${point(r0, d1)}`,
		`L${point(r1, d1)}`,
		`A${r1},${r1},0,${arc},0,${point(r1, d0)}`,
		"Z",
	].join("");
}

//- n = number of segments
export function wedgePath(r0: number, r1: number, i: number, n?: number) {
	const segments = n ?? 12;
	return segmentPath(
		200,
		200,
		r0,
		r1,
		(360 / segments) * i,
		((i + 1) * 360) / segments,
	);
}

// text coordinates for labelling segments
export function textCoords(r: number, i: number, n?: number) {
	const segments = n ?? 12;
	const [x, y] = polarToCartesian(200, 200, r, (360 / segments) * i);
	return [x, y];
}

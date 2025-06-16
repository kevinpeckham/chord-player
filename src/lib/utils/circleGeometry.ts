/**
 * SVG path generation utilities for creating circular segments and wedges
 * Used for rendering the Circle of Fifths visualization
 *
 * Based on work by Håken Lid: https://observablehq.com/@haakenlid/svg-circle
 */

/**
 * Convert polar coordinates to Cartesian coordinates
 * @param x - Center X coordinate
 * @param y - Center Y coordinate
 * @param r - Radius from center
 * @param degrees - Angle in degrees (0 = 3 o'clock, increases clockwise)
 * @returns Array of [x, y] coordinates
 */
export function polarToCartesian(
	x: number,
	y: number,
	r: number,
	degrees: number,
): [number, number] {
	const radians = (degrees * Math.PI) / 180.0;
	return [x + r * Math.cos(radians), y + r * Math.sin(radians)];
}

/**
 * Generate an SVG path for a circular segment (arc with inner and outer radius)
 * @param x - Center X coordinate of the circle
 * @param y - Center Y coordinate of the circle
 * @param innerRadius - Inner radius of the segment
 * @param outerRadius - Outer radius of the segment
 * @param startDegrees - Starting angle in degrees
 * @param endDegrees - Ending angle in degrees
 * @returns SVG path string defining the segment
 */
export function segmentPath(
	x: number,
	y: number,
	innerRadius: number,
	outerRadius: number,
	startDegrees: number,
	endDegrees: number,
): string {
	// Determine if we need a large arc (> 180 degrees)
	const largeArc = Math.abs(startDegrees - endDegrees) > 180 ? 1 : 0;

	// Helper to convert radius and degree to SVG coordinate string
	const point = (radius: number, degree: number) =>
		polarToCartesian(x, y, radius, degree)
			.map((n) => n.toPrecision(5))
			.join(",");

	// Build the path using SVG arc commands
	return [
		`M${point(innerRadius, startDegrees)}`, // Move to start of inner arc
		`A${innerRadius},${innerRadius},0,${largeArc},1,${point(innerRadius, endDegrees)}`, // Inner arc
		`L${point(outerRadius, endDegrees)}`, // Line to outer arc
		`A${outerRadius},${outerRadius},0,${largeArc},0,${point(outerRadius, startDegrees)}`, // Outer arc (reverse)
		"Z", // Close path
	].join("");
}

/**
 * Generate an SVG path for a wedge in a circle divided into equal segments
 * Used to create the chord buttons in the Circle of Fifths
 * @param innerRadius - Inner radius of the wedge
 * @param outerRadius - Outer radius of the wedge
 * @param segmentIndex - Index of this segment (0-based)
 * @param totalSegments - Total number of segments in the circle (default: 12)
 * @returns SVG path string for the wedge
 */
export function wedgePath(
	innerRadius: number,
	outerRadius: number,
	segmentIndex: number,
	totalSegments = 12,
): string {
	const degreesPerSegment = 360 / totalSegments;
	return segmentPath(
		200, // SVG viewBox center X
		200, // SVG viewBox center Y
		innerRadius,
		outerRadius,
		degreesPerSegment * segmentIndex,
		degreesPerSegment * (segmentIndex + 1),
	);
}

/**
 * Calculate text label coordinates for a circular segment
 * Positions text at the center of a segment (for Circle of Fifths labeling)
 * @param radius - Distance from center to place the text
 * @param segmentIndex - Index of the segment (0-based)
 * @param totalSegments - Total number of segments (default: 12)
 * @param rotationOffset - Additional rotation offset in degrees (default: 15 for circle of fifths alignment)
 * @returns Array of [x, y] coordinates for text placement
 */
export function textCoords(
	radius: number,
	segmentIndex: number,
	totalSegments = 12,
	rotationOffset = 15,
): [number, number] {
	const degreesPerSegment = 360 / totalSegments;
	// Center the text in the segment by adding half the segment angle
	const segmentCenterDegree =
		degreesPerSegment * segmentIndex + degreesPerSegment / 2 + rotationOffset;

	return polarToCartesian(
		200, // SVG viewBox center X
		200, // SVG viewBox center Y
		radius,
		segmentCenterDegree,
	);
}

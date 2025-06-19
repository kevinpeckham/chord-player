<!--
@component
SVG Circle of Fifths
- This component renders a circle of fifths svg element
- It borrows heavily from the work of Eric Coleman
- See his blog post https://epiccoleman.com/posts/2023-04-05-svg-circle-of-fifths.html
- And his github repo https://github.com/epiccoleman/react-circle-of-fifths/tree/main
- It also borrows functions from Håken Lid
- see: https://observablehq.com/@haakenlid/svg-circle
- Also, see the circle of fifths wikipedia page https://en.wikipedia.org/wiki/Circle_of_fifths
-->

<script lang='ts'>
// stores
import { settings } from "$stores/settings.svelte";
import { performance } from "$stores/performance.svelte";
import { startChord, stopChord } from "$stores/audio.svelte";

// types
import type { Chord, VoicingFrequencies } from "$lib/types/Chord";

// props
interface Props {
	chords: Chord[];
}
let { chords }: Props = $props();

// import utils
import { textCoords, wedgePath } from "$utils/circleGeometry";
import { getNoteForPosition, CHROMATIC_NOTES } from "$utils/noteHelpers";
import { processChordEnharmonics } from "$utils/enharmonics";

// Track active playback
let maxDurationTimeout: ReturnType<typeof setTimeout> | null = null;

//- interaction functions
function onPressStart(event: PointerEvent) {
	event.preventDefault();
	event.stopPropagation();

	const target = event.target as SVGPathElement;
	const index = Number(target.dataset.index) ?? 0;

	if (settings.mode === "notes") {
		// Individual notes mode
		const noteData = getNoteForPositionWithKeyCenter(index);
		performance.activeChord = `${noteData.display}${settings.noteOctave}`;

		// Start playing single note
		startChord([noteData.frequency], settings.activeVoice as OscillatorType);
	} else {
		// Chords mode - use reordered chords
		if (!reorderedChords || reorderedChords.length === 0) return;

		const datum = reorderedChords[index];
		if (!datum) return;

		const mode = target.dataset.mode ?? "";

		// display active chord name
		if (mode === "major") {
			const chord = datum.majorDisplay;
			performance.activeChord = `${chord} major`;
		} else if (mode === "minor") {
			const chord = datum.minorDisplay;
			const chordAdjusted = chord.replace("m", " minor");
			performance.activeChord = chordAdjusted;
		} else {
			performance.activeChord = "";
		}

		// start chord using the audio store with selected voicing
		const voicings = datum[`${mode}Voicings`] as VoicingFrequencies;
		const frequencies = voicings[settings.chordVoicing] || voicings.standard;
		startChord(frequencies, settings.activeVoice as OscillatorType);
	}

	// Set a maximum duration timeout as failsafe (5 seconds)
	if (maxDurationTimeout) {
		clearTimeout(maxDurationTimeout);
	}
	maxDurationTimeout = setTimeout(() => {
		stopChord();
		performance.activeChord = "";
		maxDurationTimeout = null;
	}, 5000);
}

function onPressEnd(event: PointerEvent) {
	event.preventDefault();
	event.stopPropagation();

	// Clear any timeout
	if (maxDurationTimeout) {
		clearTimeout(maxDurationTimeout);
		maxDurationTimeout = null;
	}

	// Stop the chord immediately
	stopChord();

	// Clear the display immediately
	performance.activeChord = "";
}

// Global safety net for pointer events
function handleGlobalPointerUp(event: PointerEvent) {
	// Safety net - stop any playing chord
	stopChord();
	performance.activeChord = "";

	// Clear timeout
	if (maxDurationTimeout) {
		clearTimeout(maxDurationTimeout);
		maxDurationTimeout = null;
	}
}

// Lifecycle - setup global listeners
$effect(() => {
	// Add global pointer up listener as safety net
	document.addEventListener("pointerup", handleGlobalPointerUp, {
		capture: true,
	});

	// Cleanup function
	return () => {
		// Clean up global listeners
		document.removeEventListener("pointerup", handleGlobalPointerUp);
		// Ensure any playing chord is stopped
		stopChord();

		// Clear any timeout
		if (maxDurationTimeout) {
			clearTimeout(maxDurationTimeout);
			maxDurationTimeout = null;
		}
	};
});

const modes = $derived(
	settings.mode === "notes"
		? [
				{
					classes: "fill-accent",
					r0: 180,
					r1: 80,
					mode: "note",
				},
			]
		: [
				{
					classes: "fill-accent",
					r0: 180,
					r1: 130,
					mode: "major",
				},
				{
					classes: "fill-accent/90",
					r0: 130,
					r1: 80,
					mode: "minor",
				},
			],
);

// Rearrange chords based on key center
const reorderedChords = $derived(
	settings.mode === "chords" && chords && chords.length > 0
		? (() => {
				// Map sharps to their flat equivalents that appear in the circle
				const keyMap: Record<string, string> = {
					"C#": "D♭",
					"D#": "E♭",
					"F#": "G♭",
					"G#": "A♭",
					"A#": "B♭",
				};

				const searchKey = keyMap[settings.keyCenter] || settings.keyCenter;
				let keyCenterIndex = chords.findIndex(
					(chord) => chord.majorDisplay === searchKey,
				);

				// Default to C if not found
				if (keyCenterIndex === -1) keyCenterIndex = 9;

				// IMPORTANT: Visual positioning in the Circle of Fifths
				// The SVG has a 15-degree rotation, and each segment is 30 degrees
				// Through testing, we determined that array position 8 appears at 12 o'clock
				// This is because F (at index 8) naturally appears at the top
				// To put any key center at 12 o'clock, we need to move it to position 8
				// For 6 o'clock position, we need to move it to position 2 (opposite of 8)
				const targetPosition = settings.keyCenterPosition === "top" ? 8 : 2;
				// Formula: rotateAmount = (keyCenterIndex - targetPosition + 12) % 12
				const rotateAmount = (keyCenterIndex - targetPosition + 12) % 12;
				const rotatedChords = [
					...chords.slice(rotateAmount),
					...chords.slice(0, rotateAmount),
				];

				// Process enharmonics based on key center
				return rotatedChords.map((chord) =>
					processChordEnharmonics(chord, settings.keyCenter),
				);
			})()
		: chords,
);

// Get note for position considering key center
function getNoteForPositionWithKeyCenter(position: number) {
	if (settings.mode === "notes") {
		// Find the offset based on key center
		// settings.keyCenter uses "#" but CHROMATIC_NOTES uses "♯", so we need to match by id
		const keyCenterIndex = CHROMATIC_NOTES.findIndex((note) => {
			// Match C# to Cs, D# to Ds, etc.
			const keyId = settings.keyCenter.replace("#", "s");
			return note.id === keyId;
		});
		// In notes mode, position 8 appears at 12 o'clock, position 2 at 6 o'clock
		// To put our key center at the target position, we need to offset appropriately
		const targetPosition = settings.keyCenterPosition === "top" ? 8 : 2;
		const adjustedPosition =
			(position - targetPosition + keyCenterIndex + 12) % 12;
		return getNoteForPosition(adjustedPosition, settings.noteOctave);
	}
	return getNoteForPosition(position, settings.noteOctave);
}
</script>

<svg
	id="instrument-circle-of-fifths"
	class="w-full h-auto aspect-square z-10 scale-[1.1] max-w-[860px] ios-touch-fix"
	viewBox="0 0 400 400"
	xmlns="http://www.w3.org/2000/svg"
	height="800"
	width="800"
	oncontextmenu={(e) => { e.preventDefault() }}
>
	<g class="rotate-[15deg] origin-[200px_200px_0px]">
		{#if settings.mode === "notes"}
			<!-- Note buttons for individual notes mode -->
			{#each Array(12) as _, i}
				{@const noteData = getNoteForPositionWithKeyCenter(i)}
				<path
					aria-pressed="false"
					aria-labelledby="note-button-label-{noteData.id}"
					class="!outline-none stroke-primary stroke-[0.1em] hover:opacity-60 fill-accent focus:opacity-60 ios-touch-fix pointer-events-all"
					d={wedgePath(180, 80, i)}
					data-mode="note"
					data-index={i}
					onpointerdown={(e) => { onPressStart(e)}}
					onpointerup={(e) => { onPressEnd(e)}}
					onpointercancel={(e) => { onPressEnd(e)}}
					onpointerleave={(e) => { onPressEnd(e)}}
					oncontextmenu={(e) => { e.preventDefault() }}
					id="note-button-{noteData.id}"
					role="button"
					tabindex={i + 100}
				/>
			{/each}
		{:else}
			<!-- Chord buttons for chord mode -->
			{#each reorderedChords as item, i}
				{#each modes as m, index}
					<path
						aria-pressed="false"
						aria-labelledby="chord-button-label-{item[m.mode + 'Id']}"
						class="!outline-none stroke-primary stroke-[0.1em] hover:opacity-60 {m.classes} focus:opacity-60 ios-touch-fix pointer-events-all"
						d={wedgePath(m.r0, m.r1, i)}
						data-mode={m.mode}
						data-chord={item[m.mode + 'Id']}
						data-index={i}
						onpointerdown={(e) => { onPressStart(e)}}
						onpointerup={(e) => { onPressEnd(e)}}
						onpointercancel={(e) => { onPressEnd(e)}}
						onpointerleave={(e) => { onPressEnd(e)}}
						oncontextmenu={(e) => { e.preventDefault() }}
						id="chord-button-{item[m.mode + 'Id']}"
						role="button"
						tabindex={Number(index + 1) * 100 + Number(i)}
					/>
				{/each}
			{/each}
		{/if}
	</g>

	<!-- text labels -->
	<g class="pointer-events-none select-none">
		{#if settings.mode === "notes"}
			<!-- Note labels for individual notes mode -->
			{#each Array(12) as _, i}
				{@const noteData = getNoteForPositionWithKeyCenter(i)}
				{@const radius = 130}
				{@const [x, y] = textCoords(radius, i)}
				<text
					class="text-24px sm:text-[1.2em] text-anchor-middle dominant-baseline-central"
					id="note-button-label-{noteData.id}"
					x={x.toFixed(2)}
					y={y.toFixed(2)}
				>{noteData.display}</text>
			{/each}
		{:else}
			<!-- Chord labels for chord mode -->
			{#each reorderedChords as item, i}
				<!-- outer labels -->
				{@const radius1 = 150}
				{@const [x1, y1] = textCoords(radius1, i)}
				<text
					class="text-20px sm:text-[1em] text-anchor-middle dominant-baseline-central"
					id="chord-button-label-{item.majorId}"
					x={x1.toFixed(2)}
					y={y1.toFixed(2)}
				>{item.majorDisplay}</text>

				<!-- inner labels -->
				{@const radius2 = 104}
				{@const [x2, y2] = textCoords(radius2, i)}
				<text
					id="chord-button-label-{item.minorId}"
					class="text-18px sm:text-[0.9em] text-anchor-middle dominant-baseline-central"
					x={x2.toFixed(2)}
					y={y2.toFixed(2)}
				>{item.minorDisplay}</text>
			{/each}
		{/if}
	</g>

	<!-- center text -->
	<g class="pointer-events-none select-none">
		<text
			class="fill-accent text-20px sm:text-[.8em] text-anchor-middle dominant-baseline-central empty:hidden"
			x="200"
			y="200"
		>{performance.activeChord}</text>
	</g>

	<!-- key center indicator -->
	<g class="pointer-events-none select-none">
		<circle
			cx="200"
			cy={settings.keyCenterPosition === "top" ? "5" : "395"}
			r="2"
			class="fill-accent opacity-80"
		/>
	</g>
</svg>
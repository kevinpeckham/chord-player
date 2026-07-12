<!--
The template is one cohesive SVG instrument — 24 wedges + labels drawn from
the same geometry; splitting it into subcomponents is planned feature work.
-->
<!-- fallow-ignore-next-line complexity -->
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

import {
	startChord,
	stopChord,
	stopChordById,
	unlockAudio,
} from "$stores/audio.svelte";
import { performance } from "$stores/performance.svelte";
import { recordChord } from "$stores/progression.svelte";
import { settings } from "$stores/settings.svelte";

// types
import type { Chord, VoicingFrequencies } from "$lib/types/Chord";

// props
interface Props {
	chords: Chord[];
}
let { chords }: Props = $props();

import { untrack } from "svelte";

// import utils
import { textCoords, wedgePath } from "$utils/circleGeometry";
import { processChordEnharmonics } from "$utils/enharmonics";
import { CHROMATIC_NOTES, getNoteForPosition } from "$utils/noteHelpers";
import { seventhChordName, withSeventh } from "$utils/sevenths";

// Track active playback - Map pointer IDs to their elements and chord names
const activePointers = $state(
	new Map<
		number,
		{
			element: SVGPathElement;
			elementId: string;
			chordName: string;
			// Per-pointer seventh upgrade (a second finger on this wedge)
			seventh: boolean;
		}
	>(),
);
let currentPointerId = $state<number | null>(null);

// Second-finger seventh upgrades: upgrade pointer ID -> chord pointer ID.
// Not reactive state — consulted only inside event handlers.
const seventhUpgrades = new Map<number, number>();

// Derived state for displaying all active chords
const activeChordNames = $derived(() => {
	const names = Array.from(activePointers.values())
		.map((p) => p.chordName)
		.filter((n) => n);
	return names.length > 0 ? names.join(" + ") : "";
});

//- interaction functions

// Record what this pointer is sounding and refresh the center display
function setPointerChordName(pointerId: number, chordName: string) {
	const pointerInfo = activePointers.get(pointerId);
	if (pointerInfo) {
		pointerInfo.chordName = chordName;
	}
	performance.activeChord = activeChordNames();
}

// Notes mode: play the single note at this wedge position
function playNoteAtIndex(index: number, pointerId: number) {
	const noteData = getNoteForPositionWithKeyCenter(index);
	setPointerChordName(pointerId, `${noteData.display}${settings.noteOctave}`);
	startChord(
		[noteData.frequency],
		settings.activeVoice as OscillatorType,
		pointerId,
	);
}

// True when this pointer should sound a seventh: the global momentary
// modifier (Shift / the 7 pad) or a second finger held on this wedge
function seventhIsActive(pointerId: number): boolean {
	return (
		performance.seventhHeld || (activePointers.get(pointerId)?.seventh ?? false)
	);
}

// Display name for a wedge chord ("C major", or "C7"/"Cmaj7"/"Am7" with the
// seventh modifier)
function chordDisplayName(
	datum: Chord,
	mode: "major" | "minor",
	seventh: boolean,
): string {
	const display = mode === "major" ? datum.majorDisplay : datum.minorDisplay;
	if (seventh) return seventhChordName(display, mode, settings.seventhType);
	return mode === "major" ? `${display} major` : display.replace("m", " minor");
}

// Frequencies for a wedge chord in the selected voicing, seventh-aware
function chordFrequencies(
	datum: Chord,
	mode: "major" | "minor",
	seventh: boolean,
): number[] {
	const voicings = datum[`${mode}Voicings`] as VoicingFrequencies;
	const base = voicings[settings.chordVoicing] || voicings.standard;
	if (!seventh) return base;
	const rootFrequency = (datum[`${mode}Frequencies`] as number[])[0];
	return withSeventh(base, rootFrequency, mode, settings.seventhType);
}

// Compact chord symbol for the progression pad ("C", "Am", "C7", "Cmaj7")
function chordSymbol(
	datum: Chord,
	mode: "major" | "minor",
	seventh: boolean,
): string {
	const display = mode === "major" ? datum.majorDisplay : datum.minorDisplay;
	return seventh
		? seventhChordName(display, mode, settings.seventhType)
		: display;
}

// Chords mode: play the major/minor chord at this wedge position using the
// selected voicing, adding the seventh when the modifier is active
function playChordAtIndex(index: number, mode: string, pointerId: number) {
	if (!reorderedChords || reorderedChords.length === 0) return;
	const datum = reorderedChords[index];
	if (!datum) return;
	if (mode !== "major" && mode !== "minor") return;

	const seventh = seventhIsActive(pointerId);

	// Jot every distinct chord this pointer sounds (new press, slide to a
	// new wedge, or a seventh change) onto the progression pad
	const previousName = activePointers.get(pointerId)?.chordName;
	const chordName = chordDisplayName(datum, mode, seventh);
	if (chordName !== previousName) {
		recordChord(chordSymbol(datum, mode, seventh));
	}

	setPointerChordName(pointerId, chordName);
	startChord(
		chordFrequencies(datum, mode, seventh),
		settings.activeVoice as OscillatorType,
		pointerId,
	);
}

function playChordFromElement(element: SVGPathElement, pointerId: number) {
	const index = Number(element.dataset.index ?? 0);
	if (settings.mode === "notes") {
		playNoteAtIndex(index, pointerId);
	} else {
		playChordAtIndex(index, element.dataset.mode ?? "", pointerId);
	}
}

// Flag to track if we've had first user interaction
let hasInitializedAudio = false;

function onPressStart(event: PointerEvent) {
	// Delegated from the SVG root — only wedge paths carry data-index;
	// presses on the background or non-interactive layers are ignored
	const target = event.target as SVGPathElement;
	if (!target.dataset?.index) return;

	event.preventDefault();
	event.stopPropagation();

	const pointerId = event.pointerId;

	// A second finger on a wedge that is already sounding upgrades that
	// chord to its seventh (released again, it drops back to the triad)
	if (settings.mode === "chords") {
		const upgradeTarget = Array.from(activePointers.entries()).find(
			([id, info]) => id !== pointerId && info.elementId === target.id,
		);
		if (upgradeTarget) {
			const [targetPointerId, targetInfo] = upgradeTarget;
			seventhUpgrades.set(pointerId, targetPointerId);
			targetInfo.seventh = true;
			playChordFromElement(targetInfo.element, targetPointerId);
			return;
		}
	}

	// Track this pointer with empty chord name initially
	activePointers.set(pointerId, {
		element: target,
		elementId: target.id,
		chordName: "",
		seventh: false,
	});
	currentPointerId = pointerId;

	// Initialize audio on very first interaction, delaying the first chord
	// to let the context unlock. The pointer is already tracked above, so a
	// release during the delay removes it and the pending chord never plays
	// (otherwise it would start after the finger lifted and stick on).
	if (!hasInitializedAudio) {
		hasInitializedAudio = true;
		unlockAudio();
		setTimeout(() => {
			if (activePointers.has(pointerId)) {
				playChordFromElement(target, pointerId);
			}
		}, 150);
		return;
	}

	// Play the new chord with this pointer ID
	playChordFromElement(target, pointerId);
}

function onPointerMove(event: PointerEvent) {
	const pointerId = event.pointerId;
	const pointerInfo = activePointers.get(pointerId);

	// Only process if we're tracking this pointer
	if (!pointerInfo) return;

	event.preventDefault();
	event.stopPropagation();

	// Get all elements at the pointer location
	const elements = document.elementsFromPoint(event.clientX, event.clientY);

	// Find the first path element that's a chord/note button
	const element = elements.find((el) => {
		const pathEl = el as SVGPathElement;
		return (
			pathEl.tagName === "path" &&
			pathEl.dataset &&
			(pathEl.dataset.mode || pathEl.dataset.index !== undefined)
		);
	}) as SVGPathElement | undefined;

	if (element && element.id !== pointerInfo.elementId) {
		// Update the tracked element for this pointer (keep the chord name
		// and any seventh upgrade)
		activePointers.set(pointerId, {
			element,
			elementId: element.id,
			chordName: pointerInfo.chordName,
			seventh: pointerInfo.seventh,
		});

		// Play new chord (this will stop the previous chord for this pointer)
		playChordFromElement(element, pointerId);
	}
}

// Shared release logic for chord pointers and seventh-upgrade pointers.
// Returns true when the pointer was one of ours.
function releasePointer(pointerId: number): boolean {
	// Lifting a seventh-upgrade finger drops its chord back to the triad
	const targetPointerId = seventhUpgrades.get(pointerId);
	if (targetPointerId !== undefined) {
		seventhUpgrades.delete(pointerId);
		const targetInfo = activePointers.get(targetPointerId);
		if (targetInfo) {
			targetInfo.seventh = false;
			playChordFromElement(targetInfo.element, targetPointerId);
		}
		return true;
	}

	if (!activePointers.has(pointerId)) return false;

	// Stop the chord for this pointer and drop any upgrade aimed at it
	stopChordById(pointerId);
	activePointers.delete(pointerId);
	for (const [upgradeId, chordId] of seventhUpgrades) {
		if (chordId === pointerId) seventhUpgrades.delete(upgradeId);
	}

	// Update display
	performance.activeChord = activeChordNames();

	// Clear current pointer if it was this one
	if (currentPointerId === pointerId) {
		currentPointerId = null;
	}
	return true;
}

function onPressEnd(event: PointerEvent) {
	if (releasePointer(event.pointerId)) {
		event.preventDefault();
		event.stopPropagation();
	}
}

// Global safety net for pointer events that end outside the SVG
function handleGlobalPointerUp(event: PointerEvent) {
	releasePointer(event.pointerId);
}

// Shift is the desktop seventh modifier: held = sevenths, released = triads
function onWindowKeyDown(event: KeyboardEvent) {
	if (event.key === "Shift") performance.seventhHeld = true;
}
function onWindowKeyUp(event: KeyboardEvent) {
	if (event.key === "Shift") performance.seventhHeld = false;
}
// Don't leave the modifier stuck on when focus leaves (e.g. cmd-tab)
function onWindowBlur() {
	performance.seventhHeld = false;
}

// Re-voice held chords when the seventh modifier or quality changes, so
// pressing/releasing Shift (or the 7 pad) upgrades sounding chords live.
// Legitimate effect: it drives the external audio engine; untrack keeps the
// replay's own state reads/writes out of the dependency set.
$effect(() => {
	const _seventhHeld = performance.seventhHeld;
	const _seventhType = settings.seventhType;
	untrack(() => {
		for (const [pointerId, info] of activePointers) {
			playChordFromElement(info.element, pointerId);
		}
	});
});

// Prevent browser touch defaults (e.g. double-tap zoom) while chords are held
function handleGlobalTouchEnd(e: TouchEvent) {
	if (activePointers.size > 0) {
		e.preventDefault();
	}
}

// Global listeners live on <svelte:document> below; here we only ensure
// any playing chord is silenced when the component unmounts.
$effect(() => {
	return () => {
		stopChord();
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

<!-- Safety net for releases that happen outside the SVG; Svelte manages
     add/remove of these document listeners with the component lifecycle -->
<svelte:document
	onpointerupcapture={handleGlobalPointerUp}
	ontouchend={handleGlobalTouchEnd}
/>

<!-- Shift = momentary seventh modifier -->
<svelte:window
	onkeydown={onWindowKeyDown}
	onkeyup={onWindowKeyUp}
	onblur={onWindowBlur}
/>

<svg
	aria-label="Circle of Fifths"
	role="application"
	id="instrument-circle-of-fifths"
	class="w-full h-auto aspect-square z-10 scale-[1.1] max-w-[860px] ios-touch-fix"
	viewBox="0 0 400 400"
	xmlns="http://www.w3.org/2000/svg"
	height="800"
	width="800"
	oncontextmenu={(e) => { e.preventDefault() }}
	onpointerdown={onPressStart}
	onpointermove={onPointerMove}
	onpointerup={onPressEnd}
	onpointercancel={onPressEnd}
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
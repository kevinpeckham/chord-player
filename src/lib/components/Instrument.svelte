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
import { playChord } from "$stores/audio.svelte";

// types
import type { Chord } from "$lib/types/Chord";

// props
interface Props {
	chords: Chord[];
}
let { chords }: Props = $props();

// import utils
import { textCoords, wedgePath } from "$utils/utils";

//- interaction functions
function onMousedown(event: MouseEvent) {
	event.stopPropagation();
	const target = event.target as SVGPathElement;
	const index = Number(target.dataset.index) ?? 0;
	const adjustedIndex = index === 11 ? 0 : index + 1;
	const datum = chords[adjustedIndex];
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

	// play chord using the audio store
	const frequencies = datum[`${mode}Frequencies`] as number[];
	playChord(frequencies, settings.activeVoice as OscillatorType);
}
function onMouseup(event: MouseEvent) {
	event.stopPropagation();

	setTimeout(() => {
		performance.activeChord = "";
	}, 600);
}

const modes = [
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
];
</script>

<svg
	id="instrument-circle-of-fifths"
	class="w-full h-auto aspect-square z-10 scale-[1.1] max-w-[860px]"
	viewBox="0 0 400 400"
	xmlns="http://www.w3.org/2000/svg"
	height="800"
	width="800"
>
	<g class="rotate-[15deg] origin-[200px_200px_0px]">
		{#each chords as item, i}
			{#each modes as m, index}
				<path
					aria-pressed="false"
					aria-labelledby="chord-button-label-{item[m.mode + 'Id']}"
					class="!outline-none stroke-primary stroke-[0.1em] transition-opacity hover:opacity-60 {m.classes} focus:opacity-60"
					d={wedgePath(m.r0, m.r1, i)}
					data-mode={m.mode}
					data-chord={item[m.mode + 'Id']}
					data-index={i}
					onmousedown={(e) => { onMousedown(e)}}
					onmouseup={(e) => { onMouseup(e)}}
					id="chord-button-{item[m.mode + 'Id']}"
					role="button"
					tabindex={Number(index + 1) * 100 + Number(i)}
				/>
			{/each}
		{/each}
	</g>

	<!-- text labels -->
	<g class="pointer-events-none">
		{#each chords as item, i}
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
	</g>

	<!-- center text -->
	<g class="pointer-events-none">
		<text
			class="fill-accent text-20px sm:text-[.8em] text-anchor-middle dominant-baseline-central empty:hidden"
			x="200"
			y="200"
		>{performance.activeChord}</text>
	</g>
</svg>
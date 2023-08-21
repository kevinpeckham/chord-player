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


	// import getter for context api
	import { getContext } from "svelte";

	// import store function
	import { writable } from "svelte/store";

	// import onMount
	import { onMount } from "svelte";

	// import stores
	const chords: Chord[] = getContext("chords");

	// import utils
	import { polarToCartesian, segmentPath, textCoords, wedgePath} from "$utils/utils";

	// import types
	import type { Chord} from "$types/types";
	import type { Writable } from "svelte/store";

	// create store
	const activeChord = writable("");

	// get store from context
	const oscillatorStore = getContext("oscillatorStore") as Writable<string>;



	// create audioContext singleton
	// const audioCtx = new window.AudioContext
	// let audioCtx: AudioContext;
	// onMount(() => {
	// 	// audioCtx = new (window.AudioContext);
	// });

	//- interaction functions
	function onMousedown(event: PointerEvent) {
		const target = event.target as SVGPathElement;
		const index = Number(target.dataset.index) ?? 0;
		const adjustedIndex = index == 11 ? 0 : index + 1;
		const datum = chords[adjustedIndex];
		const mode = target.dataset.mode ?? "";

		// display active chord name
		if (mode === "major") {
			const chord = datum.majorDisplay;
			$activeChord = chord + " major" ?? "";
		} else if (mode === "minor") {
			const chord = datum.minorDisplay;
			const chordAdjusted = chord.replace("m", " minor");
			$activeChord = chordAdjusted ?? "";
		}
		else {
			$activeChord = "";
		}

		// play chord

		// get note frequencies
		const frequencies = datum[`${mode}Frequencies`] as number[];


		const audioCtx = new (window.AudioContext);

		// create gainNode
		const gainNode = audioCtx.createGain();
    gainNode.gain.value = 1 / frequencies.length;
    gainNode.connect(audioCtx.destination);

		frequencies.forEach(frequency => {
      const oscNode = audioCtx.createOscillator();
      oscNode.type = $oscillatorStore as OscillatorType; // hook up other values

      oscNode.frequency.value = frequency;
      oscNode.connect(gainNode);

      oscNode.start(0);

      /* Stop the audio after 1.5 seconds */
      oscNode.stop(audioCtx.currentTime + 1.5);

      /* Fade out the audio after half the time to avoid clicks  */
      gainNode.gain.setTargetAtTime(0, 0.75, 0.25);
		});

	}
	function onMouseup(event: PointerEvent) {

		setTimeout(() => {
			$activeChord = "";
		}, 600);
	}



	const modes= [
		{
			classes:"fill-accent",
			r0: 180,
			r1: 130,
			mode: "major",
		},
		{
			classes:"fill-accent/90",
			r0: 130,
			r1: 80,
			mode: "minor",
		}
	]
</script>

<template lang='pug'>
	svg#circle-of-fifths.w-full.h-auto.aspect-square.z-10(
		viewBox="0 0 400 400"
		xmlns="http://www.w3.org/2000/svg"
		height="800"
		width="800"
		)
		circle(
			class="fill-transparent stroke-neutral-100 transition-opacity opacity-20 hover:opacity-40 stroke-[1em]"
			cx="200"
			cy="200"
			r="190"
			)
		g(class="rotate-[15deg]" style="transform-origin: 200px 200px 0px;")
			+each('chords as item, i')
				+each('modes as m, index')
					path(
						aria-pressed="false"
						aria-labelledby="chord-button-label-{item[m.mode + 'Id']}"
						class="!outline-none stroke-primary stroke-[0.1em] transition-opacity hover:opacity-60 {m.classes} focus:opacity-60"
						d!="{wedgePath(m.r0, m.r1, i)}"
						data-mode!="{m.mode}"
						data-chord!="{item[m.mode + 'Id']}"
						data-index!="{i}"
						on:mousedown|stopPropagation!="{onMousedown}"
						on:mouseup|stopPropagation!="{onMouseup}"
						id!="chord-button-{item[m.mode + 'Id']}"
						role="button"
						tabindex!="{(Number(index + 1) * 100 + Number(i)).toString()}"
						)


		//- text labels
		g.pointer-events-none
			+each('chords as item, i')
				//- outer labels
				+const('radius1 = 150')
				+const('[x1, y1] = textCoords(radius1, i)')
				text(
					id!="chord-button-label-{item.majorId}"
					x!="{x1.toFixed(2)}"
					y!="{y1.toFixed(2)}"
					style="text-anchor: middle; dominant-baseline: central;"
					) {item.majorDisplay}

				//- inner labels
				+const('radius2 = 104')
				+const('[x2, y2] = textCoords(radius2, i)')
				text(
					id!="chord-button-label-{item.minorId}"
					class="text-[0.9em]"
					x!="{x2.toFixed(2)}"
					y!="{y2.toFixed(2)}"
					style="text-anchor: middle; dominant-baseline: central;"
					) {item.minorDisplay}

		//- center text
		g.pointer-events-none
			text.fill-accent(
				class="text-[.8em]",
				style="text-anchor: middle; dominant-baseline: central",
				x="200",
				y="200"
			) { $activeChord }


	</template>
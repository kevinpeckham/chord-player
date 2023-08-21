<!-- Example Svelte Page / Starter Web Page-->
<script lang="ts">

	// context api
	import { setContext } from "svelte";

	// store function
	import { writable } from "svelte/store";

	// components
	import CircleOfFifths from "$atoms/CircleOfFifths.svelte";

	// types
	import type { PageData } from "./$types";

	// catch data from layout function in +layout.ts
	export let data: PageData;

	$: chords = data.chords;
	$: setContext("chords", chords);

	// variable
	let oscillatorVoice = "sine"

	// create store
	const oscillatorStore = writable(oscillatorVoice);
	$: setContext("oscillatorStore", oscillatorStore);

	// update the store when the variable changes
	$: { $oscillatorStore = oscillatorVoice };







</script>

<template lang="pug">
	//- head
	svelte:head
		title Chord Player | Circle of Fifths
		meta(
			content="A playable circle of fifths app.",
			name="description"
		)

	//- body
	header.pl-8.pt-8.absolute.top-0.left-0.z-10
		h1.text-24.text-accent  Chord Player
		div.opacity-80 A playable Circle of Fifths.

	//- controls
	.absolute.right-8.top-8.z-20
		+each('["sine","triangle","square","sawtooth"] as voice')
			.flex.gap-x-2
				input(
					type="radio"
					checked!="{oscillatorVoice === voice}"
					name="oscillator"
					value!="{voice}"
					bind:group!="{oscillatorVoice}"
					)
				label {voice}


	main.relative.grid.grid-cols-1.min-h-screen.place-items-center.p-4.text-neutral-50.w-full.h-full



		//- outer circle container
		.flex.items-center.justify-center.w-auto.aspect-square(class="h-[90vmin]")
			CircleOfFifths

		//- version
		.absolute.right-8.bottom-8.opacity-60.text-xs beta 0.0.2

	footer

</template>

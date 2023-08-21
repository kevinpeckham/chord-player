<!-- Example Svelte Page / Starter Web Page-->
<script lang="ts">

	// context api
	import { setContext } from "svelte";

	// components
	import CircleOfFifths from "$atoms/CircleOfFifths.svelte";

	// types
	import type { PageData } from "./$types";

	// catch data from layout function in +layout.ts
	export let data: PageData;

	$: chords = data.chords;
	$: setContext("chords", chords);




</script>

<template lang="pug">
	//- head
	svelte:head
		title Chord Player - Beta 0.0.1
		meta(
			content="A node starter template for the Svelte, Typescript, TailwindCSS, and Pug stack.",
			name="description"
		)

	//- body
	main.relative.grid.grid-cols-1.min-h-screen.place-items-center.p-4.text-neutral-50.w-full.h-full
		//- outer circle container
		.flex.items-center.justify-center.w-auto.aspect-square(class="h-[90vmin]")
			CircleOfFifths

		.absolute.right-8.bottom-8.opacity-60.text-xs beta 0.0.1

</template>

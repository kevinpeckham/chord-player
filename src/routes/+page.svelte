<!-- Example Svelte Page / Starter Web Page-->
<script lang="ts">
// components
import CircleOfFifths from "$components/CircleOfFifths.svelte";

// props
let { data } = $props();

// Svelte 5 runes
let oscillator = $state({
	activeChord: "",
	activeVoice: "sine",
	voices: ["sine", "triangle", "square", "sawtooth"] as const,
});
</script>


<svelte:head>
	<title>Chord Player | Circle of Fifths</title>
	<meta content="A playable circle of fifths app." name="description" />
</svelte:head>

<!-- body -->
<header class="pl-8 pt-8 absolute top-0 left-0 z-10">
	<h1 class="text-24px text-accent">Chord Player</h1>
	<div class="opacity-80">A playable Circle of Fifths.</div>
</header>

<main class="relative grid grid-cols-1 min-h-screen place-items-center p-4 text-neutral-50 max-w-full h-full">
	<!-- outer circle container -->
	<div class="flex items-center justify-center w-auto aspect-square sm:h-[90vmin]">
		<CircleOfFifths chords={data.chords} bind:oscillator={oscillator}></CircleOfFifths>
	</div>

	<!-- version -->
	<div class="absolute right-8 bottom-8 opacity-60 text-xs">v0.2.0</div>

	<!-- controls -->
	<div class="absolute left-8 bottom-8 z-20">
		{#each oscillator.voices as voice}
			<div class="flex gap-x-3">
				<input
					class="text-18px"
					id="oscillator-{voice}"
					type="radio"
					checked={oscillator.activeVoice === voice}
					name="oscillator"
					value={voice}
					onchange={() => oscillator.activeVoice = voice}
				/>
				<label for="oscillator-{voice}">{voice}</label>
			</div>
		{/each}
	</div>
</main>

<footer class="text-12px px-8 py-4 border-t border-t-neutral-100/30 bg-black/10">
	<div class="flex opacity-60">MIT License</div>
</footer>

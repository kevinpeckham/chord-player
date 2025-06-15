<!-- Example Svelte Page / Starter Web Page-->
<script lang="ts">
// components
import Instrument from "$components/Instrument.svelte";
import SettingsPanel from "$components/SettingsPanel.svelte";
import VolumeControl from "$components/VolumeControl.svelte";

// props, including data from load function
let { data } = $props();
</script>


<svelte:head>
	<title>Fifths | Circle of Fifths Chord Player</title>
	<meta content="A playable circle of fifths app." name="description" />
</svelte:head>

<!-- body -->
<header class="pl-8 pt-8 absolute top-0 left-0 z-10">
	<h1 class="text-24px text-accent">Fifths</h1>
	<div class="opacity-80">A playable circle of fifths synth.</div>
</header>

<main class="relative grid grid-cols-1 min-h-screen place-items-center p-4 text-neutral-50 max-w-full h-full">
	<!-- outer circle container -->
	<div class="flex items-center justify-center w-auto aspect-square sm:h-[90vmin]">
		<Instrument chords={data.chords}></Instrument>
	</div>

	<!-- version -->
	<div class="absolute right-8 bottom-8 opacity-60 text-xs">v0.3.0</div>

	<!-- settings panel -->
	<SettingsPanel />

	<!-- volume control -->
	<VolumeControl />
</main>

<footer class="text-12px px-8 py-4 border-t border-t-neutral-100/30 bg-black/10">
	<div class="flex opacity-60">MIT License</div>
</footer>

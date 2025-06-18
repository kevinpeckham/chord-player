<!-- Example Svelte Page / Starter Web Page-->
<script lang="ts">
// components
import Instrument from "$components/Instrument.svelte";
import SettingsPanel from "$components/SettingsPanel.svelte";
import VolumeControl from "$components/VolumeControl.svelte";
import HamburgerButton from "$components/HamburgerButton.svelte";

// props, including data from load function
let { data } = $props();

// state
let menuState: "closed" | "open" = $state("closed");
</script>


<svelte:head>
	<title>Fifths | Circle of Fifths Chord Player</title>
	<meta content="Fifths - An interactive chord player using the circle of fifths. Play major and minor chords with different synth voices." name="description" />
</svelte:head>

<!-- body -->
<header class="page-x-padding py-4 z-10 flex items-center justify-between w-full">
	<HamburgerButton bind:menuState />
	<div class="relative flex-none min-w-300px text-right">
		<h1 class="text-24px text-accent font-700 {menuState === 'open' ? 'opacity-0 pointer-events-none' : 'opacity-90 hover:opacity-100'}">Fifths</h1>
		<div class="absolute top-9 w-full opacity-80 hidden md:block {menuState === 'open' ? 'md:hidden' : ''}">A playable circle of fifths synth.
	</div>
	</div>

</header>

<main class="relative grid grid-cols-1 gap-y-12 place-items-center page-x-padding pb-36 text-neutral-50 max-w-full max-h-full z-0">

		<!-- toolbar -->
		<div data-toolbar>
			<!-- volume control -->
			<div class="">
				<VolumeControl />
			</div>
		</div>

	<!-- outer circle container -->
	<div class="flex items-start justify-center w-auto aspect-square sm:max-w-500px lg:max-w-640px">
		<Instrument chords={data.chords}></Instrument>
	</div>

</main>




<!-- settings panel -->
<div data-settings class="bg-blue-900 z-0 w-screen h-screen lg:w-500px lg:border-r lg:border-slate-100 lg:shadow-2xl absolute top-0 left-0 {menuState === 'open' ? 'lg:block' : 'hidden'}">
	<SettingsPanel />
</div>

<!-- <footer class="text-12px px-8 py-4 border-t border-t-neutral-100/30 bg-black/10">
	<div class="flex opacity-60">MIT License</div>
</footer> -->

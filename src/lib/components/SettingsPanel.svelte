<script lang="ts">
// import settings
import { settings } from "$stores/settings.svelte";
import VoicingSelector from "$components/VoicingSelector.svelte";
</script>

<div class="grid grid-cols-1 gap-6 page-x-padding pt-4">

	<h2 class="text-24px font-500 text-right">Settings</h2>

	<!-- Play Mode Selection -->
	<div class="flex flex-col gap-2">
		<label for="mode-select" class="text-sm opacity-80">Play Mode</label>
		<select
			id="mode-select"
			bind:value={settings.mode}
			class="bg-primary/20 border border-neutral-100/20 rounded px-3 py-2 text-sm capitalize"
		>
			<option value="chords">Chords</option>
			<option value="notes">Individual Notes</option>
		</select>
	</div>

	<!-- Key Center Selection -->
	<div class="flex flex-col gap-2">
		<label for="key-center-select" class="text-sm opacity-80">Key Center</label>
		<select
			id="key-center-select"
			bind:value={settings.keyCenter}
			class="bg-primary/20 border border-neutral-100/20 rounded px-3 py-2 text-sm"
		>
			<option value="C">C</option>
			<option value="C#">C♯ / D♭</option>
			<option value="D">D</option>
			<option value="D#">D♯ / E♭</option>
			<option value="E">E</option>
			<option value="F">F</option>
			<option value="F#">F♯ / G♭</option>
			<option value="G">G</option>
			<option value="G#">G♯ / A♭</option>
			<option value="A">A</option>
			<option value="A#">A♯ / B♭</option>
			<option value="B">B</option>
		</select>
	</div>

	<!-- Key Center Position -->
	<div class="flex flex-col gap-2">
		<label for="key-position-select" class="text-sm opacity-80">Key Position</label>
		<select
			id="key-position-select"
			bind:value={settings.keyCenterPosition}
			class="bg-primary/20 border border-neutral-100/20 rounded px-3 py-2 text-sm"
		>
			<option value="top">Top (12 o'clock)</option>
			<option value="bottom">Bottom (6 o'clock)</option>
		</select>
	</div>

	<!-- Oscillator Voice Selection -->
	<div class="flex flex-col gap-2">
		<label for="oscillator-select" class="text-sm opacity-80">Oscillator Type</label>
		<select
			id="oscillator-select"
			bind:value={settings.activeVoice}
			class="bg-primary/20 border border-neutral-100/20 rounded px-3 py-2 text-sm capitalize"
		>
			{#each settings.availableVoices as voice}
				<option value={voice} class="capitalize">
					{voice}
				</option>
			{/each}
		</select>
	</div>

	<!-- Chord Voicing Selection (only in chords mode) -->
	{#if settings.mode === "chords"}
		<VoicingSelector />
	{/if}

	<!-- Octave Selection (only in notes mode) -->
	{#if settings.mode === "notes"}
		<div class="flex flex-col gap-2">
			<label for="octave-select" class="text-sm opacity-80">Octave</label>
			<select
				id="octave-select"
				bind:value={settings.noteOctave}
				class="bg-primary/20 border border-neutral-100/20 rounded px-3 py-2 text-sm"
			>
				{#each [1, 2, 3, 4, 5, 6, 7] as octave}
					<option value={octave}>Octave {octave}</option>
				{/each}
			</select>
		</div>
	{/if}

	<!-- version -->
	<div class="absolute right-8 bottom-8 opacity-60 text-xs">v0.3.6</div>
</div>
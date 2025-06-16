<script lang="ts">
// import settings
import { settings } from "$stores/settings.svelte";
import VoicingSelector from "$components/VoicingSelector.svelte";
</script>

<div class="absolute left-8 bottom-8 z-20 flex flex-col gap-6">
	<!-- Play Mode Selection -->
	<div class="flex flex-col gap-2">
		<label for="mode-select" class="text-sm opacity-80 sr-only">Play Mode</label>
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
		<label for="key-center-select" class="text-sm opacity-80 sr-only">Key Center (12 o'clock)</label>
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

	<!-- Oscillator Voice Selection -->
	<div class="flex flex-col gap-2">
		<label for="oscillator-select" class="text-sm opacity-80 sr-only">Oscillator Type</label>
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
			<label for="octave-select" class="text-sm opacity-80 sr-only">Octave</label>
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
</div>
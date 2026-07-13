<script lang="ts">
// import settings

import VoicingSelector from "$components/VoicingSelector.svelte";

import { audioState, setReverbMix } from "$stores/audio.svelte";
import { settings } from "$stores/settings.svelte";

const reverbPercent = $derived(Math.round(audioState.reverbMix * 100));
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

	<!-- Seventh Type (only in chords mode) -->
	{#if settings.mode === "chords"}
		<div class="flex flex-col gap-2">
			<label for="seventh-type-select" class="text-sm opacity-80">Seventh Type</label>
			<select
				id="seventh-type-select"
				bind:value={settings.seventhType}
				class="bg-primary/20 border border-neutral-100/20 rounded px-3 py-2 text-sm"
			>
				<option value="dominant">Dominant 7th (C7)</option>
				<option value="major7">Major 7th (Cmaj7)</option>
			</select>
			<p class="text-xs opacity-60">Hold Shift or the 7 pad while playing to add sevenths. Minor chords always use m7.</p>
		</div>
	{/if}

	<!-- Reverb -->
	<div class="flex flex-col gap-2">
		<label for="reverb-mix" class="text-sm opacity-80">Reverb</label>
		<div class="flex items-center gap-3">
			<input
				id="reverb-mix"
				type="range"
				min="0"
				max="100"
				value={reverbPercent}
				oninput={(e) =>
					setReverbMix(Number.parseInt(e.currentTarget.value, 10) / 100)}
				class="w-full h-2 cursor-pointer appearance-none rounded-lg bg-gray-200/20 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-accent"
			/>
			<span class="text-sm tabular-nums opacity-80 w-10">{reverbPercent}%</span>
		</div>
		<p class="text-xs opacity-60">Press R to toggle reverb on and off.</p>
	</div>

	<!-- Time Signature -->
	<div class="flex flex-col gap-2">
		<label for="time-signature-select" class="text-sm opacity-80">Time Signature</label>
		<select
			id="time-signature-select"
			bind:value={settings.timeSignature}
			class="bg-primary/20 border border-neutral-100/20 rounded px-3 py-2 text-sm"
		>
			<option value="2/4">2/4</option>
			<option value="3/4">3/4</option>
			<option value="4/4">4/4</option>
			<option value="5/4">5/4</option>
			<option value="6/8">6/8</option>
		</select>
	</div>

	<!-- Metronome Accent -->
	<div class="flex flex-col gap-2">
		<div class="flex items-center gap-3">
			<input
				id="metronome-accent-toggle"
				type="checkbox"
				bind:checked={settings.metronomeAccent}
				class="w-4 h-4 accent-accent cursor-pointer"
			/>
			<label for="metronome-accent-toggle" class="text-sm opacity-80 cursor-pointer">Accent metronome downbeat</label>
		</div>
		<p class="text-xs opacity-60">When on, the click accents beat 1 of each bar per the time signature.</p>
	</div>

	<!-- Progression Pad visibility (only in chords mode) -->
	{#if settings.mode === "chords"}
		<div class="flex items-center gap-3">
			<input
				id="progression-pad-toggle"
				type="checkbox"
				bind:checked={settings.showProgressionPad}
				class="w-4 h-4 accent-accent cursor-pointer"
			/>
			<label for="progression-pad-toggle" class="text-sm opacity-80 cursor-pointer">Show progression pad</label>
		</div>
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

	<!-- about link -->
	<div>
		<a
			href="/about"
			class="text-sm opacity-80 underline underline-offset-2 hover:text-accent hover:opacity-100"
		>About Fifths &rarr;</a>
	</div>

	<!-- attribution -->
	<div class="absolute left-8 bottom-8 opacity-60 text-xs">
		Made by Kevin Peckham @
		<a
			href="https://www.lightningjar.com"
			target="_blank"
			rel="noopener"
			class="underline underline-offset-2 hover:text-accent"
		>Lightning Jar</a>
		in Philadelphia
	</div>

	<!-- version -->
	<div class="absolute right-8 bottom-8 opacity-60 text-xs">v0.15.0</div>
</div>
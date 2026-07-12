<!--
@component
Progression pad
- A simple tracker: every chord played is jotted onto the pad (with its
  hold duration quantized to beats at the pad's tempo)
- Transport: play/pause (true pause, position kept), stop, loop; while the
  transport is engaged, live jotting is suspended — when playback ends
  naturally with rec on, the next chord played appends (punch-in)
- ● rec toggles jotting
- Chords group into measures (per the time signature) separated by pipes;
  measures wrap as whole units and are never split across lines
- undo / clear; the X hides the pad (re-enable from settings); content
  persists in localStorage; hidden until the first chord is played
- (.mid export exists in $utils/midi but is not surfaced in the UI for now)
-->

<script lang="ts">
import {
	clearProgression,
	deleteLast,
	progression,
	toggleRecording,
} from "$stores/progression.svelte";
import {
	pausePlayback,
	player,
	playProgression,
	stopPlayback,
	toggleLoop,
} from "$stores/progressionPlayer.svelte";
import { beatsPerBar, settings } from "$stores/settings.svelte";

// Group chords into measures (per the time signature), keeping each chord's
// index into progression.entries so the sounding chord can be highlighted.
// Each measure renders as an unbreakable unit, so wrapping never splits one.
const measures = $derived.by(() => {
	const barBeats = beatsPerBar();
	const grouped: { label: string; index: number }[][] = [[]];
	let beatsInBar = 0;

	progression.entries.forEach((entry, index) => {
		if (beatsInBar >= barBeats) {
			grouped.push([]);
			beatsInBar = beatsInBar % barBeats;
		}
		grouped[grouped.length - 1].push({ label: entry.label, index });
		beatsInBar += entry.beats;
	});
	return grouped;
});

const hasPlayableEntries = $derived(
	progression.entries.some(
		(entry) => entry.kind === "chord" && entry.notes.length > 0,
	),
);

const transportRunning = $derived(player.playing && !player.paused);

function dismiss() {
	settings.showProgressionPad = false;
}

// Silence playback if the pad unmounts (dismissed / mode change)
$effect(() => {
	return () => {
		stopPlayback();
	};
});

const buttonClasses =
	"rounded border border-neutral-100/30 px-2 py-1 text-xs opacity-80 hover:opacity-100 hover:border-neutral-100/60 disabled:opacity-30 disabled:cursor-default";
const activeClasses = "text-accent border-accent/60";
</script>

{#if progression.entries.length > 0}
	<div
		data-progression-pad
		class="relative w-full max-w-500px rounded-lg bg-primary/70 border border-neutral-100/15 px-4 py-3 pr-10 grid gap-2"
	>
		<button
			type="button"
			aria-label="Hide progression pad"
			title="Hide progression pad (re-enable in settings)"
			class="absolute top-2 right-2 w-6 h-6 grid place-items-center rounded opacity-60 hover:opacity-100 hover:text-accent"
			onclick={dismiss}
		>&times;</button>

		<div
			class="flex flex-wrap gap-x-2 gap-y-1 max-h-28 overflow-y-auto font-mono text-sm"
			aria-label="Jotted progression"
		>
			{#each measures as measure, m}
				<div data-measure class="flex gap-x-3 whitespace-nowrap">
					{#each measure as chip}
						<span
							class={player.position === chip.index
								? "text-accent"
								: "opacity-90"}
						>{chip.label}</span>
					{/each}
					{#if m < measures.length - 1}
						<span class="opacity-40 select-none" aria-hidden="true">|</span>
					{/if}
				</div>
			{/each}
		</div>

		<div class="flex flex-wrap items-center gap-2">
			<!-- transport -->
			<button
				type="button"
				class="{buttonClasses} {transportRunning ? activeClasses : ''}"
				disabled={!hasPlayableEntries}
				title={transportRunning
					? "Pause playback"
					: "Play this progression"}
				onclick={transportRunning ? pausePlayback : playProgression}
			>
				{transportRunning ? "pause" : "play"}
			</button>
			<button
				type="button"
				class={buttonClasses}
				disabled={!player.playing}
				title="Stop playback"
				onclick={stopPlayback}
			>
				stop
			</button>
			<button
				type="button"
				class="{buttonClasses} {player.loop ? activeClasses : ''}"
				aria-pressed={player.loop}
				title="Loop playback"
				onclick={toggleLoop}
			>
				loop
			</button>

			<!-- playback click (the live metronome yields during playback) -->
			<label
				class="flex items-center gap-1.5 text-xs opacity-80 cursor-pointer"
				title="Play a click during playback"
			>
				<input
					type="checkbox"
					bind:checked={player.clickAlong}
					class="w-3.5 h-3.5 accent-accent cursor-pointer"
					aria-label="Click during playback"
				/>
				click
			</label>

			<!-- recorder -->
			<button
				type="button"
				class="{buttonClasses} {progression.recording ? activeClasses : ''}"
				aria-pressed={progression.recording}
				title={progression.recording
					? "Recording: chords you play are jotted (off = noodle freely)"
					: "Not recording: chords you play are not jotted"}
				onclick={toggleRecording}
			>
				&#9679; rec
			</button>
		</div>

		<div class="flex flex-wrap gap-2">
			<button type="button" class={buttonClasses} onclick={deleteLast}>
				undo
			</button>
			<button type="button" class={buttonClasses} onclick={clearProgression}>
				clear
			</button>
		</div>
	</div>
{/if}

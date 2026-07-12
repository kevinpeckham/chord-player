<!--
@component
Progression pad
- A simple tracker: every chord played is jotted onto the pad
- play/stop plays the jotted progression through the app synth; export midi
  downloads it as a .mid file
- Line break / undo / clear controls; pause stops jotting; the X hides the
  pad (re-enable from settings); content persists in localStorage
- Hidden until the first chord is played
-->

<script lang="ts">
import {
	addLineBreak,
	clearProgression,
	deleteLast,
	progression,
	togglePaused,
} from "$stores/progression.svelte";
import {
	player,
	playProgression,
	stopPlayback,
} from "$stores/progressionPlayer.svelte";
import { settings } from "$stores/settings.svelte";

import { progressionToMidi } from "$utils/midi";

// Group flat entries into visual lines at each break, keeping each chord's
// index into progression.entries so the sounding chord can be highlighted
const lines = $derived.by(() => {
	const grouped: { label: string; index: number }[][] = [[]];
	progression.entries.forEach((entry, index) => {
		if (entry.kind === "break") {
			grouped.push([]);
		} else {
			grouped[grouped.length - 1].push({ label: entry.label, index });
		}
	});
	return grouped;
});

const hasPlayableEntries = $derived(
	progression.entries.some(
		(entry) => entry.kind === "chord" && entry.notes.length > 0,
	),
);

function dismiss() {
	settings.showProgressionPad = false;
}

function exportMidi() {
	const bytes = progressionToMidi(progression.entries);
	const blob = new Blob([bytes], { type: "audio/midi" });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = "progression.mid";
	anchor.click();
	URL.revokeObjectURL(url);
}

// Silence playback if the pad unmounts (dismissed / mode change)
$effect(() => {
	return () => {
		stopPlayback();
	};
});

const buttonClasses =
	"rounded border border-neutral-100/30 px-2 py-1 text-xs opacity-80 hover:opacity-100 hover:border-neutral-100/60 disabled:opacity-30 disabled:cursor-default";
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
			class="grid gap-1 max-h-28 overflow-y-auto font-mono text-sm"
			aria-label="Jotted progression"
		>
			{#each lines as line}
				<div class="flex flex-wrap gap-x-3 gap-y-1 min-h-5">
					{#each line as chip}
						<span
							class={player.position === chip.index
								? "text-accent"
								: "opacity-90"}
						>{chip.label}</span>
					{/each}
				</div>
			{/each}
		</div>
		<div class="flex flex-wrap gap-2">
			<button
				type="button"
				class="{buttonClasses} {player.playing ? 'text-accent border-accent/60' : ''}"
				disabled={!hasPlayableEntries}
				title={player.playing
					? "Stop playback"
					: "Play this progression"}
				onclick={player.playing ? stopPlayback : playProgression}
			>
				{player.playing ? "stop" : "play"}
			</button>
			<button
				type="button"
				class="{buttonClasses} {progression.paused ? 'text-accent border-accent/60' : ''}"
				aria-pressed={progression.paused}
				title={progression.paused
					? "Resume jotting chords"
					: "Pause jotting chords"}
				onclick={togglePaused}
			>
				{progression.paused ? "resume" : "pause"}
			</button>
			<button type="button" class={buttonClasses} onclick={addLineBreak}>
				new line
			</button>
			<button type="button" class={buttonClasses} onclick={deleteLast}>
				undo
			</button>
			<button type="button" class={buttonClasses} onclick={clearProgression}>
				clear
			</button>
			<button
				type="button"
				class={buttonClasses}
				disabled={!hasPlayableEntries}
				title="Download this progression as a .mid file"
				onclick={exportMidi}
			>
				export midi
			</button>
		</div>
	</div>
{/if}

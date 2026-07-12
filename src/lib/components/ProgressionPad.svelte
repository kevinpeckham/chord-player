<!--
@component
Progression pad
- A simple tracker: every chord played is jotted onto the pad
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
import { settings } from "$stores/settings.svelte";

// Group flat entries into visual lines at each break
const lines = $derived.by(() => {
	const grouped: string[][] = [[]];
	for (const entry of progression.entries) {
		if (entry.kind === "break") {
			grouped.push([]);
		} else {
			grouped[grouped.length - 1].push(entry.label);
		}
	}
	return grouped;
});

function dismiss() {
	settings.showProgressionPad = false;
}

const buttonClasses =
	"rounded border border-neutral-100/30 px-2 py-1 text-xs opacity-80 hover:opacity-100 hover:border-neutral-100/60";
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
					{#each line as label}
						<span class="opacity-90">{label}</span>
					{/each}
				</div>
			{/each}
		</div>
		<div class="flex gap-2">
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
		</div>
	</div>
{/if}

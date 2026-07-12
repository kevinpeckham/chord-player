<!--
@component
Progression pad
- A simple tracker: every chord played is jotted onto the pad
- Line break / undo / clear controls; content persists in localStorage
- Hidden until the first chord is played
-->

<script lang="ts">
import {
	addLineBreak,
	clearProgression,
	deleteLast,
	progression,
} from "$stores/progression.svelte";

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

const buttonClasses =
	"rounded border border-neutral-100/30 px-2 py-1 text-xs opacity-80 hover:opacity-100 hover:border-neutral-100/60 disabled:opacity-30 disabled:cursor-default";
</script>

{#if progression.entries.length > 0}
	<div
		data-progression-pad
		class="fixed bottom-12 inset-x-0 z-10 flex justify-center px-4 pointer-events-none"
	>
		<div
			class="pointer-events-auto max-w-full rounded-lg bg-primary/70 backdrop-blur border border-neutral-100/15 px-4 py-3 grid gap-2"
		>
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
				<button type="button" class={buttonClasses} onclick={addLineBreak}>
					new line
				</button>
				<button type="button" class={buttonClasses} onclick={deleteLast}>
					undo
				</button>
				<button
					type="button"
					class={buttonClasses}
					onclick={clearProgression}
				>
					clear
				</button>
			</div>
		</div>
	</div>
{/if}

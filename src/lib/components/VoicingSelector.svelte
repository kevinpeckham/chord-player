<script lang="ts">
import { settings } from "$stores/settings.svelte";

// Voicing options
const voicingOptions = [
	{
		value: "standard",
		label: "Standard",
		description: "Classic triad voicing",
	},
	{ value: "spread", label: "Spread", description: "Notes across octaves" },
	{ value: "rich", label: "Rich", description: "Doubled root with bass" },
	{ value: "bass", label: "Bass", description: "Added bass note" },
	{
		value: "rootBass",
		label: "Root Bass",
		description: "Bass root + 1st inversion",
	},
];
</script>

<div class="flex flex-col gap-2">
  <label for="voicing-select" class="text-sm opacity-80 sr-only">Chord Voicing</label>
  <select
    id="voicing-select"
    bind:value={settings.chordVoicing}
    class="bg-primary/20 border border-neutral-100/20 rounded px-3 py-2 text-sm"
  >
    {#each voicingOptions as option}
      <option value={option.value}>
        {option.label} - {option.description}
      </option>
    {/each}
  </select>
</div>
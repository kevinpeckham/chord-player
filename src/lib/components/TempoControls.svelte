<!--
@component
Tempo controls (toolbar)
- One shared tempo for everything: the bpm input, tap tempo, the metronome
  click, progression playback, and MIDI export all read/write player.bpm
- click toggles a 4/4 metronome with an accented downbeat
-->

<script lang="ts">
import { metronome, toggleMetronome } from "$stores/metronome.svelte";
import { player, setBpm, tapTempo } from "$stores/progressionPlayer.svelte";

const buttonClasses =
	"rounded border border-neutral-100/30 px-2 py-1 text-xs opacity-80 hover:opacity-100 hover:border-neutral-100/60";
</script>

<div data-tempo-controls class="flex items-center gap-2">
	<label class="flex items-center gap-1 text-xs opacity-80">
		<input
			type="number"
			min="40"
			max="240"
			value={player.bpm}
			onchange={(e) =>
				setBpm(Number.parseInt(e.currentTarget.value, 10) || 120)}
			class="w-14 rounded border border-neutral-100/30 bg-primary/20 px-1.5 py-1 text-xs tabular-nums"
			aria-label="Tempo in beats per minute"
		/>
		bpm
	</label>
	<button
		type="button"
		class={buttonClasses}
		title="Tap in time to set the tempo"
		onclick={tapTempo}
	>
		tap
	</button>
	<button
		type="button"
		class="{buttonClasses} {metronome.running
			? 'text-accent border-accent/60'
			: ''}"
		aria-pressed={metronome.running}
		title={metronome.running ? "Stop the click" : "Start the click (4/4)"}
		onclick={toggleMetronome}
	>
		click
	</button>
</div>

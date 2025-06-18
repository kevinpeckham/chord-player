<script lang="ts">
import { audioState, setMasterVolume } from "$stores/audio.svelte";

// Convert 0-1 to 0-100 for display
const volumePercent = $derived(Math.round(audioState.masterVolume * 100));
</script>

<div class="contents">
	<label for="volume" class="text-sm opacity-80">Volume</label>
	<input
		id="volume"
		type="range"
		min="0"
		max="100"
		value={volumePercent}
		oninput={(e) => setMasterVolume(parseInt(e.currentTarget.value) / 100)}
		class="w-24 h-2 cursor-pointer appearance-none rounded-lg bg-gray-200/20 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:transition-all hover:[&::-webkit-slider-thumb]:scale-110 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-accent [&::-moz-range-thumb]:transition-all hover:[&::-moz-range-thumb]:scale-110"
	/>
	<span class="text-sm tabular-nums opacity-80 w-10">{volumePercent}%</span>
</div>
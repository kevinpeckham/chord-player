<script lang="ts">
// import settings
import { settings } from "$stores/settings.svelte";
import VoicingSelector from "$components/VoicingSelector.svelte";
</script>

<div class="absolute left-8 bottom-8 z-20 flex flex-col gap-6">
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
	
	<!-- Chord Voicing Selection -->
	<VoicingSelector />
</div>
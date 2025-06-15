<script lang="ts">
// import settings
import { settings, changeVoice } from "$stores/settings.svelte";
import VoicingSelector from "$components/VoicingSelector.svelte";
</script>

<div class="absolute left-8 bottom-8 z-20 flex flex-col gap-6">
	<!-- Oscillator Voice Selection -->
	<div class="flex flex-col gap-2">
		<h3 class="text-sm opacity-80">Oscillator</h3>
		{#each settings.availableVoices as voice}
			<div class="flex gap-x-3">
				<input
					class="text-18px"
					id="oscillator-{voice}"
					type="radio"
					checked={settings.activeVoice === voice}
					name="oscillator"
					value={voice}
					onchange={() => changeVoice(voice)}
				/>
				<label for="oscillator-{voice}">{voice}</label>
			</div>
		{/each}
	</div>
	
	<!-- Chord Voicing Selection -->
	<VoicingSelector />
</div>
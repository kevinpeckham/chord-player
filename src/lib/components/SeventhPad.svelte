<!--
@component
Seventh modifier pad
- Hold-to-activate "7" button: while held, chord wedges sound their seventh
- The touch equivalent of holding Shift on desktop
- Momentary like a sustain pedal — releasing returns to plain triads
-->

<script lang="ts">
import { performance } from "$stores/performance.svelte";
import { settings } from "$stores/settings.svelte";

const label = $derived(settings.seventhType === "major7" ? "maj7" : "7");

function press(event: PointerEvent) {
	event.preventDefault();
	performance.seventhHeld = true;
}
function release() {
	performance.seventhHeld = false;
}
// Keyboard accessibility: Space/Enter hold the modifier like a real key
function onKeyDown(event: KeyboardEvent) {
	if (event.key === " " || event.key === "Enter") {
		event.preventDefault();
		performance.seventhHeld = true;
	}
}
function onKeyUp(event: KeyboardEvent) {
	if (event.key === " " || event.key === "Enter") {
		performance.seventhHeld = false;
	}
}
</script>

<!-- Touch-only: with a single mouse there is no way to hold the pad and
     click a chord, so desktop users get a plain Shift hint instead (see
     +page.svelte) and never see this button. -->
<div class="seventh-pad">
	<button
		type="button"
		aria-pressed={performance.seventhHeld}
		aria-label="Hold for seventh chords"
		title="Hold for seventh chords"
		class="select-none touch-none rounded-md border border-neutral-100/30 px-4 py-2 text-sm font-500 leading-none transition-colors {performance.seventhHeld
			? 'bg-accent text-primary border-accent'
			: 'bg-primary/20 hover:border-neutral-100/60'}"
		onpointerdown={press}
		onpointerup={release}
		onpointercancel={release}
		onpointerleave={release}
		onkeydown={onKeyDown}
		onkeyup={onKeyUp}
		oncontextmenu={(e) => e.preventDefault()}
	>{label}</button>
</div>

<style>
	/* Hide the pad for mouse/trackpad users — Shift is their modifier */
	@media (hover: hover) and (pointer: fine) {
		.seventh-pad {
			display: none;
		}
	}
</style>

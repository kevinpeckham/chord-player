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

<div class="flex items-center gap-2">
	<button
		type="button"
		aria-pressed={performance.seventhHeld}
		aria-label="Hold for seventh chords"
		title="Hold for seventh chords (or hold Shift)"
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

	<!-- Desktop hint: with one mouse you can't hold the pad and click a
	     chord, so tell mouse users about the keyboard modifier. The pad
	     still lights up while Shift is held (it reflects the same state).
	     Hidden on touch devices, where holding the pad is the mechanism. -->
	<span class="seventh-desktop-hint items-center gap-1.5 text-xs opacity-60" aria-hidden="true">
		hold
		<kbd class="rounded border border-neutral-100/40 px-1.5 py-0.5 font-mono text-[11px] leading-none">⇧ Shift</kbd>
	</span>
</div>

<style>
	/* Only mouse/trackpad users can't hold the pad while playing */
	.seventh-desktop-hint {
		display: none;
	}
	@media (hover: hover) and (pointer: fine) {
		.seventh-desktop-hint {
			display: inline-flex;
		}
	}
</style>

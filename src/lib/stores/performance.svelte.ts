// performance store - live playback state
export const performance = $state({
	activeChord: "",
	// Momentary seventh modifier (Shift on desktop, the on-screen 7 pad on
	// touch). While true, chord wedges sound their seventh.
	seventhHeld: false,
});

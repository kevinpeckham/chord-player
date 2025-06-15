// settings store
export const performance = $state({
	activeChord: "",
});

// functions to change settings
export function changeChord(newChord: typeof performance.activeChord) {
	performance.activeChord = newChord;
}

// type for settings
export type Performance = typeof performance;

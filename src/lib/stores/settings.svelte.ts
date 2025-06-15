// settings store
export const settings = $state({
	activeVoice: "sine",
	availableVoices: ["sine", "triangle", "square", "sawtooth"] as const,
});

// functions to change settings
export function changeVoice(newVoice: typeof settings.activeVoice) {
	settings.activeVoice = newVoice;
}

// type for settings
export type Settings = typeof settings;

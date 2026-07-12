// Metronome / click track. Uses the standard Web Audio lookahead pattern:
// a coarse setInterval wakes every ~25ms and schedules any clicks that fall
// inside the next ~100ms window on the AudioContext clock — precise,
// drift-free timing regardless of main-thread jitter. Tempo comes live from
// the shared player.bpm, so tap tempo and the bpm input retune the click
// immediately.

import { audioTime, scheduleClick, unlockAudio } from "$stores/audio.svelte";
import { player } from "$stores/progressionPlayer.svelte";

const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD_S = 0.1;
const BEATS_PER_BAR = 4; // 4/4 with an accented downbeat

export const metronome = $state({
	running: false,
});

let intervalId: ReturnType<typeof setInterval> | null = null;
let nextBeatTime = 0;
let beatIndex = 0;

function scheduler(): void {
	const now = audioTime();
	if (now === null) return;
	while (nextBeatTime < now + SCHEDULE_AHEAD_S) {
		scheduleClick(nextBeatTime, beatIndex % BEATS_PER_BAR === 0);
		beatIndex++;
		nextBeatTime += 60 / player.bpm;
	}
}

export function startMetronome(): void {
	if (metronome.running) return;
	// Toggling the click is a user gesture — safe to unlock/resume audio here
	unlockAudio();
	const now = audioTime();
	if (now === null) return;

	beatIndex = 0;
	nextBeatTime = now + 0.05;
	metronome.running = true;
	scheduler();
	intervalId = setInterval(scheduler, LOOKAHEAD_MS);
}

export function stopMetronome(): void {
	if (intervalId) clearInterval(intervalId);
	intervalId = null;
	metronome.running = false;
}

export function toggleMetronome(): void {
	if (metronome.running) {
		stopMetronome();
	} else {
		startMetronome();
	}
}

// Component tests for Instrument (the Circle of Fifths).
//
// The audio store is mocked so startChord/stopChordById/stopChord calls can be
// observed. The `chords` prop is built exactly the way the real app does, by
// importing chordsData from the server data module.
//
// jsdom notes:
// - Pointer events are dispatched manually (PointerEvent when available,
//   otherwise MouseEvent with a defined pointerId) because jsdom has no
//   pointer-capture/layout machinery.
// - onPointerMove (sliding between chords) is NOT tested: it relies on
//   document.elementsFromPoint, which jsdom does not implement (no layout).
// - The component's very first interaction defers playback by 150ms (audio
//   unlock), so tests use fake timers to cross that boundary.

import { tick } from "svelte";

import Instrument from "$components/Instrument.svelte";

import { performance as performanceStore } from "$stores/performance.svelte";
import { clearProgression, progression } from "$stores/progression.svelte";
import { settings } from "$stores/settings.svelte";

import { chordsData } from "$data/chordsData.server";

import { render } from "@testing-library/svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("$stores/audio.svelte", () => ({
	audioState: {
		isInitialized: false,
		isPlaying: false,
		masterVolume: 0.8,
		activeNoteCount: 0,
		contextState: "suspended",
	},
	setMasterVolume: vi.fn(),
	startChord: vi.fn(),
	stopChord: vi.fn(),
	stopChordById: vi.fn(),
	toggleReverb: vi.fn(),
	unlockAudio: vi.fn(),
}));

import {
	startChord,
	stopChord,
	stopChordById,
	toggleReverb,
	unlockAudio,
} from "$stores/audio.svelte";

const FIRST_INTERACTION_DELAY_MS = 150;

function pointerEvent(type: string, pointerId = 1): Event {
	const Ctor =
		typeof window.PointerEvent === "function"
			? window.PointerEvent
			: MouseEvent;
	const event = new Ctor(type, {
		bubbles: true,
		cancelable: true,
		composed: true,
	});
	// jsdom's MouseEvent (and some PointerEvent impls) won't carry pointerId
	// through the constructor — define it explicitly.
	Object.defineProperty(event, "pointerId", { value: pointerId });
	return event;
}

// Completes the one-time 150ms audio-unlock delay so subsequent
// pointerdown events play synchronously.
async function pressChord(element: Element, pointerId = 1) {
	element.dispatchEvent(pointerEvent("pointerdown", pointerId));
	vi.advanceTimersByTime(FIRST_INTERACTION_DELAY_MS);
	await tick();
}

function releasePointer(element: Element, pointerId = 1) {
	element.dispatchEvent(pointerEvent("pointerup", pointerId));
}

function chordByMajorId(majorId: string) {
	const chord = chordsData.find((c) => c.majorId === majorId);
	if (!chord) throw new Error(`chord ${majorId} not found`);
	return chord;
}

describe("Instrument", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.clearAllMocks();
		clearProgression();
		performanceStore.activeChord = "";
		performanceStore.seventhHeld = false;
		settings.activeVoice = "sine";
		settings.chordVoicing = "standard";
		settings.seventhType = "dominant";
		settings.mode = "chords";
		settings.noteOctave = 4;
		settings.keyCenter = "C";
		settings.keyCenterPosition = "bottom";
	});

	afterEach(() => {
		vi.runOnlyPendingTimers();
		vi.useRealTimers();
		vi.unstubAllGlobals();
	});

	describe("rendering (chords mode)", () => {
		it("renders the Circle of Fifths svg", () => {
			const { container } = render(Instrument, { chords: chordsData });
			const svg = container.querySelector("svg#instrument-circle-of-fifths");
			expect(svg).toBeInTheDocument();
			expect(svg).toHaveAttribute("aria-label", "Circle of Fifths");
			expect(svg).toHaveAttribute("viewBox", "0 0 400 400");
		});

		it("renders 12 major and 12 minor wedges as buttons", () => {
			const { container } = render(Instrument, { chords: chordsData });
			const wedges = container.querySelectorAll('path[role="button"]');
			expect(wedges).toHaveLength(24);
			expect(
				container.querySelectorAll('path[data-mode="major"]'),
			).toHaveLength(12);
			expect(
				container.querySelectorAll('path[data-mode="minor"]'),
			).toHaveLength(12);
		});

		it("renders a wedge and a label for every chord in the data", () => {
			const { container } = render(Instrument, { chords: chordsData });
			for (const chord of chordsData) {
				expect(
					container.querySelector(`[id="chord-button-${chord.majorId}"]`),
				).toBeInTheDocument();
				expect(
					container.querySelector(`[id="chord-button-${chord.minorId}"]`),
				).toBeInTheDocument();
				expect(
					container.querySelector(`[id="chord-button-label-${chord.majorId}"]`),
				).toBeInTheDocument();
			}
		});

		it("with key center C at the bottom, C sits at array position 2", () => {
			const { container } = render(Instrument, { chords: chordsData });
			const cWedge = container.querySelector('[id="chord-button-C"]');
			expect(cWedge).toHaveAttribute("data-index", "2");
		});

		it("moving the key center to the top puts it at array position 8", async () => {
			settings.keyCenterPosition = "top";
			const { container } = render(Instrument, { chords: chordsData });
			await tick();
			const cWedge = container.querySelector('[id="chord-button-C"]');
			expect(cWedge).toHaveAttribute("data-index", "8");
		});

		it("uses flat spellings for key center C (prefers flats)", () => {
			const { container } = render(Instrument, { chords: chordsData });
			const labels = Array.from(
				container.querySelectorAll('[id^="chord-button-label-"]'),
			).map((el) => el.textContent);
			expect(labels).toContain("G♭");
			expect(labels).not.toContain("F♯");
		});

		it("uses sharp spellings for a sharp key center", async () => {
			settings.keyCenter = "E";
			const { container } = render(Instrument, { chords: chordsData });
			await tick();
			const labels = Array.from(
				container.querySelectorAll('[id^="chord-button-label-"]'),
			).map((el) => el.textContent);
			expect(labels).toContain("F♯");
			expect(labels).not.toContain("G♭");
		});
	});

	describe("rendering (notes mode)", () => {
		it("renders 12 note wedges and labels instead of chords", async () => {
			settings.mode = "notes";
			const { container } = render(Instrument, { chords: chordsData });
			await tick();
			const notes = container.querySelectorAll('path[data-mode="note"]');
			expect(notes).toHaveLength(12);
			expect(
				container.querySelectorAll('path[data-mode="major"]'),
			).toHaveLength(0);
			const labels = Array.from(
				container.querySelectorAll('[id^="note-button-label-"]'),
			).map((el) => el.textContent);
			expect(labels).toHaveLength(12);
			expect(labels).toEqual(
				expect.arrayContaining(["C", "C♯", "D", "G", "A", "B"]),
			);
		});
	});

	describe("chord playback", () => {
		it("ignores presses outside a wedge (delegated pointerdown on the svg background)", async () => {
			const { container } = render(Instrument, { chords: chordsData });
			const svg = container.querySelector("svg");
			if (!svg) throw new Error("svg not found");

			svg.dispatchEvent(pointerEvent("pointerdown", 1));
			vi.advanceTimersByTime(FIRST_INTERACTION_DELAY_MS);
			await tick();

			expect(unlockAudio).not.toHaveBeenCalled();
			expect(startChord).not.toHaveBeenCalled();
			expect(performanceStore.activeChord).toBe("");
		});

		// Regression: releasing before the 150ms unlock delay elapsed used to
		// start the chord after the pointer was already up, sticking it on
		it("does not start a chord if the pointer is released during the unlock delay", async () => {
			const { container } = render(Instrument, { chords: chordsData });
			const cWedge = container.querySelector('[id="chord-button-C"]');
			if (!cWedge) throw new Error("C wedge not found");

			cWedge.dispatchEvent(pointerEvent("pointerdown", 1));
			cWedge.dispatchEvent(pointerEvent("pointerup", 1));
			vi.advanceTimersByTime(FIRST_INTERACTION_DELAY_MS);
			await tick();

			expect(startChord).not.toHaveBeenCalled();
			expect(performanceStore.activeChord).toBe("");
		});

		it("first pointerdown delays playback by 150ms (audio unlock), then starts the chord", async () => {
			const { container } = render(Instrument, { chords: chordsData });
			const cWedge = container.querySelector('[id="chord-button-C"]');
			if (!cWedge) throw new Error("C wedge not found");

			cWedge.dispatchEvent(pointerEvent("pointerdown", 1));
			expect(unlockAudio).toHaveBeenCalledTimes(1);
			expect(startChord).not.toHaveBeenCalled();

			vi.advanceTimersByTime(FIRST_INTERACTION_DELAY_MS);
			await tick();

			const expected = chordByMajorId("C").majorVoicings.standard;
			expect(startChord).toHaveBeenCalledTimes(1);
			expect(startChord).toHaveBeenCalledWith(expected, "sine", 1);
		});

		it("plays a minor chord's standard voicing from its wedge", async () => {
			const { container } = render(Instrument, { chords: chordsData });
			const amWedge = container.querySelector('[id="chord-button-Am"]');
			if (!amWedge) throw new Error("Am wedge not found");

			await pressChord(amWedge, 1);

			const cChord = chordsData.find((c) => c.minorId === "Am");
			expect(startChord).toHaveBeenCalledWith(
				cChord?.minorVoicings.standard,
				"sine",
				1,
			);
		});

		it("updates the center display with the active chord name", async () => {
			const { container } = render(Instrument, { chords: chordsData });
			const cWedge = container.querySelector('[id="chord-button-C"]');
			const amWedge = container.querySelector('[id="chord-button-Am"]');
			if (!cWedge || !amWedge) throw new Error("wedges not found");

			await pressChord(cWedge, 1);
			expect(performanceStore.activeChord).toBe("C major");

			// Second (concurrent) pointer joins the display.
			amWedge.dispatchEvent(pointerEvent("pointerdown", 2));
			await tick();
			expect(performanceStore.activeChord).toBe("C major + A minor");
		});

		it("honors the selected voicing and oscillator voice", async () => {
			settings.chordVoicing = "rich";
			settings.activeVoice = "sawtooth";
			const { container } = render(Instrument, { chords: chordsData });
			const gWedge = container.querySelector('[id="chord-button-G"]');
			if (!gWedge) throw new Error("G wedge not found");

			await pressChord(gWedge, 1);

			expect(startChord).toHaveBeenCalledWith(
				chordByMajorId("G").majorVoicings.rich,
				"sawtooth",
				1,
			);
		});

		it("pointerup stops the chord for that pointer and clears the display", async () => {
			const { container } = render(Instrument, { chords: chordsData });
			const cWedge = container.querySelector('[id="chord-button-C"]');
			if (!cWedge) throw new Error("C wedge not found");

			await pressChord(cWedge, 1);
			releasePointer(cWedge, 1);
			await tick();

			expect(stopChordById).toHaveBeenCalledWith(1);
			expect(performanceStore.activeChord).toBe("");
		});

		it("a pointerup anywhere on the document stops a tracked pointer (safety net)", async () => {
			const { container } = render(Instrument, { chords: chordsData });
			const cWedge = container.querySelector('[id="chord-button-C"]');
			if (!cWedge) throw new Error("C wedge not found");

			await pressChord(cWedge, 1);
			document.body.dispatchEvent(pointerEvent("pointerup", 1));
			await tick();

			expect(stopChordById).toHaveBeenCalledWith(1);
			expect(performanceStore.activeChord).toBe("");
		});

		it("ignores pointerup for pointers it is not tracking", async () => {
			const { container } = render(Instrument, { chords: chordsData });
			const cWedge = container.querySelector('[id="chord-button-C"]');
			if (!cWedge) throw new Error("C wedge not found");

			await pressChord(cWedge, 1);
			releasePointer(cWedge, 99);

			expect(stopChordById).not.toHaveBeenCalledWith(99);
		});

		it("supports two simultaneous pointers on different wedges", async () => {
			const { container } = render(Instrument, { chords: chordsData });
			const cWedge = container.querySelector('[id="chord-button-C"]');
			const gWedge = container.querySelector('[id="chord-button-G"]');
			if (!cWedge || !gWedge) throw new Error("wedges not found");

			await pressChord(cWedge, 1);
			gWedge.dispatchEvent(pointerEvent("pointerdown", 2));
			await tick();

			expect(startChord).toHaveBeenCalledWith(
				chordByMajorId("C").majorVoicings.standard,
				"sine",
				1,
			);
			expect(startChord).toHaveBeenCalledWith(
				chordByMajorId("G").majorVoicings.standard,
				"sine",
				2,
			);

			releasePointer(gWedge, 2);
			await tick();
			expect(stopChordById).toHaveBeenCalledWith(2);
			expect(performanceStore.activeChord).toBe("C major");
		});

		it("stops all chords when the component unmounts", async () => {
			const { unmount } = render(Instrument, { chords: chordsData });
			unmount();
			expect(stopChord).toHaveBeenCalled();
		});
	});

	describe("keyboard shortcuts", () => {
		it("toggles reverb with the R key", async () => {
			render(Instrument, { chords: chordsData });
			window.dispatchEvent(
				new KeyboardEvent("keydown", { key: "r", bubbles: true }),
			);
			expect(toggleReverb).toHaveBeenCalledTimes(1);

			window.dispatchEvent(
				new KeyboardEvent("keydown", { key: "R", bubbles: true }),
			);
			expect(toggleReverb).toHaveBeenCalledTimes(2);
		});

		it("ignores R typed into a form control", async () => {
			render(Instrument, { chords: chordsData });
			const input = document.createElement("input");
			document.body.appendChild(input);

			input.dispatchEvent(
				new KeyboardEvent("keydown", { key: "r", bubbles: true }),
			);
			expect(toggleReverb).not.toHaveBeenCalled();
			input.remove();
		});
	});

	describe("progression jotting", () => {
		it("records each pressed chord as a compact symbol", async () => {
			const { container } = render(Instrument, { chords: chordsData });
			const cWedge = container.querySelector('[id="chord-button-C"]');
			const amWedge = container.querySelector('[id="chord-button-Am"]');
			if (!cWedge || !amWedge) throw new Error("wedges not found");

			await pressChord(cWedge, 1);
			releasePointer(cWedge, 1);
			await tick();
			await pressChord(amWedge, 2);
			releasePointer(amWedge, 2);
			await tick();

			expect(progression.entries).toEqual([
				{ kind: "chord", label: "C", notes: [60, 64, 67], beats: 1 },
				{ kind: "chord", label: "Am", notes: [69, 72, 76], beats: 1 },
			]);
		});

		it("records seventh chords with their symbol", async () => {
			const { container } = render(Instrument, { chords: chordsData });
			performanceStore.seventhHeld = true;
			await tick();
			const cWedge = container.querySelector('[id="chord-button-C"]');
			if (!cWedge) throw new Error("C wedge not found");

			await pressChord(cWedge, 1);

			expect(progression.entries).toEqual([
				{ kind: "chord", label: "C7", notes: [60, 64, 67, 70], beats: 1 },
			]);
		});

		it("quantizes a chord's held duration into beats on release", async () => {
			const { container } = render(Instrument, { chords: chordsData });
			const cWedge = container.querySelector('[id="chord-button-C"]');
			if (!cWedge) throw new Error("C wedge not found");

			// pressChord already advances 150ms (unlock delay); hold ~1.1s
			// total — at 120 BPM that's ~2.2 beats, quantized to a half note
			await pressChord(cWedge, 1);
			vi.advanceTimersByTime(950);
			releasePointer(cWedge, 1);
			await tick();

			const entry = progression.entries[0];
			if (entry.kind !== "chord") throw new Error("expected chord entry");
			expect(entry.beats).toBe(2);
		});

		it("does not re-record when a replay leaves the chord name unchanged", async () => {
			const { container } = render(Instrument, { chords: chordsData });
			const cWedge = container.querySelector('[id="chord-button-C"]');
			if (!cWedge) throw new Error("C wedge not found");

			await pressChord(cWedge, 1);
			// Changing the seventh type triggers the modifier effect's replay
			// of held chords; with no seventh active the chord name is
			// unchanged, so nothing new should be jotted
			settings.seventhType = "major7";
			await tick();

			expect(progression.entries).toEqual([
				{ kind: "chord", label: "C", notes: [60, 64, 67], beats: 1 },
			]);
		});
	});

	describe("seventh chords", () => {
		function wedge(container: HTMLElement, id: string): Element {
			const el = container.querySelector(`[id="chord-button-${id}"]`);
			if (!el) throw new Error(`wedge ${id} not found`);
			return el;
		}
		function lastStartChordCall() {
			const calls = vi.mocked(startChord).mock.calls;
			return calls[calls.length - 1];
		}

		it("adds a dominant seventh to a major chord while the modifier is held", async () => {
			const { container } = render(Instrument, { chords: chordsData });
			performanceStore.seventhHeld = true;
			await tick();

			await pressChord(wedge(container, "C"), 1);

			const [frequencies] = lastStartChordCall();
			expect(frequencies).toHaveLength(4);
			expect(frequencies[3]).toBeCloseTo(466.16, 1); // Bb4
			expect(performanceStore.activeChord).toBe("C7");
		});

		it("adds a major seventh when the seventh type setting is major7", async () => {
			settings.seventhType = "major7";
			const { container } = render(Instrument, { chords: chordsData });
			performanceStore.seventhHeld = true;
			await tick();

			await pressChord(wedge(container, "C"), 1);

			const [frequencies] = lastStartChordCall();
			expect(frequencies[3]).toBeCloseTo(493.88, 1); // B4
			expect(performanceStore.activeChord).toBe("Cmaj7");
		});

		it("always uses the minor seventh for minor wedges", async () => {
			settings.seventhType = "major7";
			const { container } = render(Instrument, { chords: chordsData });
			performanceStore.seventhHeld = true;
			await tick();

			await pressChord(wedge(container, "Am"), 1);

			const [frequencies] = lastStartChordCall();
			const root = chordsData.find((c) => c.minorId === "Am")
				?.minorFrequencies[0] as number;
			expect(frequencies).toHaveLength(4);
			expect(frequencies[3]).toBeCloseTo(root * 2 ** (10 / 12), 1);
			expect(performanceStore.activeChord).toBe("Am7");
		});

		it("re-voices a held chord live when the modifier is pressed and released", async () => {
			const { container } = render(Instrument, { chords: chordsData });
			await pressChord(wedge(container, "C"), 1);
			expect(lastStartChordCall()[0]).toHaveLength(3);

			performanceStore.seventhHeld = true;
			await tick();
			expect(lastStartChordCall()[0]).toHaveLength(4);
			expect(performanceStore.activeChord).toBe("C7");

			performanceStore.seventhHeld = false;
			await tick();
			expect(lastStartChordCall()[0]).toHaveLength(3);
			expect(performanceStore.activeChord).toBe("C major");
		});

		it("upgrades a sounding chord when a second finger lands on the same wedge", async () => {
			const { container } = render(Instrument, { chords: chordsData });
			const cWedge = wedge(container, "C");
			await pressChord(cWedge, 1);
			expect(lastStartChordCall()[0]).toHaveLength(3);

			// Second finger on the same wedge: same chord pointer, now a seventh
			cWedge.dispatchEvent(pointerEvent("pointerdown", 2));
			await tick();
			const [frequencies, , pointerId] = lastStartChordCall();
			expect(pointerId).toBe(1);
			expect(frequencies).toHaveLength(4);
			expect(performanceStore.activeChord).toBe("C7");

			// Lifting the second finger drops back to the triad; the chord
			// itself keeps sounding (no stop for pointer 1)
			cWedge.dispatchEvent(pointerEvent("pointerup", 2));
			await tick();
			expect(lastStartChordCall()[0]).toHaveLength(3);
			expect(performanceStore.activeChord).toBe("C major");
			expect(stopChordById).not.toHaveBeenCalledWith(1);
		});

		it("plays two chords when two fingers press different wedges (no upgrade)", async () => {
			const { container } = render(Instrument, { chords: chordsData });
			await pressChord(wedge(container, "C"), 1);
			wedge(container, "G").dispatchEvent(pointerEvent("pointerdown", 2));
			await tick();

			const [frequencies, , pointerId] = lastStartChordCall();
			expect(pointerId).toBe(2);
			expect(frequencies).toHaveLength(3);
			expect(performanceStore.activeChord).toBe("C major + G major");
		});
	});

	describe("note playback (notes mode)", () => {
		it("plays a single note frequency for a note wedge", async () => {
			settings.mode = "notes";
			const { container } = render(Instrument, { chords: chordsData });
			await tick();

			// With key center C at the bottom, position 2 is C.
			const wedge = container.querySelector('path[data-index="2"]');
			if (!wedge) throw new Error("note wedge not found");

			await pressChord(wedge, 1);

			expect(startChord).toHaveBeenCalledTimes(1);
			const [frequencies, voice, pointerId] =
				vi.mocked(startChord).mock.calls[0];
			expect(voice).toBe("sine");
			expect(pointerId).toBe(1);
			expect(frequencies).toHaveLength(1);
			// C4 = 261.63 Hz
			expect(frequencies[0]).toBeCloseTo(261.63, 1);
			expect(performanceStore.activeChord).toBe("C4");
		});
	});

	describe("global listener cleanup", () => {
		// The global pointerup safety net lives on <svelte:document>, so Svelte
		// removes it when the component is destroyed; a stray pointerup after
		// unmount must not reach the (destroyed) handler.
		it("removes the global pointerup safety-net listener on unmount", async () => {
			const { container, unmount } = render(Instrument, {
				chords: chordsData,
			});
			const cWedge = container.querySelector('[id="chord-button-C"]');
			if (!cWedge) throw new Error("C wedge not found");

			// Track a pointer, then unmount while it is still down.
			await pressChord(cWedge, 1);
			unmount();
			vi.mocked(stopChordById).mockClear();

			// The destroyed component's listener is gone, so this reaches nobody.
			document.body.dispatchEvent(pointerEvent("pointerup", 1));
			expect(stopChordById).not.toHaveBeenCalled();
		});
	});
});

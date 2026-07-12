// Component tests for SettingsPanel. The settings store is a module-level
// singleton, so all fields it binds to are reset before each test.

import SettingsPanel from "$components/SettingsPanel.svelte";

import { audioState } from "$stores/audio.svelte";
import { settings } from "$stores/settings.svelte";

import { fireEvent, render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { version } from "../../../package.json";

describe("SettingsPanel", () => {
	beforeEach(() => {
		settings.activeVoice = "sine";
		settings.chordVoicing = "standard";
		settings.mode = "chords";
		settings.noteOctave = 4;
		settings.keyCenter = "C";
		settings.keyCenterPosition = "bottom";
	});

	it("renders the heading and the core selects", () => {
		render(SettingsPanel);
		expect(
			screen.getByRole("heading", { name: "Settings" }),
		).toBeInTheDocument();
		expect(screen.getByLabelText("Play Mode")).toBeInTheDocument();
		expect(screen.getByLabelText("Key Center")).toBeInTheDocument();
		expect(screen.getByLabelText("Key Position")).toBeInTheDocument();
		expect(screen.getByLabelText("Oscillator Type")).toBeInTheDocument();
	});

	it("initializes every select from the settings store", () => {
		render(SettingsPanel);
		expect(screen.getByLabelText("Play Mode")).toHaveValue("chords");
		expect(screen.getByLabelText("Key Center")).toHaveValue("C");
		expect(screen.getByLabelText("Key Position")).toHaveValue("bottom");
		expect(screen.getByLabelText("Oscillator Type")).toHaveValue("sine");
	});

	it("lists all twelve key centers", () => {
		render(SettingsPanel);
		const options = Array.from(
			(screen.getByLabelText("Key Center") as HTMLSelectElement).options,
		);
		expect(options.map((o) => o.value)).toEqual([
			"C",
			"C#",
			"D",
			"D#",
			"E",
			"F",
			"F#",
			"G",
			"G#",
			"A",
			"A#",
			"B",
		]);
	});

	it("lists the oscillator voices from the store", () => {
		render(SettingsPanel);
		const options = Array.from(
			(screen.getByLabelText("Oscillator Type") as HTMLSelectElement).options,
		);
		expect(options.map((o) => o.value)).toEqual([
			"sine",
			"triangle",
			"square",
			"sawtooth",
		]);
	});

	it("writes select changes back to the settings store", async () => {
		const user = userEvent.setup();
		render(SettingsPanel);

		await user.selectOptions(screen.getByLabelText("Key Center"), "F#");
		expect(settings.keyCenter).toBe("F#");

		await user.selectOptions(screen.getByLabelText("Key Position"), "top");
		expect(settings.keyCenterPosition).toBe("top");

		await user.selectOptions(
			screen.getByLabelText("Oscillator Type"),
			"square",
		);
		expect(settings.activeVoice).toBe("square");
	});

	it("shows the voicing selector in chords mode but no octave select", () => {
		render(SettingsPanel);
		expect(screen.getByLabelText("Chord Voicing")).toBeInTheDocument();
		expect(screen.queryByLabelText("Octave")).not.toBeInTheDocument();
	});

	it("switching to notes mode swaps voicing for octave selection", async () => {
		const user = userEvent.setup();
		render(SettingsPanel);

		await user.selectOptions(screen.getByLabelText("Play Mode"), "notes");
		expect(settings.mode).toBe("notes");
		expect(screen.queryByLabelText("Chord Voicing")).not.toBeInTheDocument();

		const octave = screen.getByLabelText("Octave") as HTMLSelectElement;
		expect(octave).toHaveValue("4");
		expect(Array.from(octave.options).map((o) => o.value)).toEqual([
			"1",
			"2",
			"3",
			"4",
			"5",
			"6",
			"7",
		]);

		await user.selectOptions(octave, "6");
		expect(settings.noteOctave).toBe(6);
	});

	it("nested voicing selector updates the store", async () => {
		const user = userEvent.setup();
		render(SettingsPanel);
		await user.selectOptions(screen.getByLabelText("Chord Voicing"), "bass");
		expect(settings.chordVoicing).toBe("bass");
	});

	// The UI version is maintained by hand (per CLAUDE.md versioning steps);
	// asserting against package.json catches the two drifting apart
	it("displays the current package version", () => {
		render(SettingsPanel);
		expect(screen.getByText(`v${version}`)).toBeInTheDocument();
	});

	it("adjusts the reverb mix from the slider", async () => {
		audioState.reverbMix = 0.25;
		render(SettingsPanel);
		const slider = screen.getByLabelText("Reverb") as HTMLInputElement;
		expect(slider).toHaveValue("25");

		await fireEvent.input(slider, { target: { value: "60" } });
		expect(audioState.reverbMix).toBe(0.6);
	});

	it("links to the About page", () => {
		render(SettingsPanel);
		const about = screen.getByRole("link", { name: "About Fifths →" });
		expect(about).toHaveAttribute("href", "/about");
	});

	it("displays the maker attribution with a link to Lightning Jar", () => {
		render(SettingsPanel);
		const link = screen.getByRole("link", { name: "Lightning Jar" });
		expect(link).toHaveAttribute("href", "https://www.lightningjar.com");
		expect(link).toHaveAttribute("target", "_blank");
		expect(link.parentElement).toHaveTextContent(
			"Made by Kevin Peckham @ Lightning Jar in Philadelphia",
		);
	});
});

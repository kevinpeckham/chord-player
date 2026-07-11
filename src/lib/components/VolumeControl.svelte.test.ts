// Component tests for VolumeControl. Uses the real audio store (no
// AudioContext is created until playback, so jsdom is fine); the store is a
// module-level singleton, so volume is reset before each test.

import VolumeControl from "$components/VolumeControl.svelte";

import { audioState, setMasterVolume } from "$stores/audio.svelte";

import { fireEvent, render, screen } from "@testing-library/svelte";
import { beforeEach, describe, expect, it } from "vitest";

describe("VolumeControl", () => {
	beforeEach(() => {
		setMasterVolume(0.8);
	});

	it("renders a labeled range slider", () => {
		render(VolumeControl);
		const slider = screen.getByLabelText("Volume");
		expect(slider).toBeInTheDocument();
		expect(slider).toHaveAttribute("type", "range");
		expect(slider).toHaveAttribute("min", "0");
		expect(slider).toHaveAttribute("max", "100");
	});

	it("shows the store volume as a percentage", () => {
		render(VolumeControl);
		expect(screen.getByRole("slider")).toHaveValue("80");
		expect(screen.getByText("80%")).toBeInTheDocument();
	});

	it("rounds the displayed percentage", () => {
		setMasterVolume(0.333);
		render(VolumeControl);
		expect(screen.getByText("33%")).toBeInTheDocument();
	});

	it("updates the store when the slider moves", async () => {
		render(VolumeControl);
		const slider = screen.getByRole("slider");

		await fireEvent.input(slider, { target: { value: "45" } });
		expect(audioState.masterVolume).toBeCloseTo(0.45);
		expect(screen.getByText("45%")).toBeInTheDocument();
	});

	it("supports the 0 and 100 extremes", async () => {
		render(VolumeControl);
		const slider = screen.getByRole("slider");

		await fireEvent.input(slider, { target: { value: "0" } });
		expect(audioState.masterVolume).toBe(0);
		expect(screen.getByText("0%")).toBeInTheDocument();

		await fireEvent.input(slider, { target: { value: "100" } });
		expect(audioState.masterVolume).toBe(1);
		expect(screen.getByText("100%")).toBeInTheDocument();
	});

	it("reflects external store changes made after mount", async () => {
		render(VolumeControl);
		setMasterVolume(0.25);
		// Wait for Svelte to flush the derived update.
		expect(await screen.findByText("25%")).toBeInTheDocument();
		expect(screen.getByRole("slider")).toHaveValue("25");
	});
});

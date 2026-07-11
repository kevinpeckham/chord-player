// Component tests for VoicingSelector. The settings store is a module-level
// singleton, so chordVoicing is reset before each test.

import VoicingSelector from "$components/VoicingSelector.svelte";

import { settings } from "$stores/settings.svelte";

import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

describe("VoicingSelector", () => {
	beforeEach(() => {
		settings.chordVoicing = "standard";
	});

	it("renders a labeled select", () => {
		render(VoicingSelector);
		const select = screen.getByLabelText("Chord Voicing");
		expect(select).toBeInTheDocument();
		expect(select.tagName).toBe("SELECT");
	});

	it("offers the five voicing options with descriptions", () => {
		render(VoicingSelector);
		const options = screen.getAllByRole("option") as HTMLOptionElement[];
		expect(options.map((o) => o.value)).toEqual([
			"standard",
			"spread",
			"rich",
			"bass",
			"rootBass",
		]);
		expect(options.map((o) => o.textContent?.trim())).toEqual([
			"Standard - Classic triad voicing",
			"Spread - Notes across octaves",
			"Rich - Doubled root with bass",
			"Bass - Added bass note",
			"Root Bass - Bass root + 1st inversion",
		]);
	});

	it("initializes from the settings store", () => {
		settings.chordVoicing = "rich";
		render(VoicingSelector);
		expect(screen.getByLabelText("Chord Voicing")).toHaveValue("rich");
	});

	it("writes the selection back to the settings store", async () => {
		const user = userEvent.setup();
		render(VoicingSelector);
		const select = screen.getByLabelText("Chord Voicing");

		await user.selectOptions(select, "spread");
		expect(settings.chordVoicing).toBe("spread");
		expect(select).toHaveValue("spread");

		await user.selectOptions(select, "rootBass");
		expect(settings.chordVoicing).toBe("rootBass");
		expect(select).toHaveValue("rootBass");
	});
});

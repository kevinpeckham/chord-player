// Component tests for SeventhPad (the hold-to-activate seventh modifier).

import SeventhPad from "$components/SeventhPad.svelte";

import { performance } from "$stores/performance.svelte";
import { settings } from "$stores/settings.svelte";

import { render, screen } from "@testing-library/svelte";
import { beforeEach, describe, expect, it } from "vitest";

function pad(): HTMLElement {
	return screen.getByRole("button", { name: "Hold for seventh chords" });
}

describe("SeventhPad", () => {
	beforeEach(() => {
		performance.seventhHeld = false;
		settings.seventhType = "dominant";
	});

	it("renders unpressed with the 7 label for dominant sevenths", () => {
		render(SeventhPad);
		expect(pad()).toHaveAttribute("aria-pressed", "false");
		expect(pad()).toHaveTextContent("7");
	});

	it("wraps the pad so fine-pointer devices can hide it (touch-only control)", () => {
		const { container } = render(SeventhPad);
		expect(container.querySelector(".seventh-pad")).toBeInTheDocument();
	});

	it("labels itself maj7 when the seventh type setting is major7", async () => {
		settings.seventhType = "major7";
		render(SeventhPad);
		expect(pad()).toHaveTextContent("maj7");
	});

	it("holds the modifier while pressed and releases on pointerup", async () => {
		render(SeventhPad);
		pad().dispatchEvent(
			new MouseEvent("pointerdown", { bubbles: true, cancelable: true }),
		);
		expect(performance.seventhHeld).toBe(true);

		pad().dispatchEvent(new MouseEvent("pointerup", { bubbles: true }));
		expect(performance.seventhHeld).toBe(false);
	});

	it("releases the modifier when the pointer slides off the pad", async () => {
		render(SeventhPad);
		pad().dispatchEvent(
			new MouseEvent("pointerdown", { bubbles: true, cancelable: true }),
		);
		expect(performance.seventhHeld).toBe(true);

		pad().dispatchEvent(new MouseEvent("pointerleave", { bubbles: false }));
		expect(performance.seventhHeld).toBe(false);
	});

	it("supports keyboard hold via Space", async () => {
		render(SeventhPad);
		pad().dispatchEvent(
			new KeyboardEvent("keydown", { key: " ", bubbles: true }),
		);
		expect(performance.seventhHeld).toBe(true);
		pad().dispatchEvent(
			new KeyboardEvent("keyup", { key: " ", bubbles: true }),
		);
		expect(performance.seventhHeld).toBe(false);
	});

	it("reflects the held state via aria-pressed", async () => {
		const { rerender } = render(SeventhPad);
		performance.seventhHeld = true;
		await rerender({});
		expect(pad()).toHaveAttribute("aria-pressed", "true");
	});
});

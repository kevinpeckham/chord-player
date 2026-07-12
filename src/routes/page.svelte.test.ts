// Page-level tests for the settings menu open/close behavior.

import { tick } from "svelte";

import { chordsData } from "$data/chordsData.server";

import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import Page from "./+page.svelte";

// jsdom has no PointerEvent constructor; the svelte:document listener keys
// on the event type, so a MouseEvent with the right type works
function pointerDown(target: Element | Document) {
	target.dispatchEvent(
		new MouseEvent("pointerdown", { bubbles: true, cancelable: true }),
	);
}

function hamburger(): HTMLElement {
	return screen.getByRole("button", { name: "Toggle menu" });
}

describe("+page settings menu", () => {
	const data = { chords: chordsData };

	it("opens and closes via the hamburger button", async () => {
		const user = userEvent.setup();
		render(Page, { data });
		expect(hamburger()).toHaveAttribute("aria-expanded", "false");

		await user.click(hamburger());
		expect(hamburger()).toHaveAttribute("aria-expanded", "true");

		await user.click(hamburger());
		expect(hamburger()).toHaveAttribute("aria-expanded", "false");
	});

	it("closes when pressing outside the menu", async () => {
		const user = userEvent.setup();
		const { container } = render(Page, { data });
		await user.click(hamburger());
		expect(hamburger()).toHaveAttribute("aria-expanded", "true");

		const main = container.querySelector("main");
		if (!main) throw new Error("main not found");
		pointerDown(main);
		await tick();

		expect(hamburger()).toHaveAttribute("aria-expanded", "false");
	});

	it("stays open when pressing inside the menu", async () => {
		const user = userEvent.setup();
		const { container } = render(Page, { data });
		await user.click(hamburger());

		const panel = container.querySelector("[data-settings]");
		if (!panel) throw new Error("settings panel not found");
		pointerDown(panel);
		await tick();

		expect(hamburger()).toHaveAttribute("aria-expanded", "true");
	});

	it("hamburger still toggles closed while open (outside-close does not swallow it)", async () => {
		const user = userEvent.setup();
		render(Page, { data });
		await user.click(hamburger());
		expect(hamburger()).toHaveAttribute("aria-expanded", "true");

		// user-event fires pointerdown on the button before click; the
		// outside-close handler must ignore it so the toggle closes the menu
		// instead of close-then-reopen leaving it open
		await user.click(hamburger());
		expect(hamburger()).toHaveAttribute("aria-expanded", "false");
	});
});

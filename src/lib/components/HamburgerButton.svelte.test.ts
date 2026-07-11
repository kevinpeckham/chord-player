// Component tests for HamburgerButton (bindable menuState prop).

import HamburgerButton from "$components/HamburgerButton.svelte";

import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

describe("HamburgerButton", () => {
	it("renders an accessible toggle button, closed by default", () => {
		render(HamburgerButton);
		const button = screen.getByRole("button", { name: "Toggle menu" });
		expect(button).toBeInTheDocument();
		expect(button).toHaveAttribute("aria-expanded", "false");
	});

	it("respects an initial open menuState", () => {
		render(HamburgerButton, { menuState: "open" });
		expect(screen.getByRole("button", { name: "Toggle menu" })).toHaveAttribute(
			"aria-expanded",
			"true",
		);
	});

	it("toggles open and closed on successive clicks", async () => {
		const user = userEvent.setup();
		render(HamburgerButton);
		const button = screen.getByRole("button", { name: "Toggle menu" });

		await user.click(button);
		expect(button).toHaveAttribute("aria-expanded", "true");

		await user.click(button);
		expect(button).toHaveAttribute("aria-expanded", "false");
	});

	it("renders two hamburger bars and rotates them when open", async () => {
		const user = userEvent.setup();
		const { container } = render(HamburgerButton);
		const bars = container.querySelectorAll("button > div");
		expect(bars).toHaveLength(2);
		expect(bars[0].className).not.toContain("rotate-45");

		await user.click(screen.getByRole("button", { name: "Toggle menu" }));
		expect(bars[0].className).toContain("rotate-45");
		expect(bars[1].className).toContain("-rotate-45");
	});
});

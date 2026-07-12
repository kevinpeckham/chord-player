// Component tests for the About page.

import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import AboutPage from "./+page.svelte";

describe("About page", () => {
	it("renders the page heading and a way back to the instrument", () => {
		render(AboutPage);
		expect(screen.getByRole("heading", { name: "About" })).toBeInTheDocument();
		const back = screen.getByRole("link", { name: /Back to Fifths/ });
		expect(back).toHaveAttribute("href", "/");
	});

	it("explains who it is for and credits the Q-Ray inspiration", () => {
		render(AboutPage);
		expect(screen.getByText(/beginner songwriters/)).toBeInTheDocument();
		expect(screen.getByText(/Quinn Raymond/)).toBeInTheDocument();
		expect(screen.getByText(/Q-Ray/)).toBeInTheDocument();
	});

	it("links the maker credit to Lightning Jar", () => {
		render(AboutPage);
		const maker = screen.getByRole("link", {
			name: "Kevin Peckham @ Lightning Jar",
		});
		expect(maker).toHaveAttribute("href", "https://www.lightningjar.com");
	});

	it("links to the open-source repository", () => {
		render(AboutPage);
		const repo = screen.getByRole("link", {
			name: "github.com/kevinpeckham/chord-player",
		});
		expect(repo).toHaveAttribute(
			"href",
			"https://github.com/kevinpeckham/chord-player/tree/main",
		);
		expect(repo).toHaveAttribute("target", "_blank");
	});

	it("covers the core music-theory ideas", () => {
		render(AboutPage);
		expect(screen.getByText(/perfect fifth/)).toBeInTheDocument();
		expect(screen.getByText(/relative minor/)).toBeInTheDocument();
	});
});

// Component tests for LinkButton (plain-data `link` prop + optional snippet
// children, exercised via createRawSnippet).

import { createRawSnippet } from "svelte";

import LinkButton from "$components/LinkButton.svelte";

import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";

describe("LinkButton", () => {
	it("renders the default link when no props are given", () => {
		render(LinkButton);
		const anchor = screen.getByRole("link", { name: "Learn More" });
		expect(anchor).toHaveAttribute("href", "/#");
		expect(anchor).toHaveAttribute("title", "learn more");
		expect(anchor).toHaveAttribute("data-component", "LinkButton");
	});

	it("renders label, href, target, rel and title from the link prop", () => {
		render(LinkButton, {
			link: {
				label: "GitHub",
				href: "https://github.com/example",
				target: "_blank",
				rel: "noopener",
				title: "Open GitHub",
			},
		});
		const anchor = screen.getByRole("link", { name: "GitHub" });
		expect(anchor).toHaveAttribute("href", "https://github.com/example");
		expect(anchor).toHaveAttribute("target", "_blank");
		expect(anchor).toHaveAttribute("rel", "noopener");
		expect(anchor).toHaveAttribute("title", "Open GitHub");
	});

	it("omits optional attributes that are not provided", () => {
		render(LinkButton, { link: { label: "Plain", href: "/plain" } });
		const anchor = screen.getByRole("link", { name: "Plain" });
		expect(anchor).not.toHaveAttribute("target");
		expect(anchor).not.toHaveAttribute("rel");
		expect(anchor).not.toHaveAttribute("title");
	});

	it("falls back to link.url when href is absent", () => {
		render(LinkButton, { link: { label: "Via URL", url: "/from-url" } });
		expect(screen.getByRole("link", { name: "Via URL" })).toHaveAttribute(
			"href",
			"/from-url",
		);
	});

	it("uses outline styling by default and solid styling on demand", () => {
		const outline = render(LinkButton, {
			link: { label: "Outline", href: "/o" },
		});
		expect(screen.getByRole("link", { name: "Outline" }).className).toContain(
			"border-current",
		);
		outline.unmount();

		render(LinkButton, {
			link: { label: "Solid", href: "/s" },
			format: "solid",
		});
		const solid = screen.getByRole("link", { name: "Solid" });
		expect(solid.className).toContain("bg-accent");
		expect(solid.className).not.toContain("border-current");
	});

	it("appends custom classes", () => {
		render(LinkButton, {
			link: { label: "Classy", href: "/c" },
			classes: "my-custom-class",
		});
		expect(screen.getByRole("link", { name: "Classy" }).className).toContain(
			"my-custom-class",
		);
	});

	it("renders nothing when link is null", () => {
		const { container } = render(LinkButton, { link: null });
		expect(container.querySelector("a")).toBeNull();
	});

	it("renders nothing when the link has no label and there are no children", () => {
		const { container } = render(LinkButton, { link: { href: "/nowhere" } });
		expect(container.querySelector("a")).toBeNull();
	});

	it("renders snippet children inside the anchor", () => {
		const children = createRawSnippet(() => ({
			render: () => `<span data-testid="child">Child content</span>`,
		}));
		render(LinkButton, {
			link: { href: "/kids", label: null },
			children,
		});
		const anchor = screen.getByRole("link");
		expect(anchor).toHaveAttribute("href", "/kids");
		expect(screen.getByTestId("child")).toHaveTextContent("Child content");
	});
});

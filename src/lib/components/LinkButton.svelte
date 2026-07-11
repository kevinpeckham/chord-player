<!--
@component
### Button Link Component.
* A link styled as a button.
* uses "a" tag
* not appropriate for use in forms or where real buttons are needed
* outline style by default

#### Props
* children: Snippet | null - content to render inside the button
* classes: string | null - additional classes to apply to the button
* format: "solid" | "outline" - button style
* link: Link | null - link object
-->

<script lang="ts">
// import types
import type { Snippet } from "svelte";
import type { Link } from "$types/Link";

// Props type
interface Props {
	children?: Snippet | null;
	classes?: string | null;
	format?: "solid" | "outline";
	link?: Link | null;
}

// props
let {
	children = null,
	link = { href: "/#", title: "learn more", label: "Learn More" },
	classes = null,
	format = "outline", // solid | outline
}: Props = $props();

// derived attribute values (kept out of the template)
const href = $derived(link?.href ?? link?.url ?? null);
const rel = $derived(link?.rel ?? null);
const target = $derived(link?.target ?? null);
const title = $derived(link?.title ?? null);
const show = $derived(Boolean(link && (link.label || children)));
const formatClasses = $derived(
	format === "outline"
		? "border-current hover:text-accent"
		: "text-primary font-500 bg-accent border-accent hover:opacity-90",
);
</script>

{#if show && link}
	<a
		data-component="LinkButton"
		class="
			border
			border-[.1rem]
			flex-none
			inline-flex
			leading-none
			max-h-fit
			max-w-120px
			px-4
			py-3
			rounded-md
			text-0.85rem
			w-fit
			focus-visible:outline-offset-4
			{formatClasses}
			{classes}"
		{href}
		{rel}
		{target}
		{title}
	>
		<!-- label -->
		{#if link.label}
			<span class="truncate">{link.label}</span>
		{/if}

		<!-- children -->
		{#if children}
			{@render children()}
		{/if}
	</a>
{/if}

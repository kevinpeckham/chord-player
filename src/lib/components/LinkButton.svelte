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
</script>

{#if link && (link.label || children)}
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
			{format === 'outline' ? 'border-current hover:text-accent' : 'text-primary font-500 bg-accent border-accent hover:opacity-90'}


			focus-visible:outline-offset-4
			{classes}"
			href={link?.href ?? link.url ?? null}
			rel={link.rel ?? null}
			target={link.target ?? null}
			title={link.title ?? null}
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

<script lang="ts">
// css
import "uno.css";

// types
import type { Snippet } from "svelte";

interface Props {
	children?: Snippet | null;
}

let { children = null }: Props = $props();

// setup action
const setUp = (_node: HTMLDivElement) => {
	// intercept innerHTML invocation
	// to catch svelte-announcer being created and strip inline style
	// to prevent CSP violation
	// note: styles are re-added in css -- see uno.css config

	// set up
	const originalInnerHTML = Object.getOwnPropertyDescriptor(
		Element.prototype,
		"innerHTML",
	);
	Object.defineProperty(Element.prototype, "innerHTML", {
		set(value: unknown) {
			if (
				value &&
				typeof value === "string" &&
				value.includes('id="svelte-announcer"')
			) {
				const safeValue = value.replace(/style=".*?"/i, "");
				originalInnerHTML?.set?.call(this, safeValue);
			} else {
				originalInnerHTML?.set?.call(this, value);
			}
		},
	});
};

// Prevent context menu on the entire document (iOS long-press protection);
// attached via <svelte:document> so Svelte manages the listener lifecycle
function preventContextMenu(e: Event) {
	e.preventDefault();
}
</script>


<svelte:document oncontextmenu={preventContextMenu} />

<!-- slot -->
{#if children}
	<div use:setUp class="contents">
		{@render children()}
	</div>
{/if}


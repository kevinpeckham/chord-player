<script lang="ts">
// css
import "uno.css";

// types
import type { Snippet } from "svelte";
import type { LayoutServerData } from "./$types";

interface Props {
	children?: Snippet | null;
	data: LayoutServerData;
}

// import child page data
// import { page } from "$app/state";

// get data from load via props
let { children = null, data }: Props = $props();

// setup action
const setUp = (node: HTMLDivElement) => {
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
</script>


<!-- slot -->
{#if children}
	<div use:setUp class="contents">
		{@render children()}
	</div>
{/if}


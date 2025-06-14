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
</script>


<!-- slot -->
{#if children}
	<div class="contents">
		{@render children()}
	</div>
{/if}


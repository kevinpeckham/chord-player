<!--
@component
Web footer component
* prop authorLink: string -- link to author's website
* prop orgLink: string -- link to organization's website
* slot author -- author's name
* slot org -- organization's name
-->
<script lang="ts">
import type { Snippet } from "svelte";
// Props type
interface Props {
	authorLink: string;
	orgLink: string;
	author: Snippet;
	org: Snippet;
}
let { authorLink = "#", orgLink = "#", author, org } = $props();
</script>

<footer class="bg-primary px-4 pb-24 text-xs text-white">
	<div class="text-center">
		<div class="mb-1 inline-block">

			{#if author}
			<!-- author -->
			<span class="opacity-70">Created by&nbsp;</span>
			<a
				class="opacity-80 hover:text-accent hover:underline hover:opacity-100"
				href={authorLink}
				rel="me"
			>
				{@render author()}
			</a>
			{/if}

			<!-- org -->
			{#if org}
			<span class="opacity-70">&nbsp;@&nbsp;</span>
			<a
				class="inline-block underline-offset-4 opacity-80 transition-all hover:text-accent hover:underline hover:opacity-100"
				href={orgLink}
			>
				X{@render org()}
			</a>
			{/if}
		</div>
	</div>
</footer>

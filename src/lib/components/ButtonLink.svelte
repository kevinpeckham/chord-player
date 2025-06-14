<!--
@component
An <a> styled to look like a button.
* prop url: string  -- link target url
* prop title: string -- link title
* slot (default) -- link text
-->
<script lang="ts">
let { targetUrl = "#", title = "", children } = $props();
</script>

<div class="mb-16 w-full sm:mb-24">
	<a
		class="text-15 inline-block rounded bg-transparent px-4 py-2 outline outline-1 outline-neutral-50 transition-all hover:bg-accent hover:text-primary hover:outline-transparent"
		href={targetUrl}
		{title}
	>
		{@render children()}
	</a>
</div>

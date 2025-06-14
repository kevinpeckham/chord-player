<!--
@component
Prefooter contains a single linked call to action.
* prop targetUrl: string -- link target url
* prop title: string -- link title
* slot (default) -- link text
-->
<script lang="ts">
	let { targetUrl = "#", title = "", children } = $props();
</script>

<div class="bottom-0 left-0 w-full bg-primary px-4 pb-6 text-sm text-white sm:absolute sm:px-8">
	<div class="group mb-0 rounded-md px-4 py-4 text-center text-sm bg-white/5">
		<a
			class="inline-block italic text-white opacity-90 transition-all hover:opacity-100 group-hover:text-accent"
			href={targetUrl}
			{title}
		>
			{@render children()}
		</a>
	</div>
</div>

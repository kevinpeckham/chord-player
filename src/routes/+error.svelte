<script lang="ts">
// sveltekit error page documentation here:
// https://kit.svelte.dev/docs/routing#error

// import from svelte
import { page } from "$app/state";
import ButtonLink from "$components/ButtonLink.svelte";
</script>

<div class="grid h-screen w-screen grid-cols-1 place-content-center place-items-center bg-primary text-neutral-100">
	<div class="text-36px mb-2 text-accent">
		<span>{page.status}</span>
		<span>:&nbsp;</span>
		<span>{page.error?.message}</span>
	</div>
	<div class="mb-24">Looks like you hit a dead end. Sorry about that.</div>

	<div>
		<ButtonLink targetUrl="/" title="Go Home">
			Go Home
		</ButtonLink>
	</div>
</div>

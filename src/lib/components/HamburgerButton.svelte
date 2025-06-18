<script lang="ts">
// props
let { menuState = $bindable("closed") } = $props();

// bar classes
const barClasses = [
	"rotate-45 translate-y-.33em",
	"-rotate-45 -translate-y-.33em",
];
</script>

<button
	onclick={() => menuState = menuState === "open" ? "closed" : "open"}
	class="grid grid-cols-1 place-content-start gap-y-2 w-8 h-4 hover:text-accent" aria-label="Toggle menu" aria-expanded={menuState === "open"}>

	<!-- hamburger cross bars -->
	{#each barClasses as barClass}
		<div
			class="
			bg-white
			border-0.1em
			border-b
			border-white
			h-0
			rounded-full
			transition-transform
			w-full
			{menuState === "open" ? barClass : ""}"></div>
	{/each}

</button>
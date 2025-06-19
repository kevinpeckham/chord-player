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
			flex
			group
			h-0
			items-center
			relative
			rounded-full
			transition-transform
			w-full
			{menuState === "open" ? barClass : ""}">
			<div class="w-8px h-8px bg-white rounded-lg overflow-hidden {menuState === "open" ? "hidden" : "group-is-first:ml-1 group-is-last:ml-4"}"></div>
		</div>
	{/each}

</button>
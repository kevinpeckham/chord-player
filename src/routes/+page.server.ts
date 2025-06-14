import { get } from "svelte/store";

// import store
import { chordsStore } from "$stores/chordsStore";

// types
import type { PageServerLoadEvent } from "./$types";

export async function load(event: PageServerLoadEvent) {
	const chords = get(chordsStore);

	return {
		chords,
	};
}

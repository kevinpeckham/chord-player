// set pages to prerender
// export const prerender = true;

// types
import type { LayoutLoadEvent } from "./$types";

// load function
export async function load(event: LayoutLoadEvent) {
	return {
		test: "test",
	};
}

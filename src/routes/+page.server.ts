// import data
import { chordsData } from "$data/chordsData.server";

export async function load() {
	return {
		chords: chordsData,
	};
}

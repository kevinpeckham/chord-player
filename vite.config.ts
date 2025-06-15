import { sveltekit } from "@sveltejs/kit/vite";
import UnoCSS from "unocss/vite";
import devtoolsJson from "vite-plugin-devtools-json";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [devtoolsJson(), UnoCSS(), sveltekit()],
});

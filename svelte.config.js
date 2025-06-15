// preprocessor
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

// vercel adapter
import { default as vercel } from "@sveltejs/adapter-vercel";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Use vitePreprocess for TypeScript support
	preprocess: vitePreprocess(),
	kit: {
		adapter: vercel(),
		alias: {
			$assets: "./src/lib/assets",
			$components: "./src/lib/components",
			$data: "./src/lib/data",
			$settings: "./src/lib/settings",
			$stores: "./src/lib/stores",
			$tools: "./src/lib/components/tools",
			$types: "./src/lib/types",
			$utils: "./src/lib/utils",
		},
		csp: {
			directives: {
				"script-src": ["self", "https://plausible.io"],
			},
		},
	},
	compilerOptions: {
		discloseVersion: false,
		runes: true,
	},
};

export default config;

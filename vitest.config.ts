import path from "node:path";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { svelteTesting } from "@testing-library/svelte/vite";
import { defineConfig } from "vitest/config";

// Kept in sync with the aliases in svelte.config.js.
const alias = {
	$assets: path.resolve("./src/lib/assets"),
	$components: path.resolve("./src/lib/components"),
	$data: path.resolve("./src/lib/data"),
	$lib: path.resolve("./src/lib"),
	$settings: path.resolve("./src/lib/settings"),
	$stores: path.resolve("./src/lib/stores"),
	$types: path.resolve("./src/lib/types"),
	$utils: path.resolve("./src/lib/utils"),
};

// Unit + integration — plain Node resolution, no Svelte plugin.
const nodeProject = {
	resolve: { alias },
	test: {
		name: "node",
		include: ["src/**/*.test.ts"],
		exclude: ["src/**/*.svelte.test.ts", "src/**/*.e2e.ts"],
		environment: "node" as const,
	},
};

// Component tests — jsdom + the Svelte plugin. `svelteTesting()` handles
// browser-condition resolution (it inserts `browser` before `node`, keeping
// `node`) + DOM auto-cleanup.
const componentsProject = {
	plugins: [svelte(), svelteTesting()],
	resolve: { alias },
	test: {
		name: "components",
		include: ["src/**/*.svelte.test.ts"],
		environment: "jsdom" as const,
		setupFiles: ["./vitest-setup.ts"],
	},
};

// The components (jsdom) project is omitted in CI: vitest 4's rolldown
// dep-optimizer emits a runtime that imports `node:module`, unresolvable under
// the jsdom/web target on the Linux runner (passes locally on macOS). Vitest
// initializes every configured project before `--project` filtering, so the
// only reliable exclusion is to leave it out of the config. Component tests
// still run locally via `bun run test`. Revisit when the upstream vitest/
// rolldown issue clears, or move them to Vitest browser mode.
const projects = process.env.CI
	? [nodeProject]
	: [nodeProject, componentsProject];

export default defineConfig({
	resolve: { alias },
	test: {
		coverage: {
			provider: "v8",
			// Route .svelte files are excluded: they have no tests, and the
			// uncovered-files pass feeds raw (uncompiled) .svelte source to
			// rolldown, which cannot parse it. Tested components are remapped
			// from their compiled form and report fine.
			include: ["src/**/*.ts", "src/lib/**/*.svelte"],
			exclude: ["src/**/*.test.ts", "src/**/*.d.ts"],
		},
		projects,
	},
});

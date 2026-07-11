// Makes @testing-library/jest-dom's matcher types (toBeInTheDocument,
// toHaveAttribute, …) visible to svelte-check/tsc for *.svelte.test.ts files.
// The runtime side is registered in vitest-setup.ts; this file only loads the
// vitest `Assertion` interface augmentation, since the root setup file is not
// part of the SvelteKit-generated tsconfig include.
import "@testing-library/jest-dom/vitest";

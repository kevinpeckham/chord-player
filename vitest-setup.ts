// Extends Vitest's `expect` with @testing-library/jest-dom matchers
// (toBeInTheDocument, toHaveAttribute, etc.) for component tests. Inert for the
// .ts-only unit/integration tests (just adds matchers; no DOM access).
import "@testing-library/jest-dom/vitest";

/**
 * SvelteKit Server Hooks Configuration
 * ----------------------------------
 * Central configuration file for server-side hooks that process
 * requests in sequence. Handles security, redirects, and server-side
 * state management through a series of specialized handlers.
 *
 *
 * @file hooks.server.ts
 * @see https://kit.svelte.dev/docs/hooks
 *
 * Note: This is a critical file for application security
 * and performance. Changes should be carefully reviewed
 * and tested thoroughly.
 */

// serverless config
/** @type {import('@sveltejs/adapter-vercel').Config} */
export const config = {
	runtime: "nodejs22.x",
};

// import hooks
import { sequence } from "@sveltejs/kit/hooks";

// nonce

export const handle = sequence();

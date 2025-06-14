export interface Link {
	[key: string]: unknown;
	[key: `data-${string}`]: string | undefined | null;
	class?: string | null;
	label?: string | null;
	href?: string | null;
	url?: string | null;
	target?: string | null;
	rel?: string | null;
	title?: string | null;
}

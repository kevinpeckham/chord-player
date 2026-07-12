<!--
@component
About page — why Fifths exists, its inspiration, the theory behind it, and
where the source lives. The app shell locks the viewport (overflow-hidden on
html/body), so this page provides its own scroll container.
-->

<svelte:head>
	<title>About | Fifths</title>
	<meta
		content="Why Fifths exists: a playable circle of fifths for beginner songwriters, inspired by Quinn Raymond's Q-Ray, built by Kevin Peckham at Lightning Jar."
		name="description"
	/>
</svelte:head>

<div class="w-full h-screen overflow-y-auto">
	<header class="page-x-padding py-4 flex items-center justify-between w-full">
		<a href="/" class="opacity-90 hover:text-accent">&larr; Back to Fifths</a>
		<h1 class="text-24px text-accent font-700">About</h1>
	</header>

	<main class="page-x-padding pb-24 text-neutral-50">
		<div class="max-w-65ch mx-auto grid grid-cols-1 gap-10 pt-8">
			<!-- why -->
			<section class="grid gap-3">
				<h2 class="text-20px font-500 text-accent">Why Fifths exists</h2>
				<p class="opacity-90 leading-relaxed">
					Fifths is a playable circle of fifths &mdash; a handy tool for
					beginner songwriters. Instead of memorizing which chords belong
					together, you can hear it: chords that sit next to each other on
					the circle naturally sound good together. Pick a key, wander to
					its neighbors, and you'll stumble into the progressions behind
					countless songs &mdash; no theory background required.
				</p>
			</section>

			<!-- inspiration -->
			<section class="grid gap-3">
				<h2 class="text-20px font-500 text-accent">Inspiration</h2>
				<p class="opacity-90 leading-relaxed">
					Fifths is inspired by Quinn Raymond's limited MIDI instrument
					&ldquo;Q-Ray&rdquo; &mdash; an instrument that embraces
					constraint, trading range for immediacy so that anyone can pick
					it up and make music. Fifths borrows that spirit: a single
					circle, every chord one press away.
				</p>
				<p class="opacity-90 leading-relaxed">
					It was built by
					<a
						href="https://www.lightningjar.com"
						target="_blank"
						rel="noopener"
						class="underline underline-offset-2 hover:text-accent"
					>Kevin Peckham @ Lightning Jar</a>
					in Philadelphia.
				</p>
			</section>

			<!-- theory -->
			<section class="grid gap-3">
				<h2 class="text-20px font-500 text-accent">The music theory</h2>
				<p class="opacity-90 leading-relaxed">
					The circle of fifths arranges the 12 musical keys so that each
					step clockwise moves up a perfect fifth (C &rarr; G &rarr; D
					&hellip;). Keys that are adjacent on the circle share all but
					one of their notes, which is why moving between neighboring
					chords sounds smooth and &ldquo;right.&rdquo;
				</p>
				<p class="opacity-90 leading-relaxed">
					In Fifths, the outer ring holds the major chords and the inner
					ring holds each key's relative minor &mdash; a minor chord built
					from the same notes as its major partner. For any key you
					choose, the three chords most songs lean on (the I, IV, and V)
					sit side by side, with the relative minor (the vi) tucked just
					inside. That cluster of four wedges is a complete songwriting
					palette.
				</p>
				<p class="opacity-90 leading-relaxed">
					Holding Shift (or the 7 pad on touch devices) adds a seventh
					&mdash; one extra note that gives a chord tension and color.
					Dominant sevenths pull you clockwise around the circle toward
					the next key; that pull is the engine of the classic
					ii&ndash;V&ndash;I progression.
				</p>
			</section>

			<!-- open source -->
			<section class="grid gap-3">
				<h2 class="text-20px font-500 text-accent">Open source</h2>
				<p class="opacity-90 leading-relaxed">
					Fifths is open source. The code &mdash; SvelteKit, TypeScript,
					and the Web Audio API &mdash; lives on GitHub:
				</p>
				<a
					href="https://github.com/kevinpeckham/chord-player/tree/main"
					target="_blank"
					rel="noopener"
					class="underline underline-offset-2 hover:text-accent w-fit"
				>github.com/kevinpeckham/chord-player</a>
			</section>
		</div>
	</main>
</div>

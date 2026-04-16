<script>
	import { Apple, Cloud, Music2, Youtube } from '@lucide/svelte'
	import { PageShell, ShowcaseCard, ShowcaseCTA, ShowcaseGrid, ShowcaseHero } from '@miko/ui'
	import { formatDateMonthDayYearShort } from '$lib/utils/date'
	import { Seo, buildWebPageJsonLd } from '$lib/app/seo'

	const { data } = $props()
	const description =
		'Songs, demos, generative audio experiments, and music-related process notes from Miko Meow.'

	const platforms = [
		{ label: 'Spotify', href: '/contact?from=music&topic=spotify', icon: Music2 },
		{ label: 'Apple Music', href: '/contact?from=music&topic=apple_music', icon: Apple },
		{ label: 'YouTube Music', href: '/contact?from=music&topic=youtube_music', icon: Youtube },
		{ label: 'SoundCloud', href: '/contact?from=music&topic=soundcloud', icon: Cloud }
	]

	const featuredTrack = {
		title: 'Neon Drift',
		subtitle: 'synth ambient',
		date: '2025-01-12',
		tag: 'Track',
		image: '/media/projects/generated/neon-drift-synth-ambient.webp',
		alt: 'Illustrated night drive with neon reflections and glowing audio waves'
	}

	const artworkUrls = [
		featuredTrack.image,
		'/media/projects/project-color-piano.webp',
		'/journal/2011/08/webgl-music-box/images/hero.png',
		'/media/projects/project-sketchpad.webp',
		'/media/projects/project-color-sphere.webp',
		'/media/projects/project-sand-art.webp',
		'/media/projects/project-zendala.webp',
		'/media/page-icons/art-rainbow-imagination.png',
		'/media/page-icons/about-kitty-unicorn.png'
	]

	const fallbackEntries = [
		{ title: 'Neon Drift — synth ambient', href: '/music', date: '2025-01-12', tag: 'Track' },
		{ title: 'Sunroom — acoustic sketch', href: '/music', date: '2024-08-04', tag: 'Demo' },
		{ title: 'Color Piano Loops — generative audio', href: '/music', date: '2023-11-19', tag: 'Experiment' },
		{ title: 'Quiet Machines — lo-fi electronic', href: '/music', date: '2022-05-30', tag: 'Track' },
		{ title: 'Portland Rain — piano + field recording', href: '/music', date: '2018-03-14', tag: 'Demo' },
		{ title: 'Sketch Theme — product soundtrack', href: '/music', date: '2015-06-07', tag: 'Track' },
		{ title: 'Time Traveler — piano song', href: '/music', date: '2012-08-31', tag: 'Track' }
	]

	function getEntries() {
		if (data.musicPosts.length === 0) return fallbackEntries
		const liveEntries = data.musicPosts.map((post) => ({
			title: post.title,
			href: `/${post.urlPath}`,
			date: post.date,
			tag: 'Entry'
		}))
		return [...liveEntries, ...fallbackEntries].slice(0, 10)
	}

	function getPortfolioEntries() {
		return getEntries().slice(0, 9).map((entry, idx) => ({
			...entry,
			image: artworkUrls[idx % artworkUrls.length],
			alt: `${entry.title} artwork`,
			format: idx % 3 === 1 ? '48KHZ / AIFF / MODULAR' : idx % 3 === 2 ? '96KHZ / WAV / AMBIENT' : '96KHZ / WAV / SYNTH',
			badge: idx % 2 === 0 ? 'AI Assisted' : 'Human Composed',
			badgeTone: idx % 2 === 1 ? 'warm' : 'cool'
		}))
	}

</script>

<Seo
	title="Music, Demos & Sound Experiments"
	{description}
	path="/music/"
	image={featuredTrack.image}
	jsonLd={[
		buildWebPageJsonLd({
			path: '/music/',
			title: 'Music, Demos & Sound Experiments',
			description,
			type: 'CollectionPage'
		})
	]}
/>

<PageShell className="showcase-page showcase-page--portfolio showcase-page--music">
	<div class="showcase-page__inner" id="music">
		<ShowcaseHero
			eyebrow="Music"
			title="Songs, sketches, and"
			titleAccent="sound experiments"
			icon="/media/page-icons/music-notes-flow.png"
			iconAlt="Music notes icon"
			intro="Exploring the thin membrane between build sessions and sonic textures. Tracks, demos, and music-related experiments from Miko."
			signalLabel="Sonic Explorer No. 042"
			chips={platforms}
		/>

		<ShowcaseGrid title="Portfolio" kicker="A collection of audio-visual explorations" filterLabel="Filter // All">
			{#each getPortfolioEntries() as entry, idx}
				<ShowcaseCard
					href={entry.href}
					image={entry.image}
					alt={entry.alt}
					badge={entry.badge}
					badgeTone={entry.badgeTone}
					title={entry.title}
					meta={entry.format}
					date={entry.date}
					dateLabel={formatDateMonthDayYearShort(entry.date)}
					playLabel="Play"
					loading={idx === 0 ? 'eager' : 'lazy'}
					fetchpriority={idx === 0 ? 'high' : 'auto'}
				/>
			{/each}
		</ShowcaseGrid>

		<ShowcaseCTA
			title="Need a custom"
			titleAccent="soundtrack?"
			copy="Original music for a product, visual project, or interactive experience."
			href="/contact?from=music&topic=collaboration"
			linkLabel="Inquire Now"
		/>
	</div>
</PageShell>

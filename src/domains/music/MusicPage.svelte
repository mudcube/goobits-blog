<script lang="ts">
	import { PageShell, ShowcaseCard, ShowcaseCTA, ShowcaseGrid, ShowcaseHero } from '@miko/ui'
	import { formatDateMonthDayYearShort } from '$lib/utils/date'
	import { Seo, buildWebPageJsonLd } from '$lib/app/seo'
	import { featuredTrack, getMusicPortfolioEntries, musicPlatforms, type MusicPageData } from './viewmodel'

	let { data }: { data: MusicPageData } = $props()

	const description =
		'Songs, demos, and sound experiments from Miko Meow. Tracks, process notes, and generative audio.'

	const portfolioEntries = $derived(getMusicPortfolioEntries(data.musicPosts))
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
			titleAccentNewLine
			icon="/media/page-icons/music-notes-flow.png"
			iconAlt="Music notes icon"
			intro="Songs and sound experiments born from late-night build sessions. Tracks, demos, and process notes from Miko."
			signalLabel="Sonic Explorer No. 042"
			chips={musicPlatforms}
		/>

		<ShowcaseGrid title="Portfolio" kicker="Tracks, demos, and sound experiments" filterLabel="Filter // All">
			{#each portfolioEntries as entry, idx}
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

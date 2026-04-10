<script>
	import { PageClosing, PageShell, SectionLabel } from '@miko/ui'
	import { formatDateMonthDayYearShort } from '$lib/utils/date'
	import { Seo, buildWebPageJsonLd } from '$lib/app/seo'

	const { data } = $props()
	const description =
		'Songs, demos, generative audio experiments, and music-related process notes from Miko Meow.'

	const platforms = [
		{ label: 'Spotify', href: '/contact?from=music&topic=spotify', icon: 'S' },
		{ label: 'Apple Music', href: '/contact?from=music&topic=apple_music', icon: 'A' },
		{ label: 'YouTube Music', href: '/contact?from=music&topic=youtube_music', icon: 'Y' },
		{ label: 'SoundCloud', href: '/contact?from=music&topic=soundcloud', icon: 'SC' }
	]

	const localNavItems = [
		{ label: 'Music', href: '#music', icon: 'M' },
		{ label: 'Listen', href: '#listen', icon: 'L' },
		{ label: 'Entries', href: '#entries', icon: 'E' },
		{ label: 'Collab', href: '#collaborate', icon: 'C' }
	]

	const featuredTrack = {
		title: 'Neon Drift',
		subtitle: 'synth ambient',
		date: '2025-01-12',
		tag: 'Track',
		image: '/media/generated/nano-banana/neon-drift-synth-ambient.png',
		alt: 'Illustrated night drive with neon reflections and glowing audio waves'
	}

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

<PageShell className="music-page">
	<div class="music-page" id="music">
		<div class="music-page__studio">
			<nav class="music-page__rail" aria-label="Music page sections">
				{#each localNavItems as item}
					<a href={item.href} class="music-page__rail-link">
						<span class="music-page__rail-icon" aria-hidden="true">{item.icon}</span>
						<span class="music-page__rail-label">{item.label}</span>
					</a>
				{/each}
			</nav>

			<div class="music-page__workspace">
				<section class="music-page__hero" aria-labelledby="music-page-title">
					<p class="music-page__eyebrow">Music</p>
					<h1 id="music-page-title" class="music-page__title">Songs, sketches, and sound experiments</h1>
					<p class="music-page__intro">Melody has always been part of the build process. Tracks, demos, and music-related experiments from Miko.</p>

					<div id="listen" class="music-page__platforms" aria-label="Listening platforms">
						<div class="music-page__section-label-wrap">
							<SectionLabel text="Listen" />
						</div>
						<div class="music-page__platform-row">
							{#each platforms as item}
								<a href={item.href} class="music-page__platform-chip">
									<span class="music-page__platform-icon" aria-hidden="true">{item.icon}</span>
									{item.label}
								</a>
							{/each}
						</div>
					</div>
				</section>

				<section class="music-page__feature" aria-labelledby="music-feature-title">
					<div class="music-page__feature-media">
						<img src={featuredTrack.image} alt={featuredTrack.alt} class="music-page__feature-image" loading="eager" fetchpriority="high" decoding="async" />
					</div>
					<div class="music-page__feature-copy">
						<SectionLabel text="Featured track" />
						<h2 id="music-feature-title" class="music-page__feature-title">{featuredTrack.title}</h2>
						<p class="music-page__feature-subtitle">{featuredTrack.subtitle}</p>
						<div class="music-page__feature-meta" aria-label="Featured track metadata">
							<span>{featuredTrack.tag}</span>
							<span>{formatDateMonthDayYearShort(featuredTrack.date)}</span>
						</div>
					</div>
				</section>

				<section id="entries" class="music-page__entries" aria-label="Music entries">
					<div class="music-page__section-label-wrap">
						<SectionLabel text="Entries" />
					</div>
					<ol class="music-page__entry-list">
						{#each getEntries() as entry, idx}
							<li class="music-page__entry-item">
								<a href={entry.href} class="music-page__entry-link">
									<span class="music-page__entry-num">{String(idx + 1).padStart(2, '0')}</span>
									<span class="music-page__entry-title">{entry.title}</span>
									<span class="music-page__entry-tag">{entry.tag}</span>
									<span class="music-page__entry-date">{formatDateMonthDayYearShort(entry.date)}</span>
								</a>
							</li>
						{/each}
					</ol>
				</section>

				<div id="collaborate" class="music-page__closing-wrap">
					<PageClosing
						label="Collaborations"
						title="Need a custom soundtrack or audio collaboration?"
						copy="Original music for a product, visual project, or interactive experience. Reach out anytime."
						href="/contact?from=music&topic=collaboration"
						linkLabel="Start a conversation"
						className="music-page__closing"
						maxWidth="31rem"
					/>
				</div>
			</div>
		</div>
	</div>
</PageShell>

<style lang="scss">
	:global(.ui-page-shell.music-page) {
		grid-template-columns: minmax(0, 1fr);
		padding-top: 0;
		padding-bottom: 0;
		background: #191a1f;
		color: #fff;
	}

	:global(.ui-page-shell.music-page > *) {
		grid-column: 1;
	}

	.music-page {
		--music-app-bg: #191a1f;
		--music-app-border: #404040;
		--music-app-text: #fff;
		--music-app-muted: rgba(255, 255, 255, 0.64);
		--music-app-soft: rgba(255, 255, 255, 0.08);
		--music-app-softer: rgba(255, 255, 255, 0.04);
		--music-app-panel: #202126;
		--music-app-panel-2: #24252b;
		--music-rail-size: 80px;
		width: 100%;
		background: var(--music-app-bg);
		color: var(--music-app-text);
	}

	.music-page__studio {
		display: flex;
		flex-direction: row;
		width: 100%;
		min-height: calc(100vh - var(--header-height));
		background: var(--music-app-bg);
		color: var(--music-app-text);
	}

	.music-page__rail {
		width: var(--music-rail-size);
		min-width: var(--music-rail-size);
		min-height: calc(100vh - var(--header-height));
		border-right: 1px solid var(--music-app-border);
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 16px 0;
		font-size: 12px;
	}

	.music-page__rail-link {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 6px;
		width: 100%;
		min-height: 68px;
		color: var(--music-app-muted);
		font-family: var(--font-ui-sans, var(--font-sans));
		font-size: 12px;
		font-weight: var(--font-weight-medium);
		text-decoration: none;
		transition:
			color 0.16s ease,
			background 0.16s ease;
	}

	.music-page__rail-link:hover {
		color: var(--music-app-text);
		background: var(--music-app-softer);
	}

	.music-page__rail-icon {
		display: grid;
		place-items: center;
		width: 28px;
		height: 28px;
		border: 1px solid rgba(255, 255, 255, 0.16);
		border-radius: 8px;
		color: var(--music-app-text);
	}

	.music-page__rail-label {
		max-width: 64px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.music-page__workspace {
		display: grid;
		grid-template-columns: minmax(0, 1.12fr) minmax(320px, 0.88fr);
		grid-template-areas:
			'hero feature'
			'entries entries'
			'closing closing';
		gap: 24px;
		align-content: start;
		width: 100%;
		min-width: 0;
		min-height: calc(100vh - var(--header-height));
		box-sizing: border-box;
		padding: clamp(20px, 3vw, 40px);
	}

	.music-page__hero {
		grid-area: hero;
		max-width: 48rem;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 32px;
	}

	.music-page__eyebrow {
		margin: 0 0 12px;
		color: var(--music-app-muted);
		font-family: var(--font-ui-sans, var(--font-sans));
		font-size: 12px;
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.09em;
		text-transform: uppercase;
	}

	.music-page__title {
		margin: 0 0 18px;
		color: var(--music-app-text);
		font-family: var(--font-serif);
		font-size: clamp(44px, 6vw, 88px);
		font-weight: 400;
		letter-spacing: 0;
		line-height: 0.96;
		text-wrap: balance;
	}

	.music-page__intro {
		max-width: 42rem;
		margin: 0;
		color: var(--music-app-muted);
		font-size: 16px;
		line-height: 1.6;
		text-wrap: pretty;
	}

	.music-page__feature {
		grid-area: feature;
		display: grid;
		grid-template-rows: minmax(0, 1fr) auto;
		min-height: 100%;
		border: 1px solid var(--music-app-border);
		background: var(--music-app-panel);
	}

	.music-page__feature-media {
		min-height: 320px;
		background: #101115;
	}

	.music-page__feature-image {
		display: block;
		width: 100%;
		height: 100%;
		aspect-ratio: 16 / 9;
		object-fit: cover;
	}

	.music-page__feature-copy {
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		min-width: 0;
		padding: 24px;
		border-top: 1px solid var(--music-app-border);
		background: var(--music-app-panel-2);
	}

	.music-page__feature-title {
		margin: 0;
		color: var(--music-app-text);
		font-family: var(--font-serif);
		font-size: clamp(1.65rem, 3vw, 2.35rem);
		font-weight: 500;
		letter-spacing: 0;
		line-height: 1.05;
	}

	.music-page__feature-subtitle {
		margin: 0.45rem 0 1.2rem;
		color: var(--music-app-muted);
		font-size: var(--font-size-sm);
		line-height: 1.45;
	}

	.music-page__feature-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		color: var(--music-app-muted);
		font-family: var(--font-ui-sans, var(--font-sans));
		font-size: var(--font-size-xs);
	}

	.music-page__feature-meta span {
		display: inline-flex;
		align-items: center;
		min-height: 1.7rem;
		padding: 0 0.65rem;
		border: 1px solid rgba(255, 255, 255, 0.16);
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.06);
	}

	.music-page__section-label-wrap {
		margin-bottom: 12px;
	}

	.music-page__platforms {
		min-width: 0;
	}

	.music-page__entries {
		grid-area: entries;
		min-width: 0;
	}

	.music-page__closing-wrap {
		grid-area: closing;
		min-width: 0;
		padding: 16px 0 8px;
		border-top: 1px solid var(--music-app-border);
	}

	.music-page__platform-row {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}

	.music-page__platform-chip {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 42px;
		padding: 0 16px 0 12px;
		border: 1px solid rgba(255, 255, 255, 0.16);
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.04);
		color: var(--music-app-text);
		font-family: var(--font-ui-sans, var(--font-sans));
		font-size: 13px;
		font-weight: var(--font-weight-medium);
		text-decoration: none;
		transition:
			background 0.16s ease,
			border-color 0.16s ease;
	}

	.music-page__platform-chip:hover {
		background: var(--music-app-soft);
		border-color: rgba(255, 255, 255, 0.28);
	}

	.music-page__platform-icon {
		display: inline-grid;
		place-items: center;
		min-width: 20px;
		height: 20px;
		border-radius: 6px;
		background: rgba(255, 255, 255, 0.12);
		color: var(--music-app-text);
		font-size: 10px;
		line-height: 1;
	}

	.music-page__entry-list {
		display: grid;
		gap: 0;
		margin: 0;
		padding: 0;
		border: 1px solid var(--music-app-border);
		background: var(--music-app-panel);
		list-style: none;
	}

	.music-page__entry-item {
		min-width: 0;
	}

	.music-page__entry-link {
		display: grid;
		grid-template-columns: 2.25rem minmax(0, 1fr) auto minmax(6.3rem, auto);
		align-items: center;
		gap: 0.9rem;
		min-height: 50px;
		padding: 0 14px;
		border-bottom: 1px solid var(--music-app-border);
		background: transparent;
		color: var(--music-app-text);
		text-decoration: none;
		transition: background 0.16s ease;
	}

	.music-page__entry-item:last-child .music-page__entry-link {
		border-bottom: 0;
	}

	.music-page__entry-link:hover {
		background: rgba(255, 255, 255, 0.05);
	}

	.music-page__entry-num,
	.music-page__entry-tag,
	.music-page__entry-date {
		color: var(--music-app-muted);
		font-family: var(--font-ui-sans, var(--font-sans));
		font-size: 12px;
	}

	.music-page__entry-title {
		min-width: 0;
		color: var(--music-app-text);
		font-size: 14px;
		font-weight: var(--font-weight-medium);
		overflow-wrap: anywhere;
	}

	.music-page__entry-tag {
		padding: 0.18rem 0.55rem;
		border: 1px solid rgba(255, 255, 255, 0.16);
		border-radius: 8px;
	}

	.music-page__entry-date {
		text-align: right;
	}

	:global(.music-page__closing) {
		max-width: 100%;
		color: var(--music-app-text);
	}

	:global(.music-page__closing .ui-page-closing__divider) {
		display: none;
	}

	:global(.music-page__closing .ui-page-closing__title),
	:global(.music-page__closing .ui-page-closing__link) {
		color: var(--music-app-text);
	}

	:global(.music-page__closing .ui-page-closing__copy) {
		color: var(--music-app-muted);
	}

	@media (max-width: 768px) {
		.music-page__studio {
			flex-direction: column;
		}

		.music-page__rail {
			width: 100%;
			min-width: 0;
			min-height: 48px;
			height: 48px;
			flex-direction: row;
			align-items: center;
			overflow-x: auto;
			padding: 0 16px;
			border-right: 0;
			border-bottom: 1px solid var(--music-app-border);
		}

		.music-page__rail-link {
			flex: 0 0 auto;
			flex-direction: row;
			width: auto;
			min-height: 48px;
			padding: 0 10px;
			white-space: nowrap;
		}

		.music-page__rail-icon {
			width: 24px;
			height: 24px;
		}

		.music-page__workspace {
			grid-template-columns: minmax(0, 1fr);
			grid-template-areas:
				'hero'
				'feature'
				'entries'
				'closing';
			min-height: 0;
			padding: 16px;
			gap: 18px;
		}

		.music-page__title {
			font-size: clamp(36px, 14vw, 56px);
		}

		.music-page__feature {
			min-height: 0;
		}

		.music-page__feature-media {
			min-height: 0;
		}

		.music-page__platform-chip {
			min-height: 40px;
			padding-right: 12px;
			font-size: 12px;
		}

		.music-page__entry-link {
			grid-template-columns: 1.55rem minmax(0, 1fr) auto;
			gap: 0.6rem;
			min-height: 54px;
			padding: 0.55rem 0.65rem;
		}

		.music-page__entry-tag {
			display: none;
		}

		.music-page__entry-date {
			min-width: 4.8rem;
		}
	}
</style>

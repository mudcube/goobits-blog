<script>
	import { PageShell } from '@miko/ui'
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

	const featuredTrack = {
		title: 'Neon Drift',
		subtitle: 'synth ambient',
		date: '2025-01-12',
		tag: 'Track',
		image: '/media/generated/nano-banana/neon-drift-synth-ambient.png',
		alt: 'Illustrated night drive with neon reflections and glowing audio waves'
	}

	const artworkUrls = [
		featuredTrack.image,
		'https://lh3.googleusercontent.com/aida-public/AB6AXuAwJn9iks57q4ddciE4WbeFya6TRji5E9ptIHXg0HzK0y-3X3pauKJjcsEHEjpdQ2l622K2n4Co8NAKqKBenxx7yYxB6ykKRXjiGQFR8HRou9BywbNxVIBLqLyK8GgGuQiyVTb9txTfB6y1mv11H1q7ylL_0VZZTnYhHN4y2FSlFofuSKIFGxOZrCA5HOnp0Kl4sAbT5Ksdveoz6wuF4Z7P4lc-0dLyRI-mecKttEUm_YQDeCmFr3Cb4r4KG6rq-U5VoI5e7finVfg',
		'https://lh3.googleusercontent.com/aida-public/AB6AXuBXrk_Ait-5yYi82HcIMl6rTnRxFqcLXjYMifb1t6O-qkNdG_DQ5h4AqQK7kPQVLmJa5ixCz7tK9L3quAtR6KKW4FPVcxxj9v1XEfh993OCdWVzTmNFt34T_RBcCbccgX-XXQyOWuN-q5i3YPKFCBKO7bLNb-EpCkwUvjrzC-W4U_uoS_t_Ro5u36f68sLQ_ftii5fdR8uLGCbuKiQyVCjb9XZDoiwkdRAy8aqsyg8wKqdMixF0lr45iP8EHRGFxuoA_8RyX0jyFns',
		'https://lh3.googleusercontent.com/aida-public/AB6AXuD5jPuEzcBY6k9ZOEqNqOrNyhc619x2LH6kVfyNN7UFOfUm0llUU-fAMSWgbWfeL7o2IcQQhx09qeh22T7pLQdUn0qMw8Qvg8-aidEf5s8irThh9t0dhazvbD01agUd2HXZBlslud0oQIOs-Ywhirmwu3U3EZojSM0yYe-tUTHCL_D3ZJSxawHyUWVg7v3yvZcXVRvTl-YWSN0EMW2KUcFewqcMH5FDl9_6OaLPup8nQ4jp9bWGwfTk6yWKnxAX9Rl03ooCMqaxzVk',
		'https://lh3.googleusercontent.com/aida-public/AB6AXuC_xOWLyDQDZ3_23XQSMvYvgvpVzSISKrg36-Upq3c73UudExktKkoMVXGcfksxhT9u2MG79dwKHq3jpkcBgSdcBpPmn2Q8qTvkYezrp_y8gmUxtf5OfljEsElUKzcFcFXdfK2atdQjg8SkzynDXt8UR5WHs71cBFmEWSlnz_4URj_k4ikjq2S-wOr5rk6KIXjBPKaa7UaGzdxgpncHFiZjP9sQItSz1M97YHo-yJMTmXDhea6w3kFyEhShb7dBPDbgwlJWC_oU0KE',
		'https://lh3.googleusercontent.com/aida-public/AB6AXuCd2lHFZ3uB93vD_dUv8BLtUnY2RSdEQzbOSMO1d1KKC1hsMR5QTqna-_OU8wWj9oDndWzIN8wOLrFa0hsHSG8vfH5jQ-8ta4TIeeV9chXsx-0bnQaTaGfb3_BIq4ATkXlFXCYRUQW7alGz0kGTZpuZVUvVKOE9YhsbtMlb2pEH8yzmMA33PfhDgokIEyXKAJmGIEz38feDcqgUcFwuZoNmNYQftOC0fQzYlRmy14yjBxvHh3Q8jROYR9LE2Y4A4ooaop61T55Ai6M',
		'https://lh3.googleusercontent.com/aida-public/AB6AXuDADIlWga3ttLl5ZdvhTttLJnfKMmBa4jBhkx7n6_HzsqtjctWtRnxqLHO33RTjUfnK9Cz9KsJjCS6GwZ4NhPv1jbQHlM3dW3IaNYYpLpscQw6o0zDVHjOskiBAOoaO6_idmCyIE7oDtpUzdSEWdeNx-XcnjdkF1OQ2eTmW7TmeUtKJUooZURCbSyQk_MtqemqQwzJ8RGspOVqR5PcazW6Q0VG0MUnUHglPa7cydcxwovZLd0Ss2gRLkzVJbm5QkbR71cE3BobSITg',
		'https://lh3.googleusercontent.com/aida-public/AB6AXuAeEqBc8GaEa1HIBCzSCR1n5PVks4RcUEjEG9JlFhHfpnet7XqysnifBXJhJUKD3tEEaCT5vWh2t50elJCckMoYI2Qub2oP6ffyRE6LrDrjTnIpR7XdVM8ym6Te_XPhbSfTsoTsl9ZTKitJs2rjw4QbPf9v-57V6RuOUylnNOfUDG9vF2yl9mJCtjzgDdNmTIhXMY2wmjrW6A9b1bQcgKmmrziOdJZuFpMQsKnTfm00HjU21d85txBKLTweph66f0oCyGaIxza__YQ',
		'https://lh3.googleusercontent.com/aida-public/AB6AXuBOxNLWkXD8Y1qbpU8FA1Neb7mn7vHrRy0WNT1rCvYF01K3iIH7riRbQEHsQK2ALAti08dPVpC9bHEictFAkiikAZCqKFBCj-o6rbvCVjpcFGX2sRpYjH2pUn2xMSQXcn0d55v1OuttAD2bSzYbOaIfHegrHs7BwLxuG1wBYEgbwL-2gtK37rryyvRWHVxAC9Lk8kd2J0pZy01mXNoE7JtfNxFNCkABrjK3ZnXz1hC_znDwhGsESFDEG2-t7rnmhM1KSYaLSZcVqek'
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
			badge: idx % 2 === 0 ? 'AI Assisted' : 'Human Composed'
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

<PageShell className="music-page">
	<div class="music-page" id="music">
		<section class="music-page__hero" aria-labelledby="music-page-title">
			<div class="music-page__hero-copy">
				<p class="music-page__eyebrow">Music</p>
				<h1 id="music-page-title" class="music-page__title">
					Songs, sketches, and
					<span
						>sound experiments<span class="music-page__title-icon-wrap"
							><img
								src="/media/music-notes-flow.png"
								alt="Music notes icon"
								class="music-page__title-icon"
								loading="eager"
								fetchpriority="high"
								decoding="async"
							/></span
						></span
					>
				</h1>
				<p class="music-page__intro">
					Exploring the thin membrane between build sessions and sonic textures. Tracks, demos, and music-related experiments from Miko.
				</p>
			</div>

			<div class="music-page__signal">
				<div class="music-page__signal-line"></div>
				<span>Sonic Explorer No. 042</span>
			</div>

			<div id="listen" class="music-page__platforms" aria-label="Listening platforms">
				{#each platforms as item}
					<a href={item.href} class="music-page__platform-chip">
						<span class="music-page__platform-icon" aria-hidden="true">{item.icon}</span>
						{item.label}
					</a>
				{/each}
			</div>
		</section>

		<section id="entries" class="music-page__portfolio" aria-labelledby="music-portfolio-title">
			<div class="music-page__portfolio-head">
				<div>
					<h2 id="music-portfolio-title" class="music-page__section-title">Portfolio</h2>
					<p class="music-page__section-kicker">A collection of audio-visual explorations</p>
				</div>
				<span class="music-page__filter">Filter // All</span>
			</div>

			<div class="music-page__grid">
				{#each getPortfolioEntries() as entry, idx}
					<a href={entry.href} class="music-page__card">
						<div class="music-page__card-art">
							<img src={entry.image} alt={entry.alt} loading={idx === 0 ? 'eager' : 'lazy'} fetchpriority={idx === 0 ? 'high' : 'auto'} decoding="async" />
							<div class="music-page__card-shade"></div>
							<span class={`music-page__badge ${idx % 2 === 1 ? 'music-page__badge--warm' : ''}`}>{entry.badge}</span>
							<span class="music-page__play" aria-hidden="true">Play</span>
						</div>
						<div class="music-page__card-copy">
							<h3>{entry.title}</h3>
							<p>{entry.format}</p>
							<time datetime={entry.date}>{formatDateMonthDayYearShort(entry.date)}</time>
						</div>
					</a>
				{/each}
			</div>
		</section>

		<section id="collaborate" class="music-page__inquiry" aria-labelledby="music-inquiry-title">
			<div class="music-page__inquiry-panel">
				<div class="music-page__inquiry-copy">
					<h2 id="music-inquiry-title">Need a custom <span>soundtrack?</span></h2>
					<p>Original music for a product, visual project, or interactive experience.</p>
				</div>
				<a href="/contact?from=music&topic=collaboration" class="music-page__inquiry-link">Inquire Now</a>
			</div>
		</section>
	</div>
</PageShell>

<style lang="scss">
	:global(.ui-page-shell.music-page) {
		grid-template-columns: minmax(0, 1fr);
		padding-top: var(--page-shell-space-top);
		padding-bottom: 0;
		background: transparent;
		color: var(--text);
	}

	:global(.ui-page-shell.music-page > *) {
		grid-column: 1;
	}

	:global(body:has(.ui-page-shell.music-page) .layout-footer) {
		margin-top: 0;
	}

	.music-page {
		--music-background: var(--bg);
		--music-surface: color-mix(in srgb, var(--bg) 94%, var(--brand-primary) 6%);
		--music-surface-low: color-mix(in srgb, var(--bg) 88%, var(--brand-primary) 12%);
		--music-surface-container: color-mix(in srgb, var(--panel-bg) 82%, var(--brand-primary) 18%);
		--music-surface-high: color-mix(in srgb, var(--card-bg) 76%, var(--brand-primary) 24%);
		--music-surface-highest: color-mix(in srgb, var(--card-bg) 64%, var(--brand-primary) 36%);
		--music-surface-bright: color-mix(in srgb, var(--card-bg) 56%, var(--brand-primary) 44%);
		--music-text: var(--text);
		--music-muted: var(--muted);
		--music-primary: #ac8aff;
		--music-primary-dim: #8455ef;
		--music-secondary: #4cd7f6;
		--music-secondary-container: #002a33;
		--music-secondary-on-container: #00b3d1;
		--music-tertiary: #fea619;
		--music-tertiary-on-container: #4f3000;
		--music-outline: color-mix(in srgb, var(--border) 80%, var(--text));
		--music-outline-variant: color-mix(in srgb, var(--border) 68%, transparent);
		width: 100%;
		overflow: hidden;
		background: transparent;
		color: var(--music-text);
		font-family: var(--font-ui-sans, var(--font-sans));
	}

	.music-page__hero {
		display: grid;
		grid-template-columns:
			minmax(var(--layout-inline-gutter), 1fr)
			minmax(0, var(--max-width))
			minmax(var(--layout-inline-gutter), 1fr);
		align-content: center;
		padding: var(--space-8) 0 var(--space-8);
		background:
			radial-gradient(circle at 78% 18%, rgba(172, 138, 255, 0.14) 0%, rgba(172, 138, 255, 0) 36%),
			radial-gradient(circle at 18% 6%, rgba(76, 215, 246, 0.08) 0%, rgba(76, 215, 246, 0) 28%),
			linear-gradient(
				180deg,
				rgba(6, 14, 32, 0.28) 0%,
				color-mix(in srgb, var(--music-surface-low) 84%, transparent) 42%,
				color-mix(in srgb, var(--music-surface-low) 92%, transparent) 100%
			),
			transparent;
	}

	.music-page__hero > * {
		grid-column: 2;
	}

	.music-page__hero-copy {
		max-width: var(--hero-max-width);
	}

	.music-page__eyebrow {
		margin: 0 0 var(--hero-eyebrow-margin-bottom);
		color: var(--music-muted);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.09em;
		text-transform: uppercase;
	}

	.music-page__title {
		max-width: var(--hero-max-width);
		margin: 0 0 var(--hero-title-margin-bottom);
		color: var(--music-text);
		font-family: var(--font-serif);
		font-size: clamp(2rem, 4.7vw, 3.25rem);
		font-weight: 400;
		letter-spacing: -0.024em;
		line-height: 1.14;
		text-wrap: balance;

		span {
			color: var(--music-primary);
			font-style: italic;
		}
	}

	.music-page__title-icon-wrap {
		display: inline-block;
		margin-left: 0.25em;
		white-space: nowrap;
	}

	.music-page__title-icon {
		display: inline-block;
		width: clamp(2rem, 4.2vw, 2.6rem);
		height: clamp(2rem, 4.2vw, 2.6rem);
		object-fit: contain;
		vertical-align: -0.12em;
	}

	.music-page__intro {
		max-width: var(--hero-subtitle-max-width);
		margin: 0;
		color: var(--music-muted);
		font-size: var(--font-size-lg);
		letter-spacing: 0;
		line-height: 1.7;
		text-wrap: pretty;
	}

	.music-page__signal {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		margin-top: var(--space-12);
		color: var(--music-secondary);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.09em;
		text-transform: uppercase;
	}

	.music-page__signal-line {
		width: 6rem;
		height: 1px;
		background: var(--music-outline-variant);
	}

	.music-page__platforms {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		margin-top: var(--space-6);
	}

	.music-page__platform-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		min-height: 2.6rem;
		padding: 0 var(--space-4) 0 var(--space-3);
		border: var(--border-width) solid rgba(101, 117, 158, 0.28);
		border-radius: var(--radius-md);
		background: rgba(23, 43, 84, 0.3);
		backdrop-filter: blur(12px);
		color: var(--music-text);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.04em;
		text-decoration: none;
		transition:
			background 0.3s ease,
			border-color 0.3s ease,
			color 0.3s ease,
			transform 0.3s ease;

		&:hover {
			border-color: rgba(76, 215, 246, 0.5);
			background: rgba(76, 215, 246, 0.12);
			color: var(--music-secondary);
			transform: translateY(-2px);
		}
	}

	.music-page__platform-icon {
		display: inline-grid;
		place-items: center;
		min-width: 1.5rem;
		height: 1.5rem;
		border-radius: var(--radius-pill);
		background: rgba(172, 138, 255, 0.18);
		color: var(--music-text);
		font-size: 0.65rem;
		line-height: 1;
	}

	.music-page__portfolio {
		display: grid;
		grid-template-columns:
			minmax(var(--layout-inline-gutter), 1fr)
			minmax(0, var(--max-width))
			minmax(var(--layout-inline-gutter), 1fr);
		padding: var(--space-12) 0;
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--music-surface-low) 94%, var(--music-surface)) 0%,
				color-mix(in srgb, var(--music-surface-low) 88%, var(--music-surface-high)) 100%
			);
	}

	.music-page__portfolio-head {
		grid-column: 2;
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--space-6);
		margin-bottom: var(--space-10);
	}

	.music-page__section-title {
		margin: 0 0 var(--space-2);
		color: var(--music-text);
		font-family: var(--font-serif);
		font-size: clamp(1.45rem, 2.8vw, 1.75rem);
		font-weight: 400;
		letter-spacing: -0.015em;
		line-height: 1.18;
	}

	.music-page__section-kicker,
	.music-page__filter {
		margin: 0;
		color: var(--music-muted);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.09em;
		text-transform: uppercase;
	}

	.music-page__filter {
		display: inline-flex;
		align-items: center;
		min-height: 2.25rem;
		padding: 0 var(--space-4);
		border: var(--border-width) solid rgba(101, 117, 158, 0.2);
		border-radius: var(--radius-md);
		background: var(--music-surface-high);
		color: var(--music-text);
		white-space: nowrap;
	}

	.music-page__grid {
		grid-column: 2;
		display: grid;
		grid-template-columns: repeat(3, minmax(0, var(--project-card-width)));
		justify-content: space-between;
		gap: var(--space-8);
	}

	.music-page__card {
		display: flex;
		flex-direction: column;
		min-width: 0;
		color: var(--music-text);
		text-decoration: none;

		&:hover {
			.music-page__card-art img {
				transform: scale(1.1);
			}

			.music-page__play {
				opacity: 1;
				transform: translate(-50%, -50%);
			}
		}
	}

	.music-page__card-art {
		position: relative;
		aspect-ratio: 4 / 3;
		overflow: hidden;
		border-radius: var(--radius-md);
		background:
			linear-gradient(180deg, var(--music-surface-bright) 0%, var(--music-surface-highest) 100%);
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.45);

		img {
			display: block;
			width: 100%;
			height: 100%;
			object-fit: cover;
			transition: transform 0.7s ease;
		}
	}

	.music-page__card-shade {
		position: absolute;
		inset: 0;
		background: linear-gradient(to top, rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0));
		opacity: 0.6;
	}

	.music-page__badge {
		position: absolute;
		top: 1rem;
		right: 1rem;
		padding: 0.25rem 0.75rem;
		border: var(--border-width) solid rgba(76, 215, 246, 0.2);
		border-radius: var(--radius-md);
		background: rgba(0, 42, 51, 0.6);
		color: var(--music-secondary-on-container);
		font-size: 0.625rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		backdrop-filter: blur(12px);
	}

	.music-page__badge--warm {
		border-color: rgba(254, 166, 25, 0.2);
		background: rgba(254, 166, 25, 0.4);
		color: var(--music-tertiary-on-container);
	}

	.music-page__play {
		position: absolute;
		top: 50%;
		left: 50%;
		display: inline-grid;
		place-items: center;
		width: 4rem;
		height: 4rem;
		border: 1px solid rgba(172, 138, 255, 0.4);
		border-radius: var(--radius-pill);
		background: rgba(172, 138, 255, 0.2);
		box-shadow: 0 0 30px rgba(172, 138, 255, 0.4);
		color: var(--music-text);
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		opacity: 0;
		transform: translate(-50%, calc(-50% + 1rem));
		backdrop-filter: blur(12px);
		transition:
			opacity 0.5s ease,
			transform 0.5s ease;
	}

	.music-page__card-copy {
		margin-top: var(--space-5);

		h3 {
			margin: 0 0 var(--space-2);
			color: var(--music-text);
			font-family: var(--font-serif);
			font-size: var(--font-size-xl);
			font-weight: 400;
			letter-spacing: -0.015em;
			line-height: 1.2;
			overflow-wrap: anywhere;
		}

		p,
		time {
			display: block;
			margin: 0;
			color: var(--music-tertiary);
			font-size: var(--font-size-xs);
			font-weight: 700;
			letter-spacing: 0.09em;
			text-transform: uppercase;
		}

		time {
			margin-top: var(--space-1);
			color: var(--music-muted);
		}
	}

	.music-page__inquiry {
		display: grid;
		grid-template-columns:
			minmax(var(--layout-inline-gutter), 1fr)
			minmax(0, var(--max-width))
			minmax(var(--layout-inline-gutter), 1fr);
		padding: var(--space-10) 0;
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--music-surface-high) 82%, var(--music-surface-low)) 0%,
				var(--music-surface) 100%
			);
	}

	.music-page__inquiry-panel {
		grid-column: 2;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-10);
		width: 100%;
		overflow: hidden;
		padding: var(--space-10);
		border: var(--border-width) solid rgba(56, 71, 109, 0.1);
		border-radius: var(--radius-md);
		background: rgba(23, 43, 84, 0.4);
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);

		&::before,
		&::after {
			position: absolute;
			width: 24rem;
			height: 24rem;
			border-radius: 999px;
			content: '';
			filter: blur(100px);
			pointer-events: none;
		}

		&::before {
			top: 0;
			right: 0;
			background: rgba(172, 138, 255, 0.12);
			transform: translate(50%, -50%);
		}

		&::after {
			bottom: 0;
			left: 0;
			background: rgba(76, 215, 246, 0.06);
			transform: translate(-50%, 50%);
		}
	}

	.music-page__inquiry-copy,
	.music-page__inquiry-link {
		position: relative;
		z-index: 1;
	}

	.music-page__inquiry-copy {
		h2 {
			margin: 0 0 var(--space-6);
			color: var(--music-text);
			font-family: var(--font-serif);
			font-size: clamp(1.45rem, 2.8vw, 1.75rem);
			font-weight: 400;
			letter-spacing: -0.015em;
			line-height: 1.18;

			span {
				color: var(--music-secondary);
				font-style: italic;
			}
		}

		p {
			max-width: 28rem;
			margin: 0;
			color: var(--music-muted);
			font-size: var(--font-size-base);
			line-height: 1.6;
		}
	}

	.music-page__inquiry-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 3.75rem;
		padding: 0 3rem;
		border-radius: var(--radius-md);
		background: linear-gradient(90deg, var(--music-primary), var(--music-primary-dim));
		box-shadow: 0 0 40px -5px rgba(172, 138, 255, 0.4);
		color: #000;
		font-size: var(--font-size-xs);
		font-weight: 700;
		letter-spacing: 0.14em;
		text-decoration: none;
		text-transform: uppercase;
		transition:
			box-shadow 0.3s ease,
			transform 0.3s ease;

		&:hover {
			box-shadow: 0 0 60px -5px rgba(172, 138, 255, 0.6);
			transform: scale(1.05);
		}
	}

	@media (max-width: 1024px) {
		.music-page__grid {
			grid-template-columns: repeat(2, minmax(0, var(--project-card-width)));
			justify-content: center;
		}
	}

	@media (max-width: 768px) {
		:global(.ui-page-shell.music-page) {
			padding-top: var(--page-shell-space-top-mobile);
		}

		.music-page__hero {
			padding-top: var(--space-7);
			padding-bottom: var(--space-8);
		}

		.music-page__platforms {
			gap: 0.75rem;
		}

		.music-page__portfolio {
			padding-top: var(--space-12);
			padding-bottom: var(--space-12);
		}

		.music-page__portfolio-head,
		.music-page__inquiry-panel {
			align-items: stretch;
			flex-direction: column;
		}

		.music-page__grid {
			grid-template-columns: minmax(0, 1fr);
		}

		.music-page__inquiry {
			padding-top: var(--space-9);
			padding-bottom: var(--space-9);
		}
	}

	@media (max-width: 480px) {
		.music-page__signal {
			align-items: flex-start;
			flex-direction: column;
		}

		.music-page__platform-chip {
			width: 100%;
			justify-content: center;
		}

		.music-page__inquiry-panel {
			padding: var(--space-8);
		}
	}
</style>

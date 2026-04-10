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

	function getCardClass(idx) {
		return [
			'music-page__card',
			idx === 1 || idx === 5 ? 'music-page__card--lower' : '',
			idx === 3 || idx === 7 ? 'music-page__card--lift' : ''
		]
			.filter(Boolean)
			.join(' ')
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
				<h1 id="music-page-title" class="music-page__title">
					Songs, sketches, and <span>sound experiments</span>
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
					<a href={entry.href} class={getCardClass(idx)}>
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
		padding-top: 0;
		padding-bottom: 0;
		background: #060e20;
		color: #dee5ff;
	}

	:global(.ui-page-shell.music-page > *) {
		grid-column: 1;
	}

	.music-page {
		--music-background: #060e20;
		--music-surface: #060e20;
		--music-surface-low: #081329;
		--music-surface-container: #0c1934;
		--music-surface-high: #101e3e;
		--music-surface-highest: #142449;
		--music-surface-bright: #172b54;
		--music-text: #dee5ff;
		--music-muted: #9baad6;
		--music-primary: #ac8aff;
		--music-primary-dim: #8455ef;
		--music-secondary: #4cd7f6;
		--music-secondary-container: #002a33;
		--music-secondary-on-container: #00b3d1;
		--music-tertiary: #fea619;
		--music-tertiary-on-container: #4f3000;
		--music-outline: #65759e;
		--music-outline-variant: #38476d;
		width: 100%;
		overflow: hidden;
		background: var(--music-background);
		color: var(--music-text);
		font-family: var(--font-ui-sans, var(--font-sans));
	}

	.music-page__hero {
		display: flex;
		flex-direction: column;
		justify-content: center;
		min-height: 716px;
		padding: 10rem clamp(2rem, 6vw, 5rem) 6rem;
		background:
			radial-gradient(circle at 80% 20%, rgba(172, 138, 255, 0.15) 0%, rgba(6, 14, 32, 0) 60%),
			var(--music-surface);
	}

	.music-page__hero-copy {
		max-width: 64rem;
	}

	.music-page__title {
		max-width: 60rem;
		margin: 0 0 2rem;
		color: var(--music-text);
		font-family: var(--font-serif);
		font-size: clamp(3rem, 7vw, 6rem);
		font-weight: 700;
		letter-spacing: 0;
		line-height: 1.1;
		text-wrap: balance;

		span {
			color: var(--music-primary);
			font-style: italic;
		}
	}

	.music-page__intro {
		max-width: 42rem;
		margin: 0;
		color: var(--music-muted);
		font-size: clamp(1.125rem, 2vw, 1.25rem);
		letter-spacing: 0;
		line-height: 1.7;
		text-wrap: pretty;
	}

	.music-page__signal {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-top: 4rem;
		color: var(--music-secondary);
		font-size: 0.75rem;
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.3em;
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
		gap: 1rem;
		margin-top: 2rem;
	}

	.music-page__platform-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		min-height: 2.75rem;
		padding: 0 1rem 0 0.75rem;
		border: 1px solid rgba(101, 117, 158, 0.28);
		border-radius: 0.75rem;
		background: rgba(23, 43, 84, 0.34);
		color: var(--music-text);
		font-size: 0.8rem;
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
		border-radius: 999px;
		background: rgba(172, 138, 255, 0.18);
		color: var(--music-text);
		font-size: 0.65rem;
		line-height: 1;
	}

	.music-page__portfolio {
		padding: 6rem clamp(2rem, 6vw, 5rem);
		background: var(--music-surface-low);
	}

	.music-page__portfolio-head {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 1.5rem;
		margin-bottom: 4rem;
	}

	.music-page__section-title {
		margin: 0 0 0.5rem;
		color: var(--music-text);
		font-family: var(--font-serif);
		font-size: clamp(2.5rem, 4vw, 3.5rem);
		font-weight: 700;
		letter-spacing: 0;
		line-height: 1.05;
	}

	.music-page__section-kicker,
	.music-page__filter {
		margin: 0;
		color: var(--music-muted);
		font-size: 0.75rem;
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.18em;
		text-transform: uppercase;
	}

	.music-page__filter {
		display: inline-flex;
		align-items: center;
		min-height: 2.25rem;
		padding: 0 1rem;
		border: 1px solid rgba(101, 117, 158, 0.2);
		border-radius: 0.75rem;
		background: var(--music-surface-high);
		color: var(--music-text);
		white-space: nowrap;
	}

	.music-page__grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: clamp(2rem, 3vw, 3rem);
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

	.music-page__card--lower {
		margin-top: 3rem;
	}

	.music-page__card--lift {
		margin-top: -1.5rem;
	}

	.music-page__card-art {
		position: relative;
		aspect-ratio: 1;
		overflow: hidden;
		border-radius: 0.5rem;
		background: var(--music-surface-highest);
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
		border: 1px solid rgba(76, 215, 246, 0.2);
		border-radius: 0.75rem;
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
		border-radius: 999px;
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
		margin-top: 1.5rem;

		h3 {
			margin: 0 0 0.5rem;
			color: var(--music-text);
			font-family: var(--font-serif);
			font-size: 1.5rem;
			font-weight: 700;
			letter-spacing: 0;
			line-height: 1.15;
			overflow-wrap: anywhere;
		}

		p,
		time {
			display: block;
			margin: 0;
			color: var(--music-tertiary);
			font-size: 0.625rem;
			font-weight: 700;
			letter-spacing: 0.2em;
			text-transform: uppercase;
		}

		time {
			margin-top: 0.45rem;
			color: var(--music-muted);
		}
	}

	.music-page__inquiry {
		display: flex;
		justify-content: center;
		padding: 8rem clamp(2rem, 6vw, 5rem);
		background: var(--music-surface);
	}

	.music-page__inquiry-panel {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 3rem;
		width: 100%;
		max-width: 64rem;
		overflow: hidden;
		padding: clamp(3rem, 6vw, 5rem);
		border: 1px solid rgba(56, 71, 109, 0.1);
		border-radius: 0.5rem;
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
			margin: 0 0 1.5rem;
			color: var(--music-text);
			font-family: var(--font-serif);
			font-size: clamp(2.5rem, 5vw, 4rem);
			font-weight: 700;
			letter-spacing: 0;
			line-height: 1.05;

			span {
				color: var(--music-secondary);
				font-style: italic;
			}
		}

		p {
			max-width: 28rem;
			margin: 0;
			color: var(--music-muted);
			font-size: 1.125rem;
			line-height: 1.6;
		}
	}

	.music-page__inquiry-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 3.75rem;
		padding: 0 3rem;
		border-radius: 0.25rem;
		background: linear-gradient(90deg, var(--music-primary), var(--music-primary-dim));
		box-shadow: 0 0 40px -5px rgba(172, 138, 255, 0.4);
		color: #000;
		font-size: 0.875rem;
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
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 768px) {
		.music-page__hero {
			min-height: 650px;
			padding: 8rem 2rem 4rem;
		}

		.music-page__platforms {
			gap: 0.75rem;
		}

		.music-page__portfolio {
			padding: 5rem 2rem;
		}

		.music-page__portfolio-head,
		.music-page__inquiry-panel {
			align-items: stretch;
			flex-direction: column;
		}

		.music-page__grid {
			grid-template-columns: minmax(0, 1fr);
		}

		.music-page__card--lower,
		.music-page__card--lift {
			margin-top: 0;
		}

		.music-page__inquiry {
			padding: 6rem 2rem;
		}
	}

	@media (max-width: 480px) {
		.music-page__hero {
			padding-right: 1.25rem;
			padding-left: 1.25rem;
		}

		.music-page__signal {
			align-items: flex-start;
			flex-direction: column;
		}

		.music-page__platform-chip {
			width: 100%;
			justify-content: center;
		}

		.music-page__portfolio,
		.music-page__inquiry {
			padding-right: 1.25rem;
			padding-left: 1.25rem;
		}

		.music-page__inquiry-panel {
			padding: 2rem;
		}
	}
</style>

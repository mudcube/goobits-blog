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
			icon="/media/music-notes-flow.png"
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

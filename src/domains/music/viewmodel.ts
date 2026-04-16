import { Apple, Cloud, Music2, Play } from '@lucide/svelte'

export type MusicPostEntry = {
	title: string
	urlPath: string
	date: string
}

export type MusicPortfolioEntry = {
	title: string
	href: string
	date: string
	tag: string
	image: string
	alt: string
	format: string
	badge: string
	badgeTone: 'cool' | 'warm'
}

export const musicPlatforms = [
	{ label: 'Spotify', href: '/contact?from=music&topic=spotify', icon: Music2 },
	{ label: 'Apple Music', href: '/contact?from=music&topic=apple_music', icon: Apple },
	{ label: 'YouTube Music', href: '/contact?from=music&topic=youtube_music', icon: Play },
	{ label: 'SoundCloud', href: '/contact?from=music&topic=soundcloud', icon: Cloud }
]

export const featuredTrack = {
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

function getArtworkUrl(index: number) {
	return artworkUrls[index % artworkUrls.length] ?? featuredTrack.image
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

function getMusicEntries(musicPosts: MusicPostEntry[]) {
	if (musicPosts.length === 0) return fallbackEntries

	const liveEntries = musicPosts.map((post) => ({
		title: post.title,
		href: `/${post.urlPath}`,
		date: post.date,
		tag: 'Entry'
	}))

	return [...liveEntries, ...fallbackEntries].slice(0, 10)
}

export function getMusicPortfolioEntries(musicPosts: MusicPostEntry[]): MusicPortfolioEntry[] {
	return getMusicEntries(musicPosts).slice(0, 9).map((entry, idx) => ({
		...entry,
		image: getArtworkUrl(idx),
		alt: `${entry.title} artwork`,
		format:
			idx % 3 === 1
				? '48KHZ / AIFF / MODULAR'
				: idx % 3 === 2
					? '96KHZ / WAV / AMBIENT'
					: '96KHZ / WAV / SYNTH',
		badge: idx % 2 === 0 ? 'AI Assisted' : 'Human Composed',
		badgeTone: idx % 2 === 1 ? 'warm' : 'cool'
	}))
}

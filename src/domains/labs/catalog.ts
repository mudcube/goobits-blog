import type { DirectoryItem, DirectorySort } from '$lib/app/directory/viewmodel'
import type { ShowcaseCollectionEntry } from '@src/domains/showcase/types'

export type LabItem = DirectoryItem
export type LabSort = DirectorySort

export const labsCatalog: LabItem[] = [
	{ href: '/labs/color-galaxy/', title: 'Color Galaxy', vibe: 'A dreamy generative playground for color.' },
	{
		href: '/labs/js1k/BreathingGalaxies.html',
		title: 'JS1k - Breathing Galaxies',
		vibe: 'A 1KB cosmic sketch that breathes and shifts.',
		date: '2010-08-07'
	},
	{
		href: '/labs/js1k/Daltonize.html',
		title: 'JS1k - Daltonize',
		vibe: 'A tiny tool for exploring color-vision accessibility.',
		date: '2011-10-20'
	},
	{
		href: '/labs/js1k/MicroSketchpad.html',
		title: 'JS1k - Micro Sketchpad',
		vibe: 'A pocket sketchpad in 1KB. Click, drag, scribble.',
		date: '2010-08-07'
	},
	{
		href: '/labs/js1k/SpectrumDJ.html',
		title: 'JS1k - Spectrum DJ',
		vibe: 'A responsive spectrum toy for colorful audio-visual play.',
		date: '2010-08-07'
	},
	{ href: '/labs/midi-js/', title: 'MIDI.js', vibe: 'Make the browser sing. MIDI tools + demos.', date: '2012-02-16' },
	{ href: '/labs/sketch-js/', title: 'Sketch.js', vibe: 'A lightweight creative-coding toolkit for the web.' },
	{ href: '/labs/sketchpad-1.0/', title: 'Sketchpad v1.0', vibe: 'An early Sketchpad prototype from the canvas days.', date: '2009-10-27' },
	{ href: '/labs/thumbnailer/', title: 'Thumbnailer', vibe: 'Batch thumbnail generation, zipped and ready to ship.', date: '2011-11-24' },
	{ href: '/labs/zen-bg/', title: 'Zen BG', vibe: 'Build ambient, textured backgrounds with a few sliders.', date: '2011-01-06' }
]

const labImageByHref: Record<string, string> = {
	'/labs/color-galaxy/': '/media/labs/color-galaxy-card.png',
	'/labs/js1k/BreathingGalaxies.html': '/journal/2010/08/what-can-1kb-of-javascript-do/images/BreathingGalaxies.jpeg',
	'/labs/js1k/Daltonize.html': '/journal/2011/10/color-accessibility-on-digital-displays/images/hero.png',
	'/labs/js1k/MicroSketchpad.html': '/journal/2010/08/what-can-1kb-of-javascript-do/images/MicroSketchpad.jpeg',
	'/labs/js1k/SpectrumDJ.html': '/journal/2010/08/what-can-1kb-of-javascript-do/images/SpectrumDJ.jpeg',
	'/labs/midi-js/': '/journal/2012/02/midi-js/images/hero.png',
	'/labs/sketch-js/': '/media/labs/sketch-js-card.png',
	'/labs/sketchpad-1.0/': '/media/labs/sketchpad-v1-card.webp',
	'/labs/thumbnailer/': '/journal/2011/11/batch-thumbnail-generator/images/hero.png',
	'/labs/zen-bg/': '/media/labs/zen-bg-card.webp'
}

function getLabImage(href: string) {
	return labImageByHref[href] || '/media/page-icons/labs-flask.png'
}

function getLabMeta(href: string) {
	if (href.includes('/js1k/')) return 'JS1K'
	if (href.includes('midi')) return 'Audio Tool'
	if (href.includes('sketch')) return 'Sketch Tool'
	if (href.includes('thumbnail')) return 'Utility'
	return 'Experiment'
}

function formatBadgeDate(date?: string) {
	if (!date) return ''

	return new Date(date).toLocaleDateString('en-US', {
		month: 'short',
		year: 'numeric'
	})
}

export const labEntries: ShowcaseCollectionEntry[] = labsCatalog.map((item) => ({
	...item,
	image: getLabImage(item.href),
	meta: getLabMeta(item.href),
	badge: formatBadgeDate(item.date),
	badgeTone: item.date ? 'cool' : 'warm'
}))

import type { DirectoryItem, DirectorySort } from '$lib/app/directory/viewmodel'

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

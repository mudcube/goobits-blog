export type ProjectEntry = {
	id: string
	description: string
	title: string
	url: string
}

export const appProjects: ProjectEntry[] = [
	{
		id: 'sketchpad',
		description:
			'Draw, create & share with this online drawing application. Free for all since 2008. Fun for all ages\u00A0🦄',
		title: 'Sketchpad',
		url: 'https://sketchpad.com/'
	},
	{
		id: 'color-piano',
		description: 'Learn music theory essentials, and visualize amazing composers with this interactive color piano\u00A0🎵',
		title: 'Color Piano',
		url: 'https://colorpiano.com/'
	},
	{
		id: 'be-here-meow',
		description:
			'A mindfulness and journaling app designed for creative personal growth\u00A0😸',
		title: 'Be Here Meow',
		url: 'https://beheremeow.app/'
	},
	{
		id: 'color-sphere',
		description:
			'Learn color harmony essentials, create color schemes, and export your own color palettes\u00A0🎨',
		title: 'Color Sphere',
		url: 'https://colorsphere.app/'
	},
	{
		id: 'sand-art',
		description:
			'Make your own meditative & beautiful sandscapes through the art of pouring coloured sands\u00A0🧘',
		title: 'Sand Art',
		url: 'https://sandart.app/'
	},
	{
		id: 'zendala',
		description:
			'Generate colorful patterns and ambient tones with this interactive audio-visual tool\u00A0🌈',
		title: 'Zendala',
		url: 'https://zendala.app/'
	}
]

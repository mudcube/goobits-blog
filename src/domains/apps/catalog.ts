import { appProjects } from '@src/domains/projects/catalog'

const appMetaById = {
	sketchpad: { label: 'Drawing', accent: 'Flagship' },
	'color-piano': { label: 'Music Learning', accent: 'Interactive' },
	'be-here-meow': { label: 'Mindfulness', accent: 'Reflective' },
	'color-sphere': { label: 'Color Theory', accent: 'Educational' },
	'sand-art': { label: 'Generative', accent: 'Meditative' },
	zendala: { label: 'Audio-Visual', accent: 'Ambient' }
} as const

type AppMeta = {
	label: string
	accent: string
}

export const appsDescription =
	'Playful tools, creative apps, and interactive software by Miko Meow for drawing, music, mindfulness, color, and generative exploration.'

export const appsCollection = appProjects

export function getAppImage(id: string) {
	return `/media/projects/generated/apps-upscaled/project-${id}-upscaled.webp`
}

export function getAppMeta(id: string): AppMeta {
	return appMetaById[id as keyof typeof appMetaById] ?? { label: 'Creative Tool', accent: 'Interactive' }
}

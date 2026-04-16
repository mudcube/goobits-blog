import { getCalendarActivityDefinitions } from '@calendar/core'

function normalize(value: string) {
	return value.trim().toLowerCase()
}

function slugify(value: string) {
	return normalize(value)
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
}

type CalendarActivityDisplay = {
	label: string
	slug: string
	icon: string
}

const genericActivityPalette = ['#2563eb', '#db2777', '#059669', '#ea580c', '#7c3aed', '#0f766e']

function configuredActivityDisplays(): CalendarActivityDisplay[] {
	return getCalendarActivityDefinitions().map((activity) => ({
		label: normalize(activity.label),
		slug: slugify(activity.slug),
		icon: activity.icon || '✨'
	}))
}

function findConfiguredActivity(label = '', slug = '') {
	const normalizedSlug = slugify(slug)
	const normalizedLabel = normalize(label)
	const displays = configuredActivityDisplays()

	if (normalizedSlug) {
		const bySlug = displays.find((activity) => activity.slug === normalizedSlug)
		if (bySlug) return bySlug
	}

	if (normalizedLabel) {
		return displays.find((activity) => activity.label === normalizedLabel) ?? null
	}

	return null
}

function hashString(value: string) {
	let hash = 0
	for (const char of value) {
		hash = (hash * 31 + char.charCodeAt(0)) >>> 0
	}
	return hash
}

function fallbackKey(label = '', slug = '') {
	return slugify(slug) || slugify(label) || 'default'
}

export function getActivityEmoji(label = '', slug = '') {
	return findConfiguredActivity(label, slug)?.icon || '✨'
}

export function getActivityColor(label = '', slug = '') {
	const key = fallbackKey(label, slug)
	return genericActivityPalette[hashString(key) % genericActivityPalette.length] || '#64748b'
}

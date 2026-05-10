import { getCalendarActivityDefinitions } from '@calendar/core/config'
import {
	Dumbbell, Film, Tent, Mountain, Music, Coffee, Utensils, Bike, Waves,
	Palette, Gamepad2, Sparkles, BookOpen, Camera, Flower2
} from '@lucide/svelte'
import type { Component } from 'svelte'

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

const activityIconMap: Record<string, Component> = {
	gym: Dumbbell,
	movie: Film,
	movies: Film,
	circus: Tent,
	adventure: Mountain,
	hike: Mountain,
	hiking: Mountain,
	music: Music,
	coffee: Coffee,
	dinner: Utensils,
	food: Utensils,
	bike: Bike,
	cycling: Bike,
	swim: Waves,
	yoga: Flower2,
	art: Palette,
	game: Gamepad2,
	games: Gamepad2,
	book: BookOpen,
	books: BookOpen,
	photo: Camera,
	photography: Camera,
}

export function getActivityIcon(label = '', slug = ''): Component {
	const normalizedSlug = slugify(slug)
	const normalizedLabel = normalize(label)

	// Try exact slug match
	if (activityIconMap[normalizedSlug]) return activityIconMap[normalizedSlug]!

	// Try keyword match in slug or label
	for (const [keyword, icon] of Object.entries(activityIconMap)) {
		if (normalizedSlug.includes(keyword) || normalizedLabel.includes(keyword)) {
			return icon
		}
	}

	return Sparkles
}

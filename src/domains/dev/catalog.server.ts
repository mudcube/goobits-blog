import fs from 'fs'
import path from 'path'
import type { ShowcaseCollectionEntry } from '@src/domains/showcase/types'

const DEV_ROUTES_DIR = path.join(process.cwd(), 'src/routes/dev')

function titleFromSlug(slug: string) {
	return slug
		.split('-')
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ')
}

function summarizeFromSlug(slug: string) {
	return `${titleFromSlug(slug)} prototype and internal design playground.`
}

function getMetaFromSlug(slug: string) {
	if (slug.startsWith('schedule-')) return 'Scheduling Prototype'
	if (slug.startsWith('book')) return 'Booking Prototype'
	return 'Internal Prototype'
}

export function getDevEntries(): ShowcaseCollectionEntry[] {
	if (!fs.existsSync(DEV_ROUTES_DIR)) return []

	const items: ShowcaseCollectionEntry[] = []
	const entries = fs.readdirSync(DEV_ROUTES_DIR, { withFileTypes: true })

	for (const entry of entries) {
		if (!entry.isDirectory()) continue
		if (entry.name.startsWith('_') || entry.name.startsWith('(')) continue

		const pagePath = path.join(DEV_ROUTES_DIR, entry.name, '+page.svelte')
		if (!fs.existsSync(pagePath)) continue

		items.push({
			href: `/dev/${entry.name}`,
			title: titleFromSlug(entry.name),
			vibe: summarizeFromSlug(entry.name),
			image: '/media/page-icons/labs-flask.png',
			meta: getMetaFromSlug(entry.name),
			badge: 'Internal',
			badgeTone: 'warm'
		})
	}

	return items.sort((a, b) => a.href.localeCompare(b.href))
}

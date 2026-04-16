import fs from 'fs'
import path from 'path'
import type { DirectoryItem } from '$lib/app/directory/viewmodel'

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

export function getDevDirectoryItems(): DirectoryItem[] {
	if (!fs.existsSync(DEV_ROUTES_DIR)) return []

	const items: DirectoryItem[] = []
	const entries = fs.readdirSync(DEV_ROUTES_DIR, { withFileTypes: true })

	for (const entry of entries) {
		if (!entry.isDirectory()) continue
		if (entry.name.startsWith('_') || entry.name.startsWith('(')) continue

		const pagePath = path.join(DEV_ROUTES_DIR, entry.name, '+page.svelte')
		if (!fs.existsSync(pagePath)) continue

		items.push({
			href: `/dev/${entry.name}`,
			title: titleFromSlug(entry.name),
			vibe: summarizeFromSlug(entry.name)
		})
	}

	return items.sort((a, b) => a.href.localeCompare(b.href))
}

#!/usr/bin/env node
import { promises as fs } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const STATIC_DIR = path.join(ROOT, 'static')
const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif'])
const DEFAULT_MAX_BYTES = 350 * 1024
const HERO_MAX_BYTES = 700 * 1024
const GENERATED_MAX_BYTES = 450 * 1024

async function walk(dir) {
	let entries = []
	try {
		entries = await fs.readdir(dir, { withFileTypes: true })
	} catch {
		return []
	}

	const files = []
	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name)
		if (entry.isDirectory()) {
			files.push(...(await walk(fullPath)))
			continue
		}
		files.push(fullPath)
	}
	return files
}

function toPosix(value) {
	return value.replaceAll(path.sep, '/')
}

function thresholdFor(relPath) {
	if (relPath.includes('/images/generated/')) return GENERATED_MAX_BYTES
	if (relPath.includes('/images/hero.')) return HERO_MAX_BYTES
	return DEFAULT_MAX_BYTES
}

function formatKB(bytes) {
	return `${Math.round(bytes / 1024)} KB`
}

async function run() {
	const files = await walk(STATIC_DIR)
	const offenders = []

	for (const filePath of files) {
		const ext = path.extname(filePath).toLowerCase()
		if (!IMAGE_EXTS.has(ext)) continue

		const stat = await fs.stat(filePath)
		const relPath = toPosix(path.relative(STATIC_DIR, filePath))
		const limit = thresholdFor(relPath)
		if (stat.size <= limit) continue

		offenders.push({
			relPath,
			size: stat.size,
			limit
		})
	}

	offenders.sort((a, b) => b.size - a.size)

	if (offenders.length === 0) {
		console.log('OK: no oversized static images found.')
		return
	}

	console.error('Oversized static images:')
	for (const offender of offenders) {
		console.error(`- ${offender.relPath}: ${formatKB(offender.size)} (limit ${formatKB(offender.limit)})`)
	}

	process.exit(1)
}

run().catch((error) => {
	console.error(error)
	process.exit(1)
})

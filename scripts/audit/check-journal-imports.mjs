#!/usr/bin/env node
/**
 * Audit: every <script> block inside static/journal/**\/index.md may only
 * import from an explicit allowlist.
 *
 * Why: journal markdown is preprocessed by mdsvex (see svelte.config.js),
 * which compiles each post to a Svelte component. Anything imported in a
 * post's <script> block is bundled as ordinary code and runs with full
 * SSR privileges. With rehype-sanitize disabled (security audit J1), a PR
 * that adds `import x from 'node:child_process'` would execute arbitrary
 * code at server-render time. This script blocks that path so PR review
 * doesn't have to.
 *
 * Extending: add new packages to ALLOWED_IMPORTS only after deciding the
 * import is safe to ship in author-controlled markdown.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)))
const JOURNAL_DIR = join(ROOT, 'static', 'journal')

const ALLOWED_IMPORTS = new Set([
	'@goobits/blog/ui/elements'
])

const SCRIPT_BLOCK = /<script\b[^>]*>([\s\S]*?)<\/script>/gi
const IMPORT_PATTERN =
	/(?:import|export)\s+(?:type\s+)?(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g

function walk(dir) {
	const out = []
	let entries
	try {
		entries = readdirSync(dir, { withFileTypes: true })
	} catch {
		return out
	}
	for (const entry of entries) {
		const full = join(dir, entry.name)
		if (entry.isDirectory()) {
			out.push(...walk(full))
			continue
		}
		if (entry.isFile() && entry.name === 'index.md') {
			out.push(full)
		}
	}
	return out
}

function lineOf(content, offset) {
	let line = 1
	for (let i = 0; i < offset && i < content.length; i++) {
		if (content[i] === '\n') line++
	}
	return line
}

function check(file) {
	const content = readFileSync(file, 'utf8')
	const violations = []

	for (const scriptMatch of content.matchAll(SCRIPT_BLOCK)) {
		const body = scriptMatch[1] ?? ''
		const bodyOffset = (scriptMatch.index ?? 0) + scriptMatch[0].indexOf(body)

		for (const importMatch of body.matchAll(IMPORT_PATTERN)) {
			const specifier = importMatch[1] ?? importMatch[2]
			if (!specifier) continue
			if (ALLOWED_IMPORTS.has(specifier)) continue

			const offset = bodyOffset + (importMatch.index ?? 0)
			violations.push({
				specifier,
				line: lineOf(content, offset)
			})
		}
	}

	return violations
}

function main() {
	const files = walk(JOURNAL_DIR)
	let bad = 0

	for (const file of files) {
		const violations = check(file)
		if (violations.length === 0) continue
		bad += violations.length
		const rel = relative(ROOT, file)
		for (const v of violations) {
			console.error(
				`[journal-imports] ${rel}:${v.line} — disallowed import: '${v.specifier}'`
			)
		}
	}

	if (bad > 0) {
		console.error(
			`\n[journal-imports] ${bad} disallowed import${bad === 1 ? '' : 's'} across journal posts.`
		)
		console.error(
			`[journal-imports] Allowlist (in scripts/audit/check-journal-imports.mjs):`
		)
		for (const allowed of ALLOWED_IMPORTS) {
			console.error(`  - ${allowed}`)
		}
		console.error(
			`[journal-imports] If you intentionally need a new module, add it to ALLOWED_IMPORTS after`
		)
		console.error(
			`[journal-imports] confirming it's safe to ship in author-controlled markdown.`
		)
		process.exit(1)
	}

	console.log(`[journal-imports] OK (${files.length} post${files.length === 1 ? '' : 's'} scanned)`)
}

// Verify the journal dir exists; otherwise fail loud rather than silently pass.
try {
	statSync(JOURNAL_DIR)
} catch {
	console.error(`[journal-imports] journal dir missing: ${JOURNAL_DIR}`)
	process.exit(1)
}

main()

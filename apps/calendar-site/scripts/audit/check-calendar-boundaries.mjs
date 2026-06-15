#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)))

const RULES = [
	{
		name: '@calendar/app must not import @calendar/ui',
		globs: ['packages/calendar/app/src/**/*.{ts,svelte}'],
		blocked: [/^@calendar\/ui(?:\/|$)/]
	},
	{
		name: '@calendar/ui must not import server/runtime calendar packages',
		globs: ['packages/calendar/ui/src/**/*.{ts,svelte}'],
		blocked: [/^@calendar\/app(?:\/|$)/, /^@calendar\/kit(?:\/|$)/, /^@calendar\/migrations(?:\/|$)/]
	},
	{
		name: '@calendar/core must not import higher calendar packages',
		globs: ['packages/calendar/core/src/**/*.{ts,svelte}'],
		blocked: [/^@calendar\/app(?:\/|$)/, /^@calendar\/ui(?:\/|$)/, /^@calendar\/kit(?:\/|$)/, /^@calendar\/migrations(?:\/|$)/]
	},
	{
		name: '@calendar/kit must not import app or UI packages',
		globs: ['packages/calendar/kit/src/**/*.{ts,svelte}'],
		blocked: [/^@calendar\/app(?:\/|$)/, /^@calendar\/ui(?:\/|$)/]
	}
]

const IMPORT_PATTERN =
	/(?:import|export)\s+(?:type\s+)?(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g

function listFiles(globs) {
	return execFileSync(
		'bash',
		[
			'-lc',
			`shopt -s globstar nullglob; for pattern in ${globs.join(' ')}; do for file in $pattern; do printf '%s\\n' "$file"; done; done`
		],
		{
			cwd: ROOT,
			encoding: 'utf8'
		}
	)
		.split('\n')
		.map((file) => file.trim())
		.filter(Boolean)
}

const violations = []

for (const rule of RULES) {
	for (const file of listFiles(rule.globs)) {
		const absolute = resolve(ROOT, file)
		const source = readFileSync(absolute, 'utf8')
		for (const match of source.matchAll(IMPORT_PATTERN)) {
			const specifier = match[1] || match[2] || ''
			if (!rule.blocked.some((blocked) => blocked.test(specifier))) continue
			violations.push({
				rule: rule.name,
				file: relative(ROOT, absolute),
				specifier
			})
		}
	}
}

if (violations.length > 0) {
	console.error('[calendar-boundaries] Boundary violations found:')
	for (const violation of violations) {
		console.error(`- ${violation.file}: imports ${violation.specifier} (${violation.rule})`)
	}
	process.exit(1)
}

console.log('[calendar-boundaries] OK')

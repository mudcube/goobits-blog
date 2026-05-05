#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const args = process.argv.slice(2)
const getArg = (name, fallback) => {
	const prefix = `${name}=`
	const found = args.find((arg) => arg.startsWith(prefix))
	return found ? found.slice(prefix.length) : fallback
}
const hasFlag = (name) => args.includes(name)

const baseUrl = getArg('--base', process.env.LIGHTHOUSE_BASE_URL || 'http://localhost:3610').replace(/\/$/, '')
const threshold = Number(getArg('--threshold', '100'))
const maxPages = Number(getArg('--max-pages', '0'))
const outPath = getArg('--out', '.lighthouse/latest-results.json')
const urlsArg = getArg('--urls', '')
const lighthousePackage = getArg('--lighthouse-package', process.env.LIGHTHOUSE_PACKAGE || 'lighthouse@12.8.2')
const skipSitemap = hasFlag('--no-sitemap')
let chromePath = process.env.CHROME_PATH || getArg('--chrome-path', '')

const pageExtensions = /\.(html?|svelte)$/i
const nonPageExtensions = /\.(xml|txt|json|png|jpe?g|webp|avif|gif|svg|ico|css|js|mjs|map|woff2?|ttf|pdf)$/i

function normalizeUrl(input) {
	const url = new URL(input, `${baseUrl}/`)
	url.hash = ''
	return url.toString()
}

async function fetchSitemapUrls() {
	if (skipSitemap) return []
	const response = await fetch(`${baseUrl}/sitemap.xml`)
	if (!response.ok) throw new Error(`Could not fetch sitemap.xml: HTTP ${response.status}`)
	const xml = await response.text()
	return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]).filter(Boolean)
}

async function getPlaygroundUrls() {
	const files = []
	const walk = (dir) => {
		for (const entry of readdirSync(dir)) {
			const path = `${dir}/${entry}`
			if (statSync(path).isDirectory()) {
				walk(path)
			} else if (path.endsWith('/+page.svelte')) {
				files.push(path)
			}
		}
	}
	walk('src/routes/playground')
	return files.map((file) => {
		const route = file
			.replace(/^src\/routes/, '')
			.replace(/\/\+page\.svelte$/, '/')
			.replace(/\/index\/$/, '/')
		return `${baseUrl}${route}`
	})
}

function isPageUrl(input) {
	const url = new URL(input)
	const pathname = url.pathname
	if (pathname.endsWith('/')) return true
	if (pageExtensions.test(pathname)) return true
	return !nonPageExtensions.test(pathname)
}

function scoreCategory(lhr, category) {
	const score = lhr.categories?.[category]?.score
	return score === null || score === undefined ? null : Math.round(score * 100)
}

function summarizeLhr(lhr) {
	const audits = lhr.audits || {}
	return {
		finalUrl: lhr.finalDisplayedUrl || lhr.finalUrl,
		scores: {
			performance: scoreCategory(lhr, 'performance'),
			accessibility: scoreCategory(lhr, 'accessibility'),
			bestPractices: scoreCategory(lhr, 'best-practices'),
			seo: scoreCategory(lhr, 'seo')
		},
		metrics: {
			fcp: audits['first-contentful-paint']?.displayValue || null,
			lcp: audits['largest-contentful-paint']?.displayValue || null,
			tbt: audits['total-blocking-time']?.displayValue || null,
			cls: audits['cumulative-layout-shift']?.displayValue || null,
			speedIndex: audits['speed-index']?.displayValue || null
		},
		failures: Object.entries(audits)
			.filter(([, audit]) => audit.score !== null && audit.score !== undefined && audit.score < 1)
			.filter(([, audit]) => audit.scoreDisplayMode !== 'notApplicable')
			.map(([id, audit]) => ({
				id,
				title: audit.title,
				score: Math.round(audit.score * 100)
			}))
			.slice(0, 20)
	}
}

function runLighthouse(url, mode) {
	const tempFile = join(tmpdir(), `miko-lighthouse-${mode}-${Date.now()}-${Math.random().toString(36).slice(2)}.json`)
	const commandArgs = [
		'dlx',
		lighthousePackage,
		url,
		'--quiet',
		'--output=json',
		`--output-path=${tempFile}`,
		'--only-categories=performance,accessibility,best-practices,seo',
		'--chrome-flags=--headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage'
	]
	if (mode === 'desktop') commandArgs.push('--preset=desktop')

	const env = { ...process.env }
	if (chromePath) env.CHROME_PATH = chromePath

	const result = spawnSync('pnpm', commandArgs, {
		cwd: process.cwd(),
		env,
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'pipe']
	})

	if (result.status !== 0) {
		rmSync(tempFile, { force: true })
		throw new Error(`Lighthouse failed for ${mode} ${url}\n${result.stderr || result.stdout}`)
	}

	const lhr = JSON.parse(readFileSync(tempFile, 'utf8'))
	rmSync(tempFile, { force: true })
	return summarizeLhr(lhr)
}

const explicitUrls = urlsArg
	.split(',')
	.map((url) => url.trim())
	.filter(Boolean)

const sitemapUrls = explicitUrls.length ? [] : await fetchSitemapUrls()
const playgroundUrls = explicitUrls.length ? [] : await getPlaygroundUrls()
const urls = [...new Set([...explicitUrls, ...sitemapUrls, ...playgroundUrls].map(normalizeUrl))]
	.filter(isPageUrl)
	.slice(0, maxPages > 0 ? maxPages : undefined)

if (!urls.length) throw new Error('No page URLs found to audit.')
if (!chromePath) {
	try {
		const { chromium } = await import('playwright')
		chromePath = chromium.executablePath()
	} catch {
		// Lighthouse will fall back to its own Chrome discovery.
	}
}

mkdirSync(outPath.split('/').slice(0, -1).join('/') || '.', { recursive: true })

const report = {
	baseUrl,
	threshold,
	generatedAt: new Date().toISOString(),
	urls,
	results: []
}

console.log(`Auditing ${urls.length} page(s), mobile + desktop. Threshold: ${threshold}.`)

let failures = 0
for (const [index, url] of urls.entries()) {
	console.log(`\n[${index + 1}/${urls.length}] ${url}`)
	const entry = { url, mobile: null, desktop: null }
	for (const mode of ['mobile', 'desktop']) {
		const summary = runLighthouse(url, mode)
		entry[mode] = summary
		const scores = summary.scores
		const scoreLine = Object.entries(scores)
			.map(([key, value]) => `${key}=${value ?? 'n/a'}`)
			.join(' ')
		console.log(`  ${mode}: ${scoreLine}`)
		for (const [category, score] of Object.entries(scores)) {
			if (score !== null && score < threshold) failures += 1
		}
	}
	report.results.push(entry)
	writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`)
}

console.log(`\nWrote ${outPath}`)
if (failures) {
	console.error(`${failures} category score(s) below ${threshold}.`)
	process.exit(1)
}

console.log(`All audited category scores are >= ${threshold}.`)

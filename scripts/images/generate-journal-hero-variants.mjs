#!/usr/bin/env node
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const ROOT = process.cwd()
const JOURNAL_DIR = path.join(ROOT, 'static', 'journal')
const OUTPUT_DIR_NAME = 'generated'
const OUTPUT_BASENAME = 'hero'
const WIDTH_CANDIDATES = [640, 960, 1280, 1600]
const MANIFEST_PATH = path.join(ROOT, 'packages', 'blog-theme-miko', 'utils', 'generated', 'journal-image-manifest.ts')

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

function getImageDimensions(filePath) {
	const output = execFileSync('file', [filePath], { encoding: 'utf8' })
	const match = output.match(/(\d+)\s*x\s*(\d+)/)
	if (!match) {
		throw new Error(`Unable to determine dimensions for ${filePath}`)
	}
	return {
		width: Number.parseInt(match[1], 10),
		height: Number.parseInt(match[2], 10)
	}
}

function getEligibleWidths(sourceWidth) {
	const widths = WIDTH_CANDIDATES.filter((width) => width <= sourceWidth)
	return widths.length ? widths : [sourceWidth]
}

function toPublicPath(filePath) {
	return toPosix(`/${path.relative(path.join(ROOT, 'static'), filePath)}`)
}

function createOutputPath(sourcePath, width) {
	const outputDir = path.join(path.dirname(sourcePath), OUTPUT_DIR_NAME)
	return path.join(outputDir, `${OUTPUT_BASENAME}-${width}.webp`)
}

function generateWebpVariant(sourcePath, width, outputPath) {
	execFileSync(
		'ffmpeg',
		[
			'-y',
			'-i',
			sourcePath,
			'-vf',
			`scale=${width}:-2:flags=lanczos`,
			'-frames:v',
			'1',
			'-c:v',
			'libwebp',
			'-quality',
			'80',
			'-compression_level',
			'6',
			outputPath
		],
		{ stdio: 'pipe' }
	)
}

function buildManifestModule(entries) {
	const serialized = JSON.stringify(entries, null, '\t')
	return `export const journalImageManifest = ${serialized} as const\n`
}

async function emptyGeneratedDirs(heroSources) {
	const dirs = new Set(heroSources.map((sourcePath) => path.join(path.dirname(sourcePath), OUTPUT_DIR_NAME)))
	for (const dir of dirs) {
		await fs.rm(dir, { recursive: true, force: true })
	}
}

async function run() {
	const files = await walk(JOURNAL_DIR)
	const heroSources = files
		.filter((file) => /\/images\/hero\.(png|jpe?g|webp)$/i.test(toPosix(file)))
		.sort()

	await emptyGeneratedDirs(heroSources)

	const manifest = {}

	for (const sourcePath of heroSources) {
		const { width, height } = getImageDimensions(sourcePath)
		const targetWidths = getEligibleWidths(width)
		const outputs = []
		const outputDir = path.join(path.dirname(sourcePath), OUTPUT_DIR_NAME)

		await fs.mkdir(outputDir, { recursive: true })

		for (const targetWidth of targetWidths) {
			const outputPath = createOutputPath(sourcePath, targetWidth)
			generateWebpVariant(sourcePath, targetWidth, outputPath)
			outputs.push({
				src: toPublicPath(outputPath),
				width: targetWidth
			})
		}

		manifest[toPublicPath(sourcePath)] = {
			width,
			height,
			sizes: '(min-width: 1100px) 1100px, 100vw',
			webp: {
				type: 'image/webp',
				srcset: outputs.map((entry) => `${entry.src} ${entry.width}w`).join(', '),
				defaultSrc: outputs[outputs.length - 1].src
			},
			fallbackSrc: outputs[outputs.length - 1].src
		}
	}

	await fs.mkdir(path.dirname(MANIFEST_PATH), { recursive: true })
	await fs.writeFile(MANIFEST_PATH, buildManifestModule(manifest), 'utf8')

	console.log(`Generated journal hero variants for ${heroSources.length} source image(s).`)
	console.log(`Manifest: ${toPosix(path.relative(ROOT, MANIFEST_PATH))}`)
}

run().catch((error) => {
	console.error(error)
	process.exit(1)
})

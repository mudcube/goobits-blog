import { createLogger, type Logger } from './logger.js'

// Declare Node.js globals for environments where @types/node may not be installed
declare const process: { cwd: () => string } | undefined

type NodeFsPromises = {
	access(path: string): Promise<void>
	readFile(path: string, encoding: string): Promise<string>
}

type NodePath = {
	join(...paths: string[]): string
}

const logger: Logger = createLogger('CategoryDescriptions')

async function getNodeFs(): Promise<NodeFsPromises | null> {
	try {
		// eslint-disable-next-line @typescript-eslint/no-implied-eval, @typescript-eslint/no-unsafe-call, no-new-func
		const fs = await (Function('return import("fs")')() as Promise<{ promises: NodeFsPromises }>)
		return fs.promises
	} catch {
		return null
	}
}

async function getNodePath(): Promise<NodePath | null> {
	try {
		// eslint-disable-next-line @typescript-eslint/no-implied-eval, @typescript-eslint/no-unsafe-call, no-new-func
		return await (Function('return import("path")')() as Promise<NodePath>)
	} catch {
		return null
	}
}

export interface CategoryDescriptionData {
	title?: string
	description?: string
	image?: string
	alt?: string
}

export function parseCategoryDescriptions(fileContent: string): Record<string, CategoryDescriptionData> {
	const frontmatterMatch = fileContent.match(/^---\n([\s\S]*?)\n---/)

	if (!frontmatterMatch?.[1]) {
		return {}
	}

	const lines = frontmatterMatch[1].split('\n')
	const categoryData: Record<string, CategoryDescriptionData> = {}

	let currentCategory: string | null = null

	for (const line of lines) {
		if (!line.trim()) {
			continue
		}

		const categoryMatch = line.match(/^([a-z0-9-]+):\s*$/)
		if (categoryMatch?.[1]) {
			currentCategory = categoryMatch[1]
			categoryData[currentCategory] = {}
			continue
		}

		if (!currentCategory) {
			continue
		}

		const propMatch = line.match(/^\s\s([a-z-]+):\s*"(.+)"$/) || line.match(/^\s\s([a-z-]+):\s*(.+)$/)
		if (!propMatch) {
			continue
		}

		const [ , propName, propValue ] = propMatch
		if (!propName || !propValue) {
			continue
		}

		const category = categoryData[currentCategory]
		if (category) {
			(category as Record<string, string>)[propName] = propValue.replace(/^"(.*)"$/, '$1')
		}
	}

	return categoryData
}

/**
 * Default category description loader retained for backward compatibility.
 * Host apps should prefer initBlogConfig({ loadCategoryDescriptions }) to avoid cwd assumptions.
 */
export async function loadCategoryDescriptions(lang = 'en'): Promise<Record<string, CategoryDescriptionData>> {
	if (typeof process === 'undefined') {
		logger.warn('loadCategoryDescriptions requires Node.js environment')
		return {}
	}

	const fs = await getNodeFs()
	const path = await getNodePath()

	if (!fs || !path) {
		logger.warn('Node.js fs or path module not available')
		return {}
	}

	let categoriesPath = path.join(process?.cwd() ?? '', `src/content/_categories.${ lang }.md`)

	try {
		await fs.access(categoriesPath)
	} catch {
		categoriesPath = path.join(process?.cwd() ?? '', 'src/content/_categories.md')
	}

	try {
		const fileContent = await fs.readFile(categoriesPath, 'utf-8')
		return parseCategoryDescriptions(fileContent)
	} catch (readError) {
		const errorMessage = readError instanceof Error ? readError.message : String(readError)
		logger.warn(`Could not read category descriptions file: ${ errorMessage }`)
		return {}
	}
}

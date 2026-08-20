/**
 * Rehype plugin that adds responsive WebP sources to Markdown images.
 *
 * Runs at build time during mdsvex compilation. Original image URLs remain on
 * the <img> fallback so direct links and full-resolution viewers keep working.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { basename, dirname, extname, join, posix } from 'node:path'
import { imageSize } from 'image-size'

const NON_RESPONSIVE_EXTENSIONS = new Set(['.svg', '.gif'])
const NON_LOCAL_SOURCE = /^(?:https?:\/\/|\/\/|data:|blob:)/i

function walkNodes(children, visitor) {
	for (let index = 0; index < children.length; index += 1) {
		const child = children[index]
		if (child.type !== 'element') continue

		visitor(child, index, children)
		if (child.children) {
			walkNodes(child.children, visitor)
		}
	}
}

function readImageDimensions(filePath) {
	try {
		const { width, height } = imageSize(readFileSync(filePath))
		return width && height ? { width, height } : null
	} catch {
		return null
	}
}

function applyImageDimensions(properties, dimensions) {
	if (!dimensions) return

	if (!properties.width) properties.width = dimensions.width
	if (!properties.height) properties.height = dimensions.height
}

function stripQueryAndFragment(src) {
	const suffixIndex = src.search(/[?#]/)
	return suffixIndex === -1 ? src : src.substring(0, suffixIndex)
}

function decodePathname(pathname) {
	try {
		return decodeURIComponent(pathname)
	} catch {
		return pathname
	}
}

function findGeneratedVariants({ originalDiskPath, publicPath, variantDirectory }) {
	const generatedDirectory = join(dirname(originalDiskPath), variantDirectory)
	let filenames

	try {
		filenames = readdirSync(generatedDirectory)
	} catch {
		return []
	}

	const sourceName = basename(originalDiskPath, extname(originalDiskPath))
	const filenamePrefix = `${sourceName}-`
	const publicDirectory = posix.join(posix.dirname(publicPath), variantDirectory)

	return filenames
		.filter((filename) => filename.startsWith(filenamePrefix) && filename.endsWith('.webp'))
		.map((filename) => ({
			filename,
			width: Number(filename.substring(filenamePrefix.length, filename.length - '.webp'.length))
		}))
		.filter((candidate) => Number.isSafeInteger(candidate.width) && candidate.width > 0)
		.sort((left, right) => left.width - right.width)
		.map((candidate) => ({
			width: candidate.width,
			publicPath: posix.join(publicDirectory, candidate.filename)
		}))
}

function createPicture(node, sourceProperties) {
	return {
		type: 'element',
		tagName: 'picture',
		properties: {},
		children: [
			{
				type: 'element',
				tagName: 'source',
				properties: sourceProperties,
				children: []
			},
			node
		]
	}
}

export function rehypeWebpPicture(options = {}) {
	const variantDirectory = options.variantDirectory ?? 'generated'
	const sizes = options.sizes ?? '100vw'

	return (tree, vFile) => {
		if (!tree.children) return

		const filePath = vFile?.filename || vFile?.path || vFile?.history?.[0] || ''
		const fileDirectory = filePath ? dirname(filePath) : ''
		const staticRoot = join(process.cwd(), 'static')
		const publicPrefix = fileDirectory.startsWith(staticRoot)
			? fileDirectory.substring(staticRoot.length) + '/'
			: ''

		walkNodes(tree.children, (node, index, siblings) => {
			if (node.tagName !== 'img') return

			const properties = node.properties ?? (node.properties = {})
			if (!properties.loading) properties.loading = 'lazy'
			if (!properties.decoding) properties.decoding = 'async'

			const src = properties.src
			if (!src || typeof src !== 'string' || NON_LOCAL_SOURCE.test(src)) return

			const publicPath = stripQueryAndFragment(src)
			const extension = extname(publicPath).toLowerCase()
			if (!extension) return

			const diskPathname = decodePathname(publicPath)
			const originalDiskPath = diskPathname.startsWith('/')
				? join(staticRoot, diskPathname)
				: join(fileDirectory, diskPathname)
			applyImageDimensions(properties, readImageDimensions(originalDiskPath))

			if (NON_RESPONSIVE_EXTENSIONS.has(extension)) return

			const resolvedPublicPath = publicPath.startsWith('/') ? publicPath : publicPrefix + publicPath
			const variants = findGeneratedVariants({
				originalDiskPath,
				publicPath: resolvedPublicPath,
				variantDirectory
			})

			if (variants.length > 0) {
				const sourceProperties = {
					type: 'image/webp',
					srcSet: variants.map((variant) => `${variant.publicPath} ${variant.width}w`).join(', ')
				}
				if (sizes) sourceProperties.sizes = sizes
				siblings[index] = createPicture(node, sourceProperties)
				return
			}

			if (extension === '.webp') return

			const webpPublicPath =
				resolvedPublicPath.substring(0, resolvedPublicPath.length - extension.length) + '.webp'
			const webpDiskPath =
				originalDiskPath.substring(0, originalDiskPath.length - extension.length) + '.webp'
			if (!existsSync(webpDiskPath)) return

			siblings[index] = createPicture(node, {
				type: 'image/webp',
				srcSet: webpPublicPath
			})
		})
	}
}

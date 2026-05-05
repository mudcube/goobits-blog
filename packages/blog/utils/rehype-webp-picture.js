/**
 * Rehype plugin that wraps <img> elements in <picture> with a WebP <source>
 * when a .webp sibling file exists on disk. Adds loading="lazy" and
 * decoding="async" to in-article images for performance.
 *
 * Runs at build time during mdsvex compilation.
 */
import { existsSync, readFileSync } from 'fs'
import { join, dirname } from 'path'

const SKIP_EXTENSIONS = new Set(['.webp', '.svg', '.gif'])

function walkNodes(children, visitor) {
	for (let i = 0; i < children.length; i++) {
		const child = children[i]
		if (child.type === 'element') {
			visitor(child, i, children)
			if (child.children) {
				walkNodes(child.children, visitor)
			}
		}
	}
}

function readPngDimensions(buffer) {
	if (
		buffer.length < 24 ||
		buffer.readUInt32BE(0) !== 0x89504e47 ||
		buffer.readUInt32BE(4) !== 0x0d0a1a0a
	) {
		return null
	}

	return {
		width: buffer.readUInt32BE(16),
		height: buffer.readUInt32BE(20)
	}
}

function readJpegDimensions(buffer) {
	if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null

	let offset = 2
	while (offset < buffer.length) {
		if (buffer[offset] !== 0xff) {
			offset += 1
			continue
		}

		const marker = buffer[offset + 1]
		offset += 2

		if (marker === 0xd9 || marker === 0xda) break
		if (offset + 2 > buffer.length) break

		const size = buffer.readUInt16BE(offset)
		if (size < 2 || offset + size > buffer.length) break

		if (
			(marker >= 0xc0 && marker <= 0xc3) ||
			(marker >= 0xc5 && marker <= 0xc7) ||
			(marker >= 0xc9 && marker <= 0xcb) ||
			(marker >= 0xcd && marker <= 0xcf)
		) {
			return {
				width: buffer.readUInt16BE(offset + 5),
				height: buffer.readUInt16BE(offset + 3)
			}
		}

		offset += size
	}

	return null
}

function readImageDimensions(filePath) {
	try {
		const buffer = readFileSync(filePath)
		return readPngDimensions(buffer) || readJpegDimensions(buffer)
	} catch {
		return null
	}
}

export function rehypeWebpPicture() {
	return (tree, vFile) => {
		if (!tree.children) return

		// Resolve the directory of the source markdown file
		const filePath = vFile?.filename || vFile?.path || vFile?.history?.[0] || ''
		const fileDir = filePath ? dirname(filePath) : ''

		// Compute the public URL prefix from the file path
		// e.g. /workspace/static/journal/2010/08/slug/index.md → /journal/2010/08/slug/
		const staticRoot = join(process.cwd(), 'static')
		const publicPrefix = fileDir.startsWith(staticRoot)
			? fileDir.substring(staticRoot.length) + '/'
			: ''

		walkNodes(tree.children, (node, index, siblings) => {
			if (node.tagName !== 'img') return

			const src = node.properties?.src
			if (!src || typeof src !== 'string') return

			// Skip external URLs, data URIs, and already-optimal formats
			if (/^(https?:\/\/|data:)/i.test(src)) return
			const dotIdx = src.lastIndexOf('.')
			if (dotIdx === -1) return
			const ext = src.substring(dotIdx)
			if (SKIP_EXTENSIONS.has(ext.toLowerCase())) return

			const originalDiskPath = src.startsWith('/') ? join(staticRoot, src) : join(fileDir, src)
			const props = node.properties
			const dimensions = readImageDimensions(originalDiskPath)
			if (dimensions && !props.width && !props.height) {
				props.width = dimensions.width
				props.height = dimensions.height
			}
			if (!props.loading) {
				props.loading = 'lazy'
			}
			if (!props.decoding) {
				props.decoding = 'async'
			}

			// Build WebP sibling path (same name, .webp extension)
			const webpRelative = src.substring(0, dotIdx) + '.webp'

			// Resolve disk path — relative to source markdown file's directory
			let diskPath
			let webpPublicPath
			if (src.startsWith('/')) {
				diskPath = join(staticRoot, webpRelative)
				webpPublicPath = webpRelative
			} else if (fileDir) {
				diskPath = join(fileDir, webpRelative)
				webpPublicPath = publicPrefix + webpRelative
			} else {
				return
			}

			if (!existsSync(diskPath)) return

			// Wrap in <picture>
			siblings[index] = {
				type: 'element',
				tagName: 'picture',
				properties: {},
				children: [
					{
						type: 'element',
						tagName: 'source',
						properties: {
							type: 'image/webp',
							srcSet: webpPublicPath
						},
						children: []
					},
					node
				]
			}
		})
	}
}

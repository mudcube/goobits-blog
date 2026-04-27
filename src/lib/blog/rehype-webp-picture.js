/**
 * Rehype plugin that wraps <img> elements in <picture> with a WebP <source>
 * when a .webp sibling file exists on disk. Adds loading="lazy" and
 * decoding="async" to in-article images for performance.
 *
 * Runs at build time during mdsvex compilation.
 */
import { existsSync } from 'fs'
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

export function rehypeWebpPicture() {
	return (tree, vFile) => {
		if (!tree.children) return

		// Resolve the directory of the source markdown file
		const filePath = vFile?.filename || vFile?.path || vFile?.history?.[0] || ''
		const fileDir = filePath ? dirname(filePath) : ''

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

			// Build WebP sibling path (same name, .webp extension)
			const webpSrc = src.substring(0, dotIdx) + '.webp'

			// Resolve disk path — relative to source markdown file's directory
			let diskPath
			if (src.startsWith('/')) {
				diskPath = join(process.cwd(), 'static', webpSrc)
			} else if (fileDir) {
				diskPath = join(fileDir, webpSrc)
			} else {
				return
			}

			if (!existsSync(diskPath)) return

			// Add lazy loading
			const props = node.properties
			if (!props.loading) {
				props.loading = 'lazy'
			}
			if (!props.decoding) {
				props.decoding = 'async'
			}

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
							srcSet: webpSrc
						},
						children: []
					},
					node
				]
			}
		})
	}
}

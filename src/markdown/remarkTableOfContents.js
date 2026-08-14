/**
 * Remark plugin: replaces a `## TOC` (or `## TOC:N` for max depth N)
 * heading with a generated table of contents linking to subsequent headings.
 * Assigns each heading an `id` attribute, deduplicating collisions with
 * a numeric suffix (e.g. `introduction`, `introduction-2`, `introduction-3`).
 *
 * @typedef {{ type: string, value?: string, alt?: string, children?: MdInline[] }} MdInline
 * @typedef {{
 *   type: 'heading',
 *   depth: number,
 *   children: MdInline[],
 *   data?: { hProperties?: { id?: string, [key: string]: unknown }, [key: string]: unknown }
 * }} MdHeading
 * @typedef {MdHeading | { type: string, [key: string]: unknown }} MdNode
 * @typedef {{ children: MdNode[] }} MdRoot
 */

/** @returns {(tree: MdRoot) => MdRoot} */
export function remarkTableOfContents() {
	return (tree) => {
		/** @type {Array<{ depth: number, text: string, id: string }>} */
		const headings = []
		/** @type {Map<string, number>} */
		const seenIds = new Map()
		let tocIndex = -1
		let tocDepth = 2
		let tocLevel = 2

		tree.children.forEach((node, index) => {
			if (node.type === 'heading') {
				const headingNode = /** @type {MdHeading} */ (node)
				const headingText = inlineText(headingNode.children)
				const tocMatch = headingText.match(/^TOC(?::(\d+))?$/)
				if (tocMatch) {
					tocIndex = index
					tocLevel = headingNode.depth
					if (tocMatch[1]) {
						tocDepth = Math.min(6, Math.max(0, parseInt(tocMatch[1], 10)))
					}
					if (tocDepth === 0) tocDepth = 6
					return
				}

				if (tocIndex !== -1 && index > tocIndex) {
					const baseId = toId(headingText)
					const seen = seenIds.get(baseId) ?? 0
					const id = seen === 0 ? baseId : `${baseId}-${seen + 1}`
					seenIds.set(baseId, seen + 1)
					headingNode.data = {
						...headingNode.data,
						hProperties: { ...headingNode.data?.hProperties, id }
					}
					headings.push({ depth: headingNode.depth, text: headingText, id })
				}
			}
		})

		if (tocIndex !== -1) {
			const tocHeading = {
				type: 'heading',
				depth: tocLevel,
				children: [{ type: 'text', value: 'Table of Contents' }]
			}

			const tocList = {
				type: 'list',
				ordered: false,
				children: headings
					.filter((heading) => heading.depth <= tocDepth)
					.map((heading) => ({
						type: 'listItem',
						children: [
							{
								type: 'paragraph',
								children: [
									{
										type: 'link',
										url: `#${heading.id}`,
										children: [{ type: 'text', value: heading.text }]
									}
								]
							}
						]
					}))
			}

			tree.children.splice(tocIndex, 1, tocHeading, tocList)
		}

		return tree
	}
}

/**
 * @param {MdInline[]} nodes
 * @returns {string}
 */
function inlineText(nodes) {
	return nodes.map((node) => {
		if (node.type === 'text' || node.type === 'inlineCode') {
			return node.value ?? ''
		}
		if (node.type === 'image' || node.type === 'imageReference') {
			return node.alt ?? ''
		}
		return node.children ? inlineText(node.children) : ''
	}).join('')
}

/**
 * @param {string} text
 * @returns {string}
 */
function toId(text) {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '')
}

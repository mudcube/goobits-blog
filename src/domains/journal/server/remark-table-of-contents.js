/**
 * Creates a remark plugin that generates a table of contents (TOC) from markdown headings
 * @returns {import('unified').Plugin}
 */
export function remarkTableOfContents() {
	return (tree) => {
		const headings = []
		let tocIndex = -1
		let tocDepth = 2
		let tocLevel = 2

		tree.children.forEach((node, index) => {
			if (node.type === 'heading') {
				const first = node.children[0]
				const headingText = first && first.type === 'text' ? first.value : ''
				const tocMatch = headingText.match(/^TOC(?::(\d+))?$/)
				if (tocMatch) {
					tocIndex = index
					tocLevel = node.depth
					if (tocMatch[1]) {
						tocDepth = Math.min(6, Math.max(0, parseInt(tocMatch[1], 10)))
					}
					if (tocDepth === 0) {
						tocDepth = 6
					}
					return
				}

				if (tocIndex !== -1 && index > tocIndex) {
					const id = toId(headingText)
					node.data = {
						hProperties: { id }
					}
					headings.push({
						depth: node.depth,
						text: headingText,
						id
					})
				}
			}
		})

		if (tocIndex !== -1) {
			const tocHeading = {
				type: 'heading',
				depth: tocLevel,
				children: [
					{
						type: 'text',
						value: 'Table of Contents'
					}
				]
			}

			const tocList = {
				type: 'list',
				ordered: false,
				children: headings
					.filter((h) => h.depth <= tocDepth)
					.map((heading) => ({
						type: 'listItem',
						children: [
							{
								type: 'paragraph',
								children: [
									{
										type: 'link',
										url: `#${heading.id}`,
										children: [
											{
												type: 'text',
												value: heading.text
											}
										]
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

function toId(text) {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '')
}

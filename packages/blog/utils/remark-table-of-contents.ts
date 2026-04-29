type MdText = { type: 'text'; value: string }
type MdHeading = {
	type: 'heading'
	depth: number
	children: Array<MdText | { type: string; [key: string]: unknown }>
	data?: { hProperties?: { id?: string } }
}
type MdNode = MdHeading | { type: string; [key: string]: unknown }
type MdRoot = { children: MdNode[] }

export function remarkTableOfContents(): (tree: MdRoot) => MdRoot {
	return (tree: MdRoot) => {
		const headings: Array<{ depth: number; text: string; id: string }> = []
		let tocIndex = -1
		let tocDepth = 2
		let tocLevel = 2

		tree.children.forEach((node: MdNode, index: number) => {
			if (node.type === 'heading') {
				const headingNode = node as MdHeading
				const first = headingNode.children[0]
				const headingText = first?.type === 'text' ? (first as MdText).value : ''
				const tocMatch = headingText.match(/^TOC(?::(\d+))?$/)
				if (tocMatch) {
					tocIndex = index
					tocLevel = headingNode.depth
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
					headingNode.data = {
						hProperties: { id }
					}
					headings.push({
						depth: headingNode.depth,
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

function toId(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '')
}

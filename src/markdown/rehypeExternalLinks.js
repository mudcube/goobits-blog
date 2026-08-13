function visit(node) {
	if (!node || typeof node !== 'object') return
	if (node.type === 'element' && node.tagName === 'a') {
		const href = node.properties?.href
		if (typeof href === 'string' && /^https?:\/\//i.test(href)) {
			node.properties = {
				...node.properties,
				rel: 'noopener noreferrer',
				target: '_blank'
			}
		}
	}
	if (Array.isArray(node.children)) {
		for (const child of node.children) visit(child)
	}
}

export function rehypeExternalLinks() {
	return tree => visit(tree)
}

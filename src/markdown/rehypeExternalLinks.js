const DANGEROUS_PROTOCOL =
	/^\s*(?:javascript|data|vbscript|file|blob|filesystem|intent|chrome-extension):/i

function visit(node, options) {
	if (!node || typeof node !== 'object') return
	if (node.type === 'element' && node.tagName === 'a') {
		const href = node.properties?.href
		if (typeof href === 'string' && DANGEROUS_PROTOCOL.test(href)) {
			node.properties = { ...node.properties, href: '#' }
		} else if (typeof href === 'string' && /^(?:https?:)?\/\//i.test(href)) {
			const url = new URL(href, 'https://external.invalid')
			const owned = options.ownedDomains.some(
				(domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`)
			)
			if (!owned) {
				const currentRel = Array.isArray(node.properties?.rel)
					? node.properties.rel
					: String(node.properties?.rel ?? '').split(/\s+/)
				const rel = new Set([...currentRel.filter(Boolean), 'noopener', 'noreferrer'])
				if (options.nofollow) rel.add('nofollow')
				node.properties = { ...node.properties, rel: [...rel], target: '_blank' }
			}
		}
	}
	if (Array.isArray(node.children)) {
		for (const child of node.children) visit(child, options)
	}
}

export function rehypeExternalLinks(input = {}) {
	const options = {
		ownedDomains: (input.ownedDomains ?? []).map((domain) => domain.toLowerCase()),
		nofollow: input.nofollow !== false
	}
	return (tree) => visit(tree, options)
}

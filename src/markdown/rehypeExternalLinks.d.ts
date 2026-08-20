export interface RehypeExternalLinksOptions {
	ownedDomains?: string[]
	nofollow?: boolean
}

export function rehypeExternalLinks(options?: RehypeExternalLinksOptions): (tree: unknown) => void

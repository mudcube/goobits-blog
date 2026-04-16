export type SitemapAudience = 'public' | 'internal' | 'hidden'
export type HumanSitemapVisibility = 'public' | 'internal'
export type SitemapSort = 'path' | 'name' | 'modified'

export type PageRouteEntry = {
	path: string
	name: string
	type: 'page'
	hasServerLoad: boolean
	hasClientLoad: boolean
	hasLayout: boolean
	isDynamic: boolean
	hasAuth: boolean
	isNoIndex: boolean
	sitemap: SitemapAudience
	lastModified: string
	category: string
}

export type ApiRouteEntry = {
	path: string
	name: string
	type: 'api'
	httpMethods: string[]
	isDynamic: boolean
	sitemap: SitemapAudience
	lastModified: string
	category: string
}

export type SitemapEntry = PageRouteEntry | ApiRouteEntry

export type RouteInventoryStats = {
	total: number
	pages: number
	api: number
	dynamic: number
	ssr: number
	protected: number
}

export type RouteInventory = {
	routes: SitemapEntry[]
	grouped: Record<string, SitemapEntry[]>
	stats: RouteInventoryStats
}

export type SitemapRoute = {
	path: string
	lastModified: string
}

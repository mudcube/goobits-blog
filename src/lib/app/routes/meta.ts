import type { SitemapAudience } from '@goobits/sitemap/core'

export type { SitemapAudience }

export type RouteMeta = {
	sitemap?: SitemapAudience
	noindex?: boolean
}

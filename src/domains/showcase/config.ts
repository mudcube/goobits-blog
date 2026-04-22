import type { ShowcaseCollectionEntry } from './types'

export type ShowcaseCollectionConfig = {
	path: string
	seoTitle: string
	description: string
	eyebrow: string
	title: string
	titleAccent: string
	icon: string
	iconAlt: string
	intro: string
	signalLabel: string
	gridTitle: string
	gridKicker: string
	gridFilterLabel: string
	ctaTitle: string
	ctaTitleAccent: string
	ctaCopy: string
	ctaHref: string
	ctaLinkLabel: string
}

export type ShowcaseCollectionPageProps = ShowcaseCollectionConfig & {
	entries: ShowcaseCollectionEntry[]
}

<script lang="ts">
	import { blogConfig, getCoverImageUrl, slugify } from '@goobits/blog/core'
	import { formatLabel } from '@goobits/blog-theme-miko'
	import type { JournalPost } from '$lib/blog/viewmodel'
	import Seo from './Seo.svelte'
	import {
		buildArticleJsonLd,
		buildBreadcrumbJsonLd,
		buildWebPageJsonLd,
		toPlainTextExcerpt,
		type JsonLdNode
	} from './meta'

	type JournalSeoProps = {
		data: {
			pageType?: 'index' | 'category' | 'tag' | 'post' | string
			post?: JournalPost | null
			category?: string
			categoryDescription?: string
			tag?: string
		}
	}

	const { data }: JournalSeoProps = $props()

	const journalBase = $derived(blogConfig.uri || '/journal')
	const journalIndexPath = $derived(`${journalBase}/`)

	type ResolvedSeo = {
		title: string
		description: string
		path: string
		image: string
		type: 'website' | 'article'
		publishedTime: string
		modifiedTime: string
		jsonLd: JsonLdNode[]
	}

	const resolved = $derived.by<ResolvedSeo>(() => {
		const fallback = {
			title: blogConfig.name || 'Journal',
			description:
				blogConfig.description || 'Ideas, process, and notes from Miko Meow.',
			path: journalIndexPath,
			image: blogConfig.images?.defaults?.coverImage || '/media/miko.jpg',
			type: 'website' as 'website' | 'article',
			publishedTime: '',
			modifiedTime: '',
			jsonLd: [] as JsonLdNode[]
		}

		if (data.pageType === 'category' && data.category) {
			const label = formatLabel(data.category)
			const path = `${journalBase}/category/${slugify(data.category)}/`
			const description =
				data.categoryDescription ||
				`Journal entries filed under ${label}.`
			return {
				...fallback,
				title: `${label} — Journal`,
				description,
				path,
				jsonLd: [
					buildWebPageJsonLd({
						path,
						title: `${label} — Journal`,
						description,
						type: 'CollectionPage'
					})
				]
			}
		}

		if (data.pageType === 'tag' && data.tag) {
			const label = formatLabel(data.tag)
			const path = `${journalBase}/tag/${slugify(data.tag)}/`
			const description = `Journal entries tagged #${label}.`
			return {
				...fallback,
				title: `#${label} — Journal`,
				description,
				path,
				jsonLd: [
					buildWebPageJsonLd({
						path,
						title: `#${label} — Journal`,
						description,
						type: 'CollectionPage'
					})
				]
			}
		}

		if (data.pageType === 'post' && data.post) {
			const fm = data.post.metadata?.fm ?? {}
			const urlPath = data.post.urlPath ?? ''
			const path = `${journalBase}${urlPath.startsWith('/') ? urlPath : `/${urlPath}`}`
				.replace(/\/?$/, '/')
			const title = fm.title || 'Untitled Entry'
			const excerpt = fm.excerpt || ''
			const description = excerpt
				? toPlainTextExcerpt(excerpt)
				: `${title} — a journal entry from Miko Meow.`
			// getCoverImageUrl is the canonical helper — it respects blogConfig.uri
			// and handles relative vs absolute paths. We pass a minimal shape so
			// the Date/string mismatch on JournalPost vs ProcessedPost doesn't bite.
			const image =
				getCoverImageUrl(
					{
						urlPath: data.post.urlPath ?? '',
						metadata: { fm: { coverImage: fm.coverImage } }
					} as never,
					''
				) || fallback.image
			const datePublished = data.post.date?.toISOString?.() || String(data.post.date || '')
			const dateModified = fm.updated || datePublished
			const primaryCategory = fm.category || (fm.categories ?? [])[0] || ''

			const breadcrumbItems = [
				{ name: 'Journal', path: journalIndexPath }
			]
			if (primaryCategory) {
				breadcrumbItems.push({
					name: formatLabel(primaryCategory),
					path: `${journalBase}/category/${slugify(primaryCategory)}/`
				})
			}
			breadcrumbItems.push({ name: title, path })

			const jsonLd: JsonLdNode[] = [
				buildArticleJsonLd({
					path,
					title,
					description,
					datePublished,
					dateModified,
					image
				}),
				buildBreadcrumbJsonLd(breadcrumbItems)
			]

			return {
				...fallback,
				title,
				description,
				path,
				image,
				type: 'article',
				publishedTime: datePublished,
				modifiedTime: dateModified,
				jsonLd
			}
		}

		// index / unknown
		return {
			...fallback,
			jsonLd: [
				buildWebPageJsonLd({
					path: journalIndexPath,
					title: fallback.title,
					description: fallback.description,
					type: 'CollectionPage'
				})
			]
		}
	})
</script>

<Seo
	title={resolved.title}
	description={resolved.description}
	path={resolved.path}
	image={resolved.image}
	type={resolved.type}
	publishedTime={resolved.publishedTime}
	modifiedTime={resolved.modifiedTime}
	jsonLd={resolved.jsonLd}
/>

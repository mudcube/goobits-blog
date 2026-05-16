<script lang="ts">
	import { blogConfig, formatLabel, getCoverImageUrl, getPostExcerpt, slugify } from '@goobits/blog/core'
	import { toProcessedPost, type JournalPost } from '$lib/blog/viewmodel'
	import Seo from './Seo.svelte'
	import {
		SITE_AUTHOR,
		buildArticleJsonLd,
		buildBreadcrumbJsonLd,
		buildWebPageJsonLd,
		toIso8601Datetime,
		toPlainTextExcerpt,
		type JsonLdNode
	} from './meta'

	type JournalSeoProps = {
		data: {
			pageType?: 'index' | 'category' | 'tag' | 'post' | string
			post?: JournalPost | null
			posts?: Array<{ metadata?: { fm?: { title?: string } } }>
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
			image: blogConfig.images?.defaults?.coverImage || '/media/brand/miko.jpg',
			type: 'website' as 'website' | 'article',
			publishedTime: '',
			modifiedTime: '',
			jsonLd: [] as JsonLdNode[]
		}

		// For category/tag pages, weave a short list of the actual post titles
		// into the description so each collection has a unique SERP snippet
		// instead of the boilerplate "Journal entries tagged #Foo." that an
		// audit would (rightly) flag as thin/duplicate content.
		const samplePostTitles = (data.posts ?? [])
			.map((p) => p.metadata?.fm?.title)
			.filter((t): t is string => typeof t === 'string' && t.length > 0)
			.slice(0, 3)
		const postCount = data.posts?.length ?? 0

		if (data.pageType === 'category' && data.category) {
			const label = formatLabel(data.category)
			const path = `${journalBase}/category/${slugify(data.category)}/`
			const titleSummary = samplePostTitles.length > 0
				? samplePostTitles.join(', ')
				: ''
			const description = data.categoryDescription
				|| (postCount > 0 && titleSummary
					? `${postCount} journal ${postCount === 1 ? 'entry' : 'entries'} on ${label.toLowerCase()}: ${titleSummary}.`
					: `Journal entries filed under ${label}.`)
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
			const titleSummary = samplePostTitles.length > 0
				? samplePostTitles.join(', ')
				: ''
			const description = postCount > 0 && titleSummary
				? `${postCount} journal ${postCount === 1 ? 'entry' : 'entries'} tagged #${label}: ${titleSummary}.`
				: `Journal entries tagged #${label}.`
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
			// Adapt the viewmodel JournalPost to blog core's ProcessedPost shape
			// so we can feed it to getPostExcerpt and getCoverImageUrl without
			// the Date/string mismatch.
			const processed = toProcessedPost(data.post)
			// Prefer frontmatter excerpt; otherwise derive one from the markdown
			// body via blog core's getPostExcerpt (strips markup, clamps length);
			// last resort is a generic fallback so meta description is never empty.
			const frontmatterExcerpt = fm.excerpt || ''
			const derivedExcerpt = frontmatterExcerpt
				? toPlainTextExcerpt(frontmatterExcerpt)
				: toPlainTextExcerpt(getPostExcerpt(processed, 200) || '')
			const description =
				derivedExcerpt || `${title} — a journal entry from Miko Meow.`
			const image = getCoverImageUrl(processed, '') || fallback.image
			const datePublished = toIso8601Datetime(data.post.date)
			const dateModified = fm.updated ? toIso8601Datetime(fm.updated) : datePublished
			const primaryCategory = fm.category || (fm.categories ?? [])[0] || ''
			const tags = Array.isArray(fm.tags)
				? fm.tags.filter((t): t is string => typeof t === 'string')
				: []

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
					image,
					...(primaryCategory ? { articleSection: formatLabel(primaryCategory) } : {}),
					...(tags.length > 0
						? { keywords: tags.map((tag) => formatLabel(tag)) }
						: {})
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

		// index / unknown — title doubles as the SERP <title>, so spend the
		// available characters on intent terms (creative coding / drawing
		// tools / music) rather than just the brand. blogConfig.name stays
		// short for header/RSS reuse.
		const indexTitle = `Journal — Sketchpad, Color Piano, creative coding by ${SITE_AUTHOR}`
		return {
			...fallback,
			title: indexTitle,
			jsonLd: [
				buildWebPageJsonLd({
					path: journalIndexPath,
					title: indexTitle,
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

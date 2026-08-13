import type { BlogEngine } from '../core/createBlogEngine.js'
import type { BlogReadContext } from '../core/blogQuery.js'

export interface BlogEntry {
	slug: string
}

function relativeSlug(urlPath: string, basePath: string): string {
	const path = basePath && urlPath.startsWith(`${ basePath }/`)
		? urlPath.slice(basePath.length + 1)
		: urlPath.replace(/^\/+/, '')
	return path.replace(/\/+$/, '')
}

export async function generateBlogEntries(
	engine: BlogEngine,
	context: BlogReadContext = {}
): Promise<BlogEntry[]> {
	const page = await engine.listPosts({
		page: 1,
		pageSize: Number.MAX_SAFE_INTEGER,
		visibility: context.allowDrafts === true ? 'all' : 'published'
	}, context)
	const entries = page.posts.map(post => ({
		slug: relativeSlug(post.urlPath, engine.config.basePath)
	}))
	const categories = await engine.getCategories({}, context)
	const tags = await engine.getTags({}, context)

	return [
		...entries,
		...categories.map(category => ({ slug: `category/${ category.slug }` })),
		...tags.map(tag => ({ slug: `tag/${ tag.slug }` }))
	]
}

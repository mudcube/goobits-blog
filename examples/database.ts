import {
	createBlogPost,
	type BlogContentSource,
	type BlogPost,
	type BlogPostPage,
	type BlogQuery,
	type BlogReadContext,
	type BlogTaxonomyTerm
} from '@goobits/blog/core'

export interface TenantContext extends BlogReadContext {
	tenantId: string
	viewerId?: string
}

interface PostRow {
	id: string
	slug: string
	title: string
	publishedAt: Date
	path: string
}

declare const repository: {
	list(input: { tenantId: string; query: BlogQuery }): Promise<{ rows: PostRow[]; total: number }>
	find(input: { tenantId: string; reference: string }): Promise<PostRow | null>
	taxonomy(input: { tenantId: string; type: 'category' | 'tag'; query: BlogQuery }): Promise<BlogTaxonomyTerm[]>
}

function toBlogPost(row: PostRow): BlogPost {
	return createBlogPost({
		id: row.id,
		slug: row.slug,
		title: row.title,
		date: row.publishedAt,
		urlPath: row.path
	})
}

export const databaseSource: BlogContentSource<TenantContext> = {
	async listPosts(query = {}, context): Promise<BlogPostPage> {
		if (!context) {throw new Error('Tenant context is required')}
		const page = Math.max(1, query.page ?? 1)
		const pageSize = Math.max(1, query.pageSize ?? 12)
		const result = await repository.list({ tenantId: context.tenantId, query })
		return {
			posts: result.rows.map(toBlogPost),
			total: result.total,
			page,
			pageSize,
			hasNextPage: page * pageSize < result.total
		}
	},
	async getPost(reference, _query, context): Promise<BlogPost | null> {
		if (!context) {throw new Error('Tenant context is required')}
		const key = typeof reference === 'string' ? reference : reference.id
		const row = await repository.find({ tenantId: context.tenantId, reference: key })
		return row ? toBlogPost(row) : null
	},
	async getCategories(query = {}, context): Promise<BlogTaxonomyTerm[]> {
		if (!context) {throw new Error('Tenant context is required')}
		return await repository.taxonomy({ tenantId: context.tenantId, type: 'category', query })
	},
	async getTags(query = {}, context): Promise<BlogTaxonomyTerm[]> {
		if (!context) {throw new Error('Tenant context is required')}
		return await repository.taxonomy({ tenantId: context.tenantId, type: 'tag', query })
	}
}

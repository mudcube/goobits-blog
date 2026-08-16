import { createBlogEngine } from '../src/core/createBlogEngine.js'
import type { BlogRouteEvent } from '../src/sveltekit/createBlogRouteHandlers.js'
import { createBlogRouteHandlers } from '../src/sveltekit/createBlogRouteHandlers.js'
import { databaseSource, type TenantContext } from './database.js'

interface BlogLocals {
	tenantId: string
	viewerId?: string
	roles: string[]
}

type TenantEvent = BlogRouteEvent<BlogLocals>

export const blog = createBlogEngine<TenantContext>({
	config: { name: 'Community', basePath: '/blog' },
	contentSource: databaseSource
})

export const routes = createBlogRouteHandlers<TenantContext, TenantEvent>({
	engine: blog,
	prerender: false,
	getReadContext: event => ({
		tenantId: event.locals.tenantId,
		...(event.locals.viewerId ? { viewerId: event.locals.viewerId } : {}),
		allowDrafts: event.locals.roles.includes('editor')
	})
})

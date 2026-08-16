import { createBlogEngine } from '@goobits/blog/core'
import { createBlogRouteHandlers, type BlogRouteEvent } from '@goobits/blog/sveltekit'
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

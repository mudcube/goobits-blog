import { error as svelteKitError } from '@sveltejs/kit'

import { createBlogConfig, type BlogConfig, type BlogConfigInput } from '../config/blogConfig.js'
import type { BlogContentSource } from '../core/blogContentSource.js'
import { createBlogEngine, type BlogEngine } from '../core/createBlogEngine.js'
import type { BlogReadContext } from '../core/blogQuery.js'
import {
	createMarkdownContentSource,
	type MarkdownContentSourceOptions,
	type MarkdownImportRecord
} from '../markdown/createMarkdownContentSource.js'
import {
	createBlogPageLoad,
	type BlogPageLoadOptions,
	type BlogPageLoadResult,
	type BlogPageServerData
} from './createBlogPageLoad.js'
import {
	createBlogRouteHandlers,
	type BlogIndexData,
	type BlogRouteData,
	type BlogRouteEvent,
	type BlogRouteHandlers
} from './createBlogRouteHandlers.js'
import { BlogRouteError } from './BlogRouteError.js'
import type { BlogEntry } from './generateBlogEntries.js'

export type MarkdownRawContent = string | (() => Promise<string>)
export type MarkdownRawContentRecord = Record<string, MarkdownRawContent>

type MarkdownRecordInput<RecordType extends Record<string, unknown>> =
	RecordType | (() => RecordType)

export interface CreateMarkdownBlogOptions<
	Context extends BlogReadContext = BlogReadContext,
	Event extends BlogRouteEvent<object> = BlogRouteEvent
> extends Pick<
	MarkdownContentSourceOptions,
	'resolveSourcePath' | 'importFailureMode' | 'cacheTtlMs' | 'logger'
> {
	config?: BlogConfigInput
	modules: MarkdownRecordInput<MarkdownImportRecord>
	rawContent: MarkdownRecordInput<MarkdownRawContentRecord>
	getContext?: (event: Event) => Context
	getLanguage?: (event: Event) => string
	prerender?: boolean
	trailingSlash?: 'always' | 'never' | 'ignore'
	onContentError?: BlogPageLoadOptions['onError']
}

export interface MarkdownBlogRoutes<Event extends BlogRouteEvent<object> = BlogRouteEvent> {
	index: (event: Event) => Promise<BlogIndexData & { config: BlogConfig }>
	route: (event: Event) => Promise<BlogRouteData & { config: BlogConfig }>
	entries: () => Promise<BlogEntry[]>
	rss: (event: Event) => Promise<Response>
	page: (params: { data: BlogPageServerData }) => Promise<BlogPageLoadResult>
}

export interface MarkdownBlog<
	Context extends BlogReadContext = BlogReadContext,
	Event extends BlogRouteEvent<object> = BlogRouteEvent
> {
	engine: BlogEngine<Context>
	contentSource: BlogContentSource<Context>
	handlers: BlogRouteHandlers<Event>
	routes: MarkdownBlogRoutes<Event>
	config: BlogConfig
	prerender: boolean
	trailingSlash: 'always' | 'never' | 'ignore'
}

function resolveRecord<RecordType extends Record<string, unknown>>(
	input: MarkdownRecordInput<RecordType>
): RecordType {
	return typeof input === 'function' ? input() : input
}

async function loadRawContent(
	recordInput: MarkdownRecordInput<MarkdownRawContentRecord>,
	filePath: string
): Promise<string> {
	const content = resolveRecord(recordInput)[filePath]
	if (content === undefined) {
		throw new Error(`Missing raw blog content for "${filePath}"`)
	}
	return typeof content === 'string' ? content : await content()
}

function isModule(value: unknown): value is { default?: unknown } {
	return typeof value === 'object' && value !== null
}

export function createMarkdownBlog<
	Context extends BlogReadContext = BlogReadContext,
	Event extends BlogRouteEvent<object> = BlogRouteEvent
>(options: CreateMarkdownBlogOptions<Context, Event>): MarkdownBlog<Context, Event> {
	const config = createBlogConfig(options.config)
	const contentSource = createMarkdownContentSource({
		files: options.modules,
		basePath: config.basePath,
		defaultLanguage: config.defaultLanguage,
		wordsPerMinute: config.wordsPerMinute,
		readContent: async (filePath) => await loadRawContent(options.rawContent, filePath),
		...(options.resolveSourcePath ? { resolveSourcePath: options.resolveSourcePath } : {}),
		...(options.importFailureMode ? { importFailureMode: options.importFailureMode } : {}),
		...(options.cacheTtlMs !== undefined ? { cacheTtlMs: options.cacheTtlMs } : {}),
		...(options.logger ? { logger: options.logger } : {})
	})
	const engine = createBlogEngine<Context>({ config, contentSource })
	const handlers = createBlogRouteHandlers<Context, Event>({
		engine,
		...(options.getContext ? { getReadContext: options.getContext } : {}),
		...(options.getLanguage ? { getLanguage: options.getLanguage } : {}),
		...(options.prerender !== undefined ? { prerender: options.prerender } : {}),
		...(options.trailingSlash ? { trailingSlash: options.trailingSlash } : {})
	})
	const page = createBlogPageLoad({
		loadPostContent: async (sourcePath) => {
			const modules = resolveRecord(options.modules)
			const moduleEntry = Object.entries(modules).find(
				([filePath]) => (options.resolveSourcePath?.(filePath) ?? filePath) === sourcePath
			)
			if (!moduleEntry) {
				throw new Error(`Missing blog module for "${sourcePath}"`)
			}
			const module = await moduleEntry[1]()
			return isModule(module) ? (module.default ?? null) : null
		},
		...(options.onContentError ? { onError: options.onContentError } : {})
	})

	const withRouteErrors = async <Data>(load: () => Promise<Data>): Promise<Data> => {
		try {
			return await load()
		} catch (cause) {
			if (cause instanceof BlogRouteError) {
				svelteKitError(cause.status, cause.message)
			}
			throw cause
		}
	}

	return {
		engine,
		contentSource,
		handlers,
		config,
		prerender: handlers.prerender,
		trailingSlash: handlers.trailingSlash,
		routes: {
			index: async (event) => ({
				...(await withRouteErrors(async () => await handlers.loadIndex(event))),
				config
			}),
			route: async (event) => ({
				...(await withRouteErrors(async () => await handlers.loadRoute(event))),
				config
			}),
			entries: async () => await handlers.entries(),
			rss: async (event) => await handlers.GET(event),
			page
		}
	}
}

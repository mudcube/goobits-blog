import type { BlogConfig } from '../config/blogConfig.js'
import type { BlogPost } from '../core/blogPost.js'

export function resolveBlogLanguage(config: BlogConfig, requestedLanguage?: string): string {
	if (requestedLanguage && config.supportedLanguages.includes(requestedLanguage)) {
		return requestedLanguage
	}

	return config.defaultLanguage
}

export function localizeBlogPost(post: BlogPost, requestedLanguage: string): BlogPost {
	const translation = post.translations?.[requestedLanguage]
	if (!translation) {return post}

	return {
		...post,
		lang: requestedLanguage,
		title: translation.title ?? post.title,
		excerpt: translation.excerpt ?? post.excerpt,
		categories: translation.categories ?? post.categories,
		tags: translation.tags ?? post.tags
	}
}

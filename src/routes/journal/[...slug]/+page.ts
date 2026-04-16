const postModules = import.meta.glob('/static/journal/**/index.md')

export async function load({ data }: { data: Record<string, unknown> }) {
	const pageType = data['pageType']
	const post = data['post']

	if (
		pageType === 'post' &&
		typeof post === 'object' &&
		post !== null &&
		'path' in post &&
		typeof post.path === 'string'
	) {
		const resolver = postModules[post.path as keyof typeof postModules]

		if (resolver) {
			try {
				const module = await resolver()
				const postContent = (module as { default?: unknown }).default ?? null
				return {
					...data,
					postContent
				}
			} catch (error) {
				console.error('[journal] failed to load post module', post.path, error)
			}
		}
	}

	return data
}

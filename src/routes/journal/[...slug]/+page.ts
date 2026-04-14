const postModules = import.meta.glob('/static/journal/**/index.md')

export async function load({ data }: { data: Record<string, unknown> }) {
	if (
		data.pageType === 'post' &&
		typeof data.post === 'object' &&
		data.post !== null &&
		'path' in data.post &&
		typeof data.post.path === 'string'
	) {
		const resolver = postModules[data.post.path as keyof typeof postModules]

		if (resolver) {
			try {
				const module = await resolver()
				const postContent = (module as { default?: unknown }).default ?? null
				return {
					...data,
					postContent
				}
			} catch (error) {
				console.error('[journal] failed to load post module', data.post.path, error)
			}
		}
	}

	return data
}

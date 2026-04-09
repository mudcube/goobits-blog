function normalize(value: string) {
	return value.trim().toLowerCase()
}

const activityEmojiMap: Record<string, string> = {
	gym: '💪',
	circus: '🎪',
	movie: '🎬',
	movies: '🎬',
	hike: '🏔️',
	adventure: '🏔️',
	social: '🍺'
}

const activityColorMap: Record<string, string> = {
	gym: '#6366f1',
	circus: '#ec4899',
	movie: '#f59e0b',
	movies: '#f59e0b',
	hike: '#10b981',
	adventure: '#10b981',
	social: '#8b5cf6'
}

function resolveActivityKey(label = '', slug = '') {
	return normalize(slug || label)
}

export function getActivityEmoji(label = '', slug = '') {
	const key = resolveActivityKey(label, slug)
	return activityEmojiMap[key] || '✨'
}

export function getActivityColor(label = '', slug = '') {
	const key = resolveActivityKey(label, slug)
	return activityColorMap[key] || '#64748b'
}

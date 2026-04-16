import type { ContactFormData } from '@goobits/contact/core'

export function getContactContextLabel(data: Pick<ContactFormData, 'from' | 'topic'>) {
	const parts = [data.from, data.topic].filter(Boolean)
	return parts.length ? parts.join(' / ') : ''
}

export function getContactMessagePlaceholder(data: Pick<ContactFormData, 'from' | 'topic'>) {
	if (data.from === 'music' && data.topic) return 'Tell me what you need and include any links...'
	if (data.from === 'art') return 'Tell me about the piece, timeline, and any reference links...'
	if (data.from === 'about' && data.topic) {
		return 'Tell me a bit about your project and what you are looking for...'
	}
	return 'Tell me about your project…'
}

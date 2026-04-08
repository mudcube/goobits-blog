import { z } from 'zod'
import { emailSchema } from '@src/domains/shared/zod/email'
import { trimmedOptionalString } from '@src/domains/shared/zod/strings'

const MIN_MESSAGE_LENGTH = 12
const MIN_MESSAGE_WORDS = 3

function hasSubstantiveMessage(message: string) {
	const cleaned = message.replace(/\s+/g, ' ').trim()
	if (cleaned.length < MIN_MESSAGE_LENGTH) return false
	const wordCount = cleaned
		.split(' ')
		.filter((word) => /[a-z0-9]/i.test(word)).length
	return wordCount >= MIN_MESSAGE_WORDS
}

export const contactSchema = z.object({
	from: trimmedOptionalString(64),
	topic: trimmedOptionalString(64),
	started_at: trimmedOptionalString(32),
	device_id: trimmedOptionalString(128),
	website: trimmedOptionalString(256),
	name: z.string().trim().min(1, 'Name is required').max(120, 'Name is required'),
	email: emailSchema,
	message: z
		.string()
		.trim()
		.min(1, 'Message is required')
		.max(5000, 'Message is too long')
		.refine(hasSubstantiveMessage, 'Please include a more substantive message with at least a few words.'),
	['cf-turnstile-response']: trimmedOptionalString(4096)
})

export type ContactFormData = z.infer<typeof contactSchema>

export function getContactContextLabel(data: Pick<ContactFormData, 'from' | 'topic'>) {
	const parts = [data.from, data.topic].filter(Boolean)
	return parts.length ? parts.join(' / ') : ''
}

export function getContactMessagePlaceholder(data: Pick<ContactFormData, 'from' | 'topic'>) {
	if (data.from === 'music' && data.topic) return 'Tell me what you need and include any links...'
	if (data.from === 'art') return 'Tell me about the piece, timeline, and any reference links...'
	if (data.from === 'about' && data.topic) return 'Tell me a bit about your project and what you are looking for...'
	return 'Tell me about your project…'
}

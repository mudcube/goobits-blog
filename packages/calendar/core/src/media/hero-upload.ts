type R2Bucket = {
	put(
		key: string,
		value: ArrayBuffer | ArrayBufferView | ReadableStream | string,
		options?: {
			httpMetadata?: { contentType?: string; cacheControl?: string }
			customMetadata?: Record<string, string>
		}
	): Promise<unknown>
	delete(key: string): Promise<void>
}

export const ALLOWED_HERO_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export type AllowedHeroMimeType = (typeof ALLOWED_HERO_MIME_TYPES)[number]

export const MAX_HERO_BYTES = 8 * 1024 * 1024

const MIME_TO_EXT: Record<AllowedHeroMimeType, string> = {
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp'
}

export type PutHeroResult = {
	key: string
	url: string
}

function isAllowedMime(value: string): value is AllowedHeroMimeType {
	return (ALLOWED_HERO_MIME_TYPES as readonly string[]).includes(value)
}

function shortId() {
	const bytes = new Uint8Array(8)
	crypto.getRandomValues(bytes)
	return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function publicUrl(base: string, key: string) {
	const trimmed = base.replace(/\/+$/, '')
	return `${trimmed}/${key}`
}

export class HeroUploadError extends Error {
	code: 'invalid_mime' | 'too_large' | 'empty'

	constructor(code: 'invalid_mime' | 'too_large' | 'empty', message: string) {
		super(message)
		this.name = 'HeroUploadError'
		this.code = code
	}
}

export async function putEventHero(
	bucket: R2Bucket,
	publicBase: string,
	input: { eventId: number; bytes: ArrayBuffer; contentType: string }
): Promise<PutHeroResult> {
	if (!input.bytes || input.bytes.byteLength === 0) {
		throw new HeroUploadError('empty', 'File is empty')
	}
	if (input.bytes.byteLength > MAX_HERO_BYTES) {
		throw new HeroUploadError('too_large', `File exceeds ${MAX_HERO_BYTES / (1024 * 1024)}MB`)
	}
	if (!isAllowedMime(input.contentType)) {
		throw new HeroUploadError(
			'invalid_mime',
			`Unsupported file type. Use ${ALLOWED_HERO_MIME_TYPES.join(', ')}`
		)
	}

	const ext = MIME_TO_EXT[input.contentType]
	const key = `events/${input.eventId}/hero-${shortId()}.${ext}`
	await bucket.put(key, input.bytes, {
		httpMetadata: {
			contentType: input.contentType,
			cacheControl: 'public, max-age=31536000, immutable'
		}
	})
	return { key, url: publicUrl(publicBase, key) }
}

export async function deleteEventHero(bucket: R2Bucket, key: string): Promise<void> {
	await bucket.delete(key)
}

export function extractHeroKeyFromUrl(url: string | null, publicBase: string): string | null {
	if (!url) return null
	const trimmedBase = publicBase.replace(/\/+$/, '')
	if (url.startsWith(`${trimmedBase}/`)) {
		return url.slice(trimmedBase.length + 1)
	}
	return null
}

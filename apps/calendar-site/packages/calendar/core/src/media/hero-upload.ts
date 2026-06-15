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

function verifyImageMagicBytes(bytes: ArrayBuffer, mime: AllowedHeroMimeType): boolean {
	const u8 = new Uint8Array(bytes)
	if (u8.length < 12) return false
	if (mime === 'image/png') {
		return u8[0] === 0x89 && u8[1] === 0x50 && u8[2] === 0x4e && u8[3] === 0x47
			&& u8[4] === 0x0d && u8[5] === 0x0a && u8[6] === 0x1a && u8[7] === 0x0a
	}
	if (mime === 'image/jpeg') {
		return u8[0] === 0xff && u8[1] === 0xd8 && u8[2] === 0xff
	}
	// WebP: "RIFF" at 0..3, "WEBP" at 8..11
	return u8[0] === 0x52 && u8[1] === 0x49 && u8[2] === 0x46 && u8[3] === 0x46
		&& u8[8] === 0x57 && u8[9] === 0x45 && u8[10] === 0x42 && u8[11] === 0x50
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
	code: 'invalid_mime' | 'too_large' | 'empty' | 'corrupt'

	constructor(code: 'invalid_mime' | 'too_large' | 'empty' | 'corrupt', message: string) {
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
	// Defense-in-depth: client-supplied Content-Type is not trusted on its own.
	// Verify the file body actually starts with the magic bytes for the declared MIME.
	if (!verifyImageMagicBytes(input.bytes, input.contentType)) {
		throw new HeroUploadError(
			'corrupt',
			'File contents do not match the declared image type'
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

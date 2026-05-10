import type { RequestEvent } from '@sveltejs/kit'
import { buildEnv } from '@calendar/kit'
import {
	deleteEventHero,
	extractHeroKeyFromUrl,
	HeroUploadError,
	MAX_HERO_BYTES,
	putEventHero
} from '@calendar/core/media'
import { getEventHeroImage, updateEventHeroImage } from '@calendar/core/booking'
import { parsePositiveInteger } from '@calendar/core/transport'
import { logAdminEvent, requireAdminRequest, runApiRequest } from '@calendar/app/admin-api-helpers'
import { apiOk, apiError } from '@calendar/kit'

function getMediaConfig(env: Awaited<ReturnType<typeof buildEnv>>) {
	const bucket = env.MEDIA
	const publicBase =
		typeof env.MEDIA_PUBLIC_BASE === 'string' && env.MEDIA_PUBLIC_BASE.trim()
			? env.MEDIA_PUBLIC_BASE.trim()
			: null
	if (!bucket || !publicBase) return null
	return { bucket, publicBase }
}

export async function POST(event: RequestEvent) {
	return runApiRequest('admin.events.hero.upload', async () => {
		const guard = requireAdminRequest(event, { csrf: true })
		if (guard) return guard

		const eventParam = event.params['id']
		if (!eventParam) return apiError('Missing event id', { status: 400 })
		const eventId = parsePositiveInteger(eventParam)
		if (!eventId) return apiError('Invalid event id', { status: 400 })

		const env = await buildEnv(event.platform)
		const media = getMediaConfig(env)
		if (!media) {
			return apiError('Media uploads are not configured for this environment', { status: 503 })
		}

		const form = await event.request.formData().catch(() => null)
		const file = form?.get('file')
		if (!(file instanceof File)) {
			return apiError('Missing file field', { status: 400 })
		}
		if (file.size > MAX_HERO_BYTES) {
			return apiError(`File exceeds ${MAX_HERO_BYTES / (1024 * 1024)}MB`, { status: 413 })
		}

		const previousUrl = await getEventHeroImage(env.DB, eventId)
		const previousKey = extractHeroKeyFromUrl(previousUrl, media.publicBase)

		try {
			const bytes = await file.arrayBuffer()
			const uploaded = await putEventHero(media.bucket, media.publicBase, {
				eventId,
				bytes,
				contentType: file.type
			})
			const persisted = await updateEventHeroImage(env.DB, {
				eventId,
				heroImageUrl: uploaded.url
			})
			if (!persisted) {
				// DB row vanished; clean up the new object so we don't orphan it.
				try {
					await deleteEventHero(media.bucket, uploaded.key)
				} catch (cleanupError) {
					console.warn('[admin-event-hero] failed to clean up new object after missing event:', cleanupError)
				}
				return apiError('Event not found', { status: 404 })
			}
			if (previousKey) {
				try {
					await deleteEventHero(media.bucket, previousKey)
				} catch (deleteError) {
					console.warn('[admin-event-hero] failed to delete previous hero:', deleteError)
				}
			}
			logAdminEvent(event, 'event_hero_upload', { eventId, key: uploaded.key })
			return apiOk({ url: uploaded.url })
		} catch (error) {
			if (error instanceof HeroUploadError) {
				return apiError(error.message, { status: 400, code: error.code })
			}
			throw error
		}
	})
}

export async function DELETE(event: RequestEvent) {
	return runApiRequest('admin.events.hero.delete', async () => {
		const guard = requireAdminRequest(event, { csrf: true })
		if (guard) return guard

		const eventParam = event.params['id']
		if (!eventParam) return apiError('Missing event id', { status: 400 })
		const eventId = parsePositiveInteger(eventParam)
		if (!eventId) return apiError('Invalid event id', { status: 400 })

		const env = await buildEnv(event.platform)
		const media = getMediaConfig(env)

		const previousUrl = await getEventHeroImage(env.DB, eventId)
		const persisted = await updateEventHeroImage(env.DB, { eventId, heroImageUrl: null })
		if (!persisted) return apiError('Event not found', { status: 404 })

		if (media && previousUrl) {
			const previousKey = extractHeroKeyFromUrl(previousUrl, media.publicBase)
			if (previousKey) {
				try {
					await deleteEventHero(media.bucket, previousKey)
				} catch (deleteError) {
					console.warn('[admin-event-hero] failed to delete hero on clear:', deleteError)
				}
			}
		}
		logAdminEvent(event, 'event_hero_delete', { eventId })
		return apiOk({})
	})
}

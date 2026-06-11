import { initializeAntiAbuseFields } from '$lib/client/antiabuse'

type AntiAbuseFields = {
	started_at?: string
	device_id?: string
}

export function seedAntiAbuseFields<T extends AntiAbuseFields>(
	storageKey: string,
	updateForm: (updater: (current: T) => T) => void
) {
	const fields = initializeAntiAbuseFields(storageKey)
	updateForm((current) => ({
		...current,
		started_at: fields.startedAt,
		device_id: fields.deviceId
	}))
}

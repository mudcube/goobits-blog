export function initializeAntiAbuseFields(storageKey: string) {
	let deviceId = window.localStorage.getItem(storageKey)
	if (!deviceId) {
		deviceId = crypto.randomUUID()
		window.localStorage.setItem(storageKey, deviceId)
	}

	return {
		startedAt: String(Date.now()),
		deviceId
	}
}

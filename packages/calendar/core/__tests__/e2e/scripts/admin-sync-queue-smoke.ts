import { BASE_URL, withAdminPage } from './_helpers'

export async function runAdminSyncQueueSmoke() {
	await withAdminPage(async (_page, context) => {
		const statusRes = await context.request.get(`${BASE_URL}/api/admin/status`)
		if (!statusRes.ok()) throw new Error(`admin status failed: ${statusRes.status()}`)
		const statusPayload = await statusRes.json() as { syncQueue?: { deadLetter?: number } }
		const deadLetterCount = Number(statusPayload?.syncQueue?.deadLetter || 0)
		const sameOriginHeaders = {
			origin: BASE_URL,
			referer: `${BASE_URL}/schedule/admin/`
		}

		const processRes = await context.request.post(`${BASE_URL}/api/admin/sync-queue`, {
			headers: sameOriginHeaders,
			data: { action: 'process', limit: 5 }
		})
		if (!processRes.ok()) throw new Error(`sync queue process failed: ${processRes.status()}`)
		const processPayload = await processRes.json() as { ok?: boolean; action?: string }
		if (!processPayload.ok || processPayload.action !== 'process') {
			throw new Error(`unexpected process payload: ${JSON.stringify(processPayload)}`)
		}

		if (deadLetterCount > 0) {
			const retryRes = await context.request.post(`${BASE_URL}/api/admin/sync-queue`, {
				headers: sameOriginHeaders,
				data: { action: 'retry_dead_letters', limit: 5 }
			})
			if (!retryRes.ok()) throw new Error(`retry dead letters failed: ${retryRes.status()}`)
			const retryPayload = await retryRes.json() as { ok?: boolean; action?: string }
			if (!retryPayload.ok || retryPayload.action !== 'retry_dead_letters') {
				throw new Error(`unexpected retry payload: ${JSON.stringify(retryPayload)}`)
			}

			const purgeRes = await context.request.post(`${BASE_URL}/api/admin/sync-queue`, {
				headers: sameOriginHeaders,
				data: { action: 'purge_dead_letters', limit: 5 }
			})
			if (!purgeRes.ok()) throw new Error(`purge dead letters failed: ${purgeRes.status()}`)
			const purgePayload = await purgeRes.json() as { ok?: boolean; action?: string }
			if (!purgePayload.ok || purgePayload.action !== 'purge_dead_letters') {
				throw new Error(`unexpected purge payload: ${JSON.stringify(purgePayload)}`)
			}
		}

		console.log('[admin-sync-queue-smoke] PASS')
	})
}

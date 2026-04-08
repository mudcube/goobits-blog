import { BASE_URL, withAdminPage } from './_helpers'

export async function runAdminPeopleAccessSmoke() {
	await withAdminPage(async (_page, context) => {
		const usersRes = await context.request.get(`${BASE_URL}/api/calendar/admin/users`)
		if (!usersRes.ok()) throw new Error(`users GET failed: ${usersRes.status()}`)
		const usersPayload = await usersRes.json() as { users?: Array<{ id: string | number }> }
		const user = usersPayload.users?.[0]
		if (!user) {
			console.log('[admin-people-access-smoke] PASS (no users)')
			return
		}

		const userId = String(user.id)
		const accessRes = await context.request.get(`${BASE_URL}/api/calendar/admin/users/${userId}/access`)
		if (!accessRes.ok()) throw new Error(`access GET failed: ${accessRes.status()}`)
		const accessPayload = await accessRes.json() as { access: Array<{ programSlug: string; allowed: boolean }> }
		if (!accessPayload.access.length) throw new Error('no program access rows')

		const changed = accessPayload.access.map((row, idx) => ({
			...row,
			allowed: idx === 0 ? !row.allowed : row.allowed
		}))
		const putRes = await context.request.put(`${BASE_URL}/api/calendar/admin/users/${userId}/access`, {
			headers: { origin: BASE_URL, 'content-type': 'application/json' },
			data: { access: changed }
		})
		if (!putRes.ok()) throw new Error(`access PUT failed: ${putRes.status()}`)

		await context.request.put(`${BASE_URL}/api/calendar/admin/users/${userId}/access`, {
			headers: { origin: BASE_URL, 'content-type': 'application/json' },
			data: { access: accessPayload.access }
		})

		console.log('[admin-people-access-smoke] PASS')
	})
}

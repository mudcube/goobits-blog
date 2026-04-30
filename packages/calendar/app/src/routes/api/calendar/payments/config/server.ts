import type { RequestEvent } from '@sveltejs/kit'
import { buildEnv } from '@calendar/kit'
import { getPaymentCheckoutConfig, requireEnv } from '@calendar/core'
import { apiOk, requireCalendarUserId, runCalendarRequest } from '@calendar/kit'

export async function GET(event: RequestEvent) {
	return runCalendarRequest('calendar.payments.config', async () => {
		const user = requireCalendarUserId(event)
		if (user.response) return user.response
		const env = await buildEnv(event.platform)
		const payments = await getPaymentCheckoutConfig({
			db: env.DB,
			env,
			base64Key: requireEnv(env, 'TOKEN_ENC_KEY')
		})
		return apiOk({ payments })
	})
}

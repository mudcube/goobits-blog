import { redirect } from '@sveltejs/kit'
import { validateInvite } from '@calendar/core'
import { buildEnv } from '@calendar/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params, platform }) => {
	let target = `/schedule/login/?invite=${encodeURIComponent(params.code)}`
	try {
		const env = await buildEnv(platform)
		const result = await validateInvite({ db: env.DB, code: params.code })
		const redirectPath = result.valid ? result.invite?.redirect_path : null
		if (redirectPath?.startsWith('/schedule/')) {
			target += `&redirect=${encodeURIComponent(redirectPath)}`
		} else if (params.code.startsWith('gym-')) {
			target += `&redirect=${encodeURIComponent('/schedule/gym/')}`
		}
	} catch {
		if (params.code.startsWith('gym-')) {
			target += `&redirect=${encodeURIComponent('/schedule/gym/')}`
		}
	}
	redirect(302, target)
}

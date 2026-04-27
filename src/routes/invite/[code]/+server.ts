import { redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = ({ params }) => {
	redirect(302, `/schedule/login?invite=${encodeURIComponent(params.code)}`)
}

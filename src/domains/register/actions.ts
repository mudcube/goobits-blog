import { redirect, type Actions, type ServerLoad } from '@sveltejs/kit'
import { setError, superValidate } from 'sveltekit-superforms/server'
import { zod4 as zod } from 'sveltekit-superforms/adapters'
import { mergeRuntimeEnv } from '$lib/server/runtime'
import { getTurnstileSiteKey } from '$lib/server/antiabuse/turnstile-site-key'
import { submitRegisterData } from '$lib/server/register/submit'
import { getRegisterFormDefaults } from './defaults'
import { registerSchema, type RegisterFormData } from './schema'

type RegisterLoadEvent = Parameters<ServerLoad>[0]

export const load = async ({ platform }: RegisterLoadEvent) => {
	const env = mergeRuntimeEnv(platform?.env)
	const form = await superValidate(getRegisterFormDefaults(), zod(registerSchema), { errors: false })
	return {
		form,
		turnstileSiteKey: getTurnstileSiteKey(env)
	}
}

export type RegisterPageData = Awaited<ReturnType<typeof load>>

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(registerSchema))
		if (!form.valid) {
			return setError(form, '', 'Please review the highlighted fields.', { status: 400 })
		}

		const result = await submitRegisterData(event, form.data as RegisterFormData)
		if (!result.ok) {
			return setError(form, '', result.error, { status: result.status })
		}

		throw redirect(303, '/register/success')
	}
}

import { redirect, type Actions, type ServerLoad } from '@sveltejs/kit'
import { setError, superValidate } from 'sveltekit-superforms/server'
import { zod4 as zod } from 'sveltekit-superforms/adapters'
import { mergeRuntimeEnv } from '$lib/server/calendar/runtime'
import { getTurnstileSiteKey } from '$lib/server/antiabuse/turnstile-site-key'
import { submitContactData } from '$lib/server/contact/submit'
import { contactSchema, getContactFormDefaults, type ContactFormData } from '@goobits/contact/core'

export const prerender = false

type ContactLoadEvent = Parameters<ServerLoad>[0]

export const load = async ({ url, platform }: ContactLoadEvent) => {
	const env = mergeRuntimeEnv(platform?.env)
	const form = await superValidate(
		getContactFormDefaults({
			from: url.searchParams.get('from')?.trim() || '',
			topic: url.searchParams.get('topic')?.trim() || '',
			started_at: String(Date.now())
		}),
		zod(contactSchema),
		{ errors: false }
	)

	return {
		form,
		turnstileSiteKey: getTurnstileSiteKey(env)
	}
}

export type ContactPageData = Awaited<ReturnType<typeof load>>

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(contactSchema))
		if (!form.valid) {
			return setError(form, '', 'Please review the highlighted fields.', { status: 400 })
		}

		const result = await submitContactData(event, form.data as ContactFormData)
		if (!result.ok) {
			return setError(form, '', result.error, { status: result.status as 400 | 502 | 503 })
		}

		throw redirect(303, '/contact/thank-you/')
	}
}

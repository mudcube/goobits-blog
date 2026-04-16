import { z } from 'zod'
import { emailSchema } from '$lib/validation/zod/email'
import { trimmedOptionalString } from '$lib/validation/zod/strings'

export const registerSchema = z.object({
	name: z.string().trim().min(1, 'Name is required').max(120, 'Name is required'),
	email: emailSchema,
	password: z.string().min(10, 'Password must be at least 10 characters.').max(255, 'Password is too long.'),
	started_at: trimmedOptionalString(32),
	device_id: trimmedOptionalString(128),
	website: trimmedOptionalString(256),
	['cf-turnstile-response']: trimmedOptionalString(4096)
})

export type RegisterFormData = z.infer<typeof registerSchema>

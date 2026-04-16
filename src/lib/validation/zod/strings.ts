import { z } from 'zod'

export function trimmedOptionalString(maxLength: number) {
	return z.string().trim().max(maxLength).optional().default('')
}

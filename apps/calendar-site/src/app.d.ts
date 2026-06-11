import type { D1DatabaseLike } from '@calendar/kit'
import type { Session, User } from '@goobits/auth/types'

declare global {
	namespace App {
		interface Platform {
			env?: {
				DB?: D1DatabaseLike
				MEDIA?: R2Bucket
				[key: string]: string | D1DatabaseLike | R2Bucket | undefined
			}
		}

		interface Locals {
			user?: User | null
			session?: Session | null
			cspNonce?: string
		}
	}
}

export {}

declare global {
	namespace App {
		interface Platform {
			env?: {
				[key: string]: string | undefined
			}
		}

		interface Locals {
			cspNonce?: string
		}
	}
}

export {}

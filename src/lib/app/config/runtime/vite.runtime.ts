import path from 'path'
import type { UserConfig } from 'vite'
import { getRuntimeEnv } from '../env'

export function getViteRuntimeConfig(
	env: Record<string, string | undefined>,
	packageVersion: string
): Pick<UserConfig, 'define' | 'resolve' | 'server'> {
	const runtime = getRuntimeEnv(env)
	const server: NonNullable<UserConfig['server']> = {
		// Permit requests forwarded through a specific local hostname without broadening host checks.
		allowedHosts: [ 'studio.local' ],
		host: runtime.host,
		open: false,
		port: runtime.port,
		proxy: {},
		watch: {
			ignored: ['**/.svelte-kit-old/**']
		},
		// Vite blocks dot-directories by default. SvelteKit dev client dynamically imports
		// from `/.svelte-kit/...`, so explicitly allow it to avoid 403s and broken hydration.
		fs: {
			allow: [path.resolve('.'), path.resolve('.svelte-kit')]
		}
	}

	if (runtime.httpsKey && runtime.httpsCert) {
		server.https = {
			key: runtime.httpsKey,
			cert: runtime.httpsCert
		}
	}

	return {
		define: {
			'import.meta.env.PACKAGE_VERSION': JSON.stringify(packageVersion),
			'import.meta.env.RECAPTCHA_SITE_KEY': JSON.stringify(runtime.recaptchaSiteKey),
			__SVELTEKIT_PATHS_BASE__: JSON.stringify(''),
			__SVELTEKIT_PATHS_ASSETS__: JSON.stringify(''),
			__SVELTEKIT_APP_DIR__: JSON.stringify('_app'),
			__SVELTEKIT_PATHS_RELATIVE__: 'false'
		},
		resolve: {},
		server
	}
}

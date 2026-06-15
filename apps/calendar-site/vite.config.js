import dotenv from 'dotenv'
import path from 'path'
import { defineConfig } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'

dotenv.config({
	path: './config/env/.env'
})

export default defineConfig({
	build: {
		rollupOptions: {
			external: [
				'node:dns/promises',
				'better-sqlite3',
				'fs',
				'path'
			]
		},
		strict: false,
		target: 'es2020'
	},
	define: {
		'import.meta.env.PACKAGE_VERSION': JSON.stringify('0.1.0'),
		'import.meta.env.RECAPTCHA_SITE_KEY': JSON.stringify(process.env.PUBLIC_TURNSTILE_SITE_KEY ?? ''),
		__SVELTEKIT_PATHS_BASE__: JSON.stringify(''),
		__SVELTEKIT_PATHS_ASSETS__: JSON.stringify(''),
		__SVELTEKIT_APP_DIR__: JSON.stringify('_app'),
		__SVELTEKIT_PATHS_RELATIVE__: 'false'
	},
	envDir: './config/env',
	optimizeDeps: {
		exclude: [ '@goobits/auth', '@goobits/ui', '@calendar/app', '@calendar/core', '@calendar/kit', '@calendar/ui', '@calendar/theme' ]
	},
	ssr: {
		noExternal: [ '@goobits/ui', '@calendar/app', '@calendar/core', '@calendar/kit', '@calendar/ui', '@calendar/theme' ]
	},
	plugins: [
		sveltekit()
	],
	resolve: {
		alias: {
			'@node-rs/argon2': path.resolve('src/lib/stubs/argon2.ts'),
			'argon2': path.resolve('src/lib/stubs/argon2.ts'),
			'@node-rs/bcrypt': path.resolve('src/lib/stubs/bcrypt.ts'),
			'bcrypt': path.resolve('src/lib/stubs/bcrypt.ts')
		},
		dedupe: [ '@sveltejs/kit', 'svelte' ]
	},
	server: {
		host: '0.0.0.0',
		open: false,
		port: 3611,
		watch: {
			ignored: ['**/.svelte-kit-old/**']
		},
		fs: {
			allow: [path.resolve('.')]
		}
	}
})

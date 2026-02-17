import dotenv from 'dotenv'
import packageJson from './package.json'
import { defineConfig } from 'vite'
import { enhancedImages } from '@sveltejs/enhanced-img'
import { sveltekit } from '@sveltejs/kit/vite'
import { getViteRuntimeConfig } from './src/lib/config/runtime/vite.runtime.ts'

dotenv.config({
	path: './config/env/.env'
})

const runtimeConfig = getViteRuntimeConfig(process.env, packageJson.version)

export default defineConfig({
	assetsInclude: [ '**/*.md' ],
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
		target: 'esnext'
	},
	define: runtimeConfig.define,
	envDir: './config/env',
	optimizeDeps: {
		// Treat local workspace deps as source so changes apply in dev and SSR behavior matches prod.
		exclude: [ '*.md', '@goobits/auth', '@miko/ui', '@miko/calendar-ui' ]
	},
	ssr: {
		// Keep workspace UI packages as source during SSR for fast iteration.
		noExternal: [ '@miko/ui', '@miko/calendar-ui' ]
	},
	plugins: [
		enhancedImages(),
		sveltekit()
	],
	resolve: runtimeConfig.resolve,
	server: runtimeConfig.server
})

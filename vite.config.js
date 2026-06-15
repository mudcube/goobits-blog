import dotenv from 'dotenv'
import packageJson from './package.json'
import { defineConfig } from 'vite'
import { enhancedImages } from '@sveltejs/enhanced-img'
import { sveltekit } from '@sveltejs/kit/vite'
import { getViteRuntimeConfig } from './src/lib/app/config/runtime/vite.runtime.ts'

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
				'fs',
				'path'
			]
		},
		strict: false,
		target: 'es2020'
	},
	define: runtimeConfig.define,
	envDir: './config/env',
	optimizeDeps: {
		// Treat local workspace deps as source so changes apply in dev and SSR behavior matches prod.
		exclude: [ '*.md', '@goobits/ui' ]
	},
	ssr: {
		// Keep workspace UI packages as source during SSR for fast iteration.
		noExternal: [ '@goobits/ui' ]
	},
	plugins: [
		enhancedImages(),
		sveltekit()
	],
	resolve: {
		...runtimeConfig.resolve,
		// Ensure a single @sveltejs/kit instance across workspace packages so `redirect()`/`error()`
		// throws are recognized correctly by the app runtime.
		dedupe: [ '@sveltejs/kit', 'svelte' ]
	},
	server: runtimeConfig.server
})

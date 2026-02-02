import dotenv from 'dotenv'
import packageJson from './package.json'
import { defineConfig } from 'vite'
import { enhancedImages } from '@sveltejs/enhanced-img'
import { sveltekit } from '@sveltejs/kit/vite'

dotenv.config({
	path: './config/env/.env'
})

const {
	HOST = '0.0.0.0',
	HTTPS_CERT,
	HTTPS_KEY,
	NODE_ENV,
	PORT = 3020,
	RECAPTCHA_SITE_KEY
} = process.env

const isDev = NODE_ENV === 'development'

export default defineConfig({
	assetsInclude: [ '**/*.md' ],
	build: {
		rollupOptions: {
			external: [ 'node:dns/promises' ]
		},
		strict: false,
		target: 'esnext'
	},
	css: {
		preprocessorOptions: {
			scss: {
				api: 'modern-compiler'
			}
		}
	},
	define: {
		'import.meta.env.PACKAGE_VERSION': JSON.stringify(packageJson.version),
		'import.meta.env.RECAPTCHA_SITE_KEY': JSON.stringify(RECAPTCHA_SITE_KEY),
		__SVELTEKIT_PATHS_BASE__: JSON.stringify(''),
		__SVELTEKIT_PATHS_ASSETS__: JSON.stringify(''),
		__SVELTEKIT_APP_DIR__: JSON.stringify('_app'),
		__SVELTEKIT_PATHS_RELATIVE__: 'false'
	},
	envDir: './config/env',
	optimizeDeps: {
		exclude: [ '*.md' ]
	},
	plugins: [
		enhancedImages(),
		sveltekit()
	],
	server: {
		host: HOST,
		https: HTTPS_KEY && HTTPS_CERT ? {
			key: HTTPS_KEY,
			cert: HTTPS_CERT
		} : undefined,
		open: isDev,
		port: PORT,
		proxy: {}
	}
})

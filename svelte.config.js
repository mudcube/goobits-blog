import 'dotenv/config'
import adapterCloudflare from '@sveltejs/adapter-cloudflare'
import { mdsvex } from 'mdsvex'
import { handlePrerenderHttpError } from './src/lib/app/config/runtime/sveltekit.runtime.js'
import { remarkTableOfContents } from './src/lib/blog/remark-table-of-contents.js'

export default {
	kit: {
		adapter: adapterCloudflare({
			routes: {
				include: [
					'/api/*',
					'/auth/*',
					'/admin',
					'/admin/*',
					'/calendar',
					'/calendar/*',
					'/contact',
					'/contact/*',
					'/register',
					'/register/*',
					'/verify-email',
					'/verify-email/*'
				],
				exclude: [
					'/_app/*',
					'/fonts/*',
					'/media/*',
					'/journal/*',
					'/labs/*',
					'/*.css',
					'/*.js',
					'/*.json',
					'/*.map',
					'/*.png',
					'/*.jpg',
					'/*.jpeg',
					'/*.svg',
					'/*.txt',
					'/*.xml',
					'/*.ico',
					'/*.webp',
					'/*.avif'
				]
			}
		}),
		prerender: {
			handleHttpError: ({ path, message }) => {
				handlePrerenderHttpError(path, message)
			}
		},
		alias: {
			'@config': './src/config',
			'@lib': './src/lib',
			'@media': './src/media',
			'@routes': './src/routes',
			'@src': './src',
			'@static': './static',
			'@packages': './packages',
			'@miko/ui': './packages/ui/src',
			'@calendar/app': './packages/calendar/app/src',
			'@calendar/ui': './packages/calendar/ui/src'
		}
	},
	extensions: [ '.svelte', '.md' ],
	preprocess: [
		mdsvex({
			extensions: [ '.md' ],
			remarkPlugins: [ remarkTableOfContents ],
			smartypants: {
				dashes: 'oldschool'
			}
		})
	]
}

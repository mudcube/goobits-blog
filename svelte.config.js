import 'dotenv/config'
import adapterCloudflare from '@sveltejs/adapter-cloudflare'
import { mdsvex } from 'mdsvex'
import { handlePrerenderHttpError } from './src/lib/config/runtime/sveltekit.runtime.js'
import { remarkTableOfContents } from './src/lib/remarkTableOfContents.js'

export default {
	kit: {
		adapter: adapterCloudflare({
			routes: {
				include: [
					'/api/*',
					'/auth/*',
					'/admin/*',
					'/calendar/*',
					'/register',
					'/register/*',
					'/verify-email',
					'/verify-email/*'
				]
			}
		}),
		prerender: {
			handleHttpError: ({ path, message }) => {
				handlePrerenderHttpError(path, message)
			}
		},
		alias: {
			'@components': './src/components',
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

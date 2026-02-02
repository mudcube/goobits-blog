import 'dotenv/config'
import adapterCloudflare from '@sveltejs/adapter-cloudflare'
import { mdsvex } from 'mdsvex'
import { remarkTableOfContents } from './src/lib/remarkTableOfContents.js'

const { NODE_ENV } = process.env

const isDev = NODE_ENV === 'development'

export default {
	kit: {
		adapter: adapterCloudflare({
			routes: {
				include: ['/*'],
				exclude: ['<all>']
			}
		}),
		prerender: {
			handleHttpError: ({ path, status, message }) => {
				// Ignore 404s for labs subpages (they're static HTML files, not SvelteKit routes)
				if (path.startsWith('/labs/')) {
					console.warn(`Ignoring prerender 404: ${path}`)
					return
				}
				// Ignore errors from dynamic route placeholders (shouldn't be prerendered directly)
				if (path.includes('[') && path.includes(']')) {
					console.warn(`Ignoring prerender error for dynamic route: ${path}`)
					return
				}
				throw new Error(message)
			}
		},
		alias: {
			'@components': './src/components',
			'@config': './src/config',
			'@lib': './src/lib',
			'@media': './src/media',
			'@routes': './src/routes',
			'@src': './src',
			'@static': './static'
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
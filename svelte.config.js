import 'dotenv/config'
import adapterStatic from '@sveltejs/adapter-static'
import { mdsvex } from 'mdsvex'
import { remarkTableOfContents } from './src/lib/remarkTableOfContents.js'

const { NODE_ENV } = process.env

const isDev = NODE_ENV === 'development'

export default {
	kit: {
		adapter: adapterStatic({
			pages: 'build', // Directory for all the pages (default: 'build')
			assets: 'build', // Directory for all the assets (default: 'build')
			fallback: '404.html', // The page that handles 404s and client-side routing (default: undefined)
			precompress: false, // Enable Gzip and Brotli compression (default: false)
			strict: false // Throws if any routes are not prerenderable (default: false)
		}),
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
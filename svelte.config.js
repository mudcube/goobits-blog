import 'dotenv/config'
import adapter from '@sveltejs/adapter-static'
import { mdsvex } from 'mdsvex'
import { remarkTableOfContents } from './src/lib/remarkTableOfContents.js'

const {
	NODE_ENV,
	PORT
} = process.env

const isDev = NODE_ENV === 'development'

export default {
	kit: {
		adapter: adapter({
			out: 'build',
			env: {
				host: '0.0.0.0',
				port: PORT
			}
		}),
		alias: {
			'@components': './src/components',
			'@config': './src/config',
			'@lib': './src/lib',
			'@media': './src/media',
			'@routes': './src/routes',
			'@src': './src',
			'@static': './static'
		},
		trailingSlash: 'never'
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
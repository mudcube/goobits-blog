import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import adapterCloudflare from '@sveltejs/adapter-cloudflare'
import { mdsvex } from 'mdsvex'
import { remarkTableOfContents } from './src/lib/remarkTableOfContents.ts'

const { NODE_ENV } = process.env

const isDev = NODE_ENV === 'development'
const STATIC_DIR = path.join(process.cwd(), 'static')

function hasStaticFile(urlPath) {
	const cleanPath = urlPath.split('?')[0]?.split('#')[0] ?? urlPath
	const normalizedPath = cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath
	const candidates = []
	if (normalizedPath.endsWith('/')) {
		candidates.push(`${normalizedPath}index.html`)
	}
	candidates.push(normalizedPath)
	if (!normalizedPath.endsWith('.html')) {
		candidates.push(`${normalizedPath}.html`)
	}
	return candidates.some(candidate => fs.existsSync(path.join(STATIC_DIR, candidate)))
}

export default {
	kit: {
		adapter: adapterCloudflare({
			routes: {
				include: ['/api/*'],
				exclude: ['<build>', '<files>', '<prerendered>']
			}
		}),
		prerender: {
			handleHttpError: ({ path, status, message }) => {
				// Ignore 404s for labs subpages that exist as static files.
				if (path.startsWith('/labs/') && hasStaticFile(path)) {
					return
				}
				// Ignore errors from dynamic route placeholders (shouldn't be prerendered directly)
				if (path.includes('[') && path.includes(']')) {
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
			'@static': './static',
			'@packages': './packages'
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

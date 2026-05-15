import 'dotenv/config'
import adapterCloudflare from '@sveltejs/adapter-cloudflare'
import { mdsvex } from 'mdsvex'
import { handlePrerenderHttpError } from './src/lib/app/config/runtime/sveltekit.runtime.js'
import { remarkTableOfContents } from './packages/blog/src/utils/remark-table-of-contents.js'
import { rehypeWebpPicture } from './packages/blog/src/utils/rehype-webp-picture.js'

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
					'/schedule',
					'/schedule/*',
					'/blog',
					'/blog/*',
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
			'@goobits/blog-theme-miko': './packages/blog-theme-miko/src/index.ts',
			'@goobits/ui': './packages/ui/src',
			'@calendar/app': './packages/calendar/app/src',
			'@calendar/ui': './packages/calendar/ui/src'
		}
	},
	extensions: ['.svelte', '.md'],
	preprocess: [
		mdsvex({
			extensions: ['.md'],
			remarkPlugins: [remarkTableOfContents],
			rehypePlugins: [rehypeWebpPicture],
			smartypants: {
				dashes: 'oldschool'
			}
		})
	]
}

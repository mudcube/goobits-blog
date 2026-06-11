import adapterCloudflare from '@sveltejs/adapter-cloudflare'

export default {
	kit: {
		adapter: adapterCloudflare({
			routes: {
				include: [
					'/*',
					'/api/*',
					'/auth/*',
					'/admin',
					'/admin/*',
					'/book',
					'/book/*',
					'/events',
					'/events/*',
					'/login',
					'/login/*',
					'/profile',
					'/profile/*',
					'/register',
					'/register/*',
					'/t',
					'/t/*',
					'/verify-email',
					'/verify-email/*'
				],
				exclude: [
					'/_app/*',
					'/fonts/*',
					'/media/*',
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
		alias: {
			'@lib': './src/lib',
			'@src': './src',
			'@static': './static',
			'@calendar/app': '../../packages/calendar/app/src',
			'@calendar/ui': '../../packages/calendar/ui/src',
			'@goobits/ui': '../../packages/ui/src'
		}
	}
}

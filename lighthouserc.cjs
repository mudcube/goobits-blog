module.exports = {
	ci: {
		collect: {
			numberOfRuns: 2,
			startServerCommand: 'pnpm build && pnpm preview --host 0.0.0.0 --port 3000',
			startServerReadyPattern: 'http://localhost:3000',
			url: [
				'http://localhost:3000/',
				'http://localhost:3000/apps/',
				'http://localhost:3000/journal/',
				'http://localhost:3000/journal/2026/04/color-piano-reintroduced/',
				'http://localhost:3000/music/',
				'http://localhost:3000/labs/'
			]
		},
		assert: {
			assertions: {
				'categories:performance': ['warn', { minScore: 0.8 }],
				'largest-contentful-paint': ['warn', { maxNumericValue: 3000 }],
				'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
				'interaction-to-next-paint': ['warn', { maxNumericValue: 300 }],
				'total-byte-weight': ['warn', { maxNumericValue: 900000 }],
				'offscreen-images': 'warn',
				'uses-responsive-images': 'warn',
				'modern-image-formats': 'warn',
				'uses-optimized-images': 'warn'
			}
		},
		upload: {
			target: 'temporary-public-storage'
		}
	}
}

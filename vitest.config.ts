import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		include: ['__tests__/**/*.test.ts', 'packages/calendar/core/__tests__/**/*.test.ts'],
		fileParallelism: false,
		testTimeout: 180_000,
		hookTimeout: 180_000
	}
})

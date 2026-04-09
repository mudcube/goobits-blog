/**
 * Repo defaults for Google Gemini 2.5 Flash Image, commonly called Nano Banana.
 */

const ANTI_FRAME = ' IMPORTANT: No border, no frame, no vignette, no margin, edge-to-edge composition filling the entire canvas.'

export const NANO_BANANA_MODEL = 'gemini-2.5-flash-image'

export const STYLE_PRESETS = Object.freeze({
	storybook: ` Digital illustration in warm storybook style. Painterly brushstrokes with visible texture. Muted earth tones (ochre, sage, amber, cream) and warm golden highlights. Soft diffused lighting like a cozy afternoon. Whimsical, friendly, slightly stylized proportions. No photorealism, no 3D rendering.${ ANTI_FRAME }`,
	product: ` Professional product photography. Clean, bright composition with soft studio lighting. Sharp focus on subject with subtle shadow for depth. True-to-life colors, commercial catalog aesthetic. Authentic textures.${ ANTI_FRAME }`,
	photo: ` Natural lifestyle photography with warm golden-hour lighting. Authentic, candid feel. Shallow depth of field when appropriate. Documentary style, genuine atmosphere. True-to-life colors.${ ANTI_FRAME }`,
	hero: ` Digital illustration in warm storybook style. Painterly brushstrokes with visible texture. Muted earth tones and warm golden highlights. COMPOSITION: Wide cinematic framing, main subject centered in middle third, atmospheric softness and lighter values toward bottom edge for text overlay compatibility, breathing room at all edges. No photorealism, no 3D rendering.${ ANTI_FRAME }`,

	// Legacy aliases for backwards compatibility with older prompts/scripts.
	whimsy: ` Digital illustration in warm storybook style. Painterly brushstrokes with visible texture. Muted earth tones (ochre, sage, amber, cream) and warm golden highlights. Soft diffused lighting like a cozy afternoon. Whimsical, friendly, slightly stylized proportions. No photorealism, no 3D rendering.${ ANTI_FRAME }`,
	realistic: ` Professional product photography. Clean, bright composition with soft studio lighting. Sharp focus on subject with subtle shadow for depth. True-to-life colors, commercial catalog aesthetic. Authentic textures.${ ANTI_FRAME }`,
	minimal: ` Natural lifestyle photography with warm golden-hour lighting. Authentic, candid feel. Shallow depth of field when appropriate. Documentary style, genuine atmosphere. True-to-life colors.${ ANTI_FRAME }`
})

export const VALID_ASPECT_RATIOS = Object.freeze([ '1:1', '2:3', '3:2', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9', '21:9' ])

export const VALID_RESOLUTIONS = Object.freeze([ '1K', '2K', '4K' ])

export const VALID_STYLES = Object.freeze(Object.keys(STYLE_PRESETS))

export const VALID_OUTPUT_MODES = Object.freeze([ 'file', 'base64' ])

export const STYLE_DESCRIPTIONS = Object.freeze({
	storybook: 'Warm storybook illustration for whimsical and mythic content',
	product: 'Professional product photography for catalog and commercial shots',
	photo: 'Natural lifestyle photography for events, landscapes, and documentation',
	hero: 'Wide cinematic storybook illustration optimized for page headers',
	whimsy: 'Legacy alias for storybook',
	realistic: 'Legacy alias for product',
	minimal: 'Legacy alias for photo'
})

export const DIMENSION_TO_ASPECT_RATIO = Object.freeze({
	'600x600': '1:1',
	'500x500': '1:1',
	'400x400': '1:1',
	'300x300': '1:1',
	'300x200': '3:2',
	'600x400': '3:2',
	'900x600': '3:2',
	'1200x800': '3:2',
	'1200x675': '16:9',
	'1200x630': '16:9',
	'1920x1080': '16:9',
	'800x450': '16:9',
	'800x600': '4:3',
	'1200x900': '4:3',
	'400x300': '4:3',
	'1200x600': '16:9',
	'1000x500': '16:9',
	'800x400': '16:9',
	'1200x400': '21:9',
	'1000x400': '21:9',
	'2100x900': '21:9',
	'400x600': '2:3',
	'600x900': '2:3',
	'800x1200': '2:3',
	'300x400': '3:4',
	'600x800': '3:4',
	'900x1200': '3:4',
	'450x800': '9:16',
	'675x1200': '9:16',
	'1080x1920': '9:16',
	'480x600': '4:5',
	'800x1000': '4:5',
	'1080x1350': '4:5'
})

export const DEFAULT_GENERATION_OPTIONS = Object.freeze({
	model: NANO_BANANA_MODEL,
	aspectRatio: '1:1',
	resolution: '1K',
	style: 'whimsy',
	output: 'file',
	outputDir: 'static/media/generated/nano-banana',
	retryAttempts: 3,
	retryBaseDelay: 1000,
	timeoutMs: 60000,
	appendStylePrompt: true
})

function parseDimensions(dimensionStr) {
	const match = dimensionStr.match(/^(\d+)x(\d+)$/)
	if (!match) return null

	const width = parseInt(match[1], 10)
	const height = parseInt(match[2], 10)

	if (width <= 0 || height <= 0 || !isFinite(width) || !isFinite(height)) {
		return null
	}

	if (width > 10000 || height > 10000) {
		return null
	}

	return { width, height }
}

export function getAspectRatioFromUrl(url) {
	try {
		if (!url || typeof url !== 'string') {
			return DEFAULT_GENERATION_OPTIONS.aspectRatio
		}

		const match = url.match(/placehold\.co\/(\d+x\d+)/)
		if (!match) return DEFAULT_GENERATION_OPTIONS.aspectRatio

		const dimensionStr = match[1]
		if (DIMENSION_TO_ASPECT_RATIO[dimensionStr]) {
			return DIMENSION_TO_ASPECT_RATIO[dimensionStr]
		}

		const dims = parseDimensions(dimensionStr)
		if (!dims) {
			return DEFAULT_GENERATION_OPTIONS.aspectRatio
		}

		const ratio = dims.width / dims.height

		if (ratio > 2.2) return '21:9'
		if (ratio > 1.7) return '16:9'
		if (ratio > 1.4) return '3:2'
		if (ratio > 1.2) return '4:3'
		if (ratio > 0.9) return '1:1'
		if (ratio > 0.7) return '3:4'
		if (ratio > 0.55) return '2:3'
		return '9:16'
	} catch {
		return DEFAULT_GENERATION_OPTIONS.aspectRatio
	}
}

export function sleep(ms) {
	const delay = Math.max(0, Math.min(ms, 60000))
	return new Promise(resolve => setTimeout(resolve, delay))
}

export function getBackoffDelay(attempt, baseDelay = DEFAULT_GENERATION_OPTIONS.retryBaseDelay) {
	const safeAttempt = Math.max(0, Math.min(attempt, 10))
	const safeBaseDelay = Math.max(100, Math.min(baseDelay, 10000))
	const exponentialDelay = safeBaseDelay * Math.pow(2, safeAttempt)
	const jitter = Math.random() * 1000
	return Math.min(exponentialDelay + jitter, 30000)
}

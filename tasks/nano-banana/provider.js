import { GoogleGenAI } from '@google/genai'
import dotenv from 'dotenv'
import path from 'path'

import {
	DEFAULT_GENERATION_OPTIONS,
	getBackoffDelay,
	NANO_BANANA_MODEL,
	sleep,
	STYLE_DESCRIPTIONS,
	STYLE_PRESETS,
	VALID_ASPECT_RATIOS,
	VALID_OUTPUT_MODES,
	VALID_RESOLUTIONS,
	VALID_STYLES
} from './config.js'
import {
	createImageFilename,
	describeGenerationError,
	extractImageResult,
	readReferenceImage,
	resolveOutputPath,
	validateBase64Image,
	withTimeout,
	writeBase64Png
} from './utils.js'

dotenv.config({ path: path.resolve(process.cwd(), 'config/env/.env'), quiet: true })
dotenv.config({ quiet: true, override: false })

function mergeOptions(defaults, request) {
	return {
		...defaults,
		...request,
		prompt: request.prompt
	}
}

function validateOptions(options) {
	if (typeof options.prompt !== 'string' || options.prompt.trim().length === 0) {
		throw new Error('Prompt must be a non-empty string')
	}

	if (!VALID_STYLES.includes(options.style)) {
		throw new Error(`Invalid style "${ options.style }". Valid styles: ${ VALID_STYLES.join(', ') }`)
	}

	if (!VALID_ASPECT_RATIOS.includes(options.aspectRatio)) {
		throw new Error(`Invalid aspect ratio "${ options.aspectRatio }". Valid ratios: ${ VALID_ASPECT_RATIOS.join(', ') }`)
	}

	if (!VALID_RESOLUTIONS.includes(options.resolution)) {
		throw new Error(`Invalid resolution "${ options.resolution }". Valid resolutions: ${ VALID_RESOLUTIONS.join(', ') }`)
	}

	if (!VALID_OUTPUT_MODES.includes(options.output)) {
		throw new Error(`Invalid output "${ options.output }". Valid outputs: ${ VALID_OUTPUT_MODES.join(', ') }`)
	}
}

function buildPrompt(options) {
	if (options.appendStylePrompt === false) {
		return options.prompt
	}

	const stylePrompt = STYLE_PRESETS[options.style]
	return stylePrompt ? `${ options.prompt }${ stylePrompt }` : options.prompt
}

async function buildContents(options) {
	const prompt = buildPrompt(options)

	if (!options.referenceImage) {
		return prompt
	}

	const referenceImage = await readReferenceImage(options.referenceImage)

	return [
		{
			inlineData: {
				data: referenceImage.base64Data,
				mimeType: referenceImage.mimeType
			}
		},
		{
			text: `${ prompt }\n\nIMPORTANT: Use the supplied source image as the primary visual reference. Preserve the core subject, composition, silhouette, and overall visual intent unless the prompt explicitly asks for a change. Improve finish, clarity, and polish without replacing the design wholesale.`
		}
	]
}

function buildGenerateConfig(options) {
	const imageConfig = {
		aspectRatio: options.aspectRatio
	}

	if (options.resolution !== '1K') {
		imageConfig.imageSize = options.resolution
	}

	return {
		responseModalities: [ 'IMAGE' ],
		imageConfig
	}
}

export default class NanoBananaProvider {
	constructor(config = {}) {
		this.config = Object.freeze({
			...DEFAULT_GENERATION_OPTIONS,
			...config
		})

		this.apiKey = config.apiKey || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY
		this.ai = null
	}

	getCapabilities() {
		return {
			provider: 'nano-banana',
			displayName: 'Nano Banana (Gemini 2.5 Flash Image)',
			models: [ NANO_BANANA_MODEL ],
			aspectRatios: VALID_ASPECT_RATIOS,
			resolutions: VALID_RESOLUTIONS,
			styles: VALID_STYLES,
			styleDescriptions: STYLE_DESCRIPTIONS,
			outputModes: VALID_OUTPUT_MODES,
			defaults: this.config
		}
	}

	async generateImage(request) {
		const options = mergeOptions(this.config, request || {})
		validateOptions(options)

		let lastError = null
		let lastErrorDescription = null

		for (let attempt = 0; attempt < options.retryAttempts; attempt++) {
			try {
				return await this.generateOnce(options)
			} catch(error) {
				lastError = error
				lastErrorDescription = describeGenerationError(error)

				if (process.env.DEBUG) {
					console.debug('[nano-banana] generation attempt failed', {
						attempt: attempt + 1,
						maxAttempts: options.retryAttempts,
						retry: lastErrorDescription.retry,
						message: error?.message
					})
				}

				if (!lastErrorDescription.retry || attempt === options.retryAttempts - 1) {
					break
				}

				await sleep(getBackoffDelay(attempt, options.retryBaseDelay))
			}
		}

		throw new Error(lastErrorDescription?.message || lastError?.message || 'Image generation failed')
	}

	async generateOnce(options) {
		const contents = await buildContents(options)
		const response = await withTimeout(
			this.getClient().models.generateContent({
				model: options.model,
				contents,
				config: buildGenerateConfig(options)
			}),
			options.timeoutMs
		)

		const { imageData, imageText } = extractImageResult(response)

		if (options.output === 'base64') {
			validateBase64Image(imageData)
			return {
				base64Data: imageData,
				prompt: options.prompt,
				referenceImage: options.referenceImage || null,
				model: options.model,
				aspectRatio: options.aspectRatio,
				resolution: options.resolution,
				style: options.appendStylePrompt === false ? 'none' : options.style,
				imageText
			}
		}

		const filename = createImageFilename(options.prompt, options.filename)
		const { outputDir, outputPath } = resolveOutputPath(options.outputDir, filename)

		await writeBase64Png(outputPath, imageData)

		return {
			path: outputPath,
			relativePath: path.relative(process.cwd(), outputPath),
			filename,
			outputDir: path.relative(process.cwd(), outputDir),
			prompt: options.prompt,
			referenceImage: options.referenceImage || null,
			model: options.model,
			aspectRatio: options.aspectRatio,
			resolution: options.resolution,
			style: options.appendStylePrompt === false ? 'none' : options.style,
			imageText
		}
	}

	getClient() {
		if (!this.apiKey) {
			throw new Error(
				'GOOGLE_API_KEY or GEMINI_API_KEY is required. Use an exported env var or config/env/.env.'
			)
		}

		this.ai ||= new GoogleGenAI({ apiKey: this.apiKey })
		return this.ai
	}
}

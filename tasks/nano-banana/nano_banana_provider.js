/**
 * @fileoverview Nano Banana Provider - MCP-compliant image generation using Google Gemini.
 * @module nano-banana/provider
 */

import { GoogleGenAI } from '@google/genai'
import dotenv from 'dotenv'
import fs from 'fs/promises'
import path from 'path'

import { generateFilename, mcpError, mcpSuccess } from './shared/utils.js'
import {
	DEFAULT_CONFIG,
	getBackoffDelay,
	sleep,
	STYLE_PRESETS,
	VALID_ASPECT_RATIOS,
	VALID_RESOLUTIONS,
	VALID_STYLES
} from './config.js'

dotenv.config({ quiet: true })

const DEFAULT_OUTPUT_DIR = path.resolve(DEFAULT_CONFIG.outputDir)
const API_TIMEOUT_MS = 60000

const PROVIDER_INFO = Object.freeze({
	id: 'nano-banana',
	displayName: 'Nano Banana (Gemini 2.5 Flash Image)',
	version: '2.1.0',
	models: [ 'gemini-2.5-flash-image' ]
})

function safeJoin(root, ...parts) {
	const resolvedRoot = path.resolve(root)
	const fullPath = path.resolve(resolvedRoot, ...parts)
	if (fullPath !== resolvedRoot && !fullPath.startsWith(resolvedRoot + path.sep)) {
		throw new Error(`Path traversal blocked: ${ parts.join('/') }`)
	}
	return fullPath
}

export default class NanoBananaProvider {
	constructor(config = {}) {
		const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY

		if (!apiKey) {
			throw new Error(
				'GOOGLE_API_KEY or GEMINI_API_KEY environment variable is required. ' +
				'Get your key from: https://aistudio.google.com/apikey'
			)
		}

		this.config = Object.freeze({
			...DEFAULT_CONFIG,
			...config
		})

		this.ai = new GoogleGenAI({ apiKey })
	}

	_classifyError(error) {
		const message = error?.message || ''
		const status = error?.status || error?.code

		const fatalPatterns = [
			'INVALID_ARGUMENT',
			'UNAUTHENTICATED',
			'PERMISSION_DENIED',
			'NOT_FOUND',
			'401',
			'403',
			'404'
		]

		for (const pattern of fatalPatterns) {
			if (message.includes(pattern) || status === pattern) {
				return {
					shouldRetry: false,
					isFatal: true,
					userMessage: this._getErrorMessage(error)
				}
			}
		}

		const retryablePatterns = [
			'429',
			'RESOURCE_EXHAUSTED',
			'500',
			'503',
			'DEADLINE_EXCEEDED',
			'UNAVAILABLE',
			'INTERNAL',
			'timeout',
			'ECONNRESET',
			'ETIMEDOUT'
		]

		for (const pattern of retryablePatterns) {
			if (message.includes(pattern) || status === pattern) {
				return {
					shouldRetry: true,
					isFatal: false,
					userMessage: this._getErrorMessage(error)
				}
			}
		}

		return {
			shouldRetry: false,
			isFatal: false,
			userMessage: message || 'Unknown error occurred'
		}
	}

	_getErrorMessage(error) {
		const message = error?.message || ''

		if (message.includes('UNAUTHENTICATED') || message.includes('401')) {
			return 'Authentication failed. Check your API key.'
		}
		if (message.includes('PERMISSION_DENIED') || message.includes('403')) {
			return 'Permission denied. Check API key permissions.'
		}
		if (message.includes('RESOURCE_EXHAUSTED') || message.includes('429')) {
			return 'Rate limit exceeded. Please wait before retrying.'
		}
		if (message.includes('INVALID_ARGUMENT')) {
			return 'Invalid request parameters.'
		}
		if (message.includes('timeout') || message.includes('DEADLINE_EXCEEDED')) {
			return 'Request timed out. Please try again.'
		}
		if (message.includes('500') || message.includes('INTERNAL')) {
			return 'Server error. Please try again.'
		}
		if (message.includes('503') || message.includes('UNAVAILABLE')) {
			return 'Service temporarily unavailable. Please try again.'
		}

		return message || 'Unknown error occurred'
	}

	async _withTimeout(apiPromise, timeoutMs = API_TIMEOUT_MS) {
		let timeoutId

		const timeoutPromise = new Promise((_, reject) => {
			timeoutId = setTimeout(() => {
				reject(new Error(`API call timeout after ${ timeoutMs / 1000 } seconds`))
			}, timeoutMs)
		})

		try {
			const result = await Promise.race([ apiPromise, timeoutPromise ])
			clearTimeout(timeoutId)
			return result
		} catch(error) {
			clearTimeout(timeoutId)
			throw error
		}
	}

	_validateResponse(response) {
		if (!response) {
			return { valid: false, error: 'API returned null response' }
		}

		if (!Array.isArray(response.candidates) || response.candidates.length === 0) {
			return { valid: false, error: 'API response has no candidates' }
		}

		const candidate = response.candidates[0]

		if (!candidate.content) {
			return { valid: false, error: 'API response candidate has no content' }
		}

		if (!Array.isArray(candidate.content.parts) || candidate.content.parts.length === 0) {
			return { valid: false, error: 'API response has no content parts' }
		}

		return { valid: true, parts: candidate.content.parts }
	}

	_validateBase64(data) {
		if (typeof data !== 'string') {
			return { valid: false, error: 'Image data is not a string' }
		}

		if (data.length === 0) {
			return { valid: false, error: 'Image data is empty' }
		}

		if (!/^[A-Za-z0-9+/]*={0,2}$/.test(data)) {
			return { valid: false, error: 'Image data contains invalid base64 characters' }
		}

		return { valid: true }
	}

	_isPathSafe(outputPath, allowedDir) {
		try {
			const resolvedOutput = path.resolve(outputPath)
			const resolvedAllowed = path.resolve(allowedDir)
			return resolvedOutput.startsWith(resolvedAllowed + path.sep) ||
				resolvedOutput === resolvedAllowed
		} catch {
			return false
		}
	}

	async mcp_generate_image(request) {
		if (!request || !request.prompt) {
			return mcpError('invalid_request', 'Prompt is required')
		}

		if (typeof request.prompt !== 'string' || request.prompt.trim().length === 0) {
			return mcpError('invalid_request', 'Prompt must be a non-empty string')
		}

		const style = request.style || this.config.style
		const aspectRatio = request.aspectRatio || this.config.aspectRatio
		const resolution = request.resolution || this.config.resolution
		const model = request.model || this.config.model

		if (style && !VALID_STYLES.includes(style)) {
			return mcpError(
				'invalid_request',
				`Invalid style: ${ style }. Valid options: ${ VALID_STYLES.join(', ') }`
			)
		}

		if (!VALID_ASPECT_RATIOS.includes(aspectRatio)) {
			return mcpError(
				'invalid_request',
				`Invalid aspect ratio: ${ aspectRatio }. Valid options: ${ VALID_ASPECT_RATIOS.join(', ') }`
			)
		}

		if (!VALID_RESOLUTIONS.includes(resolution)) {
			return mcpError(
				'invalid_request',
				`Invalid resolution: ${ resolution }. Valid options: ${ VALID_RESOLUTIONS.join(', ') }`
			)
		}

		if (request.outputDir) {
			const targetDir = path.resolve(request.outputDir)
			const cwd = process.cwd()
			const defaultDir = path.resolve(DEFAULT_OUTPUT_DIR)

			const isAllowed = targetDir.startsWith(cwd + path.sep) ||
				targetDir === cwd ||
				targetDir.startsWith(defaultDir + path.sep) ||
				targetDir === defaultDir

			if (!isAllowed) {
				return mcpError('invalid_request', 'Output directory is outside allowed paths')
			}
		}

		const stylePrompt = STYLE_PRESETS[style] || ''
		const fullPrompt = request.appendStylePrompt !== false && stylePrompt
			? `${ request.prompt }${ stylePrompt }`
			: request.prompt

		let lastError = null
		let lastClassification = null

		for (let attempt = 0; attempt < this.config.retryAttempts; attempt++) {
			try {
				return await this._generateWithApi(fullPrompt, {
					model,
					aspectRatio,
					resolution,
					style,
					originalPrompt: request.prompt,
					output: request.output,
					outputDir: request.outputDir,
					filename: request.filename
				})
			} catch(error) {
				lastError = error
				lastClassification = this._classifyError(error)

				if (process.env.DEBUG) {
					console.debug('[Nano Banana] Attempt failed', {
						attempt: attempt + 1,
						maxAttempts: this.config.retryAttempts,
						message: error?.message,
						shouldRetry: lastClassification.shouldRetry,
						isFatal: lastClassification.isFatal
					})
				}

				if (lastClassification.isFatal) {
					break
				}

				if (lastClassification.shouldRetry && attempt < this.config.retryAttempts - 1) {
					const delay = getBackoffDelay(attempt)
					await sleep(delay)
					continue
				}

				break
			}
		}

		return mcpError(
			'provider_error',
			lastClassification?.userMessage || lastError?.message || 'Unknown error after retries',
			String(lastError)
		)
	}

	async _generateWithApi(prompt, options) {
		const { model, aspectRatio, resolution, style, originalPrompt, output, outputDir, filename } = options

		const generateConfig = {
			responseModalities: [ 'IMAGE' ],
			imageConfig: {
				aspectRatio
			}
		}

		if (resolution !== '1K') {
			generateConfig.imageConfig.imageSize = resolution
		}

		const apiPromise = this.ai.models.generateContent({
			model,
			contents: prompt,
			config: generateConfig
		})

		const response = await this._withTimeout(apiPromise, API_TIMEOUT_MS)

		const validation = this._validateResponse(response)
		if (!validation.valid) {
			throw new Error(validation.error)
		}

		let imageData = null
		let imageText = null

		for (const part of validation.parts) {
			if (part.text) {
				imageText = part.text
			} else if (part.inlineData) {
				imageData = part.inlineData.data
			}
		}

		if (!imageData) {
			const partTypes = validation.parts.map(p => Object.keys(p).join(',')).join('; ')
			throw new Error(`No image data in response. Parts found: [${ partTypes }]`)
		}

		const base64Validation = this._validateBase64(imageData)
		if (!base64Validation.valid) {
			throw new Error(base64Validation.error)
		}

		if (output === 'url') {
			return mcpSuccess({
				base64Data: imageData,
				prompt: originalPrompt,
				model,
				aspectRatio,
				resolution,
				style,
				imageText,
				note: 'Gemini returns base64 data. Use output=file to save locally.'
			})
		}

		const targetDir = outputDir || DEFAULT_OUTPUT_DIR
		const generatedFilename = generateFilename(originalPrompt, filename)
		const outputPath = safeJoin(targetDir, generatedFilename)

		if (!this._isPathSafe(outputPath, targetDir)) {
			throw new Error('Generated output path is outside target directory')
		}

		try {
			await fs.mkdir(targetDir, { recursive: true })

			let buffer
			try {
				buffer = Buffer.from(imageData, 'base64')
			} catch(decodeError) {
				throw new Error(`Failed to decode base64 image data: ${ decodeError.message }`)
			}

			if (buffer.length === 0) {
				throw new Error('Decoded image buffer is empty')
			}

			await fs.writeFile(outputPath, buffer)
		} catch(fsError) {
			throw new Error(`Failed to save image: ${ fsError.message }`)
		}

		return mcpSuccess({
			path: outputPath,
			relativePath: path.relative(process.cwd(), outputPath),
			filename: generatedFilename,
			prompt: originalPrompt,
			model,
			aspectRatio,
			resolution,
			style,
			imageText
		})
	}

	async mcp_get_capabilities() {
		return mcpSuccess({
			provider: PROVIDER_INFO.id,
			displayName: PROVIDER_INFO.displayName,
			version: PROVIDER_INFO.version,
			models: PROVIDER_INFO.models,
			functions: [ 'generate_image' ],
			aspect_ratios: VALID_ASPECT_RATIOS,
			resolutions: VALID_RESOLUTIONS,
			styles: VALID_STYLES,
			style_descriptions: {
				storybook: 'Warm storybook illustration for whimsical and mythic content',
				product: 'Professional product photography for catalog and commercial shots',
				photo: 'Natural lifestyle photography for events, landscapes, and documentation',
				hero: 'Wide cinematic storybook illustration optimized for page headers',
				whimsy: 'Legacy alias for storybook',
				realistic: 'Legacy alias for product',
				minimal: 'Legacy alias for photo'
			},
			features: [
				'text-to-image',
				'aspect-ratio-control',
				'resolution-control',
				'style-presets',
				'retry-with-backoff',
				'request-timeout'
			]
		})
	}
}

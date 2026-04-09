/**
 * @fileoverview Nano Banana Client - High-level API for image generation.
 * @module nano-banana/client
 */

import NanoBananaProvider from './nano_banana_provider.js'

export default class NanoBananaClient {
	constructor(config = {}) {
		this.provider = new NanoBananaProvider(config)
	}

	_extractErrorMessage(response) {
		if (!response) {
			return 'Provider returned null response'
		}

		if (!response.error) {
			return 'Unknown error'
		}

		const message = response.error.message || 'Unknown error'
		const details = response.error.details ? ` (${ response.error.details })` : ''
		return `${ message }${ details }`
	}

	_validateResponse(response) {
		if (!response) {
			return { valid: false, error: 'Provider returned null response' }
		}

		if (typeof response !== 'object') {
			return { valid: false, error: 'Provider returned invalid response type' }
		}

		if (!response.status) {
			return { valid: false, error: 'Provider response missing status field' }
		}

		if (response.status === 'error') {
			return { valid: false, error: this._extractErrorMessage(response) }
		}

		if (response.status !== 'success') {
			return { valid: false, error: `Unknown response status: ${ response.status }` }
		}

		if (!response.result || typeof response.result !== 'object') {
			return { valid: false, error: 'Provider response missing result field' }
		}

		return { valid: true }
	}

	async generateImage(options) {
		if (!options) {
			throw new Error('Options object is required')
		}

		if (!options.prompt) {
			throw new Error('Prompt is required to generate an image')
		}

		if (typeof options.prompt !== 'string') {
			throw new Error('Prompt must be a string')
		}

		if (options.prompt.trim().length === 0) {
			throw new Error('Prompt cannot be empty')
		}

		let response
		try {
			response = await this.provider.mcp_generate_image(options)
		} catch(providerError) {
			throw new Error(`Provider error: ${ providerError.message || providerError }`)
		}

		const validation = this._validateResponse(response)
		if (!validation.valid) {
			throw new Error(`Image generation failed: ${ validation.error }`)
		}

		return response.result
	}

	async getCapabilities() {
		let response
		try {
			response = await this.provider.mcp_get_capabilities()
		} catch(providerError) {
			throw new Error(`Provider error: ${ providerError.message || providerError }`)
		}

		const validation = this._validateResponse(response)
		if (!validation.valid) {
			throw new Error(`Failed to get capabilities: ${ validation.error }`)
		}

		return response.result
	}
}

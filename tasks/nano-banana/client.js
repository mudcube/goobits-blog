import NanoBananaProvider from './provider.js'

export default class NanoBananaClient {
	constructor(config = {}) {
		this.provider = new NanoBananaProvider(config)
	}

	generateImage(options) {
		return this.provider.generateImage(options)
	}

	getCapabilities() {
		return this.provider.getCapabilities()
	}
}

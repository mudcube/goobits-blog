import crypto from 'crypto'
import path from 'path'

export function mcpSuccess(result) {
	return {
		status: 'success',
		result
	}
}

export function mcpError(code, message, details = undefined) {
	return {
		status: 'error',
		error: {
			code,
			message,
			...(details ? { details } : {})
		}
	}
}

function sanitizeFilename(value) {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9._-]+/g, '-')
		.replace(/-{2,}/g, '-')
		.replace(/^[._-]+|[._-]+$/g, '')
		.slice(0, 80)
}

export function generateFilename(prompt, filename = undefined) {
	const parsedName = filename ? path.parse(filename).name : ''
	const baseName = sanitizeFilename(parsedName || prompt || 'image') || 'image'

	if (filename) {
		return `${ baseName }.png`
	}

	const hash = crypto
		.createHash('sha256')
		.update(`${ prompt }\n${ Date.now() }\n${ crypto.randomUUID() }`)
		.digest('hex')
		.slice(0, 8)

	return `${ baseName }-${ hash }.png`
}

export class TransportValidationError extends Error {
	status: number

	constructor(message: string, status = 400) {
		super(message)
		this.name = 'TransportValidationError'
		this.status = status
	}
}

export function asTransportErrorMessage(error: unknown, fallback = 'Invalid request payload') {
	if (error instanceof TransportValidationError) return error.message
	return fallback
}

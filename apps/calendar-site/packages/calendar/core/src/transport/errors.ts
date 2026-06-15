/**
 * Error-class convention for the calendar federation:
 *
 *   • `TransportValidationError` — thrown when an HTTP request payload
 *     fails first-line validation (missing field, bad type, value out of
 *     range, format-not-allowed, "program has events so can't be
 *     deleted"). The route handler's `runApiRequest({ onError })` maps
 *     these to user-facing responses (default 400, override via
 *     `status` for 409 etc.). Use when the user can correct the input
 *     and retry.
 *
 *   • plain `Error` — thrown for operational failures (API call returned
 *     500, missing env var, invariant violation that shouldn't be
 *     reachable, internal consistency bug). Bubbles up to the route's
 *     generic error handler and renders as a 500 to the client. Use
 *     when the user can't do anything to fix it.
 *
 * Don't introduce custom Error subclasses without a clear reason — the
 * route handler shape only knows about TransportValidationError, and
 * other domain exceptions are unlikely to need custom typing.
 */
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

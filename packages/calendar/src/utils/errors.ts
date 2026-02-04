export function toErrorResponse(err: unknown) {
	if (err instanceof Error) {
		return { error: err.message }
	}
	return {
		error: 'Unknown error'
	}
}

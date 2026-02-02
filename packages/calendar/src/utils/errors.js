export function toErrorResponse(err) {
	return {
		error: err?.message ?? 'Unknown error'
	}
}

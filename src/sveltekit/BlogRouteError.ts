export class BlogRouteError extends Error {
	readonly status: number

	constructor(status: number, message: string) {
		super(message)
		this.name = 'BlogRouteError'
		this.status = status
	}
}

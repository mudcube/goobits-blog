import type { RequestEvent } from '@sveltejs/kit'
import { disconnectCalendarProvider } from '../../disconnect'

export async function POST(event: RequestEvent) {
	return disconnectCalendarProvider('outlook', event)
}

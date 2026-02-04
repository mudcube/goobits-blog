/**
 * @typedef {Object} CalendarProvider
 * @property {(input: { timeMin: string, timeMax: string, calendarIds: string[] }) => Promise<{ busy: Array<{ start: string, end: string }> }>} freeBusy
 * @property {(input: { calendarId: string, event: Object }) => Promise<{ id: string, htmlLink?: string }>} createEvent
 * @property {(input: { calendarId: string, eventId: string }) => Promise<void>} deleteEvent
 */

export {}

import type { AdminEventsResponse, AdminProgramsResponse } from '@calendar/ui/api/admin'
import type { CalendarPaymentDefaultsResponse } from '@calendar/ui/api/calendar'

export type MockCrewUser = {
	id: string
	name: string
	email: string
	role?: string
	isSelf?: boolean
	created_at?: number
}

export type MockCrewInvite = {
	id: string
	code: string
	email: string
	created_at: number
	expires_in_days?: number
}

export type AdminMockCatalog = {
	dashboardEvents: AdminEventsResponse['upcoming']
	dashboardRecentEvents: AdminEventsResponse['recent']
	programs: AdminProgramsResponse['programs']
	crewUsers: MockCrewUser[]
	crewInvites: MockCrewInvite[]
	paymentDefaults: CalendarPaymentDefaultsResponse['payment']
}

const EMPTY_ADMIN_MOCK_CATALOG: AdminMockCatalog = {
	dashboardEvents: [],
	dashboardRecentEvents: [],
	programs: [],
	crewUsers: [],
	crewInvites: [],
	paymentDefaults: {
		provider: 'venmo',
		handle: ''
	}
}

let adminMockCatalog: AdminMockCatalog = {
	...EMPTY_ADMIN_MOCK_CATALOG
}

export function configureAdminMockCatalog(input: Partial<AdminMockCatalog>) {
	adminMockCatalog = {
		...adminMockCatalog,
		...input
	}
	return getAdminMockCatalog()
}

export function getAdminMockCatalog(): AdminMockCatalog {
	return adminMockCatalog
}

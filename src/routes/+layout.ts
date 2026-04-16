import { applyMikoCalendarPreset } from '@calendar/preset-miko'
import { configureAdminMockCatalog } from '@calendar/ui/admin/mock/catalog'
import {
	mockCrewInvites,
	mockCrewUsers,
	mockDashboardEvents,
	mockDashboardRecentEvents,
	mockPaymentDefaults,
	mockPrograms
} from '$lib/app/schedule/admin/mock-data'

applyMikoCalendarPreset()
configureAdminMockCatalog({
	dashboardEvents: mockDashboardEvents,
	dashboardRecentEvents: mockDashboardRecentEvents,
	programs: mockPrograms,
	crewUsers: mockCrewUsers,
	crewInvites: mockCrewInvites,
	paymentDefaults: mockPaymentDefaults
})

export const prerender = true
export const trailingSlash = 'always'

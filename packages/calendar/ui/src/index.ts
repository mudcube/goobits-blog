import CalendarShellLayout from './layouts/CalendarShellLayout.svelte'

import CalendarHomePage from './member/home/CalendarHomePage.svelte'
import ActivityBookingPage from './member/booking/ActivityBookingPage.svelte'
import CalendarProfilePage from './member/profile/CalendarProfilePage.svelte'

import AdminLoginCard from './admin/auth/AdminLoginCard.svelte'
import AdminRouteShell from './admin/shell/AdminRouteShell.svelte'
import AdminCalendarPanel from './admin/availability/AdminCalendarPanel.svelte'
import AdminDashboardPanel from './admin/dashboard/AdminDashboardPanel.svelte'
import AdminWeekGrid from './admin/dashboard/AdminWeekGrid.svelte'
import AdminNeedsAttention from './admin/dashboard/AdminNeedsAttention.svelte'
import AdminMemoriesRail from './admin/dashboard/AdminMemoriesRail.svelte'
import AdminEventDetailSheet from './admin/events/AdminEventDetailSheet.svelte'
import AdminMembersPanel from './admin/members/AdminMembersPanel.svelte'
import AdminIntegrationsPanel from './admin/integrations/google/AdminIntegrationsPanel.svelte'
import PillButton from './primitives/CalendarPillButton.svelte'
import Button from './primitives/CalendarButton.svelte'
import Hero from './primitives/CalendarHero.svelte'
import ShellNav from './primitives/CalendarShellNav.svelte'

export {
	CalendarShellLayout,
	CalendarHomePage,
	ActivityBookingPage,
	CalendarProfilePage,
	AdminLoginCard,
	AdminRouteShell,
	AdminCalendarPanel,
	AdminDashboardPanel,
	AdminWeekGrid,
	AdminNeedsAttention,
	AdminMemoriesRail,
	AdminEventDetailSheet,
	AdminMembersPanel,
	AdminIntegrationsPanel,
	PillButton,
	Button,
	Hero,
	ShellNav,
	PillButton as CalendarPillButton,
	Button as CalendarButton,
	Hero as CalendarHero,
	ShellNav as CalendarShellNav
}

// Booking flow components
export {
	SkyTrack,
	SpotlightTour,
	StepIndicator,
	TimeReadout,
	TimeStep,
	CrewCard,
	CalendarStep,
	BookedStep,
	InlineClaim
} from './booking'
export type { TourStep, Person, OpenDay, HourlyWeather } from './booking'
export { ft, fDur, formatDate, buildMockOpenDays } from './booking'
export type { Activity } from './booking'

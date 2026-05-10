import CalendarShellLayout from './layouts/CalendarShellLayout.svelte'

import CalendarHomePage from './member/home/CalendarHomePage.svelte'
import ActivityBookingPage from './member/booking/ActivityBookingPage.svelte'
import CalendarProfilePage from './member/profile/CalendarProfilePage.svelte'

import AdminLoginCard from './admin/auth/AdminLoginCard.svelte'
import AdminRouteShell from './admin/shell/AdminRouteShell.svelte'
import AdminCalendarPanel from './admin/availability/AdminCalendarPanel.svelte'
import AdminWeekGrid from './admin/dashboard/AdminWeekGrid.svelte'
import AdminMemoriesRail from './admin/dashboard/AdminMemoriesRail.svelte'
import AdminEventDetailSheet from './admin/events/AdminEventDetailSheet.svelte'
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
	AdminWeekGrid,
	AdminMemoriesRail,
	AdminEventDetailSheet,
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
export { ft, fDur, formatDate, buildMockOpenDays, eventToOpenDay } from './booking'
export type { Activity } from './booking'

import {
  beginCalendarOAuth,
  buildInviteLink,
  cleanupAdminE2EData,
  disconnectCalendarOAuth,
  disconnectOutlookCalendarOAuth,
  connectAppleCalendar,
  disconnectAppleCalendar,
  fetchAdminPaymentIntegrations,
  fetchAdminEvents,
  fetchAdminPrograms,
  fetchAdminStatus,
  fetchCalendarMembersData,
  persistAdminEventCapacity,
  persistAdminEventDetails,
  persistAdminEventAttendance,
  persistAdminEventMemory,
  persistAdminEventHero,
  clearAdminEventHero,
  removeAdminEvent,
  persistAdminEvents,
  persistAdminProgram,
  persistAdminRules,
  processAdminSyncQueue,
  purgeAdminSyncDeadLetters,
  persistInvite,
  persistPayPalIntegration,
  persistSquareIntegration,
  removePaymentIntegration,
  removeAdminProgram,
  reorderAdminPrograms,
  retryAdminSyncDeadLetters,
  saveAdminProgram,
  removeInvite,
  type AdminRulesState,
} from "../shared/admin";
import {
  getCalendarAdminEventDetail,
  getCalendarAdminEventTemplates,
  getCalendarAdminPaymentDefaults,
  promoteCalendarWaitlistEntry,
  saveCalendarAdminPaymentDefaults,
} from "../../api/calendar";

async function runSuccess(task: () => Promise<unknown>) {
  await task();
  return { ok: true, error: "" };
}

export async function loadDashboardStatus() {
  const data = await fetchAdminStatus();
  return {
    connected: data.google.connected,
    connectionExpired: data.google.expired,
    connectionRefreshFailed: data.google.refreshFailed ?? false,
    oauth: data.oauth,
    syncQueue: data.syncQueue,
    rules: data.rules,
    paymentDefaults: data.paymentDefaults,
    paymentIntegrations: data.paymentIntegrations,
    sync: data.sync,
  };
}

export async function loadDashboardBookings() {
  const data = await fetchAdminEvents();
  const bookings = data.upcoming.map((event) => ({
    id: event.id,
    date: new Date(event.startsAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    time: `${new Date(event.startsAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} – ${new Date(event.endsAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`,
    title: event.title,
    activityLabel: event.activityLabel,
    seats: event.seatsTaken,
    capacity: event.capacity,
    status: event.seatsLeft > 0 ? "open" : "full",
  }));
  return {
    error: "",
    bookings,
    stats: {
      upcoming: bookings.length,
      seats: bookings.reduce((sum, booking) => sum + booking.seats, 0),
    },
  };
}

export async function saveDashboardRules(input: AdminRulesState) {
  return runSuccess(() => persistAdminRules(input));
}

export async function loadMembersData() {
  const { invitesData, usersData } = await fetchCalendarMembersData();

  return {
    invites: invitesData.invites,
    users: usersData.users,
    error: "",
  };
}

export async function createMemberInvite(input: {
  email: string | null;
  uses: number;
  expiresInDays: number;
}) {
  return runSuccess(() => persistInvite(input));
}

export async function deleteMemberInvite(id: string) {
  return runSuccess(() => removeInvite(id));
}

export async function cleanupDevE2EData() {
  return cleanupAdminE2EData();
}

export async function getCalendarReconnectUrl(
  provider: "google" | "outlook" = "google",
) {
  const data = await beginCalendarOAuth({ provider });
  return { ok: true, authUrl: data.authUrl, error: "" };
}

export async function disconnectCalendarReconnect() {
  return runSuccess(() => disconnectCalendarOAuth());
}

export async function disconnectOutlookCalendarReconnect() {
  return runSuccess(() => disconnectOutlookCalendarOAuth());
}

export async function connectAppleCalendarCredentials(input: {
  username: string;
  appPassword: string;
  calendarUrl: string;
}) {
  return runSuccess(() => connectAppleCalendar(input));
}

export async function disconnectAppleCalendarReconnect() {
  return runSuccess(() => disconnectAppleCalendar());
}

export async function loadPaymentIntegrations() {
  const data = await fetchAdminPaymentIntegrations();
  return { ok: true, payments: data.payments, error: "" };
}

export async function savePayPalIntegration(input: {
  clientId: string;
  clientSecret: string;
  environment: "sandbox" | "live";
}) {
  return runSuccess(() => persistPayPalIntegration(input));
}

export async function saveSquareIntegration(input: {
  applicationId: string;
  locationId: string;
  accessToken: string;
  environment: "sandbox" | "live";
}) {
  return runSuccess(() => persistSquareIntegration(input));
}

export async function deletePaymentIntegration(provider: "paypal" | "square") {
  return runSuccess(() => removePaymentIntegration(provider));
}

export async function loadAdminPrograms() {
  const data = await fetchAdminPrograms();
  return {
    error: "",
    programs: data.programs,
  };
}

export async function updateAdminProgram(input: {
  slug: string;
  enabled: boolean;
}) {
  return runSuccess(() => persistAdminProgram(input));
}

export async function saveDashboardProgram(input: {
  slug: string;
  label: string;
  activityName: string;
  pageTitle: string;
  eyebrow: string;
  heroTitleLine1: string;
  heroTitleLine2?: string;
  heroSubtitle: string;
  description: string;
  icon: string;
  eyebrowClass?: string;
  glowClass?: string;
  formGlowClass?: string;
  serviceStatusNote?: string;
  enabled: boolean;
  sortOrder: number;
}) {
  return runSuccess(() => saveAdminProgram(input));
}

export async function deleteDashboardProgram(slug: string) {
  return runSuccess(() => removeAdminProgram(slug));
}

export async function reorderDashboardPrograms(
  orders: ReadonlyArray<{ slug: string; sortOrder: number }>,
) {
  return runSuccess(() => reorderAdminPrograms(orders));
}

export async function loadAdminEventsData() {
  const data = await fetchAdminEvents();
  return {
    error: "",
    upcoming: data.upcoming,
    recent: data.recent,
  };
}

export async function createAdminEventsBatch(input: {
  activitySlug: string;
  title: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  costCents?: number;
  currency?: string;
  paymentProvider?: string;
  paymentHandle?: string;
  paymentNoteTemplate?: string;
  repeatWeeks?: number;
  location?: string;
  note?: string;
}) {
  return runSuccess(() => persistAdminEvents(input));
}

export async function updateAdminEventCapacityValue(
  eventId: number,
  capacity: number,
) {
  return runSuccess(() => persistAdminEventCapacity(eventId, capacity));
}

export async function updateAdminEventDetailsValue(
  eventId: number,
  input: { title: string; startsAt: string; endsAt: string },
) {
  return runSuccess(() => persistAdminEventDetails(eventId, input));
}

export async function updateAdminEventAttendanceValue(
  eventId: number,
  input: {
    userId: string;
    attendanceStatus: "unknown" | "attended" | "flaked";
  },
) {
  return runSuccess(() => persistAdminEventAttendance(eventId, input));
}

export async function updateAdminEventMemoryValue(
  eventId: number,
  input: { recapText?: string; heroImageUrl?: string },
) {
  return runSuccess(() => persistAdminEventMemory(eventId, input));
}

export async function uploadAdminEventHeroValue(eventId: number, file: File) {
  try {
    const result = await persistAdminEventHero(eventId, file);
    return { ok: true as const, error: "", url: result.url };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to upload image";
    return { ok: false as const, error: message, url: "" as string };
  }
}

export async function clearAdminEventHeroValue(eventId: number) {
  return runSuccess(() => clearAdminEventHero(eventId));
}

export async function deleteAdminEventValue(eventId: number) {
  return runSuccess(() => removeAdminEvent(eventId));
}

export async function processDashboardSyncQueue(limit = 10) {
  return runSuccess(() => processAdminSyncQueue(limit));
}

export async function retryDashboardSyncDeadLetters(limit = 10) {
  return runSuccess(() => retryAdminSyncDeadLetters(limit));
}

export async function purgeDashboardSyncDeadLetters(limit = 50) {
  return runSuccess(() => purgeAdminSyncDeadLetters(limit));
}

export async function loadAdminPaymentDefaults() {
  return getCalendarAdminPaymentDefaults();
}

export async function saveAdminPaymentDefaults(
  input: Parameters<typeof saveCalendarAdminPaymentDefaults>[0],
) {
  return runSuccess(() => saveCalendarAdminPaymentDefaults(input));
}

export async function loadAdminEventTemplates() {
  return getCalendarAdminEventTemplates();
}

export async function loadAdminEventDetail(eventId: number) {
  return getCalendarAdminEventDetail(eventId);
}

export async function promoteWaitlistEntry(eventId: number, entryId: number) {
  return promoteCalendarWaitlistEntry(eventId, entryId);
}

export function createInviteShareLink(origin: string, code: string) {
  return buildInviteLink(origin, code);
}

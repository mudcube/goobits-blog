import type { AdminBootstrap } from "@calendar/core";
import { createProgramsController } from "../programs/programs-controller.svelte";
import { createSyncController } from "../settings/sync-controller.svelte";
import { DEFAULT_ADMIN_RULES, DEFAULT_ADMIN_STATS } from "../shared/admin";
import {
  createAdminEventsBatch,
  deletePaymentIntegration,
  loadAdminEventsData,
  loadAdminPaymentDefaults,
  loadPaymentIntegrations,
  loadAdminEventTemplates,
  loadAdminEventDetail,
  loadDashboardBookings,
  loadDashboardStatus,
  promoteWaitlistEntry,
  saveAdminPaymentDefaults,
  saveDashboardRules,
  savePayPalIntegration,
  saveSquareIntegration,
  updateAdminEventCapacityValue,
  updateAdminEventDetailsValue,
  updateAdminEventAttendanceValue,
  updateAdminEventMemoryValue,
  updateAdminEventRecapValue,
  uploadAdminEventHeroValue,
  clearAdminEventHeroValue,
  deleteAdminEventValue,
} from "./admin-dashboard";

type UnauthorizedHandler = (error: unknown) => boolean;

type DashboardControllerOptions = {
  onUnauthorized?: UnauthorizedHandler;
};

type PaymentIntegrations = {
  paypal: {
    clientId: string | null;
    environment: "sandbox" | "live";
    source: "stored" | "env" | null;
    enabled: boolean;
  };
  square: {
    applicationId: string | null;
    locationId: string | null;
    environment: "sandbox" | "production";
    source: "stored" | "env" | null;
    enabled: boolean;
  };
};

type PaymentProviderKey = "venmo" | "paypal" | "cashapp";

type PaymentDefaults = {
  provider: string;
  handle: string;
  primaryProvider: PaymentProviderKey | "";
  handles: Record<PaymentProviderKey, string>;
};

const PAYMENT_PROVIDER_KEYS: PaymentProviderKey[] = [
  "venmo",
  "paypal",
  "cashapp",
];

function blankPaymentDefaults(): PaymentDefaults {
  return {
    provider: "",
    handle: "",
    primaryProvider: "",
    handles: {
      venmo: "",
      paypal: "",
      cashapp: "",
    },
  };
}

function normalizePaymentDefaults(
  input:
    | {
        provider?: string | null | undefined;
        handle?: string | null | undefined;
        primaryProvider?: string | null | undefined;
        handles?:
          | Partial<Record<PaymentProviderKey, string | null>>
          | undefined;
      }
    | null
    | undefined,
): PaymentDefaults {
  const provider = (input?.primaryProvider ?? input?.provider ?? "") || "";
  const normalizedProvider = PAYMENT_PROVIDER_KEYS.includes(
    provider as PaymentProviderKey,
  )
    ? (provider as PaymentProviderKey)
    : "";
  const handles = blankPaymentDefaults().handles;
  for (const key of PAYMENT_PROVIDER_KEYS) {
    handles[key] = input?.handles?.[key] ?? "";
  }
  if (normalizedProvider && !handles[normalizedProvider] && input?.handle) {
    handles[normalizedProvider] = input.handle;
  }
  return {
    provider: normalizedProvider,
    handle: normalizedProvider ? handles[normalizedProvider] : "",
    primaryProvider: normalizedProvider,
    handles,
  };
}

function paymentHandleFor(
  defaults: PaymentDefaults,
  provider: string | null | undefined,
) {
  const key = provider as PaymentProviderKey;
  return PAYMENT_PROVIDER_KEYS.includes(key) ? defaults.handles[key] : "";
}

export function createAdminDashboardController(
  options: DashboardControllerOptions = {},
) {
  const { onUnauthorized } = options;

  let hours = $state({ ...DEFAULT_ADMIN_RULES.hours });
  let buffer = $state(DEFAULT_ADMIN_RULES.buffer);
  let notice = $state(DEFAULT_ADMIN_RULES.notice);
  let capacity = $state(DEFAULT_ADMIN_RULES.capacity);
  let saved = $state(false);
  let saving = $state(false);
  const syncController = createSyncController({ onUnauthorized });
  const programsController = createProgramsController({ onUnauthorized });
  let bookings = $state<unknown[]>([]);
  let paymentDefaults = $state<PaymentDefaults>(blankPaymentDefaults());
  let paymentIntegrations = $state<PaymentIntegrations>({
    paypal: {
      clientId: null,
      environment: "sandbox",
      source: null,
      enabled: false,
    },
    square: {
      applicationId: null,
      locationId: null,
      environment: "sandbox",
      source: null,
      enabled: false,
    },
  });
  let stats = $state(DEFAULT_ADMIN_STATS);
  let loading = $state(true);
  let error = $state("");
  let events = $state<
    Array<{
      id: number;
      activitySlug: string;
      activityLabel: string;
      title: string;
      startsAt: string;
      endsAt: string;
      capacity: number;
      seatsTaken: number;
      seatsLeft: number;
      waitlistCount: number;
      costCents: number;
      currency: string;
      paymentProvider: string | null;
      paymentHandle: string | null;
      paymentNoteTemplate: string | null;
      recapText: string | null;
      heroImageUrl: string | null;
      participants: Array<{
        userId: string;
        name: string | null;
        avatarUrl: string | null;
        joinedAt: string | null;
      }>;
    }>
  >([]);
  let recentEvents = $state<
    Array<{
      id: number;
      activitySlug: string;
      activityLabel: string;
      title: string;
      startsAt: string;
      endsAt: string;
      capacity: number;
      seatsTaken: number;
      seatsLeft: number;
      waitlistCount: number;
      costCents: number;
      currency: string;
      paymentProvider: string | null;
      paymentHandle: string | null;
      paymentNoteTemplate: string | null;
      recapText: string | null;
      heroImageUrl: string | null;
      participants: Array<{
        userId: string;
        name: string | null;
        avatarUrl: string | null;
        joinedAt: string | null;
      }>;
    }>
  >([]);
  let eventsLoading = $state(false);
  let eventsLoaded = $state(false);
  let eventsCreating = $state(false);
  let eventUpdatingId = $state<number | null>(null);
  let eventDraft = $state({
    activitySlug: "",
    title: "",
    startsAt: "",
    endsAt: "",
    capacity: 4,
    repeatWeeks: 0,
    costCents: 0,
    currency: "USD",
    paymentProvider: "venmo",
    paymentHandle: "",
    paymentNoteTemplate: "",
    location: "",
    note: "",
  });
  let eventTemplates = $state<
    Array<{
      id: number;
      title: string;
      activitySlug: string;
      capacity: number;
      costCents: number;
      currency: string;
      paymentProvider: string | null;
      paymentHandle: string | null;
      paymentNoteTemplate: string | null;
      location: string | null;
      note: string | null;
    }>
  >([]);
  let selectedEventDetail = $state<{
    event: {
      id: number;
      activitySlug: string;
      activityLabel: string;
      title: string;
      startsAt: string;
      endsAt: string;
      capacity: number;
      waitlistCount: number;
      recapText: string | null;
      heroImageUrl: string | null;
    };
    attendees: Array<{
      entryId: number;
      userId: string;
      name: string | null;
      email: string | null;
      status: "joined" | "waitlist";
      waitlistPosition: number | null;
      attendanceStatus: "unknown" | "attended" | "flaked";
      joinedAt: string;
    }>;
    weather: { summary: string; temperatureF: number } | null;
  } | null>(null);

  function normalizeLocalDateTimeInput(value: string) {
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date.toISOString() : value;
  }

  function alignEventDraftWithPrograms() {
    const programs = programsController.programs;
    const firstEnabled = programs.find((program) => program.enabled);
    if (
      firstEnabled &&
      (!eventDraft.activitySlug ||
        !programs.some(
          (program) =>
            program.slug === eventDraft.activitySlug && program.enabled,
        ))
    ) {
      eventDraft = { ...eventDraft, activitySlug: firstEnabled.slug };
    }
  }

  function bootstrap(input: Partial<AdminBootstrap> | null | undefined) {
    if (!input) return;
    if (input.programs) {
      programsController.applyPrograms(input.programs as never);
      alignEventDraftWithPrograms();
    }
    if (input.upcoming) {
      events = input.upcoming as typeof events;
      eventsLoaded = true;
    }
    if (input.recent) {
      recentEvents = input.recent as typeof recentEvents;
      eventsLoaded = true;
    }
    if (input.paymentDefaults) {
      paymentDefaults = normalizePaymentDefaults(input.paymentDefaults);
    }
    if (input.paymentIntegrations) {
      paymentIntegrations = input.paymentIntegrations;
    }
  }

  async function loadStatus() {
    try {
      const dashboardStatus = await loadDashboardStatus();
      syncController.applyStatus(dashboardStatus);
      paymentDefaults = dashboardStatus.paymentDefaults
        ? normalizePaymentDefaults(dashboardStatus.paymentDefaults)
        : paymentDefaults;
      paymentIntegrations =
        dashboardStatus.paymentIntegrations ?? paymentIntegrations;
      if (dashboardStatus.rules) {
        hours = {
          from: dashboardStatus.rules.hoursFrom,
          to: dashboardStatus.rules.hoursTo,
        };
        buffer = dashboardStatus.rules.buffer;
        notice = dashboardStatus.rules.notice;
        capacity = dashboardStatus.rules.capacity;
      }
    } catch (err) {
      if (onUnauthorized?.(err)) return;
      console.error("Failed to load status:", err);
    }
  }

  async function loadPaymentDefaults() {
    try {
      const result = await loadAdminPaymentDefaults();
      paymentDefaults = normalizePaymentDefaults(result.payment);
      if (!eventDraft.paymentProvider && paymentDefaults.provider) {
        eventDraft = {
          ...eventDraft,
          paymentProvider: paymentDefaults.provider,
        };
      }
      if (!eventDraft.paymentHandle) {
        const defaultHandle = paymentHandleFor(
          paymentDefaults,
          eventDraft.paymentProvider || paymentDefaults.provider,
        );
        if (defaultHandle)
          eventDraft = { ...eventDraft, paymentHandle: defaultHandle };
      }
    } catch (err) {
      if (onUnauthorized?.(err)) return;
    }
  }

  async function savePaymentDefaults() {
    error = "";
    try {
      const primaryProvider =
        paymentDefaults.primaryProvider.trim() ||
        paymentDefaults.provider.trim();
      const handles = {
        venmo: paymentDefaults.handles.venmo.trim() || null,
        paypal: paymentDefaults.handles.paypal.trim() || null,
        cashapp: paymentDefaults.handles.cashapp.trim() || null,
      };
      if (
        (primaryProvider === "venmo" ||
          primaryProvider === "paypal" ||
          primaryProvider === "cashapp") &&
        !handles[primaryProvider] &&
        paymentDefaults.handle.trim()
      ) {
        handles[primaryProvider] = paymentDefaults.handle.trim();
      }
      const result = await saveAdminPaymentDefaults({
        provider: primaryProvider || null,
        handle: paymentDefaults.handle.trim() || null,
        primaryProvider: primaryProvider || null,
        handles,
      });
      if (!result.ok) {
        error = result.error;
      }
    } catch (err) {
      if (onUnauthorized?.(err)) return;
      error =
        err instanceof Error ? err.message : "Failed to save payment defaults";
    }
  }

  async function loadPaymentProviderIntegrations() {
    try {
      const result = await loadPaymentIntegrations();
      if (result.ok) {
        paymentIntegrations = result.payments;
      }
    } catch (err) {
      if (onUnauthorized?.(err)) return;
      error =
        err instanceof Error
          ? err.message
          : "Failed to load payment integrations";
    }
  }

  async function connectPayPal(input: {
    clientId: string;
    clientSecret: string;
    environment: "sandbox" | "live";
  }) {
    error = "";
    try {
      const result = await savePayPalIntegration(input);
      if (!result.ok) {
        error = result.error;
        return;
      }
      await loadPaymentProviderIntegrations();
    } catch (err) {
      if (onUnauthorized?.(err)) return;
      error =
        err instanceof Error ? err.message : "Failed to save PayPal checkout";
    }
  }

  async function connectSquare(input: {
    applicationId: string;
    locationId: string;
    accessToken: string;
    environment: "sandbox" | "live";
  }) {
    error = "";
    try {
      const result = await saveSquareIntegration(input);
      if (!result.ok) {
        error = result.error;
        return;
      }
      await loadPaymentProviderIntegrations();
    } catch (err) {
      if (onUnauthorized?.(err)) return;
      error =
        err instanceof Error ? err.message : "Failed to save Cash App Pay";
    }
  }

  async function disconnectPaymentIntegration(provider: "paypal" | "square") {
    error = "";
    try {
      const result = await deletePaymentIntegration(provider);
      if (!result.ok) {
        error = result.error;
        return;
      }
      await loadPaymentProviderIntegrations();
    } catch (err) {
      if (onUnauthorized?.(err)) return;
      error =
        err instanceof Error
          ? err.message
          : "Failed to disconnect payment integration";
    }
  }

  async function loadBookings() {
    loading = true;
    error = "";
    try {
      const dashboardBookings = await loadDashboardBookings();
      bookings = dashboardBookings.bookings;
      stats = dashboardBookings.stats || DEFAULT_ADMIN_STATS;
      error = dashboardBookings.error;
    } catch (err) {
      if (onUnauthorized?.(err)) return;
      error = err instanceof Error ? err.message : "Failed to load bookings";
    } finally {
      loading = false;
    }
  }

  async function save() {
    saving = true;
    try {
      const saveResult = await saveDashboardRules({
        hours: { ...hours },
        buffer,
        notice,
        capacity,
      });
      if (saveResult.ok) {
        saved = true;
        setTimeout(() => {
          saved = false;
        }, 2200);
      } else {
        error = saveResult.error;
      }
    } catch (err) {
      if (onUnauthorized?.(err)) return;
      error = err instanceof Error ? err.message : "Failed to save rules";
    } finally {
      saving = false;
    }
  }

  // sync provider connect/disconnect lives on syncController; forwarded
  // below for backwards compat.

  async function loadPrograms() {
    await programsController.load();
    alignEventDraftWithPrograms();
  }

  async function loadEvents() {
    eventsLoading = true;
    error = "";
    try {
      const result = await loadAdminEventsData();
      events = result.upcoming;
      recentEvents = result.recent;
      error = result.error;
      const templatesResult = await loadAdminEventTemplates();
      eventTemplates = templatesResult.templates;
    } catch (err) {
      if (onUnauthorized?.(err)) return;
      error = err instanceof Error ? err.message : "Failed to load events";
    } finally {
      eventsLoading = false;
      eventsLoaded = true;
    }
  }

  async function createEvents() {
    eventsCreating = true;
    error = "";
    try {
      if (!eventDraft.activitySlug) {
        error = "Select a program before creating events.";
        return;
      }
      if (!eventDraft.title || !eventDraft.startsAt || !eventDraft.endsAt) {
        error = "Title, start, and end are required.";
        return;
      }
      const result = await createAdminEventsBatch({
        ...eventDraft,
        startsAt: normalizeLocalDateTimeInput(eventDraft.startsAt),
        endsAt: normalizeLocalDateTimeInput(eventDraft.endsAt),
      });
      if (!result.ok) {
        error = result.error;
        return;
      }
      eventDraft = {
        ...eventDraft,
        title: "",
        location: "",
        note: "",
        repeatWeeks: 0,
        costCents: 0,
        paymentHandle: "",
        paymentNoteTemplate: "",
      };
      await loadEvents();
    } catch (err) {
      if (onUnauthorized?.(err)) return;
      error = err instanceof Error ? err.message : "Failed to create events";
    } finally {
      eventsCreating = false;
    }
  }

  function applyTemplate(templateId: number) {
    const template = eventTemplates.find((item) => item.id === templateId);
    if (!template) return;
    eventDraft = {
      ...eventDraft,
      activitySlug: template.activitySlug,
      title: template.title,
      capacity: template.capacity,
      costCents: template.costCents,
      currency: template.currency || "USD",
      paymentProvider:
        template.paymentProvider ?? paymentDefaults.provider ?? "venmo",
      paymentHandle:
        template.paymentHandle ??
        paymentHandleFor(
          paymentDefaults,
          template.paymentProvider ?? paymentDefaults.provider,
        ) ??
        "",
      paymentNoteTemplate: template.paymentNoteTemplate ?? "",
      location: template.location ?? "",
      note: template.note ?? "",
    };
  }

  async function openEventDetail(eventId: number) {
    error = "";
    try {
      const result = await loadAdminEventDetail(eventId);
      selectedEventDetail = {
        event: {
          id: result.event.id,
          activitySlug: result.event.activitySlug,
          activityLabel: result.event.activityLabel,
          title: result.event.title,
          startsAt: result.event.startsAt,
          endsAt: result.event.endsAt,
          capacity: result.event.capacity,
          waitlistCount: result.event.waitlistCount,
          recapText: result.event.recapText,
          heroImageUrl: result.event.heroImageUrl,
        },
        attendees: result.attendees,
        weather: result.weather,
      };
    } catch (err) {
      if (onUnauthorized?.(err)) return;
      error =
        err instanceof Error ? err.message : "Failed to load event detail";
    }
  }

  function closeEventDetail() {
    selectedEventDetail = null;
  }

  async function promoteWaitlist(eventId: number, entryId: number) {
    error = "";
    try {
      const result = await promoteWaitlistEntry(eventId, entryId);
      if (result.status === "full") {
        error = "Event is full; couldn't promote.";
        return;
      }
      if (result.status === "already_joined") {
        error = "Already joined this event.";
        return;
      }
      await Promise.all([loadEvents(), openEventDetail(eventId)]);
    } catch (err) {
      if (onUnauthorized?.(err)) return;
      error =
        err instanceof Error ? err.message : "Failed to promote waitlist user";
    }
  }

  async function updateEventCapacity(eventId: number, capacity: number) {
    eventUpdatingId = eventId;
    error = "";
    try {
      const result = await updateAdminEventCapacityValue(eventId, capacity);
      if (!result.ok) {
        error = result.error;
        return;
      }
      events = events.map((event) =>
        event.id === eventId ? { ...event, capacity } : event,
      );
    } catch (err) {
      if (onUnauthorized?.(err)) return;
      error =
        err instanceof Error ? err.message : "Failed to update event capacity";
    } finally {
      eventUpdatingId = null;
    }
  }

  async function updateEventDetails(
    eventId: number,
    input: { title: string; startsAt: string; endsAt: string },
  ) {
    eventUpdatingId = eventId;
    error = "";
    try {
      const normalizedInput = {
        ...input,
        startsAt: normalizeLocalDateTimeInput(input.startsAt),
        endsAt: normalizeLocalDateTimeInput(input.endsAt),
      };
      const result = await updateAdminEventDetailsValue(
        eventId,
        normalizedInput,
      );
      if (!result.ok) {
        error = result.error;
        return;
      }
      events = events.map((event) =>
        event.id === eventId
          ? {
              ...event,
              title: normalizedInput.title,
              startsAt: normalizedInput.startsAt,
              endsAt: normalizedInput.endsAt,
            }
          : event,
      );
      recentEvents = recentEvents.map((event) =>
        event.id === eventId
          ? {
              ...event,
              title: normalizedInput.title,
              startsAt: normalizedInput.startsAt,
              endsAt: normalizedInput.endsAt,
            }
          : event,
      );
      if (selectedEventDetail?.event.id === eventId) {
        selectedEventDetail = {
          ...selectedEventDetail,
          event: {
            ...selectedEventDetail.event,
            title: normalizedInput.title,
            startsAt: normalizedInput.startsAt,
            endsAt: normalizedInput.endsAt,
          },
        };
      }
    } catch (err) {
      if (onUnauthorized?.(err)) return;
      error =
        err instanceof Error ? err.message : "Failed to update event details";
    } finally {
      eventUpdatingId = null;
    }
  }

  async function updateEventAttendance(
    eventId: number,
    userId: string,
    attendanceStatus: "unknown" | "attended" | "flaked",
  ) {
    eventUpdatingId = eventId;
    error = "";
    try {
      const result = await updateAdminEventAttendanceValue(eventId, {
        userId,
        attendanceStatus,
      });
      if (!result.ok) {
        error = result.error;
        return;
      }
      if (selectedEventDetail?.event.id === eventId) {
        selectedEventDetail = {
          ...selectedEventDetail,
          attendees: selectedEventDetail.attendees.map((attendee) =>
            attendee.userId === userId
              ? { ...attendee, attendanceStatus }
              : attendee,
          ),
        };
      }
    } catch (err) {
      if (onUnauthorized?.(err)) return;
      error =
        err instanceof Error ? err.message : "Failed to update attendance";
    } finally {
      eventUpdatingId = null;
    }
  }

  async function updateEventMemory(
    eventId: number,
    recapText: string,
    heroImageUrl: string,
  ) {
    eventUpdatingId = eventId;
    error = "";
    try {
      const result = await updateAdminEventMemoryValue(eventId, {
        recapText,
        heroImageUrl,
      });
      if (!result.ok) {
        error = result.error;
        return;
      }
      recentEvents = recentEvents.map((event) =>
        event.id === eventId ? { ...event, recapText, heroImageUrl } : event,
      );
      if (selectedEventDetail?.event.id === eventId) {
        selectedEventDetail = {
          ...selectedEventDetail,
          event: {
            ...selectedEventDetail.event,
            recapText,
            heroImageUrl: heroImageUrl || null,
          },
        };
      }
    } catch (err) {
      if (onUnauthorized?.(err)) return;
      error =
        err instanceof Error ? err.message : "Failed to update event memory";
    } finally {
      eventUpdatingId = null;
    }
  }

  async function updateEventRecap(eventId: number, recapText: string) {
    eventUpdatingId = eventId;
    error = "";
    try {
      const result = await updateAdminEventRecapValue(eventId, recapText);
      if (!result.ok) {
        error = result.error;
        return;
      }
      events = events.map((event) =>
        event.id === eventId ? { ...event, recapText } : event,
      );
      recentEvents = recentEvents.map((event) =>
        event.id === eventId ? { ...event, recapText } : event,
      );
      if (selectedEventDetail?.event.id === eventId) {
        selectedEventDetail = {
          ...selectedEventDetail,
          event: { ...selectedEventDetail.event, recapText },
        };
      }
    } catch (err) {
      if (onUnauthorized?.(err)) return;
      error = err instanceof Error ? err.message : "Failed to save description";
    } finally {
      eventUpdatingId = null;
    }
  }

  function applyHeroImage(eventId: number, heroImageUrl: string | null) {
    events = events.map((event) =>
      event.id === eventId ? { ...event, heroImageUrl } : event,
    );
    recentEvents = recentEvents.map((event) =>
      event.id === eventId ? { ...event, heroImageUrl } : event,
    );
    if (selectedEventDetail?.event.id === eventId) {
      selectedEventDetail = {
        ...selectedEventDetail,
        event: { ...selectedEventDetail.event, heroImageUrl },
      };
    }
  }

  async function uploadEventHero(eventId: number, file: File) {
    eventUpdatingId = eventId;
    error = "";
    try {
      const result = await uploadAdminEventHeroValue(eventId, file);
      if (!result.ok) {
        error = result.error;
        return null;
      }
      applyHeroImage(eventId, result.url);
      return result.url;
    } catch (err) {
      if (onUnauthorized?.(err)) return null;
      error = err instanceof Error ? err.message : "Failed to upload image";
      return null;
    } finally {
      eventUpdatingId = null;
    }
  }

  async function clearEventHero(eventId: number) {
    eventUpdatingId = eventId;
    error = "";
    try {
      const result = await clearAdminEventHeroValue(eventId);
      if (!result.ok) {
        error = result.error;
        return false;
      }
      applyHeroImage(eventId, null);
      return true;
    } catch (err) {
      if (onUnauthorized?.(err)) return false;
      error = err instanceof Error ? err.message : "Failed to remove image";
      return false;
    } finally {
      eventUpdatingId = null;
    }
  }

  async function deleteEvent(eventId: number) {
    eventUpdatingId = eventId;
    error = "";
    try {
      const result = await deleteAdminEventValue(eventId);
      if (!result.ok) {
        error = result.error;
        return;
      }
      events = events.filter((event) => event.id !== eventId);
      recentEvents = recentEvents.filter((event) => event.id !== eventId);
      if (selectedEventDetail?.event.id === eventId) {
        selectedEventDetail = null;
      }
    } catch (err) {
      if (onUnauthorized?.(err)) return;
      error = err instanceof Error ? err.message : "Failed to delete event";
    } finally {
      eventUpdatingId = null;
    }
  }

  // sync queue handlers live on syncController; forwarded below.

  return {
    get hours() {
      return hours;
    },
    set hours(value) {
      hours = value;
    },
    get buffer() {
      return buffer;
    },
    set buffer(value) {
      buffer = value;
    },
    get notice() {
      return notice;
    },
    set notice(value) {
      notice = value;
    },
    get capacity() {
      return capacity;
    },
    set capacity(value) {
      capacity = value;
    },
    get saved() {
      return saved;
    },
    get saving() {
      return saving;
    },
    get connected() {
      return syncController.connected;
    },
    get connectionExpired() {
      return syncController.connectionExpired;
    },
    get connectionRefreshFailed() {
      return syncController.connectionRefreshFailed;
    },
    get disconnecting() {
      return syncController.disconnecting;
    },
    get oauth() {
      return syncController.oauth;
    },
    get sync() {
      return syncController.sync;
    },
    get syncQueue() {
      return syncController.syncQueue;
    },
    get paymentDefaults() {
      return paymentDefaults;
    },
    set paymentDefaults(value) {
      paymentDefaults = value;
    },
    get paymentIntegrations() {
      return paymentIntegrations;
    },
    get bookings() {
      return bookings;
    },
    get stats() {
      return stats;
    },
    get loading() {
      return loading;
    },
    get error() {
      return error || syncController.error || programsController.error;
    },
    get programs() {
      return programsController.programs;
    },
    get programsLoading() {
      return programsController.programsLoading;
    },
    get programsLoaded() {
      return programsController.programsLoaded;
    },
    get programUpdatingSlug() {
      return programsController.programUpdatingSlug;
    },
    get selectedProgramSlug() {
      return programsController.selectedProgramSlug;
    },
    get programDraft() {
      return programsController.programDraft;
    },
    set programDraft(value) {
      programsController.programDraft = value;
    },
    get programSaving() {
      return programsController.programSaving;
    },
    get programDeleting() {
      return programsController.programDeleting;
    },
    get events() {
      return events;
    },
    get enabledPrograms() {
      return programsController.enabledPrograms;
    },
    get eventsLoading() {
      return eventsLoading;
    },
    get eventsLoaded() {
      return eventsLoaded;
    },
    get eventsCreating() {
      return eventsCreating;
    },
    get eventUpdatingId() {
      return eventUpdatingId;
    },
    get syncQueueBusy() {
      return syncController.syncQueueBusy;
    },
    get recentEvents() {
      return recentEvents;
    },
    get eventDraft() {
      return eventDraft;
    },
    set eventDraft(value) {
      eventDraft = value;
    },
    get eventTemplates() {
      return eventTemplates;
    },
    get selectedEventDetail() {
      return selectedEventDetail;
    },
    bootstrap,
    loadStatus,
    loadBookings,
    loadPaymentDefaults,
    loadPrograms,
    loadEvents,
    save,
    reconnect: syncController.reconnect,
    disconnect: syncController.disconnect,
    connectApple: syncController.connectApple,
    loadPaymentProviderIntegrations,
    connectPayPal,
    connectSquare,
    disconnectPaymentIntegration,
    toggleProgram: programsController.toggleProgram,
    selectProgram: programsController.selectProgram,
    newProgramDraft: programsController.newProgramDraft,
    saveProgram: programsController.saveProgram,
    moveProgram: programsController.moveProgram,
    reorderPrograms: programsController.reorderPrograms,
    deleteProgram: programsController.deleteProgram,
    createEvents,
    applyTemplate,
    openEventDetail,
    closeEventDetail,
    promoteWaitlist,
    updateEventCapacity,
    updateEventDetails,
    updateEventAttendance,
    updateEventMemory,
    updateEventRecap,
    uploadEventHero,
    clearEventHero,
    deleteEvent,
    savePaymentDefaults,
    processSyncQueue: syncController.processQueue,
    retryDeadLetters: syncController.retryDeadLetters,
    purgeDeadLetters: syncController.purgeDeadLetters,
  };
}

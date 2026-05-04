import { DEFAULT_ADMIN_RULES, DEFAULT_ADMIN_STATS } from "../shared/admin";
import {
  createAdminEventsBatch,
  connectAppleCalendarCredentials,
  deletePaymentIntegration,
  deleteDashboardProgram,
  disconnectAppleCalendarReconnect,
  disconnectCalendarReconnect,
  disconnectOutlookCalendarReconnect,
  getCalendarReconnectUrl,
  loadAdminEventsData,
  loadAdminPrograms,
  loadAdminPaymentDefaults,
  loadPaymentIntegrations,
  loadAdminEventTemplates,
  loadAdminEventDetail,
  loadDashboardBookings,
  loadDashboardStatus,
  promoteWaitlistEntry,
  processDashboardSyncQueue,
  purgeDashboardSyncDeadLetters,
  retryDashboardSyncDeadLetters,
  saveAdminPaymentDefaults,
  saveDashboardProgram,
  saveDashboardRules,
  savePayPalIntegration,
  saveSquareIntegration,
  updateAdminEventCapacityValue,
  updateAdminEventDetailsValue,
  updateAdminEventAttendanceValue,
  updateAdminEventMemoryValue,
  deleteAdminEventValue,
  updateAdminProgram,
} from "./admin-dashboard";

type UnauthorizedHandler = (error: unknown) => boolean;

type DashboardControllerOptions = {
  onUnauthorized?: UnauthorizedHandler;
};

type SyncProviderKey = "google" | "outlook" | "apple";

type SyncProviderStatus = {
  connected: boolean;
  expired: boolean;
  expiresAt: number | null;
  refreshFailed: boolean;
  active: boolean;
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
  let connected = $state(false);
  let connectionExpired = $state(false);
  let connectionRefreshFailed = $state(false);
  let disconnecting = $state(false);
  let oauth = $state({
    googleCalendarRedirectUri: null as string | null,
    outlookRedirectUri: null as string | null,
    googleLoginRedirectUri: "",
    appleLoginRedirectUri: "",
  });
  let sync = $state<{
    activeProvider: SyncProviderKey | null;
    providers: Record<SyncProviderKey, SyncProviderStatus>;
  }>({
    activeProvider: null,
    providers: {
      google: {
        connected: false,
        expired: false,
        expiresAt: null,
        refreshFailed: false,
        active: false,
      },
      outlook: {
        connected: false,
        expired: false,
        expiresAt: null,
        refreshFailed: false,
        active: false,
      },
      apple: {
        connected: false,
        expired: false,
        expiresAt: null,
        refreshFailed: false,
        active: false,
      },
    },
  });
  let syncQueue = $state({
    pending: 0,
    processing: 0,
    failed: 0,
    deadLetter: 0,
    oldestPendingSeconds: 0,
    oldestDeadLetterSeconds: 0,
    hasBacklogAlert: false,
    hasDeadLetterAlert: false,
  });
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
  let programs = $state<
    Array<{
      slug: string;
      href: string;
      label: string;
      activityName: string;
      pageTitle: string;
      eyebrow: string;
      heroTitleLines: string[];
      heroSubtitle: string;
      description: string;
      icon: string;
      eyebrowClass?: string | undefined;
      glowClass?: string | undefined;
      formGlowClass?: string | undefined;
      serviceStatusNote?: string | undefined;
      enabled: boolean;
      sortOrder: number;
    }>
  >([]);
  let programsLoading = $state(false);
  let programUpdatingSlug = $state<string | null>(null);
  let programSaving = $state(false);
  let programDeleting = $state(false);
  let selectedProgramSlug = $state<string | null>(null);
  let programDraft = $state({
    slug: "",
    label: "",
    activityName: "",
    pageTitle: "",
    eyebrow: "",
    heroTitleLine1: "",
    heroTitleLine2: "",
    heroSubtitle: "",
    description: "",
    icon: "",
    eyebrowClass: "",
    glowClass: "",
    formGlowClass: "",
    serviceStatusNote: "",
    enabled: true,
    sortOrder: 0,
  });
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
      }>;
    }>
  >([]);
  let eventsLoading = $state(false);
  let eventsCreating = $state(false);
  let eventUpdatingId = $state<number | null>(null);
  let syncQueueBusy = $state(false);
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

  async function loadStatus() {
    try {
      const dashboardStatus = await loadDashboardStatus();
      connected = dashboardStatus.connected;
      connectionExpired = dashboardStatus.connectionExpired;
      connectionRefreshFailed = dashboardStatus.connectionRefreshFailed;
      oauth = dashboardStatus.oauth ?? oauth;
      sync = dashboardStatus.sync ?? sync;
      syncQueue = dashboardStatus.syncQueue ?? {
        pending: 0,
        processing: 0,
        failed: 0,
        deadLetter: 0,
        oldestPendingSeconds: 0,
        oldestDeadLetterSeconds: 0,
        hasBacklogAlert: false,
        hasDeadLetterAlert: false,
      };
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

  async function reconnect(provider: "google" | "outlook" = "google") {
    try {
      const reconnectResult = await getCalendarReconnectUrl(provider);
      if (reconnectResult.ok) {
        window.location.href = reconnectResult.authUrl;
      } else {
        error = reconnectResult.error;
      }
    } catch (err) {
      if (onUnauthorized?.(err)) return;
      error =
        err instanceof Error ? err.message : `Failed to connect to ${provider}`;
    }
  }

  async function disconnect(provider: SyncProviderKey = "google") {
    disconnecting = true;
    try {
      const disconnectResult =
        provider === "outlook"
          ? await disconnectOutlookCalendarReconnect()
          : provider === "apple"
            ? await disconnectAppleCalendarReconnect()
            : await disconnectCalendarReconnect();
      if (disconnectResult.ok) {
        connected = false;
        connectionExpired = false;
        connectionRefreshFailed = false;
        await loadStatus();
      } else {
        error = disconnectResult.error;
      }
    } catch (err) {
      if (onUnauthorized?.(err)) return;
      error =
        err instanceof Error ? err.message : `Failed to disconnect ${provider}`;
    } finally {
      disconnecting = false;
    }
  }

  async function connectApple(input: {
    username: string;
    appPassword: string;
    calendarUrl: string;
  }) {
    error = "";
    try {
      const result = await connectAppleCalendarCredentials(input);
      if (!result.ok) {
        error = result.error;
        return;
      }
      await loadStatus();
    } catch (err) {
      if (onUnauthorized?.(err)) return;
      error =
        err instanceof Error ? err.message : "Failed to connect Apple Calendar";
    }
  }

  async function loadPrograms() {
    programsLoading = true;
    error = "";
    try {
      const result = await loadAdminPrograms();
      programs = result.programs;
      error = result.error;
      const firstProgram = programs[0];
      if (!selectedProgramSlug && firstProgram) {
        selectProgram(firstProgram.slug);
      }
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
    } catch (err) {
      if (onUnauthorized?.(err)) return;
      error = err instanceof Error ? err.message : "Failed to load programs";
    } finally {
      programsLoading = false;
    }
  }

  async function toggleProgram(slug: string, nextEnabled: boolean) {
    programUpdatingSlug = slug;
    error = "";
    try {
      const result = await updateAdminProgram({ slug, enabled: nextEnabled });
      if (!result.ok) {
        error = result.error;
        return;
      }
      programs = programs.map((program) =>
        program.slug === slug ? { ...program, enabled: nextEnabled } : program,
      );
    } catch (err) {
      if (onUnauthorized?.(err)) return;
      error = err instanceof Error ? err.message : "Failed to update program";
    } finally {
      programUpdatingSlug = null;
    }
  }

  function selectProgram(slug: string) {
    const program = programs.find((item) => item.slug === slug);
    if (!program) return;
    selectedProgramSlug = slug;
    programDraft = {
      slug: program.slug,
      label: program.label,
      activityName: program.activityName,
      pageTitle: program.pageTitle,
      eyebrow: program.eyebrow,
      heroTitleLine1: program.heroTitleLines[0] ?? "",
      heroTitleLine2: program.heroTitleLines[1] ?? "",
      heroSubtitle: program.heroSubtitle,
      description: program.description,
      icon: program.icon,
      eyebrowClass: program.eyebrowClass ?? "",
      glowClass: program.glowClass ?? "",
      formGlowClass: program.formGlowClass ?? "",
      serviceStatusNote: program.serviceStatusNote ?? "",
      enabled: program.enabled,
      sortOrder: program.sortOrder,
    };
  }

  function newProgramDraft() {
    const existingSlugs = new Set(programs.map((program) => program.slug));
    let slug = "new-program";
    let suffix = 2;
    while (existingSlugs.has(slug)) {
      slug = `new-program-${suffix}`;
      suffix += 1;
    }
    selectedProgramSlug = null;
    programDraft = {
      slug,
      label: "New Program",
      activityName: "New Program",
      pageTitle: "New Program",
      eyebrow: "New Program",
      heroTitleLine1: "Make it yours.",
      heroTitleLine2: "",
      heroSubtitle:
        "Set up the page, save it as a draft, then click days to schedule sessions.",
      description: "",
      icon: "✨",
      eyebrowClass: "",
      glowClass: "",
      formGlowClass: "",
      serviceStatusNote: "",
      enabled: true,
      sortOrder:
        (programs.length ? programs[programs.length - 1]!.sortOrder : 0) + 10,
    };
  }

  async function saveProgram() {
    programSaving = true;
    error = "";
    try {
      const result = await saveDashboardProgram({
        slug: programDraft.slug.trim(),
        label: programDraft.label.trim(),
        activityName: programDraft.activityName.trim(),
        pageTitle: programDraft.pageTitle.trim(),
        eyebrow: programDraft.eyebrow.trim(),
        heroTitleLine1: programDraft.heroTitleLine1.trim(),
        heroTitleLine2: programDraft.heroTitleLine2.trim(),
        heroSubtitle: programDraft.heroSubtitle.trim(),
        description: programDraft.description.trim(),
        icon: programDraft.icon.trim(),
        eyebrowClass: programDraft.eyebrowClass.trim(),
        glowClass: programDraft.glowClass.trim(),
        formGlowClass: programDraft.formGlowClass.trim(),
        serviceStatusNote: programDraft.serviceStatusNote.trim(),
        enabled: programDraft.enabled,
        sortOrder: programDraft.sortOrder,
      });
      if (!result.ok) {
        error = result.error;
        return;
      }
      await loadPrograms();
      selectProgram(programDraft.slug.trim());
    } catch (err) {
      if (onUnauthorized?.(err)) return;
      error = err instanceof Error ? err.message : "Failed to save program";
    } finally {
      programSaving = false;
    }
  }

  async function moveProgram(slug: string, direction: "up" | "down") {
    const current = [...programs].sort((a, b) => a.sortOrder - b.sortOrder);
    const index = current.findIndex((program) => program.slug === slug);
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return;

    const reordered = [...current];
    const [item] = reordered.splice(index, 1);
    if (!item) return;
    reordered.splice(nextIndex, 0, item);

    const previousPrograms = programs;
    const nextSortOrders = new Map(
      reordered.map((program, orderIndex) => [program.slug, (orderIndex + 1) * 10]),
    );
    programs = programs.map((program) => ({
      ...program,
      sortOrder: nextSortOrders.get(program.slug) ?? program.sortOrder,
    }));

    programSaving = true;
    error = "";
    try {
      for (const program of reordered) {
        const sortOrder = nextSortOrders.get(program.slug) ?? program.sortOrder;
        if (sortOrder === program.sortOrder) continue;
        const result = await saveDashboardProgram({
          slug: program.slug,
          label: program.label,
          activityName: program.activityName,
          pageTitle: program.pageTitle,
          eyebrow: program.eyebrow,
          heroTitleLine1: program.heroTitleLines[0] ?? "",
          heroTitleLine2: program.heroTitleLines[1] ?? "",
          heroSubtitle: program.heroSubtitle,
          description: program.description,
          icon: program.icon,
          eyebrowClass: program.eyebrowClass ?? "",
          glowClass: program.glowClass ?? "",
          formGlowClass: program.formGlowClass ?? "",
          serviceStatusNote: program.serviceStatusNote ?? "",
          enabled: program.enabled,
          sortOrder,
        });
        if (!result.ok) {
          error = result.error;
          programs = previousPrograms;
          return;
        }
      }
      await loadPrograms();
    } catch (err) {
      programs = previousPrograms;
      if (onUnauthorized?.(err)) return;
      error = err instanceof Error ? err.message : "Failed to reorder programs";
    } finally {
      programSaving = false;
    }
  }

  async function deleteProgram() {
    const slug = selectedProgramSlug;
    if (!slug) return;
    if (!confirm(`Delete program "${slug}"?`)) return;
    programDeleting = true;
    error = "";
    try {
      const result = await deleteDashboardProgram(slug);
      if (!result.ok) {
        error = result.error;
        return;
      }
      await loadPrograms();
      const firstProgram = programs[0];
      if (firstProgram) selectProgram(firstProgram.slug);
      else newProgramDraft();
    } catch (err) {
      if (onUnauthorized?.(err)) return;
      error = err instanceof Error ? err.message : "Failed to delete program";
    } finally {
      programDeleting = false;
    }
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

  async function processSyncQueue() {
    syncQueueBusy = true;
    error = "";
    try {
      const result = await processDashboardSyncQueue(20);
      if (!result.ok) {
        error = result.error;
        return;
      }
      await loadStatus();
    } catch (err) {
      if (onUnauthorized?.(err)) return;
      error =
        err instanceof Error ? err.message : "Failed to process sync queue";
    } finally {
      syncQueueBusy = false;
    }
  }

  async function retryDeadLetters() {
    syncQueueBusy = true;
    error = "";
    try {
      const result = await retryDashboardSyncDeadLetters(20);
      if (!result.ok) {
        error = result.error;
        return;
      }
      await loadStatus();
    } catch (err) {
      if (onUnauthorized?.(err)) return;
      error =
        err instanceof Error
          ? err.message
          : "Failed to requeue dead-letter jobs";
    } finally {
      syncQueueBusy = false;
    }
  }

  async function purgeDeadLetters() {
    if (
      !confirm(
        "Purge dead-letter sync jobs? This discards failed jobs permanently.",
      )
    )
      return;
    syncQueueBusy = true;
    error = "";
    try {
      const result = await purgeDashboardSyncDeadLetters(100);
      if (!result.ok) {
        error = result.error;
        return;
      }
      await loadStatus();
    } catch (err) {
      if (onUnauthorized?.(err)) return;
      error =
        err instanceof Error ? err.message : "Failed to purge dead-letter jobs";
    } finally {
      syncQueueBusy = false;
    }
  }

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
      return connected;
    },
    get connectionExpired() {
      return connectionExpired;
    },
    get connectionRefreshFailed() {
      return connectionRefreshFailed;
    },
    get disconnecting() {
      return disconnecting;
    },
    get oauth() {
      return oauth;
    },
    get sync() {
      return sync;
    },
    get syncQueue() {
      return syncQueue;
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
      return error;
    },
    get programs() {
      return programs;
    },
    get programsLoading() {
      return programsLoading;
    },
    get programUpdatingSlug() {
      return programUpdatingSlug;
    },
    get selectedProgramSlug() {
      return selectedProgramSlug;
    },
    get programDraft() {
      return programDraft;
    },
    set programDraft(value) {
      programDraft = value;
    },
    get programSaving() {
      return programSaving;
    },
    get programDeleting() {
      return programDeleting;
    },
    get events() {
      return events;
    },
    get enabledPrograms() {
      return programs.filter((program) => program.enabled);
    },
    get eventsLoading() {
      return eventsLoading;
    },
    get eventsCreating() {
      return eventsCreating;
    },
    get eventUpdatingId() {
      return eventUpdatingId;
    },
    get syncQueueBusy() {
      return syncQueueBusy;
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
    loadStatus,
    loadBookings,
    loadPaymentDefaults,
    loadPrograms,
    loadEvents,
    save,
    reconnect,
    disconnect,
    connectApple,
    loadPaymentProviderIntegrations,
    connectPayPal,
    connectSquare,
    disconnectPaymentIntegration,
    toggleProgram,
    selectProgram,
    newProgramDraft,
    saveProgram,
    moveProgram,
    deleteProgram,
    createEvents,
    applyTemplate,
    openEventDetail,
    closeEventDetail,
    promoteWaitlist,
    updateEventCapacity,
    updateEventDetails,
    updateEventAttendance,
    updateEventMemory,
    deleteEvent,
    savePaymentDefaults,
    processSyncQueue,
    retryDeadLetters,
    purgeDeadLetters,
  };
}

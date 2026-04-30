import { requestApi } from "./http";
import { z } from "zod";
import { withAdminApi } from "../config";

export type AdminRulesInput = {
  hoursFrom: string;
  hoursTo: string;
  buffer: number;
  notice: number;
  capacity: number;
};

export type AdminProgramInput = {
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
};

export type AdminEventCreateInput = {
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
};

export type AdminSyncQueueAction =
  | "process"
  | "retry_dead_letters"
  | "purge_dead_letters";

const AdminPaymentIntegrationsSchema = z.object({
  paypal: z.object({
    clientId: z.union([z.string(), z.null()]),
    environment: z
      .union([z.literal("sandbox"), z.literal("live")])
      .optional()
      .default("sandbox"),
    source: z
      .union([z.literal("stored"), z.literal("env"), z.null()])
      .optional()
      .default(null),
    enabled: z.boolean(),
  }),
  square: z.object({
    applicationId: z.union([z.string(), z.null()]),
    locationId: z.union([z.string(), z.null()]),
    environment: z.union([z.literal("sandbox"), z.literal("production")]),
    source: z
      .union([z.literal("stored"), z.literal("env"), z.null()])
      .optional()
      .default(null),
    enabled: z.boolean(),
  }),
});

const AdminCleanupE2EResponseSchema = z.object({
  ok: z.literal(true),
  events: z.object({ before: z.number(), after: z.number() }),
  users: z.object({ before: z.number(), after: z.number() }),
});

const AdminStatusResponseSchema = z.object({
  ok: z.literal(true),
  google: z.object({
    connected: z.boolean(),
    expired: z.boolean(),
    expiresAt: z.number().nullable(),
    refreshFailed: z.boolean().optional().default(false),
  }),
  sync: z
    .object({
      activeProvider: z.union([
        z.literal("google"),
        z.literal("outlook"),
        z.literal("apple"),
        z.null(),
      ]),
      providers: z.object({
        google: z.object({
          connected: z.boolean(),
          expired: z.boolean(),
          expiresAt: z.number().nullable(),
          refreshFailed: z.boolean(),
          active: z.boolean(),
        }),
        outlook: z.object({
          connected: z.boolean(),
          expired: z.boolean(),
          expiresAt: z.number().nullable(),
          refreshFailed: z.boolean(),
          active: z.boolean(),
        }),
        apple: z.object({
          connected: z.boolean(),
          expired: z.boolean(),
          expiresAt: z.number().nullable(),
          refreshFailed: z.boolean(),
          active: z.boolean(),
        }),
      }),
    })
    .optional(),
  oauth: z.object({
    googleCalendarRedirectUri: z.union([z.string(), z.null()]),
    outlookRedirectUri: z
      .union([z.string(), z.null()])
      .optional()
      .default(null),
    googleLoginRedirectUri: z.string(),
    appleLoginRedirectUri: z.string(),
  }),
  syncQueue: z.object({
    pending: z.number(),
    processing: z.number(),
    failed: z.number(),
    deadLetter: z.number().optional().default(0),
    oldestPendingSeconds: z.number(),
    oldestDeadLetterSeconds: z.number().optional().default(0),
    hasBacklogAlert: z.boolean().optional().default(false),
    hasDeadLetterAlert: z.boolean().optional().default(false),
  }),
  rules: z.object({
    hoursFrom: z.string(),
    hoursTo: z.string(),
    buffer: z.number(),
    notice: z.number(),
    capacity: z.number(),
  }),
  paymentDefaults: z.object({
    provider: z.union([z.string(), z.null()]),
    handle: z.union([z.string(), z.null()]),
    primaryProvider: z.union([z.string(), z.null()]).optional(),
    handles: z
      .object({
        venmo: z.union([z.string(), z.null()]),
        paypal: z.union([z.string(), z.null()]),
        cashapp: z.union([z.string(), z.null()]),
      })
      .optional(),
  }),
  paymentIntegrations: AdminPaymentIntegrationsSchema.optional().default({
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
  }),
});

const AdminMutationOkSchema = z.object({ ok: z.literal(true) });
const AdminPaymentIntegrationsResponseSchema = z.object({
  ok: z.literal(true),
  payments: AdminPaymentIntegrationsSchema,
});
const AdminSyncQueueMutationSchema = z.object({
  ok: z.literal(true),
  action: z.union([
    z.literal("process"),
    z.literal("retry_dead_letters"),
    z.literal("purge_dead_letters"),
  ]),
  claimed: z.number().optional(),
  processed: z.number().optional(),
  failed: z.number().optional(),
  deadLettered: z.number().optional(),
  requeued: z.number().optional(),
  deleted: z.number().optional(),
});

const AdminProgramsResponseSchema = z.object({
  ok: z.literal(true),
  programs: z.array(
    z.object({
      slug: z.string(),
      href: z.string(),
      label: z.string(),
      activityName: z.string(),
      pageTitle: z.string(),
      eyebrow: z.string(),
      heroTitleLines: z.array(z.string()),
      heroSubtitle: z.string(),
      description: z.string(),
      icon: z.string(),
      eyebrowClass: z.string().optional(),
      glowClass: z.string().optional(),
      formGlowClass: z.string().optional(),
      serviceStatusNote: z.string().optional(),
      enabled: z.boolean(),
      sortOrder: z.number(),
    }),
  ),
});

const AdminMeResponseSchema = z.object({
  ok: z.literal(true),
  authenticated: z.boolean(),
  user: z
    .object({
      id: z.union([z.string(), z.null()]),
      email: z.union([z.string(), z.null()]),
      name: z.union([z.string(), z.null()]),
    })
    .optional(),
});

const AdminEventsResponseSchema = z.object({
  ok: z.literal(true),
  upcoming: z.array(
    z.object({
      id: z.number(),
      activitySlug: z.string(),
      activityLabel: z.string(),
      title: z.string(),
      startsAt: z.string(),
      endsAt: z.string(),
      capacity: z.number(),
      seatsTaken: z.number(),
      seatsLeft: z.number(),
      waitlistCount: z.number(),
      costCents: z.number(),
      currency: z.string(),
      paymentProvider: z.union([z.string(), z.null()]),
      paymentHandle: z.union([z.string(), z.null()]),
      paymentNoteTemplate: z.union([z.string(), z.null()]),
      recapText: z.union([z.string(), z.null()]),
      heroImageUrl: z.union([z.string(), z.null()]),
      participants: z.array(
        z.object({
          userId: z.string(),
          name: z.union([z.string(), z.null()]),
          avatarUrl: z.union([z.string(), z.null()]),
        }),
      ),
    }),
  ),
  recent: z.array(
    z.object({
      id: z.number(),
      activitySlug: z.string(),
      activityLabel: z.string(),
      title: z.string(),
      startsAt: z.string(),
      endsAt: z.string(),
      capacity: z.number(),
      seatsTaken: z.number(),
      seatsLeft: z.number(),
      waitlistCount: z.number(),
      costCents: z.number(),
      currency: z.string(),
      paymentProvider: z.union([z.string(), z.null()]),
      paymentHandle: z.union([z.string(), z.null()]),
      paymentNoteTemplate: z.union([z.string(), z.null()]),
      recapText: z.union([z.string(), z.null()]),
      heroImageUrl: z.union([z.string(), z.null()]),
      participants: z.array(
        z.object({
          userId: z.string(),
          name: z.union([z.string(), z.null()]),
          avatarUrl: z.union([z.string(), z.null()]),
        }),
      ),
    }),
  ),
});

export type AdminStatusResponse = z.infer<typeof AdminStatusResponseSchema>;
export type AdminMutationOk = z.infer<typeof AdminMutationOkSchema>;
export type AdminMeResponse = z.infer<typeof AdminMeResponseSchema>;
export type AdminProgramsResponse = z.infer<typeof AdminProgramsResponseSchema>;
export type AdminEventsResponse = z.infer<typeof AdminEventsResponseSchema>;
export type AdminSyncQueueMutationResponse = z.infer<
  typeof AdminSyncQueueMutationSchema
>;
export type AdminCleanupE2EResponse = z.infer<
  typeof AdminCleanupE2EResponseSchema
>;
export type AdminPaymentIntegrationsResponse = z.infer<
  typeof AdminPaymentIntegrationsResponseSchema
>;

export async function getAdminStatus() {
  return requestApi<AdminStatusResponse>(withAdminApi("/status"), {
    parse: (payload) => AdminStatusResponseSchema.parse(payload),
  });
}

export async function cleanupAdminE2E() {
  return requestApi<AdminCleanupE2EResponse>(withAdminApi("/dev/cleanup-e2e"), {
    method: "POST",
    headers: { origin: window.location.origin },
    parse: (payload) => AdminCleanupE2EResponseSchema.parse(payload),
  });
}

export async function saveAdminRules(input: AdminRulesInput) {
  return requestApi<AdminMutationOk>(withAdminApi("/rules"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    parse: (payload) => AdminMutationOkSchema.parse(payload),
  });
}

export async function getAdminMe() {
  return requestApi<AdminMeResponse>(withAdminApi("/me"), {
    parse: (payload) => AdminMeResponseSchema.parse(payload),
  });
}

export async function getAdminPrograms() {
  return requestApi<AdminProgramsResponse>(withAdminApi("/programs"), {
    parse: (payload) => AdminProgramsResponseSchema.parse(payload),
  });
}

export async function setAdminProgram(input: AdminProgramInput) {
  return requestApi<AdminMutationOk>(withAdminApi("/programs"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "upsert", ...input }),
    parse: (payload) => AdminMutationOkSchema.parse(payload),
  });
}

export async function toggleAdminProgram(slug: string, enabled: boolean) {
  return requestApi<AdminMutationOk>(withAdminApi("/programs"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "toggle", slug, enabled }),
    parse: (payload) => AdminMutationOkSchema.parse(payload),
  });
}

export async function deleteAdminProgram(slug: string) {
  return requestApi<AdminMutationOk>(withAdminApi("/programs"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "delete", slug }),
    parse: (payload) => AdminMutationOkSchema.parse(payload),
  });
}

export async function getAdminEvents() {
  return requestApi<AdminEventsResponse>(withAdminApi("/events"), {
    parse: (payload) => AdminEventsResponseSchema.parse(payload),
  });
}

export async function createAdminEvents(input: AdminEventCreateInput) {
  return requestApi<AdminMutationOk>(withAdminApi("/events"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    parse: (payload) => AdminMutationOkSchema.parse(payload),
  });
}

export async function updateAdminEventCapacity(
  eventId: number,
  capacity: number,
) {
  return requestApi<AdminMutationOk>(withAdminApi(`/events/${eventId}`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "capacity", capacity }),
    parse: (payload) => AdminMutationOkSchema.parse(payload),
  });
}

export async function updateAdminEventMemory(
  eventId: number,
  input: { recapText?: string; heroImageUrl?: string },
) {
  return requestApi<AdminMutationOk>(withAdminApi(`/events/${eventId}`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "memory",
      recapText: input.recapText ?? "",
      heroImageUrl: input.heroImageUrl ?? "",
    }),
    parse: (payload) => AdminMutationOkSchema.parse(payload),
  });
}

export async function updateAdminEventDetails(
  eventId: number,
  input: { title: string; startsAt: string; endsAt: string },
) {
  return requestApi<AdminMutationOk>(withAdminApi(`/events/${eventId}`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "event",
      title: input.title,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
    }),
    parse: (payload) => AdminMutationOkSchema.parse(payload),
  });
}

export async function updateAdminEventAttendance(
  eventId: number,
  input: {
    userId: string;
    attendanceStatus: "unknown" | "attended" | "flaked";
  },
) {
  return requestApi<AdminMutationOk>(withAdminApi(`/events/${eventId}`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "attendance",
      userId: input.userId,
      attendanceStatus: input.attendanceStatus,
    }),
    parse: (payload) => AdminMutationOkSchema.parse(payload),
  });
}

export async function deleteAdminEvent(eventId: number) {
  return requestApi<AdminMutationOk>(withAdminApi(`/events/${eventId}`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "delete" }),
    parse: (payload) => AdminMutationOkSchema.parse(payload),
  });
}

export async function mutateAdminSyncQueue(
  action: AdminSyncQueueAction,
  limit = 10,
) {
  return requestApi<AdminSyncQueueMutationResponse>(
    withAdminApi("/sync-queue"),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, limit }),
      parse: (payload) => AdminSyncQueueMutationSchema.parse(payload),
    },
  );
}

export async function disconnectAdminGoogleIntegration() {
  return requestApi<AdminMutationOk>(
    withAdminApi("/integrations/google/disconnect"),
    {
      method: "POST",
      parse: (payload) => AdminMutationOkSchema.parse(payload),
    },
  );
}

export async function disconnectAdminOutlookIntegration() {
  return requestApi<AdminMutationOk>(
    withAdminApi("/integrations/outlook/disconnect"),
    {
      method: "POST",
      parse: (payload) => AdminMutationOkSchema.parse(payload),
    },
  );
}

export async function disconnectAdminAppleIntegration() {
  return requestApi<AdminMutationOk>(
    withAdminApi("/integrations/apple/disconnect"),
    {
      method: "POST",
      parse: (payload) => AdminMutationOkSchema.parse(payload),
    },
  );
}

export async function connectAdminAppleIntegration(input: {
  username: string;
  appPassword: string;
  calendarUrl: string;
}) {
  return requestApi<AdminMutationOk>(withAdminApi("/integrations/apple"), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    parse: (payload) => AdminMutationOkSchema.parse(payload),
  });
}

export async function getAdminPaymentIntegrations() {
  return requestApi<AdminPaymentIntegrationsResponse>(
    withAdminApi("/integrations/payments"),
    {
      parse: (payload) => AdminPaymentIntegrationsResponseSchema.parse(payload),
    },
  );
}

export async function saveAdminPayPalIntegration(input: {
  clientId: string;
  clientSecret: string;
  environment: "sandbox" | "live";
}) {
  return requestApi<AdminMutationOk>(withAdminApi("/integrations/payments"), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider: "paypal", ...input }),
    parse: (payload) => AdminMutationOkSchema.parse(payload),
  });
}

export async function saveAdminSquareIntegration(input: {
  applicationId: string;
  locationId: string;
  accessToken: string;
  environment: "sandbox" | "live";
}) {
  return requestApi<AdminMutationOk>(withAdminApi("/integrations/payments"), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider: "square", ...input }),
    parse: (payload) => AdminMutationOkSchema.parse(payload),
  });
}

export async function deleteAdminPaymentIntegration(
  provider: "paypal" | "square",
) {
  return requestApi<AdminMutationOk>(
    withAdminApi(
      `/integrations/payments?provider=${encodeURIComponent(provider)}`,
    ),
    {
      method: "DELETE",
      parse: (payload) => AdminMutationOkSchema.parse(payload),
    },
  );
}

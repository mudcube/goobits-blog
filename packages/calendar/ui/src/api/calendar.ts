import { requestApi } from "./http";
import { z } from "zod";
import { getCalendarUiConfig, withCalendarApi } from "../config";

export type CreateInviteInput = {
  email: string | null;
  uses: number;
  expiresInDays: number;
};

const CalendarOAuthStartResponseSchema = z.object({
  authUrl: z.string(),
  provider: z.union([z.literal("google"), z.literal("outlook")]).optional(),
});

const CalendarMutationOkSchema = z.object({
  ok: z.literal(true),
});

const CalendarAdminInviteSchema = z.object({
  id: z.union([z.number(), z.string()]),
  code: z.string(),
  email: z.union([z.string(), z.null()]),
  uses_remaining: z.union([z.number(), z.null()]),
  expires_at: z.union([z.number(), z.null()]),
  created_at: z.number(),
  times_used: z.union([z.number(), z.string()]).optional(),
});

const CalendarInvitesResponseSchema = z.object({
  ok: z.literal(true),
  invites: z.array(CalendarAdminInviteSchema),
});

const CalendarAdminUserSchema = z.object({
  id: z.union([z.number(), z.string()]),
  email: z.string(),
  name: z.union([z.string(), z.null()]),
  avatar_url: z.union([z.string(), z.null()]),
  email_verified: z.union([z.number(), z.boolean()]),
  last_login_at: z.union([z.number(), z.null()]),
  provider: z.union([z.string(), z.null()]),
});

const CalendarUsersResponseSchema = z.object({
  ok: z.literal(true),
  users: z.array(CalendarAdminUserSchema),
});

const CalendarUserAccessResponseSchema = z.object({
  ok: z.literal(true),
  access: z.array(
    z.object({
      programSlug: z.string(),
      allowed: z.boolean(),
    }),
  ),
});

const CalendarPaymentDefaultsResponseSchema = z.object({
  ok: z.literal(true),
  payment: z.object({
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
});

const CalendarEventTemplatesResponseSchema = z.object({
  ok: z.literal(true),
  templates: z.array(
    z.object({
      id: z.number(),
      title: z.string(),
      activitySlug: z.string(),
      capacity: z.number(),
      costCents: z.number(),
      currency: z.string(),
      paymentProvider: z.union([z.string(), z.null()]),
      paymentHandle: z.union([z.string(), z.null()]),
      paymentNoteTemplate: z.union([z.string(), z.null()]),
      location: z.union([z.string(), z.null()]),
      note: z.union([z.string(), z.null()]),
    }),
  ),
});

const CalendarAdminEventDetailResponseSchema = z.object({
  ok: z.literal(true),
  event: z.object({
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
  }),
  attendees: z.array(
    z.object({
      entryId: z.number(),
      userId: z.string(),
      name: z.union([z.string(), z.null()]),
      email: z.union([z.string(), z.null()]),
      status: z.union([z.literal("joined"), z.literal("waitlist")]),
      guestCount: z.number(),
      waitlistPosition: z.union([z.number(), z.null()]),
      attendanceStatus: z.union([
        z.literal("unknown"),
        z.literal("attended"),
        z.literal("flaked"),
      ]),
    }),
  ),
  weather: z.union([
    z.object({
      summary: z.string(),
      temperatureF: z.number(),
    }),
    z.null(),
  ]),
});

const CalendarPromoteResponseSchema = z.object({
  ok: z.literal(true),
  status: z.union([
    z.literal("promoted"),
    z.literal("already_joined"),
    z.literal("full"),
  ]),
});

const CalendarFeedEventSchema = z.object({
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
  userStatus: z.union([z.literal("joined"), z.literal("waitlist"), z.null()]),
  userGuestCount: z.number(),
  location: z.union([z.string(), z.null()]),
  note: z.union([z.string(), z.null()]),
  costCents: z.number(),
  currency: z.string(),
  paymentProvider: z.union([z.string(), z.null()]),
  paymentHandle: z.union([z.string(), z.null()]),
  paymentNoteTemplate: z.union([z.string(), z.null()]),
  recapText: z.union([z.string(), z.null()]),
  heroImageUrl: z.union([z.string(), z.null()]),
  payUrl: z.union([z.string(), z.null()]).optional(),
  participants: z.array(
    z.object({
      userId: z.string(),
      name: z.union([z.string(), z.null()]),
      avatarUrl: z.union([z.string(), z.null()]),
    }),
  ),
});

const CalendarEventsResponseSchema = z.object({
  ok: z.literal(true),
  upcoming: z.array(CalendarFeedEventSchema),
  recent: z.array(CalendarFeedEventSchema),
});

const CalendarJoinResponseSchema = z.object({
  ok: z.literal(true),
  status: z.union([z.literal("joined"), z.literal("waitlist")]),
  confirmationId: z.union([z.string(), z.null()]).optional(),
  state: z
    .object({
      seatsTaken: z.number(),
      seatsLeft: z.number(),
      waitlistCount: z.number(),
      userStatus: z.union([
        z.literal("joined"),
        z.literal("waitlist"),
        z.null(),
      ]),
      userGuestCount: z.number(),
    })
    .nullable()
    .optional(),
});

const CalendarPaymentConfigResponseSchema = z.object({
  ok: z.literal(true),
  payments: z.object({
    paypal: z.object({
      clientId: z.union([z.string(), z.null()]),
      enabled: z.boolean(),
    }),
    square: z.object({
      applicationId: z.union([z.string(), z.null()]),
      locationId: z.union([z.string(), z.null()]),
      environment: z.union([z.literal("sandbox"), z.literal("production")]),
      enabled: z.boolean(),
    }),
  }),
});

const CalendarPayPalOrderResponseSchema = z.object({
  ok: z.literal(true),
  orderId: z.string(),
});

const CalendarPayPalCaptureResponseSchema = z.object({
  ok: z.literal(true),
  orderId: z.string(),
  status: z.string(),
});

const CalendarCashAppPaymentResponseSchema = z.object({
  ok: z.literal(true),
  paymentId: z.string(),
  status: z.string(),
  receiptUrl: z.union([z.string(), z.null()]),
});

const CalendarLeaveResponseSchema = z.object({
  ok: z.literal(true),
  state: z
    .object({
      seatsTaken: z.number(),
      seatsLeft: z.number(),
      waitlistCount: z.number(),
      userStatus: z.union([
        z.literal("joined"),
        z.literal("waitlist"),
        z.null(),
      ]),
      userGuestCount: z.number(),
    })
    .nullable()
    .optional(),
});

const CalendarProfileSchema = z.object({
  emergencyContact: z.string(),
  dietaryRestrictions: z.string(),
  chatHandle: z.string(),
});

const CalendarProfileResponseSchema = z.object({
  ok: z.literal(true),
  profile: CalendarProfileSchema,
});

export type CalendarOAuthStartResponse = z.infer<
  typeof CalendarOAuthStartResponseSchema
>;
export type CalendarMutationOk = z.infer<typeof CalendarMutationOkSchema>;
export type CalendarAdminInvite = z.infer<typeof CalendarAdminInviteSchema>;
export type CalendarInvitesResponse = z.infer<
  typeof CalendarInvitesResponseSchema
>;
export type CalendarAdminUser = z.infer<typeof CalendarAdminUserSchema>;
export type CalendarUsersResponse = z.infer<typeof CalendarUsersResponseSchema>;
export type CalendarEventsResponse = z.infer<
  typeof CalendarEventsResponseSchema
>;
export type CalendarJoinResponse = z.infer<typeof CalendarJoinResponseSchema>;
export type CalendarLeaveResponse = z.infer<typeof CalendarLeaveResponseSchema>;
export type CalendarProfile = z.infer<typeof CalendarProfileSchema>;
export type CalendarPaymentConfigResponse = z.infer<
  typeof CalendarPaymentConfigResponseSchema
>;
export type CalendarPayPalOrderResponse = z.infer<
  typeof CalendarPayPalOrderResponseSchema
>;
export type CalendarPayPalCaptureResponse = z.infer<
  typeof CalendarPayPalCaptureResponseSchema
>;
export type CalendarCashAppPaymentResponse = z.infer<
  typeof CalendarCashAppPaymentResponseSchema
>;
export type CalendarUserAccessResponse = z.infer<
  typeof CalendarUserAccessResponseSchema
>;
export type CalendarPaymentDefaultsResponse = z.infer<
  typeof CalendarPaymentDefaultsResponseSchema
>;
export type CalendarEventTemplatesResponse = z.infer<
  typeof CalendarEventTemplatesResponseSchema
>;
export type CalendarAdminEventDetailResponse = z.infer<
  typeof CalendarAdminEventDetailResponseSchema
>;
export type CalendarPromoteResponse = z.infer<
  typeof CalendarPromoteResponseSchema
>;

export async function startCalendarOAuth(
  input: { provider?: "google" | "outlook" } = {},
) {
  return requestApi<CalendarOAuthStartResponse>(
    withCalendarApi("/oauth-start"),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: input.provider ?? "google" }),
      parse: (payload) => CalendarOAuthStartResponseSchema.parse(payload),
    },
  );
}

export async function getCalendarAdminInvites() {
  const base = getCalendarUiConfig().routes.apiCalendarAdminBase;
  return requestApi<CalendarInvitesResponse>(`${base}/invites`, {
    parse: (payload) => CalendarInvitesResponseSchema.parse(payload),
  });
}

export async function getCalendarAdminUsers() {
  const base = getCalendarUiConfig().routes.apiCalendarAdminBase;
  return requestApi<CalendarUsersResponse>(`${base}/users`, {
    parse: (payload) => CalendarUsersResponseSchema.parse(payload),
  });
}

export async function getCalendarAdminUserAccess(userId: string) {
  const base = getCalendarUiConfig().routes.apiCalendarAdminBase;
  return requestApi<CalendarUserAccessResponse>(
    `${base}/users/${encodeURIComponent(userId)}/access`,
    {
      parse: (payload) => CalendarUserAccessResponseSchema.parse(payload),
    },
  );
}

export async function saveCalendarAdminUserAccess(
  userId: string,
  access: Array<{ programSlug: string; allowed: boolean }>,
) {
  const base = getCalendarUiConfig().routes.apiCalendarAdminBase;
  return requestApi<CalendarMutationOk>(
    `${base}/users/${encodeURIComponent(userId)}/access`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access }),
      parse: (payload) => CalendarMutationOkSchema.parse(payload),
    },
  );
}

export async function createCalendarInvite(input: CreateInviteInput) {
  const base = getCalendarUiConfig().routes.apiCalendarAdminBase;
  return requestApi<CalendarMutationOk>(`${base}/invites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    parse: (payload) => CalendarMutationOkSchema.parse(payload),
  });
}

export async function deleteCalendarInvite(id: string) {
  const base = getCalendarUiConfig().routes.apiCalendarAdminBase;
  return requestApi<CalendarMutationOk>(
    `${base}/invites?id=${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      parse: (payload) => CalendarMutationOkSchema.parse(payload),
    },
  );
}

export async function getCalendarAdminPaymentDefaults() {
  const base = getCalendarUiConfig().routes.apiCalendarAdminBase;
  return requestApi<CalendarPaymentDefaultsResponse>(
    `${base}/settings/payment`,
    {
      parse: (payload) => CalendarPaymentDefaultsResponseSchema.parse(payload),
    },
  );
}

export async function saveCalendarAdminPaymentDefaults(input: {
  provider?: string | null;
  handle?: string | null;
  primaryProvider?: string | null;
  handles?: {
    venmo?: string | null;
    paypal?: string | null;
    cashapp?: string | null;
  };
}) {
  const base = getCalendarUiConfig().routes.apiCalendarAdminBase;
  return requestApi<CalendarMutationOk>(`${base}/settings/payment`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    parse: (payload) => CalendarMutationOkSchema.parse(payload),
  });
}

export async function getCalendarAdminEventTemplates() {
  const base = getCalendarUiConfig().routes.apiCalendarAdminBase;
  return requestApi<CalendarEventTemplatesResponse>(
    `${base}/events/templates`,
    {
      parse: (payload) => CalendarEventTemplatesResponseSchema.parse(payload),
    },
  );
}

export async function getCalendarAdminEventDetail(eventId: number) {
  const base = getCalendarUiConfig().routes.apiCalendarAdminBase;
  return requestApi<CalendarAdminEventDetailResponse>(
    `${base}/events/${eventId}/detail`,
    {
      parse: (payload) => CalendarAdminEventDetailResponseSchema.parse(payload),
    },
  );
}

export async function promoteCalendarWaitlistEntry(
  eventId: number,
  entryId: number,
) {
  const base = getCalendarUiConfig().routes.apiCalendarAdminBase;
  return requestApi<CalendarPromoteResponse>(
    `${base}/events/${eventId}/waitlist/${entryId}/promote`,
    {
      method: "POST",
      parse: (payload) => CalendarPromoteResponseSchema.parse(payload),
    },
  );
}

export async function logoutCalendarSession() {
  const authBase = getCalendarUiConfig().routes.authBase;
  const response = await fetch(`${authBase}/logout`, {
    method: "POST",
    redirect: "follow",
  });

  if (response.status >= 500) {
    throw new Error(`Logout failed (${response.status})`);
  }
}

export async function getCalendarEvents(input: { mine?: boolean } = {}) {
  const qs = new URLSearchParams();
  if (input.mine) qs.set("mine", "1");
  return requestApi<CalendarEventsResponse>(
    `${withCalendarApi("/events")}${qs.size > 0 ? `?${qs.toString()}` : ""}`,
    {
      parse: (payload) => CalendarEventsResponseSchema.parse(payload),
    },
  );
}

export async function joinCalendarEvent(
  eventId: number,
  input: { guestCount?: number; note?: string } = {},
) {
  return requestApi<CalendarJoinResponse>(
    withCalendarApi(`/events/${eventId}/join`),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      parse: (payload) => CalendarJoinResponseSchema.parse(payload),
    },
  );
}

export async function leaveCalendarEvent(eventId: number) {
  return requestApi<CalendarLeaveResponse>(
    withCalendarApi(`/events/${eventId}/leave`),
    {
      method: "POST",
      parse: (payload) => CalendarLeaveResponseSchema.parse(payload),
    },
  );
}

export async function getCalendarPaymentConfig() {
  return requestApi<CalendarPaymentConfigResponse>(
    withCalendarApi("/payments/config"),
    {
      parse: (payload) => CalendarPaymentConfigResponseSchema.parse(payload),
    },
  );
}

export async function createCalendarPayPalOrder(input: {
  eventId: number;
  confirmationId?: string | null;
  fundingSource?: "paypal" | "venmo";
}) {
  return requestApi<CalendarPayPalOrderResponse>(
    withCalendarApi("/payments/paypal/order"),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      parse: (payload) => CalendarPayPalOrderResponseSchema.parse(payload),
    },
  );
}

export async function captureCalendarPayPalOrder(orderId: string) {
  return requestApi<CalendarPayPalCaptureResponse>(
    withCalendarApi("/payments/paypal/capture"),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
      parse: (payload) => CalendarPayPalCaptureResponseSchema.parse(payload),
    },
  );
}

export async function createCalendarCashAppPayment(input: {
  eventId: number;
  confirmationId?: string | null;
  sourceId: string;
}) {
  return requestApi<CalendarCashAppPaymentResponse>(
    withCalendarApi("/payments/cashapp"),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      parse: (payload) => CalendarCashAppPaymentResponseSchema.parse(payload),
    },
  );
}

export async function getCalendarProfile() {
  return requestApi<CalendarProfileResponse>(withCalendarApi("/profile"), {
    parse: (payload) => CalendarProfileResponseSchema.parse(payload),
  });
}

type CalendarProfileResponse = z.infer<typeof CalendarProfileResponseSchema>;

export async function saveCalendarProfile(input: CalendarProfile) {
  return requestApi<CalendarMutationOk>(withCalendarApi("/profile"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    parse: (payload) => CalendarMutationOkSchema.parse(payload),
  });
}

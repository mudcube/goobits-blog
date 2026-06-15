import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createSqliteDb } from "../../../kit/src/dev/sqliteDb.ts";
import { grantCalendarAdmin } from "../../src/access/admin-permissions.ts";
import { getAdminEventDetail } from "../../src/services/admin/event-detail.ts";
import { promoteWaitlistedParticipant } from "../../src/services/bookings/promote-waitlist.ts";
import {
  createPayPalCheckoutOrder,
  createSquareCashAppPayment,
  getPaymentCheckoutConfig,
  getPaymentCheckoutContext,
  savePayPalPaymentCredentials,
  saveSquarePaymentCredentials,
} from "../../src/services/payments/checkout.ts";
import {
  getAdminPaymentDefaults,
  setAdminPaymentDefaults,
} from "../../src/services/payments/admin-payment-defaults.ts";
import {
  enqueueCalendarSyncJob,
  processCalendarSyncQueue,
} from "../../src/services/sync/queue.ts";
import {
  setActiveCalendarSyncProvider,
  type CalendarSyncProvider,
} from "../../src/sync/settings.ts";
import {
  canManageCalendarEvent,
  acceptCalendarTenantInvite,
  createCalendarTenantForUser,
  createCalendarTenantInvite,
  getCalendarTenantRole,
  listPublicCalendarTenantEvents,
  validateCalendarTenantInvite,
} from "../../src/tenants.ts";
import type { D1DatabaseLike } from "../../src/storage/d1.ts";

const dbDirs: string[] = [];

afterEach(() => {
  for (const dir of dbDirs.splice(0)) {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});

function createTestDb() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "calendar-core-test-"));
  const dbPath = path.join(dir, "db.sqlite");
  dbDirs.push(dir);
  return createSqliteDb({ dbPath }) as D1DatabaseLike;
}

async function createEvent(
  db: D1DatabaseLike,
  input: { capacity: number; status?: string; tenantId?: number },
) {
  const result = await db
    .prepare(
      `INSERT INTO calendar_events (tenant_id, activity_slug, title, starts_at, ends_at, capacity, status, location, note)
		 VALUES (?, 'studio', 'Test Event', '2026-04-29T10:00:00.000Z', '2026-04-29T11:00:00.000Z', ?, ?, 'Studio', 'Bring water')`,
    )
    .bind(input.tenantId ?? 1, input.capacity, input.status ?? "scheduled")
    .run();
  return result.meta.last_row_id;
}

async function createParticipant(
  db: D1DatabaseLike,
  input: {
    eventId: number;
    userId: string;
    status: "joined" | "waitlist";
    guestCount?: number;
    createdAt?: number;
  },
) {
  const result = await db
    .prepare(
      `INSERT INTO calendar_event_participants (event_id, user_id, guest_count, status, created_at, updated_at)
		 VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      input.eventId,
      input.userId,
      input.guestCount ?? 0,
      input.status,
      input.createdAt ?? 100,
      input.createdAt ?? 100,
    )
    .run();
  return result.meta.last_row_id;
}

describe("calendar regression coverage", () => {
  it("counts guest seats in admin event detail", async () => {
    const db = createTestDb();
    const eventId = await createEvent(db, { capacity: 3 });
    await createParticipant(db, {
      eventId,
      userId: "u1",
      status: "joined",
      guestCount: 1,
    });
    await createParticipant(db, {
      eventId,
      userId: "u2",
      status: "waitlist",
      guestCount: 2,
    });

    const detail = await getAdminEventDetail(db, eventId);

    expect(detail?.event.seatsTaken).toBe(2);
    expect(detail?.event.seatsLeft).toBe(1);
    expect(detail?.event.waitlistCount).toBe(1);
    expect(
      detail?.attendees.find((attendee) => attendee.userId === "u1")
        ?.guestCount,
    ).toBe(1);
    expect(
      detail?.attendees.find((attendee) => attendee.userId === "u2")
        ?.guestCount,
    ).toBe(2);
  });

  it("does not promote waitlisted participants when guest seats exceed capacity", async () => {
    const db = createTestDb();
    const eventId = await createEvent(db, { capacity: 2 });
    await createParticipant(db, {
      eventId,
      userId: "joined",
      status: "joined",
      guestCount: 1,
    });
    const entryId = await createParticipant(db, {
      eventId,
      userId: "waitlisted",
      status: "waitlist",
    });

    const fullResult = await promoteWaitlistedParticipant(db, {
      eventId,
      entryId,
    });
    const stillWaitlisted = await db
      .prepare(`SELECT status FROM calendar_event_participants WHERE id = ?`)
      .bind(entryId)
      .first<{ status: string }>();

    expect(fullResult.status).toBe("full");
    expect(stillWaitlisted?.status).toBe("waitlist");

    await db
      .prepare(`UPDATE calendar_events SET capacity = 3 WHERE id = ?`)
      .bind(eventId)
      .run();

    const promotedResult = await promoteWaitlistedParticipant(db, {
      eventId,
      entryId,
    });
    const promoted = await db
      .prepare(`SELECT status FROM calendar_event_participants WHERE id = ?`)
      .bind(entryId)
      .first<{ status: string }>();

    expect(promotedResult.status).toBe("promoted");
    expect(promoted?.status).toBe("joined");
  });

  it("reclaims stale processing sync jobs", async () => {
    const db = createTestDb();
    const eventId = await createEvent(db, { capacity: 5 });
    await db
      .prepare(
        `INSERT INTO calendar_sync_jobs (
			 event_id, trigger, status, attempt_count, next_attempt_at, locked_at, locked_by, created_at, updated_at
			) VALUES (?, 'stale-test', 'processing', 0, unixepoch() + 3600, unixepoch() - 1200, 'dead-worker', unixepoch() - 1200, unixepoch() - 1200)`,
      )
      .bind(eventId)
      .run();

    const result = await processCalendarSyncQueue(
      db,
      { CALENDAR_SYNC_MODE: "mock" },
      5,
    );
    const job = await db
      .prepare(
        `SELECT status, locked_at, locked_by FROM calendar_sync_jobs WHERE event_id = ?`,
      )
      .bind(eventId)
      .first<{
        status: string;
        locked_at: number | null;
        locked_by: string | null;
      }>();

    expect(result).toEqual({
      claimed: 1,
      processed: 1,
      failed: 0,
      deadLettered: 0,
    });
    expect(job).toMatchObject({
      status: "done",
      locked_at: null,
      locked_by: null,
    });
  });

  it("clears existing sync metadata for canceled events in mock sync mode", async () => {
    const db = createTestDb();
    const eventId = await createEvent(db, { capacity: 5, status: "canceled" });
    await db
      .prepare(
        `INSERT INTO calendar_event_sync (
				event_id,
				google_event_id,
				google_html_link,
				outlook_event_id,
				outlook_html_link,
				apple_event_id,
				apple_html_link,
				last_synced_at,
				updated_at
			 )
			 VALUES (
				?,
				'google-old',
				'https://example.com/google-old',
				'outlook-old',
				'https://example.com/outlook-old',
				'apple-old',
				'https://example.com/apple-old',
				unixepoch() - 100,
				unixepoch() - 100
			 )`,
      )
      .bind(eventId)
      .run();
    await enqueueCalendarSyncJob(db, { eventId, trigger: "cancel-test" });

    const result = await processCalendarSyncQueue(
      db,
      { CALENDAR_SYNC_MODE: "mock" },
      5,
    );
    const sync = await db
      .prepare(
        `SELECT
				google_event_id,
				google_html_link,
				outlook_event_id,
				outlook_html_link,
				apple_event_id,
				apple_html_link,
				last_error
			 FROM calendar_event_sync
			 WHERE event_id = ?`,
      )
      .bind(eventId)
      .first<{
        google_event_id: string | null;
        google_html_link: string | null;
        outlook_event_id: string | null;
        outlook_html_link: string | null;
        apple_event_id: string | null;
        apple_html_link: string | null;
        last_error: string | null;
      }>();

    expect(result).toEqual({
      claimed: 1,
      processed: 1,
      failed: 0,
      deadLettered: 0,
    });
    expect(sync).toEqual({
      google_event_id: null,
      google_html_link: null,
      outlook_event_id: null,
      outlook_html_link: null,
      apple_event_id: null,
      apple_html_link: null,
      last_error: null,
    });
  });

  it.each([
    ["google", "google_event_id"],
    ["outlook", "outlook_event_id"],
    ["apple", "apple_event_id"],
  ] satisfies Array<
    [
      CalendarSyncProvider,
      "google_event_id" | "outlook_event_id" | "apple_event_id",
    ]
  >)(
    "writes mock sync metadata to the active %s provider columns",
    async (provider, providerColumn) => {
      const db = createTestDb();
      const eventId = await createEvent(db, { capacity: 5 });
      await setActiveCalendarSyncProvider(db, provider);
      await enqueueCalendarSyncJob(db, {
        eventId,
        trigger: `${provider}-provider-test`,
      });

      const result = await processCalendarSyncQueue(
        db,
        { CALENDAR_SYNC_MODE: "mock" },
        5,
      );
      const sync = await db
        .prepare(
          `SELECT google_event_id, outlook_event_id, apple_event_id, last_error
				 FROM calendar_event_sync
				 WHERE event_id = ?`,
        )
        .bind(eventId)
        .first<{
          google_event_id: string | null;
          outlook_event_id: string | null;
          apple_event_id: string | null;
          last_error: string | null;
        }>();

      expect(result).toEqual({
        claimed: 1,
        processed: 1,
        failed: 0,
        deadLettered: 0,
      });
      expect(sync?.[providerColumn]).toBe(`mock_${provider}_${eventId}_1`);
      expect(sync?.last_error).toBeNull();
      for (const column of [
        "google_event_id",
        "outlook_event_id",
        "apple_event_id",
      ] as const) {
        if (column !== providerColumn) expect(sync?.[column]).toBeNull();
      }
    },
  );

  it("only builds payment checkout context for the signed-in joined paid booking", async () => {
    const db = createTestDb();
    const eventId = await createEvent(db, { capacity: 5 });
    await db
      .prepare(
        `UPDATE calendar_events
			 SET cost_cents = 1500, currency = 'USD', payment_provider = 'paypal', payment_handle = 'billing@example.com'
			 WHERE id = ?`,
      )
      .bind(eventId)
      .run();
    await createParticipant(db, {
      eventId,
      userId: "joined-user",
      status: "joined",
    });
    await db
      .prepare(
        `UPDATE calendar_event_participants
			 SET confirmation_id = 'confirm-paid'
			 WHERE event_id = ? AND user_id = 'joined-user'`,
      )
      .bind(eventId)
      .run();
    await createParticipant(db, {
      eventId,
      userId: "waitlisted-user",
      status: "waitlist",
    });

    const context = await getPaymentCheckoutContext(db, {
      eventId,
      userId: "joined-user",
      confirmationId: "confirm-paid",
    });
    const wrongUser = await getPaymentCheckoutContext(db, {
      eventId,
      userId: "other-user",
      confirmationId: "confirm-paid",
    });
    const waitlisted = await getPaymentCheckoutContext(db, {
      eventId,
      userId: "waitlisted-user",
    });

    expect(context).toMatchObject({
      eventId,
      userId: "joined-user",
      confirmationId: "confirm-paid",
      amountCents: 1500,
      currency: "USD",
      paymentProvider: "paypal",
      paymentHandle: "billing@example.com",
    });
    expect(wrongUser).toBeNull();
    expect(waitlisted).toBeNull();
  });

  it("loads encrypted payment checkout credentials from settings before env fallback", async () => {
    const db = createTestDb();
    const base64Key = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
    await savePayPalPaymentCredentials({
      db,
      base64Key,
      clientId: "stored-paypal-client",
      clientSecret: "stored-paypal-secret",
      environment: "live",
    });
    await saveSquarePaymentCredentials({
      db,
      base64Key,
      applicationId: "stored-square-app",
      locationId: "stored-square-location",
      accessToken: "stored-square-token",
      environment: "sandbox",
    });

    const config = await getPaymentCheckoutConfig({
      db,
      base64Key,
      env: {
        PAYPAL_CLIENT_ID: "env-paypal-client",
        PAYPAL_CLIENT_SECRET: "env-paypal-secret",
        PUBLIC_SQUARE_APPLICATION_ID: "env-square-app",
        PUBLIC_SQUARE_LOCATION_ID: "env-square-location",
        SQUARE_ACCESS_TOKEN: "env-square-token",
      },
    });

    expect(config).toEqual({
      paypal: {
        clientId: "stored-paypal-client",
        environment: "live",
        source: "stored",
        enabled: true,
      },
      square: {
        applicationId: "stored-square-app",
        locationId: "stored-square-location",
        environment: "sandbox",
        source: "stored",
        enabled: true,
      },
    });
  });

  it("hydrates structured payment defaults from legacy settings", async () => {
    const db = createTestDb();
    await setAdminPaymentDefaults(db, {
      provider: "paypal",
      handle: "billing@example.com",
    });

    const defaults = await getAdminPaymentDefaults(db);

    expect(defaults).toEqual({
      provider: "paypal",
      handle: "billing@example.com",
      primaryProvider: "paypal",
      handles: {
        venmo: null,
        paypal: "billing@example.com",
        cashapp: null,
      },
    });
  });

  it("writes per-provider handles and keeps the legacy primary mirror in sync", async () => {
    const db = createTestDb();
    await setAdminPaymentDefaults(db, {
      primaryProvider: "cashapp",
      handles: {
        venmo: "@miko",
        paypal: "billing@example.com",
        cashapp: "$miko",
      },
    });

    const defaults = await getAdminPaymentDefaults(db);
    const legacyRows = await db
      .prepare(
        `SELECT key, value FROM calendar_admin_settings
				 WHERE key IN ('payment_provider', 'payment_handle')
				 ORDER BY key`,
      )
      .all<{ key: string; value: string | null }>();

    expect(defaults).toEqual({
      provider: "cashapp",
      handle: "$miko",
      primaryProvider: "cashapp",
      handles: {
        venmo: "@miko",
        paypal: "billing@example.com",
        cashapp: "$miko",
      },
    });
    expect(legacyRows.results).toEqual([
      { key: "payment_handle", value: "$miko" },
      { key: "payment_provider", value: "cashapp" },
    ]);
  });

  it("rejects checkout rails that do not match the event payment provider", async () => {
    const db = createTestDb();
    const eventId = await createEvent(db, { capacity: 5 });
    await db
      .prepare(
        `UPDATE calendar_events
				 SET cost_cents = 1500, currency = 'USD', payment_provider = 'cashapp', payment_handle = '$miko'
				 WHERE id = ?`,
      )
      .bind(eventId)
      .run();
    await createParticipant(db, {
      eventId,
      userId: "joined-user",
      status: "joined",
    });
    const context = await getPaymentCheckoutContext(db, {
      eventId,
      userId: "joined-user",
    });
    if (!context) throw new Error("missing payment context");

    await expect(
      createPayPalCheckoutOrder({
        db,
        env: {},
        context,
        fundingSource: "paypal",
      }),
    ).rejects.toThrow("Payment method is not available");

    await db
      .prepare(
        `UPDATE calendar_events
				 SET payment_provider = 'paypal', payment_handle = 'billing@example.com'
				 WHERE id = ?`,
      )
      .bind(eventId)
      .run();
    const paypalContext = await getPaymentCheckoutContext(db, {
      eventId,
      userId: "joined-user",
    });
    if (!paypalContext) throw new Error("missing paypal payment context");

    await expect(
      createSquareCashAppPayment({
        db,
        env: {},
        context: paypalContext,
        sourceId: "cnon:test",
      }),
    ).rejects.toThrow("Payment method is not available");
  });

  it("creates user tenant pages with public event listings", async () => {
    const db = createTestDb();
    const tenant = await createCalendarTenantForUser(db, {
      userId: "organizer-1",
      name: "Portland Jams",
    });
    const eventId = await createEvent(db, { capacity: 10 });
    await db
      .prepare(
        `UPDATE calendar_events
         SET tenant_id = ?, activity_slug = 'gym', title = 'Open jam',
             starts_at = '2036-04-29T10:00:00.000Z',
             ends_at = '2036-04-29T11:00:00.000Z'
         WHERE id = ?`,
      )
      .bind(tenant.id, eventId)
      .run();
    await createParticipant(db, {
      eventId,
      userId: "joined-user",
      status: "joined",
      guestCount: 1,
    });

    const events = await listPublicCalendarTenantEvents(db, {
      tenantId: tenant.id,
    });

    expect(tenant.slug).toBe("portland-jams");
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      id: eventId,
      title: "Open jam",
      seatsTaken: 2,
      capacity: 10,
    });
  });

  it("allows only tenant managers or global admins to manage tenant events", async () => {
    const db = createTestDb();
    const tenant = await createCalendarTenantForUser(db, {
      userId: "owner-1",
      name: "Owner Crew",
    });
    const otherTenant = await createCalendarTenantForUser(db, {
      userId: "owner-2",
      name: "Other Crew",
    });
    await db
      .prepare(
        `INSERT INTO calendar_tenant_members (tenant_id, user_id, role, created_at, updated_at)
         VALUES (?, 'admin-1', 'admin', unixepoch(), unixepoch()),
                (?, 'member-1', 'member', unixepoch(), unixepoch())`,
      )
      .bind(tenant.id, tenant.id)
      .run();
    const eventId = await createEvent(db, {
      capacity: 10,
      tenantId: tenant.id,
    });
    const otherEventId = await createEvent(db, {
      capacity: 10,
      tenantId: otherTenant.id,
    });
    const adminUser = await db
      .prepare(
        `INSERT INTO calendar_users (email, name, email_verified, created_at, last_login_at)
         VALUES ('global-admin@example.com', 'Global Admin', 1, unixepoch(), unixepoch())`,
      )
      .run();
    const globalAdminId = String(adminUser.meta.last_row_id);
    await grantCalendarAdmin({ db, userId: globalAdminId });

    await expect(canManageCalendarEvent(db, {
      eventId,
      userId: "owner-1",
    })).resolves.toMatchObject({ ok: true, role: "owner", tenantId: tenant.id });
    await expect(canManageCalendarEvent(db, {
      eventId,
      userId: "admin-1",
    })).resolves.toMatchObject({ ok: true, role: "admin", tenantId: tenant.id });
    await expect(canManageCalendarEvent(db, {
      eventId,
      userId: "member-1",
    })).resolves.toEqual({ ok: false, reason: "forbidden" });
    await expect(canManageCalendarEvent(db, {
      eventId: otherEventId,
      userId: "owner-1",
    })).resolves.toEqual({ ok: false, reason: "forbidden" });
    await expect(canManageCalendarEvent(db, {
      eventId,
      userId: globalAdminId,
    })).resolves.toMatchObject({ ok: true, role: "global-admin", tenantId: tenant.id });
    await expect(canManageCalendarEvent(db, {
      eventId: 999999,
      userId: "owner-1",
    })).resolves.toEqual({ ok: false, reason: "not_found" });
  });

  it("accepts tenant collaborator invites into tenant membership", async () => {
    const db = createTestDb();
    const tenant = await createCalendarTenantForUser(db, {
      userId: "owner-1",
      name: "Invite Crew",
    });
    const invite = await createCalendarTenantInvite(db, {
      tenantId: tenant.id,
      email: "collab@example.com",
      role: "admin",
      invitedByUserId: "owner-1",
    });
    if (!invite.ok) throw new Error("expected tenant invite");

    await expect(validateCalendarTenantInvite(db, {
      code: invite.invite.code,
      email: "collab@example.com",
    })).resolves.toMatchObject({
      valid: true,
      invite: {
        tenantId: tenant.id,
        tenantName: "Invite Crew",
        role: "admin",
      },
    });

    await expect(acceptCalendarTenantInvite(db, {
      code: invite.invite.code,
      userId: "collab-user",
      email: "collab@example.com",
    })).resolves.toEqual({
      ok: true,
      tenantId: tenant.id,
      role: "admin",
    });
    await expect(getCalendarTenantRole(db, {
      tenantId: tenant.id,
      userId: "collab-user",
    })).resolves.toBe("admin");
    await expect(acceptCalendarTenantInvite(db, {
      code: invite.invite.code,
      userId: "other-user",
      email: "collab@example.com",
    })).resolves.toEqual({ ok: false, reason: "accepted" });
  });
});

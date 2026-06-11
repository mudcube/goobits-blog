import { describe, expect, it } from "vitest";
import {
  parseAdminCreateEventsBatchInput,
  parseAdminPaymentDefaultsInput,
  parseAdminProgramMutationInput,
  parseCalendarCreateEventInput,
  TransportValidationError,
} from "../../src/transport.ts";

describe("admin transport validation", () => {
  it("accepts valid program upsert payload", () => {
    const result = parseAdminProgramMutationInput({
      action: "upsert",
      slug: "gym",
      label: "Gym",
      activityName: "Gym",
      pageTitle: "Gym | SITE",
      eyebrow: "Gym",
      heroTitleLine1: "Move daily.",
      heroTitleLine2: "Stay strong.",
      heroSubtitle: "Strength and recovery sessions.",
      description: "Members workouts and mobility.",
      icon: "💪",
      eyebrowClass: "eyebrow-gym",
      glowClass: "glow-gym",
      formGlowClass: "form-gym",
      serviceStatusNote: "Open weekly",
      enabled: true,
      sortOrder: 10,
    });

    expect(result.action).toBe("upsert");
    if (result.action !== "upsert") return;
    expect(result.program.slug).toBe("gym");
    expect(result.program.enabled).toBe(true);
    expect(result.program.sortOrder).toBe(10);
  });

  it("rejects invalid event creation payload", () => {
    expect(() =>
      parseAdminCreateEventsBatchInput({
        activitySlug: "gym",
        title: "Bad event",
        startsAt: "2026-02-18T10:00:00.000Z",
        endsAt: "2026-02-18T09:00:00.000Z",
        capacity: 2,
      }),
    ).toThrow(TransportValidationError);
  });

  it("accepts member event creation payload", () => {
    expect(
      parseCalendarCreateEventInput({
        activitySlug: "gym",
        title: "Friday movement jam",
        startsAt: "2026-02-18T10:00:00.000Z",
        endsAt: "2026-02-18T11:00:00.000Z",
        capacity: 20,
        location: "Portland",
        note: "Bring water.",
        timezone: "America/Los_Angeles",
      }),
    ).toEqual({
      activitySlug: "gym",
      title: "Friday movement jam",
      startsAt: "2026-02-18T10:00:00.000Z",
      endsAt: "2026-02-18T11:00:00.000Z",
      capacity: 20,
      location: "Portland",
      note: "Bring water.",
      timezone: "America/Los_Angeles",
    });
  });

  it("rejects invalid member event creation payload", () => {
    expect(() =>
      parseCalendarCreateEventInput({
        activitySlug: "bad slug",
        title: "Bad event",
        startsAt: "2026-02-18T10:00:00.000Z",
        endsAt: "2026-02-18T11:00:00.000Z",
        capacity: 20,
      }),
    ).toThrow(TransportValidationError);
  });

  it("accepts supported payment defaults", () => {
    expect(
      parseAdminPaymentDefaultsInput({
        provider: "PayPal",
        handle: "billing@example.com",
      }),
    ).toEqual({
      provider: "paypal",
      handle: "billing@example.com",
      primaryProvider: "paypal",
      handles: {
        venmo: null,
        paypal: "billing@example.com",
        cashapp: null,
      },
    });
    expect(
      parseAdminPaymentDefaultsInput({ provider: "", handle: "" }),
    ).toEqual({
      provider: null,
      handle: null,
      primaryProvider: null,
      handles: {
        venmo: null,
        paypal: null,
        cashapp: null,
      },
    });
    expect(
      parseAdminPaymentDefaultsInput({
        primaryProvider: "cashapp",
        handles: {
          venmo: "@miko",
          paypal: "billing@example.com",
          cashapp: "$miko",
        },
      }),
    ).toEqual({
      provider: "cashapp",
      handle: "$miko",
      primaryProvider: "cashapp",
      handles: {
        venmo: "@miko",
        paypal: "billing@example.com",
        cashapp: "$miko",
      },
    });
  });

  it("rejects unsupported or partial payment defaults", () => {
    expect(() =>
      parseAdminPaymentDefaultsInput({
        provider: "zelle",
        handle: "billing@example.com",
      }),
    ).toThrow(TransportValidationError);
    expect(() =>
      parseAdminPaymentDefaultsInput({ provider: "venmo", handle: "" }),
    ).toThrow(TransportValidationError);
    expect(() =>
      parseAdminPaymentDefaultsInput({ provider: "", handle: "@miko" }),
    ).toThrow(TransportValidationError);
  });
});

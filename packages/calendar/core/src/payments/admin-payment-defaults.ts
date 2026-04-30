import type { D1DatabaseLike } from "../storage/d1.ts";

export type AdminPaymentProvider = "venmo" | "paypal" | "cashapp";

export type AdminPaymentHandles = Record<AdminPaymentProvider, string | null>;

export type AdminPaymentDefaults = {
  provider: string | null;
  handle: string | null;
  primaryProvider: AdminPaymentProvider | null;
  handles: AdminPaymentHandles;
};

const PAYMENT_PROVIDERS = ["venmo", "paypal", "cashapp"] as const;

function emptyHandles(): AdminPaymentHandles {
  return {
    venmo: null,
    paypal: null,
    cashapp: null,
  };
}

function normalizeProvider(
  value: string | null | undefined,
): AdminPaymentProvider | null {
  const provider = (value || "").trim().toLowerCase();
  return PAYMENT_PROVIDERS.includes(provider as AdminPaymentProvider)
    ? (provider as AdminPaymentProvider)
    : null;
}

function paymentHandleKey(provider: AdminPaymentProvider) {
  return `payment_handle_${provider}`;
}

export async function getAdminPaymentDefaults(
  db: D1DatabaseLike,
): Promise<AdminPaymentDefaults> {
  try {
    const rows = await db
      .prepare(
        `SELECT key, value
				 FROM calendar_admin_settings
				 WHERE key IN (
					'payment_provider',
					'payment_handle',
					'payment_handle_venmo',
					'payment_handle_paypal',
					'payment_handle_cashapp'
				 )`,
      )
      .all<{ key: string; value: string | null }>();

    const map = new Map(
      (rows?.results ?? []).map((row) => [row.key, row.value]),
    );
    const provider = normalizeProvider(map.get("payment_provider"));
    const legacyHandle = map.get("payment_handle") ?? null;
    const handles = emptyHandles();
    let hasStructuredHandle = false;
    for (const paymentProvider of PAYMENT_PROVIDERS) {
      const handle = map.get(paymentHandleKey(paymentProvider)) ?? null;
      if (handle) hasStructuredHandle = true;
      handles[paymentProvider] = handle;
    }
    if (!hasStructuredHandle && provider && legacyHandle) {
      handles[provider] = legacyHandle;
    }
    const handle = provider ? (handles[provider] ?? legacyHandle) : null;
    return {
      provider,
      handle,
      primaryProvider: provider,
      handles,
    };
  } catch {
    return {
      provider: null,
      handle: null,
      primaryProvider: null,
      handles: emptyHandles(),
    };
  }
}

export async function setAdminPaymentDefaults(
  db: D1DatabaseLike,
  input: {
    provider?: string | null;
    handle?: string | null;
    primaryProvider?: string | null;
    handles?: Partial<Record<AdminPaymentProvider, string | null>>;
  },
) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS calendar_admin_settings (
		  key TEXT PRIMARY KEY,
		  value TEXT,
		  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
		)`,
    )
    .run();

  const hasProvider =
    Object.prototype.hasOwnProperty.call(input, "provider") ||
    Object.prototype.hasOwnProperty.call(input, "primaryProvider");
  const hasHandle = Object.prototype.hasOwnProperty.call(input, "handle");
  const hasHandles = Object.prototype.hasOwnProperty.call(input, "handles");
  const provider = normalizeProvider(input.primaryProvider ?? input.provider);
  const handles = input.handles
    ? { ...emptyHandles(), ...input.handles }
    : emptyHandles();
  if (!hasHandles && provider && hasHandle) {
    handles[provider] = input.handle ?? null;
  }
  const primaryHandle = provider ? (handles[provider] ?? null) : null;

  if (hasProvider || hasHandles) {
    await db
      .prepare(
        `INSERT INTO calendar_admin_settings (key, value, updated_at)
				 VALUES ('payment_provider', ?, unixepoch())
				 ON CONFLICT(key) DO UPDATE SET
				   value = excluded.value,
				   updated_at = unixepoch()`,
      )
      .bind(provider)
      .run();
  }

  if (hasProvider || hasHandle || hasHandles) {
    await db
      .prepare(
        `INSERT INTO calendar_admin_settings (key, value, updated_at)
				 VALUES ('payment_handle', ?, unixepoch())
				 ON CONFLICT(key) DO UPDATE SET
				   value = excluded.value,
				   updated_at = unixepoch()`,
      )
      .bind(primaryHandle)
      .run();
  }

  if (hasHandles) {
    for (const paymentProvider of PAYMENT_PROVIDERS) {
      await db
        .prepare(
          `INSERT INTO calendar_admin_settings (key, value, updated_at)
					 VALUES (?, ?, unixepoch())
					 ON CONFLICT(key) DO UPDATE SET
					   value = excluded.value,
					   updated_at = unixepoch()`,
        )
        .bind(
          paymentHandleKey(paymentProvider),
          handles[paymentProvider] ?? null,
        )
        .run();
    }
  } else if (provider && hasHandle) {
    await db
      .prepare(
        `INSERT INTO calendar_admin_settings (key, value, updated_at)
				 VALUES (?, ?, unixepoch())
				 ON CONFLICT(key) DO UPDATE SET
				   value = excluded.value,
				   updated_at = unixepoch()`,
      )
      .bind(paymentHandleKey(provider), input.handle ?? null)
      .run();
  }
}

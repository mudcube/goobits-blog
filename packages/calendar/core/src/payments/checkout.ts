import type { D1DatabaseLike } from "../storage/d1.ts";
import { getEnv, requireEnv } from "../config/env.ts";
import {
  deleteConnection,
  getConnection,
  saveConnection,
} from "../storage/d1.ts";
import { TransportValidationError } from "../transport/errors.ts";

export type CheckoutProvider = "paypal" | "venmo" | "cashapp";

export type PaymentCheckoutContext = {
  eventId: number;
  participantId: number | null;
  userId: string;
  confirmationId: string | null;
  title: string;
  amountCents: number;
  currency: string;
  paymentProvider: string | null;
  paymentHandle: string | null;
};

type PayPalAccessToken = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
};

type PayPalOrderResponse = {
  id?: string;
  status?: string;
  links?: Array<{ href?: string; rel?: string; method?: string }>;
  payment_source?: Record<string, unknown>;
};

type SquarePaymentResponse = {
  payment?: {
    id?: string;
    status?: string;
    receipt_url?: string;
  };
};

type PayPalPaymentCredentials = {
  clientId: string;
  clientSecret: string;
  environment: "sandbox" | "live";
  source: "stored" | "env";
};

type SquarePaymentCredentials = {
  applicationId: string;
  locationId: string;
  accessToken: string;
  environment: "sandbox" | "live";
  source: "stored" | "env";
};

const FAR_FUTURE_EXPIRES_AT = Date.now() + 100 * 365 * 24 * 60 * 60 * 1000;

function normalizeEnvironment(
  value: string | null | undefined,
): "sandbox" | "live" {
  const normalized = (value || "sandbox").trim().toLowerCase();
  return normalized === "live" || normalized === "production"
    ? "live"
    : "sandbox";
}

function parseSquareScope(scope: string | null | undefined) {
  if (!scope) return { locationId: "", environment: "sandbox" as const };
  try {
    const parsed = JSON.parse(scope) as {
      locationId?: unknown;
      environment?: unknown;
    };
    return {
      locationId:
        typeof parsed.locationId === "string" ? parsed.locationId : "",
      environment: normalizeEnvironment(
        typeof parsed.environment === "string" ? parsed.environment : "sandbox",
      ),
    };
  } catch {
    return { locationId: scope, environment: "sandbox" as const };
  }
}

function paypalApiBase(environment: "sandbox" | "live") {
  return environment === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

function squareApiBase(environment: "sandbox" | "live") {
  return environment === "live"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";
}

function amountString(amountCents: number) {
  return (Math.max(0, amountCents) / 100).toFixed(2);
}

function normalizeCurrency(value: string | null | undefined) {
  return (value || "USD").trim().toUpperCase().slice(0, 3) || "USD";
}

function stringifyJson(value: unknown) {
  try {
    return JSON.stringify(value).slice(0, 5000);
  } catch {
    return null;
  }
}

function normalizeCheckoutProvider(
  value: string | null | undefined,
): CheckoutProvider | null {
  const provider = (value || "").trim().toLowerCase();
  return provider === "paypal" || provider === "venmo" || provider === "cashapp"
    ? provider
    : null;
}

function assertPayPalFundingAllowed(
  context: PaymentCheckoutContext,
  fundingSource: "paypal" | "venmo" | null | undefined,
) {
  const eventProvider = normalizeCheckoutProvider(context.paymentProvider);
  const requested = fundingSource === "venmo" ? "venmo" : "paypal";
  if (eventProvider !== requested) {
    throw new TransportValidationError(
      "Payment method is not available for this booking",
    );
  }
}

function assertCashAppAllowed(context: PaymentCheckoutContext) {
  if (normalizeCheckoutProvider(context.paymentProvider) !== "cashapp") {
    throw new TransportValidationError(
      "Payment method is not available for this booking",
    );
  }
}

export async function getStoredPayPalPaymentCredentials({
  db,
  env,
  base64Key,
}: {
  db: D1DatabaseLike;
  env: Record<string, unknown>;
  base64Key: string;
}): Promise<PayPalPaymentCredentials | null> {
  const connection = await getConnection({
    db,
    provider: "paypal_checkout",
    base64Key,
  });
  // PayPal stores clientId/clientSecret in primary/secondary credentials.
  // (The accessToken/refreshToken aliases on `connection` map to the same
  // bytes, but the names lie about the semantics for non-OAuth providers.)
  if (connection?.primaryCredential && connection.secondaryCredential) {
    return {
      clientId: connection.primaryCredential,
      clientSecret: connection.secondaryCredential,
      environment: normalizeEnvironment(connection.scope),
      source: "stored",
    };
  }
  const paypalClientId =
    getEnv(env, "PUBLIC_PAYPAL_CLIENT_ID", "")?.trim() ||
    getEnv(env, "PAYPAL_CLIENT_ID", "")?.trim() ||
    "";
  const paypalClientSecret =
    getEnv(env, "PAYPAL_CLIENT_SECRET", "")?.trim() || "";
  if (!paypalClientId || !paypalClientSecret) return null;
  return {
    clientId: paypalClientId,
    clientSecret: paypalClientSecret,
    environment: normalizeEnvironment(
      getEnv(env, "PAYPAL_ENVIRONMENT", "sandbox"),
    ),
    source: "env",
  };
}

export async function getStoredSquarePaymentCredentials({
  db,
  env,
  base64Key,
}: {
  db: D1DatabaseLike;
  env: Record<string, unknown>;
  base64Key: string;
}): Promise<SquarePaymentCredentials | null> {
  const connection = await getConnection({
    db,
    provider: "square_cashapp",
    base64Key,
  });
  // Square stores applicationId/accessToken in primary/secondary
  // credentials. locationId + environment ride along in the scope JSON.
  if (connection?.primaryCredential && connection.secondaryCredential) {
    const scope = parseSquareScope(connection.scope);
    if (scope.locationId) {
      return {
        applicationId: connection.primaryCredential,
        locationId: scope.locationId,
        accessToken: connection.secondaryCredential,
        environment: scope.environment,
        source: "stored",
      };
    }
  }
  const squareApplicationId =
    getEnv(env, "PUBLIC_SQUARE_APPLICATION_ID", "")?.trim() || "";
  const squareLocationId =
    getEnv(env, "PUBLIC_SQUARE_LOCATION_ID", "")?.trim() ||
    getEnv(env, "SQUARE_LOCATION_ID", "")?.trim() ||
    "";
  const squareAccessToken =
    getEnv(env, "SQUARE_ACCESS_TOKEN", "")?.trim() || "";
  if (!squareApplicationId || !squareLocationId || !squareAccessToken)
    return null;
  return {
    applicationId: squareApplicationId,
    locationId: squareLocationId,
    accessToken: squareAccessToken,
    environment: normalizeEnvironment(
      getEnv(env, "SQUARE_ENVIRONMENT", "sandbox"),
    ),
    source: "env",
  };
}

export async function getPaymentCheckoutConfig({
  db,
  env,
  base64Key,
}: {
  db: D1DatabaseLike;
  env: Record<string, unknown>;
  base64Key: string;
}) {
  const [paypal, square] = await Promise.all([
    getStoredPayPalPaymentCredentials({ db, env, base64Key }),
    getStoredSquarePaymentCredentials({ db, env, base64Key }),
  ]);

  return {
    paypal: {
      clientId: paypal?.clientId || null,
      environment: paypal?.environment || "sandbox",
      source: paypal?.source || null,
      enabled: !!paypal,
    },
    square: {
      applicationId: square?.applicationId || null,
      locationId: square?.locationId || null,
      environment: (square?.environment === "live" ? "production" : "sandbox") as "production" | "sandbox",
      source: square?.source || null,
      enabled: !!square,
    },
  };
}

export async function savePayPalPaymentCredentials({
  db,
  base64Key,
  clientId,
  clientSecret,
  environment,
}: {
  db: D1DatabaseLike;
  base64Key: string;
  clientId: string;
  clientSecret: string;
  environment: "sandbox" | "live";
}) {
  await saveConnection({
    db,
    provider: "paypal_checkout",
    base64Key,
    token: {
      // primary = clientId (public-ish), secondary = clientSecret (must
      // never leak). FAR_FUTURE_EXPIRES_AT is a sentinel — these are
      // long-lived API credentials, not OAuth tokens.
      primaryCredential: clientId,
      secondaryCredential: clientSecret,
      expiresAt: FAR_FUTURE_EXPIRES_AT,
      scope: environment,
    },
  });
}

export async function saveSquarePaymentCredentials({
  db,
  base64Key,
  applicationId,
  locationId,
  accessToken,
  environment,
}: {
  db: D1DatabaseLike;
  base64Key: string;
  applicationId: string;
  locationId: string;
  accessToken: string;
  environment: "sandbox" | "live";
}) {
  await saveConnection({
    db,
    provider: "square_cashapp",
    base64Key,
    token: {
      // primary = applicationId (public-ish), secondary = accessToken
      // (the long-lived Square API token). locationId + environment travel
      // in the scope blob since the columns can't carry them.
      primaryCredential: applicationId,
      secondaryCredential: accessToken,
      expiresAt: FAR_FUTURE_EXPIRES_AT,
      scope: JSON.stringify({ locationId, environment }),
    },
  });
}

export async function deletePaymentCredentials(
  db: D1DatabaseLike,
  provider: "paypal" | "square",
) {
  await deleteConnection({
    db,
    provider: provider === "paypal" ? "paypal_checkout" : "square_cashapp",
  });
}

export async function getPaymentCheckoutContext(
  db: D1DatabaseLike,
  input: { eventId: number; userId: string; confirmationId?: string | null },
): Promise<PaymentCheckoutContext | null> {
  const row = await db
    .prepare(
      `SELECT
				e.id AS event_id,
				e.title,
				e.cost_cents,
				e.currency,
				e.payment_provider,
				e.payment_handle,
				p.id AS participant_id,
				p.confirmation_id,
				CAST(p.user_id AS TEXT) AS user_id,
				p.status AS participant_status
			 FROM calendar_events e
			 JOIN calendar_event_participants p ON p.event_id = e.id
			 WHERE e.id = ?
			   AND CAST(p.user_id AS TEXT) = ?
			   AND p.status = 'joined'
			   AND (? IS NULL OR p.confirmation_id = ?)
			 LIMIT 1`,
    )
    .bind(
      input.eventId,
      input.userId,
      input.confirmationId ?? null,
      input.confirmationId ?? null,
    )
    .first<{
      event_id: number;
      title: string;
      cost_cents: number | null;
      currency: string | null;
      payment_provider: string | null;
      payment_handle: string | null;
      participant_id: number | null;
      confirmation_id: string | null;
      user_id: string;
      participant_status: string;
    }>();
  if (!row || (row.cost_cents ?? 0) <= 0) return null;
  return {
    eventId: row.event_id,
    participantId: row.participant_id,
    userId: row.user_id,
    confirmationId: row.confirmation_id,
    title: row.title,
    amountCents: Math.max(0, row.cost_cents ?? 0),
    currency: normalizeCurrency(row.currency),
    paymentProvider: row.payment_provider,
    paymentHandle: row.payment_handle,
  };
}

async function savePaymentTransaction(
  db: D1DatabaseLike,
  input: {
    provider: CheckoutProvider;
    context: PaymentCheckoutContext;
    externalId: string;
    status: string;
    fundingSource?: string | null;
    rawResponse?: unknown;
  },
) {
  await db
    .prepare(
      `INSERT INTO calendar_payment_transactions (
				provider, event_id, participant_id, user_id, confirmation_id, amount_cents, currency,
				status, external_id, funding_source, raw_response, created_at, updated_at
			 )
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())
			 ON CONFLICT(provider, external_id) DO UPDATE SET
				status = excluded.status,
				funding_source = COALESCE(excluded.funding_source, calendar_payment_transactions.funding_source),
				raw_response = excluded.raw_response,
				updated_at = unixepoch()`,
    )
    .bind(
      input.provider,
      input.context.eventId,
      input.context.participantId,
      input.context.userId,
      input.context.confirmationId,
      input.context.amountCents,
      input.context.currency,
      input.status,
      input.externalId,
      input.fundingSource ?? null,
      stringifyJson(input.rawResponse),
    )
    .run();
}

async function getPayPalAccessToken(credentials: PayPalPaymentCredentials) {
  const auth = btoa(`${credentials.clientId}:${credentials.clientSecret}`);
  const res = await fetch(
    `${paypalApiBase(credentials.environment)}/v1/oauth2/token`,
    {
      method: "POST",
      headers: {
        authorization: `Basic ${auth}`,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ grant_type: "client_credentials" }),
    },
  );
  const body = (await res.json().catch(() => null)) as PayPalAccessToken | null;
  if (!res.ok || !body?.access_token) {
    throw new Error(`PayPal access token failed (${res.status})`);
  }
  return body.access_token;
}

export async function createPayPalCheckoutOrder({
  db,
  env,
  context,
  fundingSource,
}: {
  db: D1DatabaseLike;
  env: Record<string, unknown>;
  context: PaymentCheckoutContext;
  fundingSource?: "paypal" | "venmo" | null;
}) {
  assertPayPalFundingAllowed(context, fundingSource);
  const idempotencyKey = `event-${context.eventId}-${context.userId}-${context.confirmationId || "booking"}-${fundingSource || "paypal"}`;
  const base64Key = requireEnv(env, "TOKEN_ENC_KEY");
  const credentials = await getStoredPayPalPaymentCredentials({
    db,
    env,
    base64Key,
  });
  if (!credentials)
    throw new Error("PayPal checkout credentials are not configured");
  const accessToken = await getPayPalAccessToken(credentials);
  const res = await fetch(
    `${paypalApiBase(credentials.environment)}/v2/checkout/orders`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
        "paypal-request-id": idempotencyKey.slice(0, 108),
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: String(context.eventId),
            custom_id:
              context.confirmationId || `${context.eventId}:${context.userId}`,
            description: context.title.slice(0, 127),
            amount: {
              currency_code: context.currency,
              value: amountString(context.amountCents),
            },
          },
        ],
      }),
    },
  );
  const body = (await res
    .json()
    .catch(() => null)) as PayPalOrderResponse | null;
  if (!res.ok || !body?.id) {
    throw new Error(`PayPal order create failed (${res.status})`);
  }
  await savePaymentTransaction(db, {
    provider: fundingSource === "venmo" ? "venmo" : "paypal",
    context,
    externalId: body.id,
    status: body.status || "created",
    fundingSource: fundingSource || "paypal",
    rawResponse: body,
  });
  return { orderId: body.id };
}

export async function capturePayPalCheckoutOrder({
  db,
  env,
  orderId,
  userId,
}: {
  db: D1DatabaseLike;
  env: Record<string, unknown>;
  orderId: string;
  userId: string;
}) {
  const existing = await db
    .prepare(
      `SELECT user_id FROM calendar_payment_transactions
			 WHERE provider IN ('paypal', 'venmo') AND external_id = ?
			 LIMIT 1`,
    )
    .bind(orderId)
    .first<{ user_id: string }>();
  if (!existing || existing.user_id !== userId) {
    throw new Error("PayPal order not found for user");
  }
  const base64Key = requireEnv(env, "TOKEN_ENC_KEY");
  const credentials = await getStoredPayPalPaymentCredentials({
    db,
    env,
    base64Key,
  });
  if (!credentials)
    throw new Error("PayPal checkout credentials are not configured");
  const accessToken = await getPayPalAccessToken(credentials);
  const res = await fetch(
    `${paypalApiBase(credentials.environment)}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
        "paypal-request-id": `capture-${orderId}`.slice(0, 108),
      },
    },
  );
  const body = (await res
    .json()
    .catch(() => null)) as PayPalOrderResponse | null;
  if (!res.ok || !body?.id) {
    throw new Error(`PayPal order capture failed (${res.status})`);
  }
  await db
    .prepare(
      `UPDATE calendar_payment_transactions
			 SET status = ?, raw_response = ?, updated_at = unixepoch()
			 WHERE provider IN ('paypal', 'venmo') AND external_id = ?`,
    )
    .bind(body.status || "captured", stringifyJson(body), orderId)
    .run();
  return { orderId: body.id, status: body.status || "captured" };
}

export async function createSquareCashAppPayment({
  db,
  env,
  context,
  sourceId,
}: {
  db: D1DatabaseLike;
  env: Record<string, unknown>;
  context: PaymentCheckoutContext;
  sourceId: string;
}) {
  assertCashAppAllowed(context);
  const base64Key = requireEnv(env, "TOKEN_ENC_KEY");
  const credentials = await getStoredSquarePaymentCredentials({
    db,
    env,
    base64Key,
  });
  if (!credentials)
    throw new Error("Cash App Pay credentials are not configured");
  const idempotencyKey = `cashapp-${context.eventId}-${context.userId}-${context.confirmationId || "booking"}`;
  const res = await fetch(
    `${squareApiBase(credentials.environment)}/v2/payments`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${credentials.accessToken}`,
        "content-type": "application/json",
        "Square-Version": "2026-01-22",
      },
      body: JSON.stringify({
        source_id: sourceId,
        idempotency_key: idempotencyKey,
        location_id: credentials.locationId,
        amount_money: {
          amount: context.amountCents,
          currency: context.currency,
        },
        note: context.title.slice(0, 500),
        reference_id:
          context.confirmationId || `${context.eventId}:${context.userId}`,
      }),
    },
  );
  const body = (await res
    .json()
    .catch(() => null)) as SquarePaymentResponse | null;
  if (!res.ok || !body?.payment?.id) {
    throw new Error(`Cash App payment failed (${res.status})`);
  }
  await savePaymentTransaction(db, {
    provider: "cashapp",
    context,
    externalId: body.payment.id,
    status: body.payment.status || "completed",
    fundingSource: "cashapp",
    rawResponse: body,
  });
  return {
    paymentId: body.payment.id,
    status: body.payment.status || "completed",
    receiptUrl: body.payment.receipt_url || null,
  };
}

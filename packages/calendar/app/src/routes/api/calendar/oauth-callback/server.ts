import type { RequestEvent } from "@sveltejs/kit";
import { buildEnv, apiError, logApiError } from "@calendar/kit";
import { exchangeGoogleCode, exchangeOutlookCode } from "@calendar/core/providers";
import { consumeOauthState, saveConnection } from "@calendar/core/storage";
import { setActiveCalendarSyncProvider } from "@calendar/core/sync";
import { getCalendarConfig, requireEnv } from "@calendar/core/config";

function withAdminSettingsRedirect(url: URL) {
  const adminBase = getCalendarConfig().routes.adminBase.replace(/\/$/, "");
  return new URL(`${adminBase}/settings/?connected=1`, url);
}

export async function GET(event: RequestEvent) {
  try {
    const url = new URL(event.request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    if (!code || !state) {
      return apiError("Invalid OAuth callback request", { status: 400, code: "invalid_request" });
    }

    // No format pre-check: consumeOauthState's DB lookup is the authoritative
    // validation. A regex format guard adds no security (parameterized queries
    // already block injection) and is a minor information leak about state
    // shape. Trust the lookup.
    const env = await buildEnv(event.platform);
    const validState = await consumeOauthState({ db: env.DB, state });
    if (!validState) {
      return apiError("Invalid OAuth state", { status: 400, code: "invalid_state" });
    }

    const provider = url.searchParams.get("provider") === "outlook" ? "outlook" : "google";
    const token =
      provider === "outlook"
        ? await exchangeOutlookCode({ env, code })
        : await exchangeGoogleCode({ env, code });
    await saveConnection({
      db: env.DB,
      provider,
      token,
      base64Key: requireEnv(env, "TOKEN_ENC_KEY"),
    });
    await setActiveCalendarSyncProvider(env.DB, provider);

    return Response.redirect(
      withAdminSettingsRedirect(new URL(event.request.url)),
      302,
    );
  } catch (err) {
    logApiError("calendar.oauth-callback", err);
    return apiError("OAuth callback failed", { status: 500 });
  }
}

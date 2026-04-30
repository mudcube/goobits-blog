import type { RequestEvent } from "@sveltejs/kit";
import { buildEnv, apiError, logApiError } from "@calendar/kit";
import {
  consumeOauthState,
  exchangeGoogleCode,
  exchangeOutlookCode,
  getCalendarConfig,
  requireEnv,
  saveConnection,
  setActiveCalendarSyncProvider,
} from "@calendar/core";

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

    const isAdminOauthState =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        state,
      );
    if (!isAdminOauthState) {
      return apiError("Invalid OAuth state", { status: 400, code: "invalid_state" });
    }

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

<script lang="ts">
  import { page } from "$app/stores";
  import {
    getProviderErrorMessage,
    type CalendarProviderName,
  } from "@calendar/ui/routing/auth-providers";
  import { buildProviderLoginHref } from "@calendar/ui/routing/auth-redirects";
  import { PillButton } from "@calendar/ui";
  import { getCalendarConfig } from "@calendar/core/config";
  import { calendarSiteActivities } from "$lib/calendar-site-preset";
  import {
    resolveCalendarLoginTargetActivity,
    resolveFirstAvailableProvider,
  } from "@calendar/ui/member/auth/calendar-login";

  const { data } = $props<{
    data: {
      providers: Record<CalendarProviderName, boolean>;
      hasAnyProvider: boolean;
      inviteCode: string;
      inviteStatus:
        | "valid"
        | "expired"
        | "exhausted"
        | "not_found"
        | "email_mismatch"
        | "missing_code"
        | null;
      inviteEmailRestricted: boolean;
      redirectTo: string;
    };
  }>();

  let loading = $state(false);
  let claimLoading = $state(false);
  const calendarConfig = getCalendarConfig();
  const rawError = $page.url.searchParams.get("error") || "";
  let error = $state(getProviderErrorMessage(rawError));

  const inviteCode = $derived(data.inviteCode || "");
  const redirectTo = $derived(data.redirectTo);
  const verifiedStatus = $page.url.searchParams.get("verified") || "";
  let inviteInput = $state("");
  let claimName = $state("");

  $effect(() => {
    if (!inviteInput && inviteCode) inviteInput = inviteCode;
  });
  let claimEmail = $state("");
  let claimError = $state("");

  const targetActivity = $derived(resolveCalendarLoginTargetActivity(redirectTo));
  const quickLinks = [
    { href: "/login", label: "Login" },
    { href: "/admin", label: "Admin" },
    { href: "/admin/events", label: "Events" },
    { href: "/admin/crew", label: "Crew" },
    { href: "/admin/settings", label: "Settings" },
    { href: "/book", label: "Book" },
    ...calendarSiteActivities.map((activity) => ({
      href: `/${activity.slug}`,
      label: activity.label
    }))
  ];
  const inviteStatus = $derived(data.inviteStatus);
  const hasValidInvite = $derived(!!inviteCode && inviteStatus === "valid");
  const inviteStatusMessage = $derived.by(() => {
    if (!inviteCode || hasValidInvite) return "";
    if (inviteStatus === "expired") return "This invite has expired.";
    if (inviteStatus === "exhausted")
      return "This invite has already been used.";
    if (inviteStatus === "email_mismatch")
      return "This invite is tied to a different email address.";
    return "This invite link is invalid.";
  });

  async function loginWith(
    provider: CalendarProviderName,
    codeOverride?: string,
  ) {
    loading = true;
    error = "";

    try {
      const code = codeOverride ?? inviteCode;
      window.location.href = buildProviderLoginHref(provider, {
        inviteCode: code,
        redirectTo,
      });
    } catch {
      error = "Something went wrong. Please try again.";
      loading = false;
    }
  }

  async function claimInvite(event: SubmitEvent) {
    event.preventDefault();
    claimError = "";

    if (!inviteCode || !hasValidInvite) {
      claimError = "This invite link is not valid anymore.";
      return;
    }

    if (!claimName.trim()) {
      claimError = "Enter your name to continue.";
      return;
    }

    claimLoading = true;

    try {
      const response = await fetch("/api/calendar/invite-claim", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          code: inviteCode,
          name: claimName.trim(),
          email: claimEmail.trim() || null,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        claimError =
          payload?.error?.message ||
          payload?.message ||
          "Could not claim this invite. Please try again.";
        claimLoading = false;
        return;
      }

      window.location.href = redirectTo;
    } catch {
      claimError = "Could not claim this invite. Please try again.";
      claimLoading = false;
    }
  }

  function joinWithInvite(event: SubmitEvent) {
    event.preventDefault();
    const code = inviteInput.trim();
    if (!code) {
      error = "Enter an invite code to continue.";
      return;
    }

    const provider = resolveFirstAvailableProvider(data.providers);
    if (provider) {
      loginWith(provider, code);
      return;
    }

    error = "No sign-in provider is configured yet.";
  }
</script>

<svelte:head>
  <title
    >{hasValidInvite ? "You're invited" : "Sign in"} | {calendarConfig.brand.calendarName} | {calendarConfig.brand
      .siteName}</title
  >
  {#if hasValidInvite}
    <meta property="og:title" content="You're invited to {calendarConfig.brand.calendarName}" />
    <meta property="og:description" content="Join instantly. No account needed. Tap to pick your time." />
    <meta property="og:type" content="website" />
  {/if}
</svelte:head>

<div class="calendar-page calendar-login">
  <div class="calendar-login__center">
    <section class="calendar-login__card" aria-label="Members sign in">
      <p class="calendar-login__label">
        {hasValidInvite
          ? targetActivity
            ? `${targetActivity.eyebrow} Invite`
            : "Invitation"
          : targetActivity
            ? targetActivity.eyebrow
            : "Members"}
      </p>
      <h1 class="calendar-login__title">
        {hasValidInvite
          ? targetActivity
            ? `Join ${targetActivity.label} ${targetActivity.icon}`
            : "You're invited ✨"
          : targetActivity
            ? `${targetActivity.label} ${targetActivity.icon}`
            : "Welcome back ✨"}
      </h1>
      <p class="calendar-login__subtitle">
        {hasValidInvite
          ? "Join instantly without creating an account. Google or Apple sign-in is optional."
          : targetActivity
            ? `${targetActivity.heroSubtitle} Sign in to continue.`
            : "Sign in to access activities and events."}
      </p>

      {#if error}
        <div class="calendar-page__error-message calendar-login__error">
          {error}
        </div>
      {/if}

      {#if claimError}
        <div class="calendar-page__error-message calendar-login__error">
          {claimError}
        </div>
      {/if}

      {#if verifiedStatus === "1"}
        <div class="calendar-page__invite-notice calendar-login__invite-notice">
          Email verified. You can sign in now.
        </div>
      {:else if verifiedStatus && verifiedStatus !== "1"}
        <div class="calendar-page__error-message calendar-login__error">
          Verification link is invalid or expired.
        </div>
      {/if}

      {#if hasValidInvite}
        <div class="calendar-page__invite-notice calendar-login__invite-notice">
          You're invited. Join instantly with this link, or use Google / Apple
          below.
        </div>
        <form class="calendar-login__claim-form" onsubmit={claimInvite}>
          <label class="calendar-login__claim-field" for="calendar-claim-name">
            <span>Your name</span>
            <input
              id="calendar-claim-name"
              class="ui-form-control"
              type="text"
              maxlength="120"
              autocomplete="name"
              placeholder="How should I save your name?"
              bind:value={claimName}
            />
          </label>
          <label
            class="calendar-login__claim-field"
            for="calendar-claim-email"
          >
            <span>Email for reminders {data.inviteEmailRestricted ? "" : "(optional)"}</span>
            <input
              id="calendar-claim-email"
              class="ui-form-control"
              type="email"
              maxlength="320"
              autocomplete="email"
              placeholder="you@example.com"
              required={data.inviteEmailRestricted}
              bind:value={claimEmail}
            />
          </label>
          <PillButton
            type="submit"
            size="lg"
            fullWidth
            variant="primary"
            disabled={claimLoading}
          >
            {claimLoading ? "Joining…" : "Join with Invite"}
          </PillButton>
        </form>
      {:else if inviteCode}
        <div class="calendar-page__error-message calendar-login__error">
          {inviteStatusMessage}
        </div>
      {/if}

      <div class="calendar-login__buttons">
        {#if data.providers.google}
          <PillButton
            onClick={() =>
              loginWith("google", inviteInput.trim() || inviteCode)}
            disabled={loading}
            fullWidth
            size="lg"
            variant="secondary"
            className="calendar-login__button calendar-login__button--google"
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </PillButton>
        {/if}

        {#if data.providers.apple}
          <PillButton
            onClick={() => loginWith("apple", inviteInput.trim() || inviteCode)}
            disabled={loading}
            fullWidth
            size="lg"
            variant="secondary"
            className="calendar-login__button calendar-login__button--apple"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path
                d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
              />
            </svg>
            Sign in with Apple
          </PillButton>
        {/if}
      </div>

      {#if data.hasAnyProvider}
        <div class="calendar-login__divider" aria-hidden="true">
          <div class="calendar-login__divider-line"></div>
          <span>{hasValidInvite ? "or sign in with a provider" : "or join with invite"}</span>
          <div class="calendar-login__divider-line"></div>
        </div>

        {#if !hasValidInvite}
          <form class="calendar-login__invite-form" onsubmit={joinWithInvite}>
            <label class="calendar-login__invite-label" for="calendar-invite-code">Invite code</label>
            <div class="calendar-login__invite-row">
              <input
                id="calendar-invite-code"
                class="calendar-login__invite-input"
                type="text"
                maxlength="24"
                spellcheck="false"
                autocomplete="off"
                placeholder="Enter code"
                bind:value={inviteInput}
              />
              <button
                type="submit"
                class="calendar-login__invite-submit"
                disabled={loading}
              >
                Continue
              </button>
            </div>
          </form>
        {/if}
      {/if}

      {#if !data.hasAnyProvider && !hasValidInvite}
        <p class="calendar-page__invite-hint calendar-login__hint">
          No sign-in provider is configured yet. Please add OAuth credentials in
          environment settings.
        </p>
      {/if}

      {#if !inviteCode}
        <p class="calendar-page__invite-hint calendar-login__hint">
          Don't have a code? Invites are shared directly by an admin.
        </p>
      {/if}

      <nav class="calendar-login__quick-links" aria-label="Calendar pages">
        {#each quickLinks as item}
          <a class="calendar-login__quick-link" href={item.href}>{item.label}</a>
        {/each}
      </nav>
    </section>
  </div>
</div>

<style>
  .calendar-login__claim-form {
    display: grid;
    gap: 0.85rem;
    margin-bottom: 1rem;
  }

  .calendar-login__claim-field {
    display: grid;
    gap: 0.35rem;
  }

  .calendar-login__claim-field > span,
  .calendar-login__invite-label {
    font-size: 0.76rem;
    font-weight: 600;
    color: color-mix(in srgb, var(--text) 68%, transparent);
  }

  .calendar-login__invite-form {
    display: grid;
    gap: 0.4rem;
  }

  .calendar-login__invite-row {
    display: flex;
    border: 1px solid color-mix(in srgb, var(--calendar-shell-text, var(--text)) 22%, transparent);
    border-radius: 999px;
    overflow: hidden;
    background: color-mix(in srgb, var(--calendar-shell-text, var(--text)) 6%, transparent);
    transition: border-color 140ms ease;
  }

  .calendar-login__invite-row:focus-within {
    border-color: color-mix(in srgb, var(--calendar-shell-text, var(--text)) 45%, transparent);
  }

  .calendar-login__invite-input {
    flex: 1;
    min-width: 0;
    padding: 0.65rem 1.5rem 0.65rem 1.15rem;
    border: none;
    background: transparent;
    color: var(--calendar-shell-text, var(--text));
    font: inherit;
    font-size: 0.88rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    letter-spacing: 0.06em;
  }

  .calendar-login__invite-input::placeholder {
    color: color-mix(in srgb, var(--calendar-shell-text, var(--text)) 35%, transparent);
  }

  .calendar-login__invite-input:focus {
    outline: none;
  }

  .calendar-login__invite-submit {
    padding: 0.65rem 1.25rem;
    border: none;
    border-left: 1px solid color-mix(in srgb, var(--calendar-shell-text, var(--text)) 15%, transparent);
    border-radius: 0;
    background: var(--gradient-action);
    color: #fff;
    font: inherit;
    font-size: 0.88rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: opacity 140ms ease;
  }

  .calendar-login__invite-submit:hover:not(:disabled) {
    opacity: 0.88;
  }

  .calendar-login__invite-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .calendar-login__quick-links {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.45rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid color-mix(in srgb, var(--calendar-shell-text, var(--text)) 12%, transparent);
  }

  .calendar-login__quick-link {
    min-width: 0;
    padding: 0.58rem 0.7rem;
    border: 1px solid color-mix(in srgb, var(--calendar-shell-text, var(--text)) 14%, transparent);
    border-radius: 999px;
    background: color-mix(in srgb, var(--calendar-shell-text, var(--text)) 5%, transparent);
    color: color-mix(in srgb, var(--calendar-shell-text, var(--text)) 82%, transparent);
    font-size: 0.78rem;
    font-weight: 650;
    line-height: 1.15;
    text-align: center;
    text-decoration: none;
    white-space: nowrap;
    transition:
      background 140ms ease,
      border-color 140ms ease,
      color 140ms ease;
  }

  .calendar-login__quick-link:hover {
    border-color: color-mix(in srgb, var(--calendar-shell-text, var(--text)) 28%, transparent);
    background: color-mix(in srgb, var(--calendar-shell-text, var(--text)) 10%, transparent);
    color: var(--calendar-shell-text, var(--text));
  }

  @media (max-width: 30em) {
    .calendar-login__quick-links {
      grid-template-columns: 1fr;
    }
  }

</style>

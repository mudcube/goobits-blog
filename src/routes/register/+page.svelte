<script lang="ts">
  import { onMount } from "svelte";
  import { FormField, Hero, PillButton } from "@miko/ui";
  import { initializeAntiAbuseFields } from "$lib/client/antiabuse";

  type ActionData = {
    error?: string;
    requiresChallenge?: boolean;
    name?: string;
    email?: string;
  };

  const { data, form } = $props<{
    data: { turnstileSiteKey: string; antiAbuseEnabled: boolean };
    form?: ActionData;
  }>();

  let startedAt = $state("");
  let deviceId = $state("");

  onMount(() => {
    const fields = initializeAntiAbuseFields("miko_register_device_id");
    startedAt = fields.startedAt;
    deviceId = fields.deviceId;
  });
</script>

<svelte:head>
  <title>Register - MIKO.ART</title>
  {#if data.turnstileSiteKey}
    <script
      src="https://challenges.cloudflare.com/turnstile/v0/api.js"
      async
      defer
    ></script>
  {/if}
</svelte:head>

<Hero
  title="Create account"
  subtitle="Create your account and confirm your email to continue."
  icon="/media/emoji-herb.png"
  compact={true}
/>

<section class="register-page ui-surface-card">
  <form
    method="POST"
    class="register-page__form"
    novalidate
    data-testid="register-form"
  >
    <input
      type="hidden"
      name="started_at"
      value={startedAt}
      data-testid="register-started-at"
    />
    <input type="hidden" name="device_id" value={deviceId} />
    <label class="register-page__hp" aria-hidden="true">
      <span>Website</span>
      <input type="text" name="website" tabindex="-1" autocomplete="off" />
    </label>

    <FormField
      className="register-page__field"
      label="Name"
      forId="register-name"
      required
    >
      <input
        id="register-name"
        class="ui-form-control"
        name="name"
        type="text"
        required
        value={form?.name || ""}
        autocomplete="name"
        data-testid="register-name"
      />
    </FormField>
    <FormField
      className="register-page__field"
      label="Email"
      forId="register-email"
      required
    >
      <input
        id="register-email"
        class="ui-form-control"
        name="email"
        type="email"
        required
        value={form?.email || ""}
        autocomplete="email"
        data-testid="register-email"
      />
    </FormField>
    <FormField
      className="register-page__field"
      label="Password"
      forId="register-password"
      required
    >
      <input
        id="register-password"
        class="ui-form-control"
        name="password"
        type="password"
        required
        minlength="10"
        autocomplete="new-password"
        data-testid="register-password"
      />
    </FormField>

    {#if data.turnstileSiteKey}
      <div class="cf-turnstile" data-sitekey={data.turnstileSiteKey}></div>
    {/if}

    {#if form?.error}
      <p class="register-page__error" data-testid="register-error">
        {form.error}
      </p>
    {/if}

    <div class="register-page__submit-row" data-testid="register-submit-row">
      <PillButton
        type="submit"
        className="register-page__submit"
        variant="primary"
        size="md"
      >
        Create account
      </PillButton>
    </div>
  </form>
</section>

<style>
  .register-page {
    max-width: min(36rem, 100%);
    padding: var(--space-8);
  }

  .register-page__form {
    display: grid;
    gap: var(--space-4);
  }

  :global(.register-page__field) {
    display: grid;
    gap: var(--space-2);
  }

  .register-page__hp {
    position: absolute;
    left: -100vw;
    top: auto;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }

  .register-page__error {
    margin: 0;
    color: var(--status-error-text);
  }

  .register-page__submit-row {
    justify-self: start;
  }
</style>

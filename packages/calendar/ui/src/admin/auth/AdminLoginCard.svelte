<script>
  import Button from "../../primitives/CalendarButton.svelte";
  const {
    form,
    loginUrl = '/schedule/login?redirect=%2Fschedule%2Fadmin%2F',
    currentUser = null,
    canBootstrapAdmin = false
  } = $props();
</script>

<div class="admin-page__login">
  <div class="admin-login" aria-label="Admin login">
    <div class="admin-login__label">Admin</div>
    <h1 class="admin-login__title">Admin sign-in</h1>
    <p class="admin-login__subtitle">
      Sign in with your Google account. Admin access is granted to approved calendar users.
    </p>

    {#if !currentUser}
      <Button
        href={loginUrl}
        className="admin-login__unlock"
        variant="primary"
        size="lg"
      >Continue with Google</Button>
    {:else if canBootstrapAdmin}
      <p class="admin-login__hint">
        Signed in as {currentUser.email}. Enter the admin passcode once to grant this account access.
      </p>
      <form class="admin-login__form" method="POST" action="?/grantAdmin">
        <div class="ui-inline-field admin-login__row">
          <input
            class="ui-form-control admin-login__passcode"
            type="password"
            name="password"
            placeholder="Admin passcode"
            autocomplete="current-password"
            required
          />
          <Button
            className="ui-inline-field__action admin-login__unlock"
            variant="primary"
            size="lg"
            type="submit">Grant access</Button
          >
        </div>
        {#if form?.success}
          <p class="admin-login__hint">Granting access...</p>
        {/if}
        {#if form?.error}
          <p class="admin-login__error" role="status">{form.error}</p>
        {/if}
      </form>
    {:else}
      <p class="admin-login__hint">
        Signed in as {currentUser.email}. This account does not have admin access.
      </p>
      <Button
        href={loginUrl}
        className="admin-login__unlock"
        variant="secondary"
        size="lg"
      >Use another Google account</Button>
    {/if}

    <p class="admin-login__hint">The admin area shares the calendar login session; permissions stay separate.</p>
  </div>
</div>

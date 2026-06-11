<script lang="ts">
	import { SuccessPage } from '@goobits/ui'
	import { getCalendarConfig } from '@calendar/core/config'
	const calendarConfig = getCalendarConfig()
</script>

<svelte:head>
	<title>Check Your Email</title>
	<meta name="description" content="Confirmation page for account registration." />
	<meta name="robots" content="noindex, nofollow, noarchive" />
</svelte:head>

<SuccessPage
	className="register-page register-success-page"
	title="Check your email"
	copy="Your account and organizer page are ready. Open your inbox and confirm your email before signing in."
	buttonHref={calendarConfig.routes.calendarLoginPath}
	buttonLabel="Go to sign in"
	buttonIcon="login"
/>

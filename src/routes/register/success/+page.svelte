<script lang="ts">
	import { SuccessPage } from '@miko/ui'
	import { getCalendarConfig } from '@calendar/core'
	const calendarConfig = getCalendarConfig()
</script>

<svelte:head>
	<title>Check Your Email - MIKO.ART</title>
</svelte:head>

<SuccessPage
	className="register-page register-success-page"
	title="Check your email"
	copy="Your account is ready. Open your inbox and confirm your email to finish setup before signing in."
	buttonHref={calendarConfig.routes.calendarLoginPath}
	buttonLabel="Go to sign in"
	imageSrc="/media/contact-thank-you.svg"
	imageAlt="Success illustration"
	buttonIcon="login"
/>

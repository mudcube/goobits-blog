<script lang="ts">
	import { Seo } from '$lib/app/seo'
	import { SuccessPage } from '@goobits/ui'
	import { getCalendarConfig } from '@calendar/core/config'
	const calendarConfig = getCalendarConfig()
</script>

<Seo
	title="Check Your Email"
	description="Confirmation page for account registration on MIKO.ART."
	path="/register/success/"
	noindex
/>

<SuccessPage
	className="register-page register-success-page"
	title="Check your email"
	copy="Your account is ready. Open your inbox and confirm your email to finish setup before signing in."
	buttonHref={calendarConfig.routes.calendarLoginPath}
	buttonLabel="Go to sign in"
	imageSrc="/media/page-icons/contact-thank-you.svg"
	imageAlt="Success illustration"
	buttonIcon="login"
/>

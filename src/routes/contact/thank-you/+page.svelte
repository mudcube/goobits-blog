<script lang="ts">
	import { Seo } from '$lib/app/seo'
	import { SuccessPage } from '@goobits/ui'
</script>

<Seo
	title="Thank You"
	description="Confirmation page for submitted MIKO.ART contact messages."
	path="/contact/thank-you/"
	noindex
/>

<SuccessPage
	className="contact-page thank-you-page"
	title="Message received!"
	copy="Thank you for reaching out. I&apos;ll get back to you as soon as possible."
	buttonHref="/"
	buttonLabel="Back to home"
	imageSrc="/media/page-icons/contact-thank-you.svg"
	imageAlt="Thank you illustration"
	buttonIcon="home"
/>

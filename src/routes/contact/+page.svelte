<script lang="ts">
	import { Seo, buildWebPageJsonLd } from '$lib/app/seo'
	import ContactForm from '@src/domains/contact/ContactForm.svelte'
	import type { SuperValidated } from 'sveltekit-superforms'
	import type { ContactFormData } from '@src/domains/contact/schema'

	let { data }: { data: { form: SuperValidated<ContactFormData>; turnstileSiteKey: string } } = $props()
	const description =
		'Contact Miko Meow about creative software, design tools, music projects, installations, commissions, and collaborations.'
</script>

<Seo
	title="Contact Miko Meow"
	{description}
	path="/contact/"
	image="/media/page-icons/contact-email-heart.png"
	jsonLd={[
		buildWebPageJsonLd({
			path: '/contact/',
			title: 'Contact Miko Meow',
			description,
			type: 'ContactPage'
		})
	]}
/>

<ContactForm form={data.form} turnstileSiteKey={data.turnstileSiteKey} />

<script lang="ts">
	import ContactForm from '@src/domains/contact/ContactForm.svelte'
	import type { SuperValidated } from 'sveltekit-superforms'
	import type { ContactFormData } from '@src/domains/contact/schema'

	let { data }: { data: { form: SuperValidated<ContactFormData>; turnstileSiteKey: string } } = $props()
</script>

<ContactForm form={data.form} turnstileSiteKey={data.turnstileSiteKey} />

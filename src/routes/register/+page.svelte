<script lang="ts">
	import RegisterForm from '@src/domains/register/RegisterForm.svelte'
	import NoIndexHead from '$lib/app/seo/NoIndexHead.svelte'
	import type { SuperValidated } from 'sveltekit-superforms'
	import type { RegisterFormData } from '@src/domains/register/schema'

	let { data }: { data: { form: SuperValidated<RegisterFormData>; turnstileSiteKey: string } } = $props()
</script>

<NoIndexHead />

<RegisterForm form={data.form} turnstileSiteKey={data.turnstileSiteKey} />

<script lang="ts">
	import RegisterForm from '@src/domains/register/RegisterForm.svelte'
	import type { SuperValidated } from 'sveltekit-superforms'
	import type { RegisterFormData } from '@src/domains/register/schema'

	let { data }: { data: { form: SuperValidated<RegisterFormData>; turnstileSiteKey: string } } = $props()
</script>

<RegisterForm form={data.form} turnstileSiteKey={data.turnstileSiteKey} />

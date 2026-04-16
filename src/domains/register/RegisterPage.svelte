<script lang="ts">
	import NoIndexHead from '$lib/app/seo/NoIndexHead.svelte'
	import type { SuperValidated } from 'sveltekit-superforms'
	import type { RegisterFormData } from './schema'
	import RegisterForm from './RegisterForm.svelte'

	let {
		data
	}: {
		data: {
			form: SuperValidated<RegisterFormData>
			turnstileSiteKey: string
		}
	} = $props()
</script>

<NoIndexHead />

<RegisterForm form={data.form} turnstileSiteKey={data.turnstileSiteKey} />

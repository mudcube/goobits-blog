<script lang="ts">
	import NoIndexHead from '$lib/seo/NoIndexHead.svelte'
	import type { RegisterPageData } from './actions'
	import RegisterForm from './RegisterForm.svelte'

	let { data }: { data: RegisterPageData } = $props()
</script>

<NoIndexHead />

<RegisterForm form={data.form} turnstileSiteKey={data.turnstileSiteKey} />

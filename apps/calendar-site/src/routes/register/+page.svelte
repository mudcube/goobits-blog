<script lang="ts">
	import RegisterPage from '@src/domains/register/RegisterPage.svelte'
	import type { RegisterPageData } from '@src/domains/register/actions'

	let { data }: { data: RegisterPageData } = $props()
</script>

<RegisterPage {data} />

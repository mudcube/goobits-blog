<script lang="ts">
	import RegisterPage from '@src/domains/register/RegisterPage.svelte'

	let { data } = $props()
</script>

<RegisterPage {data} />

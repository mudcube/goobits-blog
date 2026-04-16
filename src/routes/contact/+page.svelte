<script lang="ts">
	import ContactPage from '@src/domains/contact/ContactPage.svelte'

	let { data } = $props()
</script>

<ContactPage {data} />

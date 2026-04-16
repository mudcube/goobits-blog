<script lang="ts">
	import ContactPage from '@src/domains/contact/ContactPage.svelte'
	import type { ContactPageData } from '@src/domains/contact/actions'

	let { data }: { data: ContactPageData } = $props()
</script>

<ContactPage {data} />

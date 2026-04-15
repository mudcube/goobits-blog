<script>
	import { ensureJournalBlogConfig } from '$lib/blog/config'

	let { children } = $props()

	ensureJournalBlogConfig()
</script>

{@render children?.()}

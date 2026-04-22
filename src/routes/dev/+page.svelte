<script lang="ts">
	import DevPage from '@src/domains/dev/DevPage.svelte'

	let { data } = $props<{ data: { items: { href: string; title: string; vibe: string; date?: string }[] } }>()
</script>

<DevPage items={data.items} />

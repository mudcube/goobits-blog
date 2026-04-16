<script lang="ts">
	import MusicPage from '@src/domains/music/MusicPage.svelte'
	import type { MusicPageData } from '@src/domains/music/viewmodel'

	let { data }: { data: MusicPageData } = $props()
</script>

<MusicPage {data} />

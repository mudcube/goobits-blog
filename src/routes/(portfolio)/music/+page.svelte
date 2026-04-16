<script lang="ts">
	import MusicPage from '@src/domains/music/MusicPage.svelte'

	let { data } = $props()
</script>

<MusicPage {data} />

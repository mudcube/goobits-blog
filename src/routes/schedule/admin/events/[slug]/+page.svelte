<script lang="ts">
	import ProgramEditorPage from '../program/[slug]/+page.svelte'
	const { data } = $props<{ data: { user: unknown | null; slug: string } }>()
</script>

<ProgramEditorPage {data} />

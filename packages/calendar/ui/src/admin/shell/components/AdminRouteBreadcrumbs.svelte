<script lang="ts">
	import type { AdminBreadcrumbItem } from '../route'

	const { items } = $props<{ items: AdminBreadcrumbItem[] }>()
</script>

<div class="social-admin__breadcrumbs-body">
	{#each items as item, i}
		{#if item.href && i < items.length - 1}
			<a href={item.href}>{item.label}</a>
		{:else}
			<span>{item.label}</span>
		{/if}
		{#if i < items.length - 1}
			<span class="social-admin__crumb-sep">&rsaquo;</span>
		{/if}
	{/each}
</div>

<script lang="ts">
	import './blogTheme.css'

	interface BreadcrumbItem {
		label: string
		href?: string
	}

	interface Props {
		items?: BreadcrumbItem[]
		label?: string
	}

	const { items = [], label = 'Breadcrumbs' }: Props = $props()
</script>

{#if items.length > 0}
	<nav class="blog-breadcrumbs" aria-label={label}>
		<ol>
			{#each items as item, index (`${ item.label }-${ index }`)}
				<li>
					{#if item.href && index < items.length - 1}<a href={item.href}>{item.label}</a>{:else}<span aria-current="page">{item.label}</span>{/if}
				</li>
			{/each}
		</ol>
	</nav>
{/if}

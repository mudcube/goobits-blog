<script lang="ts">
	import './blogTheme.css'
	import { createBlogUiMessages, type BlogUiMessagesInput } from '../config/blogMessages.js'

	interface BreadcrumbItem {
		label: string
		href?: string
	}

	interface Props {
		items?: BreadcrumbItem[]
		label?: string
		messages?: BlogUiMessagesInput
	}

	const { items = [], label, messages: messageInput = {} }: Props = $props()
	const messages = $derived(createBlogUiMessages(messageInput))
	const ariaLabel = $derived(label ?? messages.breadcrumbs)
</script>

{#if items.length > 0}
	<nav class="blog-breadcrumbs" aria-label={ariaLabel}>
		<ol>
			{#each items as item, index (`${ item.label }-${ index }`)}
				<li>
					{#if item.href && index < items.length - 1}<a href={item.href}>{item.label}</a>{:else}<span aria-current="page">{item.label}</span>{/if}
				</li>
			{/each}
		</ol>
	</nav>
{/if}

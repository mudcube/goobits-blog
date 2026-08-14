<script lang="ts">
	import Check from '@lucide/svelte/icons/check'
	import Copy from '@lucide/svelte/icons/copy'
	import Mail from '@lucide/svelte/icons/mail'
	import Share2 from '@lucide/svelte/icons/share-2'
	import { onDestroy } from 'svelte'

	import { GooButton } from '@goobits/goo/button'
	import './blogTheme.css'
	import { createBlogUiMessages, type BlogUiMessagesInput } from '../config/blogMessages.js'

	type ShareNetwork = 'email' | 'facebook' | 'x'

	interface Props {
		url: string
		title: string
		text?: string
		networks?: ShareNetwork[]
		messages?: BlogUiMessagesInput
		class?: string
	}

	const {
		url,
		title,
		text = '',
		networks = [],
		messages: messageInput = {},
		class: className = ''
	}: Props = $props()

	const messages = $derived(createBlogUiMessages(messageInput))
	let copied = $state(false)
	let timeout: ReturnType<typeof setTimeout> | null = null

	onDestroy(() => {
		if (timeout) {clearTimeout(timeout)}
	})

	async function share(): Promise<void> {
		if (typeof navigator !== 'undefined' && navigator.share) {
			try {
				await navigator.share({ title, text, url })
			} catch (error) {
				if (!(error instanceof DOMException && error.name === 'AbortError')) {
					await copy()
				}
			}
			return
		}
		await copy()
	}

	async function copy(): Promise<void> {
		if (typeof navigator === 'undefined' || !navigator.clipboard) {return}
		try {
			await navigator.clipboard.writeText(url)
			copied = true
			if (timeout) {clearTimeout(timeout)}
			timeout = setTimeout(() => { copied = false }, 2000)
		} catch {
			copied = false
		}
	}

	function networkUrl(network: ShareNetwork): string {
		if (network === 'email') {return `mailto:?subject=${ encodeURIComponent(title) }&body=${ encodeURIComponent(`${ text }\n${ url }`) }`}
		if (network === 'facebook') {return `https://www.facebook.com/sharer/sharer.php?u=${ encodeURIComponent(url) }`}
		return `https://x.com/intent/post?url=${ encodeURIComponent(url) }&text=${ encodeURIComponent(title) }`
	}

	function networkLabel(network: ShareNetwork): string {
		if (network === 'x') {return 'X'}
		return `${ network.charAt(0).toUpperCase() }${ network.slice(1) }`
	}
</script>

{#snippet shareIcon()}<Share2 size={18} aria-hidden="true" />{/snippet}
{#snippet copyIcon()}
	{#if copied}<Check size={18} aria-hidden="true" />{:else}<Copy size={18} aria-hidden="true" />{/if}
{/snippet}
{#snippet mailIcon()}<Mail size={18} aria-hidden="true" />{/snippet}

<div class={['blog-share', className].filter(Boolean).join(' ')} aria-label="Sharing options">
	<GooButton label={messages.share} icon={shareIcon} title={messages.share} onclick={() => void share()} />
	<GooButton label={copied ? messages.copiedLink : messages.copyLink} icon={copyIcon} title={messages.copyLink} onclick={() => void copy()} />
	{#each networks as network (network)}
		<GooButton
			class="blog-share__network"
			label={networkLabel(network)}
			icon={network === 'email' ? mailIcon : undefined}
			href={networkUrl(network)}
			target={network === 'email' ? undefined : '_blank'}
			rel={network === 'email' ? undefined : 'noopener noreferrer nofollow'}
		/>
	{/each}
</div>

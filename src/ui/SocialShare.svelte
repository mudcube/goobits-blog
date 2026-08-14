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
</script>

<div class={['blog-share', className].filter(Boolean).join(' ')} aria-label="Sharing options">
	<GooButton ariaLabel={messages.share} title={messages.share} onclick={() => void share()}>
		<Share2 size={18} aria-hidden="true" /> <span>{messages.share}</span>
	</GooButton>
	<GooButton ariaLabel={copied ? messages.copiedLink : messages.copyLink} title={messages.copyLink} onclick={() => void copy()}>
		{#if copied}<Check size={18} aria-hidden="true" />{:else}<Copy size={18} aria-hidden="true" />{/if}
		<span>{copied ? messages.copiedLink : messages.copyLink}</span>
	</GooButton>
	{#each networks as network (network)}
		<a class="blog-share__network" href={networkUrl(network)} target={network === 'email' ? undefined : '_blank'} rel={network === 'email' ? undefined : 'noopener noreferrer nofollow'}>
			{#if network === 'email'}<Mail size={18} aria-hidden="true" />{/if}<span>{network}</span>
		</a>
	{/each}
</div>

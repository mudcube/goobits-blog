<script lang="ts">
	import { formatDate } from './time'

	let {
		day,
		onClaim,
	}: {
		day: Date | null
		onClaim: (name: string) => void
	} = $props()

	let name = $state('')

	function submit(e: SubmitEvent) {
		e.preventDefault()
		if (!name.trim()) return
		onClaim(name.trim())
	}
</script>

<div class="ic" class:ic--visible={!!day}>
	{#if day}
		<div class="ic__inner">
			<p class="ic__date">{formatDate(day)}</p>
			<p class="ic__prompt">What's your name?</p>
			<form class="ic__form" onsubmit={submit}>
				<input class="ic__input" type="text" placeholder="Your name" maxlength="60" autocomplete="name" bind:value={name} />
				<button type="submit" class="ic__btn" disabled={!name.trim()}>Continue →</button>
			</form>
		</div>
	{/if}
</div>

<style>
	.ic { max-height: 0; overflow: hidden; transition: max-height 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s; opacity: 0; }
	.ic--visible { max-height: 10rem; opacity: 1; }
	.ic__inner { padding: 0.75rem 0; }
	.ic__date { margin: 0 0 0.15rem; font-size: 0.68rem; font-weight: 600; color: color-mix(in srgb, var(--text) 50%, transparent); }
	.ic__prompt { margin: 0 0 0.5rem; font-family: var(--font-display); font-size: 1.1rem; font-weight: 500; letter-spacing: -0.02em; }
	.ic__form { display: grid; grid-template-columns: 1fr auto; gap: 0; }
	.ic__input { padding: 0.55rem 0.75rem; border: 1px solid color-mix(in srgb, var(--text) 14%, transparent); border-radius: 0.45rem 0 0 0.45rem; border-right: none; background: color-mix(in srgb, var(--bg) 80%, transparent); color: var(--text); font: inherit; font-size: 0.85rem; }
	.ic__input:focus { outline: none; border-color: color-mix(in srgb, #a78bfa 40%, transparent); }
	.ic__btn { padding: 0.55rem 0.85rem; border: none; border-radius: 0 0.45rem 0.45rem 0; background: var(--gradient-action); color: #fff; font: inherit; font-size: 0.78rem; font-weight: 600; cursor: pointer; white-space: nowrap; }
	.ic__btn:disabled { opacity: 0.35; cursor: default; }
</style>

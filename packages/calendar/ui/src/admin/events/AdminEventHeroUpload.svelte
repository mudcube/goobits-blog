<script lang="ts">
	import { ImageUp, Trash2 } from '@lucide/svelte'
	import AdminInlineConfirm from '../shared/AdminInlineConfirm.svelte'

	const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
	const MAX_BYTES = 8 * 1024 * 1024

	const {
		heroImageUrl,
		mockMode = false,
		onUpload,
		onClear,
		onError
	} = $props<{
		heroImageUrl: string | null
		mockMode?: boolean
		onUpload: (file: File) => Promise<string | null>
		onClear: () => Promise<boolean>
		onError?: (message: string) => void
	}>()

	let inputEl: HTMLInputElement | undefined = $state()
	let busy = $state(false)
	let dragging = $state(false)
	let confirmRemove = $state(false)
	let localPreview = $state<string | null>(null)

	function reportError(message: string) {
		onError?.(message)
	}

	function validate(file: File): string | null {
		if (!ALLOWED_TYPES.includes(file.type)) {
			return 'Use a JPEG, PNG, or WebP image'
		}
		if (file.size > MAX_BYTES) {
			return `File exceeds ${MAX_BYTES / (1024 * 1024)}MB`
		}
		return null
	}

	async function handleFile(file: File) {
		if (mockMode) {
			reportError('Mock mode: hero upload preview only')
			return
		}
		const error = validate(file)
		if (error) {
			reportError(error)
			return
		}
		busy = true
		const reader = new FileReader()
		reader.onload = () => {
			localPreview = typeof reader.result === 'string' ? reader.result : null
		}
		reader.readAsDataURL(file)
		try {
			const url = await onUpload(file)
			if (!url) {
				localPreview = null
			}
		} finally {
			busy = false
			if (inputEl) inputEl.value = ''
			localPreview = null
		}
	}

	function pickFile() {
		if (busy) return
		inputEl?.click()
	}

	function onChange(event: Event) {
		const target = event.currentTarget as HTMLInputElement
		const file = target.files?.[0]
		if (!file) return
		void handleFile(file)
	}

	function onDrop(event: DragEvent) {
		event.preventDefault()
		dragging = false
		const file = event.dataTransfer?.files?.[0]
		if (!file) return
		void handleFile(file)
	}

	function onDragOver(event: DragEvent) {
		event.preventDefault()
		dragging = true
	}

	function onDragLeave() {
		dragging = false
	}

	async function performRemove() {
		confirmRemove = false
		busy = true
		try {
			await onClear()
		} finally {
			busy = false
		}
	}

	const display = $derived(localPreview || heroImageUrl)
</script>

<div class="hero-upload">
	{#if confirmRemove}
		<AdminInlineConfirm
			question="Remove the hero image?"
			confirmLabel="Yes, remove"
			onCancel={() => (confirmRemove = false)}
			onConfirm={() => void performRemove()}
		/>
	{/if}

	{#if display}
		<div class="hero-upload__preview">
			<img src={display} alt="Event hero" />
			<div class="hero-upload__actions">
				<button
					type="button"
					class="admin-ui-btn admin-ui-btn--muted"
					onclick={pickFile}
					disabled={busy}
				>
					<ImageUp size={14} strokeWidth={2.2} />
					{busy ? 'Uploading…' : 'Replace'}
				</button>
				<button
					type="button"
					class="admin-ui-btn admin-ui-btn--warn"
					onclick={() => (confirmRemove = true)}
					disabled={busy}
				>
					<Trash2 size={14} strokeWidth={2.2} />
					Remove
				</button>
			</div>
		</div>
	{:else}
		<button
			type="button"
			class="hero-upload__dropzone"
			class:hero-upload__dropzone--dragging={dragging}
			onclick={pickFile}
			ondrop={onDrop}
			ondragover={onDragOver}
			ondragleave={onDragLeave}
			disabled={busy}
		>
			<ImageUp size={20} strokeWidth={1.8} />
			<span class="hero-upload__primary">{busy ? 'Uploading…' : 'Add hero image'}</span>
			<span class="hero-upload__secondary">JPEG, PNG, or WebP · up to 8MB</span>
		</button>
	{/if}

	<input
		bind:this={inputEl}
		type="file"
		accept={ALLOWED_TYPES.join(',')}
		class="hero-upload__file"
		onchange={onChange}
	/>
</div>

<style>
	.hero-upload {
		display: grid;
		gap: 0.55rem;
	}

	.hero-upload__file {
		display: none;
	}

	.hero-upload__dropzone {
		display: grid;
		justify-items: center;
		gap: 0.3rem;
		padding: 1.4rem 1rem;
		border-radius: 0.75rem;
		border: 1.5px dashed color-mix(in srgb, var(--text) 16%, transparent);
		background: color-mix(in srgb, var(--text) 3%, var(--bg) 97%);
		color: var(--admin-text-soft);
		cursor: pointer;
		font: inherit;
		text-align: center;
		transition:
			border-color 150ms ease,
			background 150ms ease;
	}

	.hero-upload__dropzone:hover,
	.hero-upload__dropzone--dragging {
		border-color: color-mix(in srgb, var(--admin-accent) 48%, transparent);
		background: color-mix(in srgb, var(--admin-accent) 6%, var(--bg) 94%);
		color: var(--text);
	}

	.hero-upload__primary {
		font-size: 0.86rem;
		font-weight: 580;
	}

	.hero-upload__secondary {
		font-size: 0.72rem;
		font-weight: 460;
		font-style: italic;
		color: var(--admin-text-muted);
	}

	.hero-upload__preview {
		display: grid;
		gap: 0.45rem;
	}

	.hero-upload__preview img {
		width: 100%;
		max-height: 14rem;
		object-fit: cover;
		border-radius: 0.7rem;
		border: 1px solid color-mix(in srgb, var(--text) 9%, transparent);
		background: color-mix(in srgb, var(--text) 4%, var(--bg) 96%);
	}

	.hero-upload__actions {
		display: inline-flex;
		gap: 0.4rem;
	}
</style>

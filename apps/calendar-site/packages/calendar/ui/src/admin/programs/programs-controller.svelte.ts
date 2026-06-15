import {
	deleteDashboardProgram,
	loadAdminPrograms,
	reorderDashboardPrograms,
	saveDashboardProgram,
	updateAdminProgram
} from '../dashboard/admin-dashboard'

export type ProgramRecord = {
	slug: string
	href: string
	label: string
	activityName: string
	pageTitle: string
	eyebrow: string
	heroTitleLines: string[]
	heroSubtitle: string
	description: string
	icon: string
	eyebrowClass?: string | undefined
	glowClass?: string | undefined
	formGlowClass?: string | undefined
	serviceStatusNote?: string | undefined
	enabled: boolean
	sortOrder: number
}

export type ProgramDraft = {
	slug: string
	label: string
	activityName: string
	pageTitle: string
	eyebrow: string
	heroTitleLine1: string
	heroTitleLine2: string
	heroSubtitle: string
	description: string
	icon: string
	eyebrowClass: string
	glowClass: string
	formGlowClass: string
	serviceStatusNote: string
	enabled: boolean
	sortOrder: number
}

type ControllerOptions = {
	onUnauthorized?: ((error: unknown) => boolean) | undefined
}

const BLANK_DRAFT: ProgramDraft = {
	slug: '',
	label: '',
	activityName: '',
	pageTitle: '',
	eyebrow: '',
	heroTitleLine1: '',
	heroTitleLine2: '',
	heroSubtitle: '',
	description: '',
	icon: '',
	eyebrowClass: '',
	glowClass: '',
	formGlowClass: '',
	serviceStatusNote: '',
	enabled: true,
	sortOrder: 0
}

export function createProgramsController(options: ControllerOptions = {}) {
	const { onUnauthorized } = options

	let programs = $state<ProgramRecord[]>([])
	let programsLoading = $state(false)
	let programsLoaded = $state(false)
	let programUpdatingSlug = $state<string | null>(null)
	let programSaving = $state(false)
	let programDeleting = $state(false)
	let selectedProgramSlug = $state<string | null>(null)
	let programDraft = $state<ProgramDraft>({ ...BLANK_DRAFT })
	let error = $state('')

	function selectProgram(slug: string) {
		const program = programs.find((item) => item.slug === slug)
		if (!program) return
		selectedProgramSlug = slug
		programDraft = {
			slug: program.slug,
			label: program.label,
			activityName: program.activityName,
			pageTitle: program.pageTitle,
			eyebrow: program.eyebrow,
			heroTitleLine1: program.heroTitleLines[0] ?? '',
			heroTitleLine2: program.heroTitleLines[1] ?? '',
			heroSubtitle: program.heroSubtitle,
			description: program.description,
			icon: program.icon,
			eyebrowClass: program.eyebrowClass ?? '',
			glowClass: program.glowClass ?? '',
			formGlowClass: program.formGlowClass ?? '',
			serviceStatusNote: program.serviceStatusNote ?? '',
			enabled: program.enabled,
			sortOrder: program.sortOrder
		}
	}

	function applyPrograms(input: ProgramRecord[]) {
		programs = input
		programsLoaded = true
		const firstProgram = programs[0]
		if (!selectedProgramSlug && firstProgram) {
			selectProgram(firstProgram.slug)
		}
	}

	async function load() {
		programsLoading = true
		error = ''
		try {
			const result = await loadAdminPrograms()
			programs = result.programs
			error = result.error
			const firstProgram = programs[0]
			if (!selectedProgramSlug && firstProgram) {
				selectProgram(firstProgram.slug)
			}
		} catch (err) {
			if (onUnauthorized?.(err)) return
			error = err instanceof Error ? err.message : 'Failed to load programs'
		} finally {
			programsLoading = false
			programsLoaded = true
		}
	}

	async function toggleProgram(slug: string, nextEnabled: boolean) {
		programUpdatingSlug = slug
		error = ''
		try {
			const result = await updateAdminProgram({ slug, enabled: nextEnabled })
			if (!result.ok) {
				error = result.error
				return
			}
			programs = programs.map((program) =>
				program.slug === slug ? { ...program, enabled: nextEnabled } : program
			)
		} catch (err) {
			if (onUnauthorized?.(err)) return
			error = err instanceof Error ? err.message : 'Failed to update program'
		} finally {
			programUpdatingSlug = null
		}
	}

	function newProgramDraft() {
		const existingSlugs = new Set(programs.map((program) => program.slug))
		let slug = 'new-program'
		let suffix = 2
		while (existingSlugs.has(slug)) {
			slug = `new-program-${suffix}`
			suffix += 1
		}
		selectedProgramSlug = null
		programDraft = {
			slug,
			label: 'New Program',
			activityName: 'New Program',
			pageTitle: 'New Program',
			eyebrow: 'New Program',
			heroTitleLine1: 'Make it yours.',
			heroTitleLine2: '',
			heroSubtitle:
				'Set up the page, save it as a draft, then click days to schedule events.',
			description: '',
			icon: '✨',
			eyebrowClass: '',
			glowClass: '',
			formGlowClass: '',
			serviceStatusNote: '',
			enabled: true,
			sortOrder:
				(programs.length ? programs[programs.length - 1]!.sortOrder : 0) + 10
		}
	}

	async function saveProgram() {
		programSaving = true
		error = ''
		try {
			const result = await saveDashboardProgram({
				slug: programDraft.slug.trim(),
				label: programDraft.label.trim(),
				activityName: programDraft.activityName.trim(),
				pageTitle: programDraft.pageTitle.trim(),
				eyebrow: programDraft.eyebrow.trim(),
				heroTitleLine1: programDraft.heroTitleLine1.trim(),
				heroTitleLine2: programDraft.heroTitleLine2.trim(),
				heroSubtitle: programDraft.heroSubtitle.trim(),
				description: programDraft.description.trim(),
				icon: programDraft.icon.trim(),
				eyebrowClass: programDraft.eyebrowClass.trim(),
				glowClass: programDraft.glowClass.trim(),
				formGlowClass: programDraft.formGlowClass.trim(),
				serviceStatusNote: programDraft.serviceStatusNote.trim(),
				enabled: programDraft.enabled,
				sortOrder: programDraft.sortOrder
			})
			if (!result.ok) {
				error = result.error
				return
			}
			await load()
			selectProgram(programDraft.slug.trim())
		} catch (err) {
			if (onUnauthorized?.(err)) return
			error = err instanceof Error ? err.message : 'Failed to save program'
		} finally {
			programSaving = false
		}
	}

	async function persistProgramOrder(orderedSlugs: string[]) {
		const previousPrograms = programs
		const orders = orderedSlugs.map((slug, orderIndex) => ({
			slug,
			sortOrder: (orderIndex + 1) * 10
		}))
		const nextSortOrders = new Map(orders.map((o) => [o.slug, o.sortOrder]))
		programs = programs.map((program) => ({
			...program,
			sortOrder: nextSortOrders.get(program.slug) ?? program.sortOrder
		}))

		programSaving = true
		error = ''
		try {
			const result = await reorderDashboardPrograms(orders)
			if (!result.ok) {
				error = result.error
				programs = previousPrograms
				return
			}
			await load()
		} catch (err) {
			programs = previousPrograms
			if (onUnauthorized?.(err)) return
			error = err instanceof Error ? err.message : 'Failed to reorder programs'
		} finally {
			programSaving = false
		}
	}

	async function moveProgram(slug: string, direction: 'up' | 'down') {
		const current = [...programs].sort((a, b) => a.sortOrder - b.sortOrder)
		const index = current.findIndex((program) => program.slug === slug)
		const nextIndex = direction === 'up' ? index - 1 : index + 1
		if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return

		const reordered = [...current]
		const [item] = reordered.splice(index, 1)
		if (!item) return
		reordered.splice(nextIndex, 0, item)

		await persistProgramOrder(reordered.map((p) => p.slug))
	}

	async function reorderPrograms(orderedSlugs: string[]) {
		const known = new Set(programs.map((p) => p.slug))
		const filtered = orderedSlugs.filter((slug) => known.has(slug))
		if (filtered.length === 0) return
		await persistProgramOrder(filtered)
	}

	async function deleteProgram() {
		const slug = selectedProgramSlug
		if (!slug) return
		programDeleting = true
		error = ''
		try {
			const result = await deleteDashboardProgram(slug)
			if (!result.ok) {
				error = result.error
				return
			}
			await load()
			const firstProgram = programs[0]
			if (firstProgram) selectProgram(firstProgram.slug)
			else newProgramDraft()
		} catch (err) {
			if (onUnauthorized?.(err)) return
			error = err instanceof Error ? err.message : 'Failed to delete program'
		} finally {
			programDeleting = false
		}
	}

	return {
		get programs() { return programs },
		get programsLoading() { return programsLoading },
		get programsLoaded() { return programsLoaded },
		get programUpdatingSlug() { return programUpdatingSlug },
		get programSaving() { return programSaving },
		get programDeleting() { return programDeleting },
		get selectedProgramSlug() { return selectedProgramSlug },
		get programDraft() { return programDraft },
		set programDraft(value) { programDraft = value },
		get error() { return error },
		get enabledPrograms() {
			return programs.filter((program) => program.enabled)
		},
		applyPrograms,
		load,
		toggleProgram,
		selectProgram,
		newProgramDraft,
		saveProgram,
		moveProgram,
		reorderPrograms,
		deleteProgram
	}
}

export type AdminProgramsController = ReturnType<typeof createProgramsController>

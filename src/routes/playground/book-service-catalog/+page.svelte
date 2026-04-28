<script lang="ts">
	import { ChevronRowCard } from '@calendar/ui/shared'
	import {
		StepIndicator,
		CalendarStep,
		TimeStep,
		BookedStep,
		buildMockOpenDays,
		formatDate,
		ft
	} from '@calendar/ui'
	import type { Activity, OpenDay, Person } from '@calendar/ui'
	import DevHero from '../DevHero.svelte'
	import type { Service } from './+page.server'

	const { data } = $props<{ data: { services: Service[] } }>()

	let stepNum = $state(0)
	let maxReached = $state(0)
	let direction = $state<'forward' | 'back' | 'none'>('none')
	let animKey = $state(0)

	let selectedService = $state<Service | null>(null)
	let selectedDay = $state<OpenDay | null>(null)
	let pendingDay = $state<OpenDay | null>(null)
	let start = $state(10)
	let end = $state(11)

	const DEMO_PEOPLE: Person[] = [
		{ name: 'Pat', color: '#7a5af8', start: 11, end: 12 }
	]

	const activity = $derived<Activity>({
		slug: selectedService?.id ?? 'service',
		label: selectedService?.name ?? 'Service',
		icon: selectedService?.emoji ?? '✂️',
		tagline: selectedService?.description ?? '',
		windowStart: 9,
		windowEnd: 18,
		maxDuration: selectedService ? Math.max(1, selectedService.durationMin / 60) : 1,
		capacity: 1
	})

	const openDays = $derived<OpenDay[]>(selectedService ? buildMockOpenDays(activity, DEMO_PEOPLE) : [])

	let calYear = $state(new Date().getFullYear())
	let calMonthIdx = $state(new Date().getMonth())

	function prevMonth() {
		if (calMonthIdx === 0) {
			calMonthIdx = 11
			calYear--
		} else {
			calMonthIdx--
		}
	}
	function nextMonth() {
		if (calMonthIdx === 11) {
			calMonthIdx = 0
			calYear++
		} else {
			calMonthIdx++
		}
	}

	const calMonthLabel = $derived(
		new Date(calYear, calMonthIdx).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
	)

	const calDays = $derived.by(() => {
		const year = calYear
		const month = calMonthIdx
		const first = new Date(year, month, 1)
		const last = new Date(year, month + 1, 0)
		const pad = (first.getDay() + 6) % 7
		type Cell = {
			date: Date
			inMonth: boolean
			isToday: boolean
			isOpen: boolean
			isPast: boolean
			bookingCount: number
		}
		const cells: Cell[] = []
		for (let i = pad - 1; i >= 0; i--) {
			cells.push({
				date: new Date(year, month, -i),
				inMonth: false,
				isToday: false,
				isOpen: false,
				isPast: true,
				bookingCount: 0
			})
		}
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		for (let d = 1; d <= last.getDate(); d++) {
			const dt = new Date(year, month, d)
			const match = openDays.find((od: OpenDay) => od.date.getTime() === dt.getTime())
			cells.push({
				date: dt,
				inMonth: true,
				isToday: dt.getTime() === today.getTime(),
				isOpen: !!match,
				isPast: dt < today,
				bookingCount: match?.bookings.length ?? 0
			})
		}
		const endPad = (7 - (cells.length % 7)) % 7
		for (let i = 1; i <= endPad; i++) {
			cells.push({
				date: new Date(year, month + 1, i),
				inMonth: false,
				isToday: false,
				isOpen: false,
				isPast: false,
				bookingCount: 0
			})
		}
		return cells
	})

	const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

	const overlapping = $derived(
		selectedDay ? selectedDay.bookings.filter((o) => o.start < end && o.end > start) : []
	)

	function goStep(n: number) {
		direction = n >= stepNum ? 'forward' : 'back'
		animKey++
		stepNum = n
		if (n > maxReached) maxReached = n
	}

	function pickService(s: Service) {
		selectedService = s
		const durationHrs = Math.max(1, s.durationMin / 60)
		start = activity.windowStart + 1
		end = Math.min(start + durationHrs, activity.windowEnd)
		goStep(1)
	}

	function selectDay(day: OpenDay) {
		selectedDay = day
		goStep(2)
	}

	function joinPerson(person: Person) {
		start = person.start
		end = person.end
	}

	function confirmBooking() {
		goStep(3)
	}

	function priceLabel(p: number) {
		return p === 0 ? 'Free' : `$${p}`
	}

	function durationLabel(min: number) {
		if (min < 60) return `${min} min`
		const h = Math.floor(min / 60)
		const m = min % 60
		return m === 0 ? `${h} hr` : `${h} hr ${m} min`
	}

	const stepLabels = $derived.by((): [string, string, string] => {
		const serviceLabel = selectedService ? selectedService.name : 'Service'
		const dayLabel = selectedDay ? formatDate(selectedDay.date) : 'Date'
		const timeLabel = stepNum >= 3 ? `${ft(start)}–${ft(end)}` : 'Time'
		// 4 phases mapped to 3 indicator slots: Service → (Date+Time) → Booked
		if (stepNum >= 3) return [serviceLabel, `${dayLabel} · ${timeLabel}`, 'Booked']
		if (stepNum === 2) return [serviceLabel, dayLabel, 'Time']
		if (stepNum === 1) return [serviceLabel, 'Date', 'Time']
		return ['Service', 'Date', 'Time']
	})

	const indicatorStep = $derived(Math.min(stepNum, 2))

	function onStepNav(step: number) {
		if (step === stepNum) return
		if (step < indicatorStep) {
			if (step === 0) {
				selectedService = null
				selectedDay = null
				pendingDay = null
			} else if (step === 1) {
				selectedDay = null
				pendingDay = null
			}
			goStep(step)
		}
	}
</script>

<svelte:head>
	<title>Service Catalog Prototype · Playground</title>
</svelte:head>

<div class="playground-page">
	<DevHero
		title="Service Catalog"
		subtitle="Pick a service, then date, then time — for salons, photographers, tattoo studios."
		breadcrumbItems={[{ label: 'Playground', href: '/playground/' }, { label: 'Service Catalog' }]}
	/>

	<div class="book">
		<div class="book__inner">
			<StepIndicator
				current={indicatorStep}
				{maxReached}
				labels={stepLabels}
				onNavigate={onStepNav}
			/>

			{#key animKey}
				<div
					class="book__step book__panel"
					class:book__step--fwd={direction === 'forward'}
					class:book__step--back={direction === 'back'}
				>
					{#if stepNum === 0}
						<header class="book__head">
							<h2 class="book__title">What would you like to book?</h2>
							<p class="book__subtitle">Each service shows its duration and price upfront.</p>
						</header>

						<div class="service-list">
							{#each data.services as service (service.id)}
								<ChevronRowCard
									onclick={() => pickService(service)}
									ariaLabel={`Pick ${service.name}`}
								>
									{#snippet start()}
										<span class="service-list__emoji">{service.emoji}</span>
									{/snippet}
									<div class="service-list__body">
										<div class="service-list__row">
											<span class="service-list__name">{service.name}</span>
											<span class="service-list__price">{priceLabel(service.priceUsd)}</span>
										</div>
										<div class="service-list__row service-list__row--meta">
											<span>{durationLabel(service.durationMin)}</span>
											<span class="service-list__sep">·</span>
											<span class="service-list__desc">{service.description}</span>
										</div>
									</div>
								</ChevronRowCard>
							{/each}
						</div>
					{:else if stepNum === 1 && selectedService}
						<CalendarStep
							{activity}
							{calDays}
							weekdays={WEEKDAYS}
							{openDays}
							claimed={true}
							bind:pendingDay
							onSelectDay={selectDay}
							onClaim={() => {}}
							monthLabel={calMonthLabel}
							{prevMonth}
							{nextMonth}
						/>
					{:else if stepNum === 2 && selectedDay}
						<TimeStep
							day={selectedDay}
							hourly={[]}
							sunrise={6}
							sunset={20}
							hasRain={false}
							{overlapping}
							bind:start
							bind:end
							onJoin={joinPerson}
							onConfirm={confirmBooking}
						/>
					{:else if stepNum === 3 && selectedDay && selectedService}
						<BookedStep
							activityIcon={selectedService.emoji}
							activityLabel={selectedService.name}
							date={selectedDay.date}
							{start}
							{end}
							{overlapping}
							onBack={() => {
								selectedService = null
								selectedDay = null
								goStep(0)
							}}
							onEdit={() => goStep(2)}
						/>
					{/if}
				</div>
			{/key}
		</div>
	</div>
</div>

<style>
	.playground-page {
		max-width: 56rem;
		margin: 0 auto;
		padding: 2rem 1rem 4rem;
	}
	.book {
		margin-top: 1.5rem;
	}
	.book__inner {
		max-width: 28rem;
		margin: 0 auto;
		padding: 1rem 0.75rem;
		box-sizing: border-box;
		width: 100%;
	}
	.book__panel {
		position: relative;
		padding: 1rem;
		border: 1px solid color-mix(in srgb, var(--text) 8%, transparent);
		border-radius: 0.75rem;
		background: color-mix(in srgb, var(--panel-bg, var(--bg)) 60%, transparent);
	}
	.book__step--fwd {
		animation: book-fwd 0.28s cubic-bezier(0.16, 1, 0.3, 1);
	}
	.book__step--back {
		animation: book-back 0.28s cubic-bezier(0.16, 1, 0.3, 1);
	}
	@keyframes book-fwd {
		from {
			opacity: 0;
			transform: translateX(30px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}
	@keyframes book-back {
		from {
			opacity: 0;
			transform: translateX(-30px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}
	.book__head {
		margin: 0 0 0.85rem;
		text-align: center;
	}
	.book__title {
		margin: 0 0 0.2rem;
		font-family: var(--font-display);
		font-size: 1.15rem;
		font-weight: 500;
		letter-spacing: -0.02em;
	}
	.book__subtitle {
		margin: 0;
		font-size: 0.78rem;
		color: color-mix(in srgb, var(--text) 56%, transparent);
	}
	.service-list {
		display: grid;
		gap: 0.4rem;
	}
	.service-list__emoji {
		font-size: 1.3rem;
		line-height: 1;
	}
	.service-list__body {
		display: grid;
		gap: 0.15rem;
	}
	.service-list__row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}
	.service-list__row--meta {
		font-size: 0.7rem;
		color: color-mix(in srgb, var(--text) 48%, transparent);
		gap: 0.35rem;
		justify-content: flex-start;
	}
	.service-list__name {
		font-weight: 650;
		font-size: 0.85rem;
	}
	.service-list__price {
		font-weight: 600;
		font-size: 0.78rem;
		color: color-mix(in srgb, var(--text) 70%, transparent);
	}
	.service-list__sep {
		opacity: 0.6;
	}
	.service-list__desc {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>

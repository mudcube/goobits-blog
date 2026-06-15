<script lang="ts">
	import { ArrowUp, Check, Users, X as XIcon } from '@lucide/svelte'
	import AdminCrewMemberCard from '@calendar/ui/admin/members/AdminCrewMemberCard.svelte'
	import AdminMetaCards from '@calendar/ui/admin/shared/AdminMetaCards.svelte'
	import {
		attendeeInitials,
		attendeeBadge as attendeeBadgeFor,
		attendeeDetail as attendeeDetailFor
	} from './event-detail-helpers'

	type Attendee = {
		entryId: number
		userId: string
		name: string | null
		email: string | null
		status: string
		waitlistPosition: number | null
		attendanceStatus: string
	}

	const {
		attendees,
		eventEnded,
		openSpots,
		crewMemberHref,
		onPromote,
		onAttendance
	}: {
		attendees: Attendee[]
		eventEnded: boolean
		openSpots: number
		crewMemberHref: (userId: string) => string
		onPromote: (entryId: number) => void
		onAttendance: (userId: string, status: 'unknown' | 'attended' | 'flaked') => void
	} = $props()
</script>

<section class="event-attendees__section">
	<div class="event-attendees__header">
		<div class="event-attendees__label">Attendees</div>
	</div>
	{#if attendees.length === 0}
		<p class="event-attendees__empty">No attendees yet.</p>
	{:else}
		<ul class="event-attendees__list">
			{#each attendees as attendee}
				<li class="event-attendees__item">
					<AdminCrewMemberCard
						name={attendee.name || attendee.email || attendee.userId}
						initials={attendeeInitials(attendee.name || attendee.email || attendee.userId)}
						badge={attendeeBadgeFor(attendee, eventEnded)}
						detail={attendeeDetailFor(attendee, eventEnded)}
						href={crewMemberHref(attendee.userId)}
					/>
					{#if attendee.status === 'waitlist' || attendee.waitlistPosition}
						<div class="event-attendees__actions">
							<button
								type="button"
								class="admin-ui-btn admin-ui-btn--accent"
								onclick={() => onPromote(attendee.entryId)}
							>
								<ArrowUp size={13} strokeWidth={2} /> Promote
							</button>
						</div>
					{:else if eventEnded && attendee.status === 'joined'}
						<div class="event-attendees__actions">
							<button
								type="button"
								class="admin-ui-btn"
								class:admin-ui-btn--accent={attendee.attendanceStatus === 'attended'}
								onclick={() =>
									onAttendance(
										attendee.userId,
										attendee.attendanceStatus === 'attended' ? 'unknown' : 'attended'
									)}
							>
								<Check size={13} strokeWidth={2} /> Attended
							</button>
							<button
								type="button"
								class="admin-ui-btn"
								class:admin-ui-btn--warn={attendee.attendanceStatus === 'flaked'}
								onclick={() =>
									onAttendance(
										attendee.userId,
										attendee.attendanceStatus === 'flaked' ? 'unknown' : 'flaked'
									)}
							>
								<XIcon size={13} strokeWidth={2} /> No-show
							</button>
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
	{#if openSpots > 0}
		<AdminMetaCards
			items={[
				{
					id: 'open-spots',
					label: `${openSpots} spot${openSpots === 1 ? '' : 's'} open`,
					detail: '',
					icon: Users
				}
			]}
			singleLine={true}
		/>
	{/if}
</section>

<style>
	.event-attendees__section {
		display: grid;
		gap: 0.6rem;
	}

	.event-attendees__header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.event-attendees__label {
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--text) 50%, transparent);
	}

	.event-attendees__empty {
		margin: 0;
		font-size: 0.86rem;
		color: color-mix(in srgb, var(--text) 58%, transparent);
		min-height: 1.5em;
	}

	.event-attendees__list {
		margin: 0;
		padding: 0;
		list-style: none;
		display: grid;
		gap: 0.35rem;
	}

	.event-attendees__item {
		list-style: none;
		display: grid;
		gap: 0.4rem;
	}

	.event-attendees__actions {
		display: inline-flex;
		gap: 0.4rem;
		padding-left: 3rem;
	}
</style>

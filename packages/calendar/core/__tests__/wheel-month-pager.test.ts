import { describe, expect, it } from 'vitest'
import { createWheelMonthPager } from '../../ui/src/features/events/member/wheel-month-pager'

function wheelEvent({
	timeStamp,
	deltaX = 0,
	deltaY
}: {
	timeStamp: number
	deltaY: number
	deltaX?: number
}) {
	return {
		timeStamp,
		deltaX,
		deltaY,
		preventDefault() {}
	} as WheelEvent
}

describe('createWheelMonthPager', () => {
	it('consumes a burst as a single month page', () => {
		const pages: Array<1 | -1> = []
		let lastDirection: 1 | -1 | 0 = 0
		const pager = createWheelMonthPager({
			triggerDelta: 48,
			sameDirectionRearmGapMs: 700,
			gestureIdleMs: 200,
			getLastPageDirection: () => lastDirection,
			onPage: (direction) => {
				lastDirection = direction
				pages.push(direction)
			}
		})

		pager.handle(wheelEvent({ timeStamp: 1_000, deltaY: 30 }))
		pager.handle(wheelEvent({ timeStamp: 1_060, deltaY: 22 }))
		pager.handle(wheelEvent({ timeStamp: 1_120, deltaY: 90 }))
		pager.handle(wheelEvent({ timeStamp: 1_180, deltaY: 40 }))

		expect(pages).toEqual([1])
	})

	it('suppresses rapid same-direction rearm but allows a later one', () => {
		const pages: Array<1 | -1> = []
		let lastDirection: 1 | -1 | 0 = 0
		const pager = createWheelMonthPager({
			triggerDelta: 48,
			sameDirectionRearmGapMs: 700,
			gestureIdleMs: 200,
			getLastPageDirection: () => lastDirection,
			onPage: (direction) => {
				lastDirection = direction
				pages.push(direction)
			}
		})

		pager.handle(wheelEvent({ timeStamp: 1_000, deltaY: 60 }))
		pager.handle(wheelEvent({ timeStamp: 1_060, deltaY: 60 }))

		pager.handle(wheelEvent({ timeStamp: 1_500, deltaY: 60 }))
		pager.handle(wheelEvent({ timeStamp: 1_560, deltaY: 60 }))

		pager.handle(wheelEvent({ timeStamp: 2_300, deltaY: 60 }))
		pager.handle(wheelEvent({ timeStamp: 2_360, deltaY: 60 }))

		expect(pages).toEqual([1, 1])
	})

	it('allows an immediate direction change', () => {
		const pages: Array<1 | -1> = []
		let lastDirection: 1 | -1 | 0 = 0
		const pager = createWheelMonthPager({
			triggerDelta: 48,
			sameDirectionRearmGapMs: 700,
			gestureIdleMs: 200,
			getLastPageDirection: () => lastDirection,
			onPage: (direction) => {
				lastDirection = direction
				pages.push(direction)
			}
		})

		pager.handle(wheelEvent({ timeStamp: 1_000, deltaY: 60 }))
		pager.handle(wheelEvent({ timeStamp: 1_060, deltaY: 60 }))

		pager.handle(wheelEvent({ timeStamp: 1_420, deltaY: -60 }))
		pager.handle(wheelEvent({ timeStamp: 1_480, deltaY: -60 }))

		expect(pages).toEqual([1, -1])
	})
})

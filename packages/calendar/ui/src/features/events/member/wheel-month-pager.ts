import { dominantAxisValue } from './month-stack'

type Direction = 1 | -1
type WheelLikeEvent = Pick<WheelEvent, 'deltaX' | 'deltaY' | 'timeStamp' | 'preventDefault'>

type WheelPagerState = {
	consumed: boolean
	gestureStartGap: number
}

type WheelMonthPagerOptions = {
	triggerDelta: number
	sameDirectionRearmGapMs: number
	gestureIdleMs?: number
	getLastPageDirection: () => Direction | 0
	onPage: (direction: Direction) => void
	onDebug?: (message: string) => void
	onStateChange?: (state: WheelPagerState) => void
}

export function createWheelMonthPager({
	triggerDelta,
	sameDirectionRearmGapMs,
	gestureIdleMs = 260,
	getLastPageDirection,
	onPage,
	onDebug,
	onStateChange
}: WheelMonthPagerOptions) {
	let lastWheelEventAt = 0
	let lastWheelGestureStartAt = 0
	let currentGestureStartGap = Number.POSITIVE_INFINITY
	let gestureDirection: Direction | 0 = 0
	let gestureDelta = 0
	let sameDirectionSuppressionBypass = false
	let postTriggerFloorAbsMovement = Number.POSITIVE_INFINITY
	let wheelGestureConsumed = false

	function emitState() {
		onStateChange?.({
			consumed: wheelGestureConsumed,
			gestureStartGap: currentGestureStartGap
		})
	}

	function startGesture(
		event: Pick<WheelLikeEvent, 'timeStamp'>,
		direction: Direction,
		{ bypassSameDirectionSuppression = false, reason = 'start' } = {}
	) {
		currentGestureStartGap = lastWheelGestureStartAt
			? event.timeStamp - lastWheelGestureStartAt
			: Number.POSITIVE_INFINITY
		lastWheelGestureStartAt = event.timeStamp
		gestureDirection = direction
		gestureDelta = 0
		sameDirectionSuppressionBypass = bypassSameDirectionSuppression
		postTriggerFloorAbsMovement = Number.POSITIVE_INFINITY
		wheelGestureConsumed = false
		onDebug?.(`wheel ${reason} gap=${Math.round(currentGestureStartGap)}`)
		emitState()
	}

	function resetGesture() {
		gestureDirection = 0
		gestureDelta = 0
		sameDirectionSuppressionBypass = false
		postTriggerFloorAbsMovement = Number.POSITIVE_INFINITY
		wheelGestureConsumed = false
		currentGestureStartGap = Number.POSITIVE_INFINITY
		emitState()
	}

	function shouldRestartFromReacceleration(absMovement: number) {
		if (!Number.isFinite(postTriggerFloorAbsMovement)) return false
		const increase = absMovement - postTriggerFloorAbsMovement
		return (
			absMovement >= postTriggerFloorAbsMovement * 1.35 &&
			increase >= triggerDelta * 0.5
		)
	}

	function handle(event: WheelLikeEvent) {
		event.preventDefault?.()

		const primaryMovement = dominantAxisValue([event.deltaX || 0, event.deltaY || 0, 0])
		if (!primaryMovement) return
		const absMovement = Math.abs(primaryMovement)
		const direction: Direction = primaryMovement > 0 ? 1 : -1
		const isNewGesture =
			!lastWheelEventAt ||
			event.timeStamp - lastWheelEventAt > gestureIdleMs ||
			(gestureDirection !== 0 && direction !== gestureDirection)

		if (isNewGesture) {
			startGesture(event, direction)
		} else if (wheelGestureConsumed && direction === gestureDirection) {
			if (shouldRestartFromReacceleration(absMovement)) {
				onDebug?.(
					`wheel reaccelerate floor=${Math.round(postTriggerFloorAbsMovement)} movement=${Math.round(absMovement)}`
				)
				startGesture(event, direction, {
					bypassSameDirectionSuppression: true,
					reason: 'restart'
				})
			} else {
				postTriggerFloorAbsMovement = Number.isFinite(postTriggerFloorAbsMovement)
					? Math.min(postTriggerFloorAbsMovement, absMovement)
					: absMovement
				lastWheelEventAt = event.timeStamp
				return
			}
		}

		lastWheelEventAt = event.timeStamp
		gestureDirection = direction
		if (wheelGestureConsumed) return
		gestureDelta += primaryMovement
		if (Math.abs(gestureDelta) < triggerDelta) return
		wheelGestureConsumed = true
		emitState()

		if (
			getLastPageDirection() === direction &&
			currentGestureStartGap < sameDirectionRearmGapMs &&
			!sameDirectionSuppressionBypass
		) {
			onDebug?.(`wheel suppress direction=${direction} gap=${Math.round(currentGestureStartGap)}`)
			return
		}

		onDebug?.(`wheel trigger direction=${direction} movement=${Math.round(primaryMovement)}`)
		onPage(direction)
	}

	function destroy() {
		lastWheelEventAt = 0
		lastWheelGestureStartAt = 0
		resetGesture()
	}

	emitState()

	return {
		handle,
		destroy
	}
}

/**
 * In-memory rate limiter for anti-abuse — used in local dev and test runs.
 *
 * Wraps `@goobits/security/rate-limit` so the underlying timestamp-window
 * accounting and store cleanup come from the canonical implementation.
 * Per-call `(limit, windowMs)` tuples are supported via a small limiter
 * cache — v2's `createRateLimiter` takes its windows at construction time,
 * but anti-abuse calls in `./index.ts` pass different limits per check
 * (per-IP / per-email / per-device / per-ASN).
 */

import { createRateLimiter, MemoryRateLimitStore } from '@goobits/security/rate-limit'

export type RateLimitCheckResult = {
	allowed: boolean
	remaining: number
	resetAt: number
	count: number
}

const sharedStore = new MemoryRateLimitStore()
const limiterCache = new Map<string, ReturnType<typeof createRateLimiter>>()

function getOrCreateLimiter(limit: number, windowMs: number) {
	const cacheKey = `${limit}:${windowMs}`
	let limiter = limiterCache.get(cacheKey)
	if (!limiter) {
		limiter = createRateLimiter({
			windows: [ { name: cacheKey, windowMs, maxEvents: limit } ],
			store: sharedStore,
			keyPrefix: `antiabuse:${cacheKey}`
		})
		limiterCache.set(cacheKey, limiter)
	}
	return limiter
}

export async function checkRateLimit(
	key: string,
	limit: number,
	windowMs: number
): Promise<RateLimitCheckResult> {
	const limiter = getOrCreateLimiter(limit, windowMs)
	const result = await limiter.check(key)
	if (result.allowed) {
		return {
			allowed: true,
			remaining: result.remaining,
			resetAt: result.resetAtMs,
			count: limit - result.remaining
		}
	}
	// Denied: caller's risk-scoring branches don't fire on this path
	// (the consumer short-circuits with a generic failure), so the exact
	// over-limit count doesn't matter — report `limit + 1` to signal "exceeded".
	return {
		allowed: false,
		remaining: 0,
		resetAt: result.resetAtMs,
		count: limit + 1
	}
}

export function keyForRateLimit(prefix: string, value: string) {
	return `${prefix}:${value.trim().toLowerCase()}`
}

/**
 * No-op kept for source-compatibility with the prior bespoke implementation.
 * v2's `MemoryRateLimitStore` handles its own opportunistic cleanup.
 */
export function compactRateLimitBuckets(_maxSize = 5000) {
	// no-op
}

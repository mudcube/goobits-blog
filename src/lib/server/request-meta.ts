export function getClientIp(
	request: Request,
	{
		env,
		getClientAddress
	}: {
		env: Record<string, string | undefined>
		getClientAddress?: () => string
	}
) {
	const cloudflareIp = request.headers.get('cf-connecting-ip')?.trim()
	if (cloudflareIp) return cloudflareIp

	// Only trust XFF when explicitly enabled (for non-Cloudflare deployments).
	if (env['RATE_LIMIT_TRUST_XFF'] === 'true') {
		const forwarded = request.headers.get('x-forwarded-for')
		const firstForwarded = forwarded?.split(',')[0]?.trim()
		if (firstForwarded) return firstForwarded
	}

	if (getClientAddress) return getClientAddress()
	return 'unknown'
}

export function getAsn(request: Request) {
	const cfRequest = request as Request & { cf?: { asn?: number } }
	const asn = cfRequest.cf?.asn
	return typeof asn === 'number' ? String(asn) : 'unknown'
}

/**
 * True if the request carries the Cloudflare metadata we need to scope
 * per-IP / per-ASN rate limits. False on requests that bypass Cloudflare
 * (direct origin hits, misrouted internal traffic, etc.).
 *
 * In production, callers that depend on these for spam control should
 * refuse the request rather than collapse everyone into the shared
 * `'unknown'` bucket — see security audit M5.
 */
export function hasCloudflareMetadata(request: Request): boolean {
	const hasIp = (request.headers.get('cf-connecting-ip')?.trim().length ?? 0) > 0
	const cfRequest = request as Request & { cf?: { asn?: number } }
	const hasAsn = typeof cfRequest.cf?.asn === 'number'
	return hasIp || hasAsn
}

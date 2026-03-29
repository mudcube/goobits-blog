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

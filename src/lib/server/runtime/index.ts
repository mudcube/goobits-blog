type RuntimeEnv = Record<string, string | undefined>

export function mergeRuntimeEnv(platformEnv?: RuntimeEnv) {
	return {
		...process.env,
		...(platformEnv ?? {})
	} as RuntimeEnv
}

export function resolveBaseUrl(url: URL, env: RuntimeEnv = mergeRuntimeEnv()) {
	return env['PUBLIC_BASE_URL'] || url.origin
}

export async function resolveRuntimeDb(_platformEnv?: RuntimeEnv) {
	return undefined
}

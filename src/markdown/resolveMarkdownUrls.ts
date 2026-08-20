const ABSOLUTE_URL = /^(?:[a-z][a-z\d+.-]*:|\/\/|\/|#)/i
const PLACEHOLDER_ORIGIN = 'https://blog.invalid'

function withTrailingSlash(value: string): string {
	return value.endsWith('/') ? value : `${value}/`
}

export function resolveMarkdownUrl(value: string, baseUrl: string): string {
	if (!value || ABSOLUTE_URL.test(value)) {
		return value
	}

	const absoluteBase = /^[a-z][a-z\d+.-]*:/i.test(baseUrl)
		? withTrailingSlash(baseUrl)
		: new URL(
				withTrailingSlash(baseUrl.startsWith('/') ? baseUrl : `/${baseUrl}`),
				PLACEHOLDER_ORIGIN
			)
	const resolved = new URL(value, absoluteBase)

	return typeof absoluteBase === 'string'
		? resolved.href
		: `${resolved.pathname}${resolved.search}${resolved.hash}`
}

function rewriteHtmlAttributes(value: string, baseUrl: string): string {
	return value.replace(
		/(\b(?:href|poster|src)\s*=\s*)(["'])([^"']+)\2/gi,
		(_match, prefix: string, quote: string, url: string) =>
			`${prefix}${quote}${resolveMarkdownUrl(url, baseUrl)}${quote}`
	)
}

function rewriteHtmlTags(value: string, baseUrl: string): string {
	return value.replace(/<\/?[a-z][^>]*>/gi, (tag) => rewriteHtmlAttributes(tag, baseUrl))
}

function destinationEnd(value: string, start: number): number {
	if (value[start] === '<') {
		const end = value.indexOf('>', start + 1)
		return end < 0 ? start : end + 1
	}

	let depth = 0
	for (let index = start; index < value.length; index += 1) {
		const character = value[index]
		if (character === '\\') {
			index += 1
		} else if (character === '(') {
			depth += 1
		} else if (character === ')') {
			if (depth === 0) {
				return index
			}
			depth -= 1
		} else if (/\s/.test(character ?? '')) {
			return index
		}
	}

	return value.length
}

function rewriteInlineDestinations(value: string, baseUrl: string): string {
	let cursor = 0
	let result = ''

	while (cursor < value.length) {
		const marker = value.indexOf('](', cursor)
		if (marker < 0) {
			return result + value.slice(cursor)
		}

		let start = marker + 2
		while (/\s/.test(value[start] ?? '')) {
			start += 1
		}
		const end = destinationEnd(value, start)
		if (end === start) {
			result += value.slice(cursor, start)
			cursor = start
			continue
		}

		const angled = value[start] === '<'
		const rawUrl = value.slice(start + (angled ? 1 : 0), end - (angled ? 1 : 0))
		const resolved = resolveMarkdownUrl(rawUrl, baseUrl)
		result += value.slice(cursor, start) + (angled ? `<${resolved}>` : resolved)
		cursor = end
	}

	return result
}

function rewriteReferenceDefinition(value: string, baseUrl: string): string {
	return value.replace(
		/^(\s{0,3}\[[^\]\n]+\]:\s*)(<([^>\n]+)>|(\S+))/,
		(
			_match,
			prefix: string,
			_destination: string,
			angledUrl: string | undefined,
			plainUrl: string | undefined
		) => {
			const resolved = resolveMarkdownUrl(angledUrl ?? plainUrl ?? '', baseUrl)
			return `${prefix}${angledUrl === undefined ? resolved : `<${resolved}>`}`
		}
	)
}

function rewriteOutsideCodeSpans(value: string, baseUrl: string): string {
	let cursor = 0
	let result = ''
	const rewrite = (prose: string): string =>
		rewriteInlineDestinations(rewriteHtmlTags(prose, baseUrl), baseUrl)

	while (cursor < value.length) {
		const opening = value.indexOf('`', cursor)
		if (opening < 0) {
			return result + rewrite(value.slice(cursor))
		}

		let delimiterEnd = opening
		while (value[delimiterEnd] === '`') {
			delimiterEnd += 1
		}
		const delimiter = value.slice(opening, delimiterEnd)
		const closing = value.indexOf(delimiter, delimiterEnd)
		if (closing < 0) {
			return result + rewrite(value.slice(cursor, opening)) + value.slice(opening)
		}

		result += rewrite(value.slice(cursor, opening))
		result += value.slice(opening, closing + delimiter.length)
		cursor = closing + delimiter.length
	}

	return result
}

export function resolveMarkdownUrls(markdown: string, baseUrl: string): string {
	let fence: { character: string; length: number } | null = null

	return markdown.replace(/^.*(?:\r?\n|$)/gm, (line) => {
		const body = line.replace(/\r?\n$/, '')
		const ending = line.slice(body.length)
		const fenceMatch = body.match(/^ {0,3}(`{3,}|~{3,})/)
		if (fenceMatch?.[1]) {
			const marker = fenceMatch[1]
			if (!fence) {
				fence = { character: marker[0] ?? '', length: marker.length }
			} else if (marker[0] === fence.character && marker.length >= fence.length) {
				fence = null
			}
			return line
		}
		if (fence || /^(?: {4}|\t)/.test(body)) {
			return line
		}

		const definition = rewriteReferenceDefinition(body, baseUrl)
		return `${rewriteOutsideCodeSpans(definition, baseUrl)}${ending}`
	})
}

import crypto from 'crypto'
import fs from 'fs/promises'
import path from 'path'

const PNG_EXTENSION = '.png'
const MIME_TYPE_BY_EXTENSION = Object.freeze({
	'.gif': 'image/gif',
	'.jpeg': 'image/jpeg',
	'.jpg': 'image/jpeg',
	'.png': 'image/png',
	'.webp': 'image/webp'
})

export function toSlug(value, fallback = 'image') {
	const slug = String(value || '')
		.toLowerCase()
		.replace(/[^a-z0-9._-]+/g, '-')
		.replace(/-{2,}/g, '-')
		.replace(/^[._-]+|[._-]+$/g, '')
		.slice(0, 80)

	return slug || fallback
}

export function createImageFilename(prompt, requestedFilename = undefined) {
	const parsedName = requestedFilename ? path.parse(requestedFilename).name : ''
	const baseName = toSlug(parsedName || prompt)

	if (requestedFilename) {
		return `${ baseName }${ PNG_EXTENSION }`
	}

	const id = crypto.randomUUID().slice(0, 8)
	return `${ baseName }-${ id }${ PNG_EXTENSION }`
}

export function resolveInsideWorkspace(targetPath, label = 'Path') {
	const workspaceRoot = process.cwd()
	const resolved = path.resolve(workspaceRoot, targetPath)

	if (resolved !== workspaceRoot && !resolved.startsWith(workspaceRoot + path.sep)) {
		throw new Error(`${ label } must stay inside the repository workspace`)
	}

	return resolved
}

export function resolveOutputPath(outputDir, filename) {
	const resolvedDir = resolveInsideWorkspace(outputDir, 'Output directory')
	const resolvedPath = path.resolve(resolvedDir, filename)

	if (!resolvedPath.startsWith(resolvedDir + path.sep)) {
		throw new Error('Output filename resolved outside the output directory')
	}

	return {
		outputDir: resolvedDir,
		outputPath: resolvedPath
	}
}

export async function readPromptFile(promptFile) {
	const resolvedPath = resolveInsideWorkspace(promptFile, 'Prompt file')
	return (await fs.readFile(resolvedPath, 'utf-8')).trim()
}

export async function readReferenceImage(referenceImagePath) {
	const resolvedPath = resolveInsideWorkspace(referenceImagePath, 'Reference image')
	const extension = path.extname(resolvedPath).toLowerCase()
	const mimeType = MIME_TYPE_BY_EXTENSION[extension]

	if (!mimeType) {
		throw new Error(`Unsupported reference image type "${ extension || 'unknown' }". Use PNG, JPG, WEBP, or GIF.`)
	}

	const buffer = await fs.readFile(resolvedPath)

	if (buffer.length === 0) {
		throw new Error('Reference image file is empty')
	}

	return {
		path: resolvedPath,
		mimeType,
		base64Data: buffer.toString('base64')
	}
}

export async function writeBase64Png(outputPath, base64Data) {
	const buffer = Buffer.from(base64Data, 'base64')

	if (buffer.length === 0) {
		throw new Error('Generated image data decoded to an empty file')
	}

	await fs.mkdir(path.dirname(outputPath), { recursive: true })
	await fs.writeFile(outputPath, buffer)
}

export function validateBase64Image(data) {
	if (typeof data !== 'string' || data.length === 0) {
		throw new Error('Gemini returned empty image data')
	}

	if (!/^[A-Za-z0-9+/]*={0,2}$/.test(data)) {
		throw new Error('Gemini returned invalid base64 image data')
	}
}

export function extractImageResult(response) {
	const parts = response?.candidates?.[0]?.content?.parts

	if (!Array.isArray(parts) || parts.length === 0) {
		throw new Error('Gemini response did not include content parts')
	}

	let imageData = null
	let imageText = null

	for (const part of parts) {
		if (part.text) {
			imageText = part.text
		} else if (part.inlineData?.data) {
			imageData = part.inlineData.data
		}
	}

	if (!imageData) {
		const partTypes = parts.map(part => Object.keys(part).join(',')).join('; ')
		throw new Error(`Gemini response did not include image data. Parts found: [${ partTypes }]`)
	}

	validateBase64Image(imageData)

	return {
		imageData,
		imageText
	}
}

export async function withTimeout(promise, timeoutMs) {
	let timeoutId

	const timeoutPromise = new Promise((_, reject) => {
		timeoutId = setTimeout(() => {
			reject(new Error(`Gemini request timed out after ${ timeoutMs / 1000 } seconds`))
		}, timeoutMs)
	})

	try {
		return await Promise.race([ promise, timeoutPromise ])
	} finally {
		clearTimeout(timeoutId)
	}
}

export function describeGenerationError(error) {
	const message = error?.message || String(error || '')
	const status = error?.status || error?.code || ''
	const signature = `${ status } ${ message }`

	if (/UNAUTHENTICATED|401/.test(signature)) {
		return { retry: false, message: 'Authentication failed. Check GOOGLE_API_KEY or GEMINI_API_KEY.' }
	}
	if (/PERMISSION_DENIED|403/.test(signature)) {
		return { retry: false, message: 'Permission denied. Check API key permissions.' }
	}
	if (/INVALID_ARGUMENT|NOT_FOUND|404/.test(signature)) {
		return { retry: false, message: message || 'Gemini rejected the request.' }
	}
	if (/RESOURCE_EXHAUSTED|429|500|503|DEADLINE_EXCEEDED|UNAVAILABLE|INTERNAL|timeout|ECONNRESET|ETIMEDOUT/i.test(signature)) {
		return { retry: true, message: message || 'Gemini request failed with a retryable error.' }
	}

	return { retry: false, message: message || 'Gemini request failed.' }
}

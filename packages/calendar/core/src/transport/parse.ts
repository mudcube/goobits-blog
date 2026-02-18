import { TransportValidationError } from './errors.ts'

type JsonObject = Record<string, unknown>

function isJsonObject(input: unknown): input is JsonObject {
	return Boolean(input) && typeof input === 'object' && !Array.isArray(input)
}

export function asJsonObject(input: unknown, message = 'Invalid JSON payload'): JsonObject {
	if (!isJsonObject(input)) throw new TransportValidationError(message)
	return input
}

export function readRequiredString(
	input: JsonObject,
	key: string,
	options?: { maxLength?: number; trim?: boolean; message?: string }
) {
	const raw = input[key]
	if (typeof raw !== 'string') throw new TransportValidationError(options?.message ?? `Missing ${key}`)
	const value = options?.trim === false ? raw : raw.trim()
	if (!value) throw new TransportValidationError(options?.message ?? `Missing ${key}`)
	if (options?.maxLength && value.length > options.maxLength) {
		return value.slice(0, options.maxLength)
	}
	return value
}

export function readOptionalString(
	input: JsonObject,
	key: string,
	options?: { maxLength?: number; trim?: boolean }
) {
	const raw = input[key]
	if (raw == null) return null
	if (typeof raw !== 'string') throw new TransportValidationError(`Invalid ${key}`)
	const value = options?.trim === false ? raw : raw.trim()
	if (!value) return null
	if (options?.maxLength && value.length > options.maxLength) {
		return value.slice(0, options.maxLength)
	}
	return value
}

export function readBoolean(input: JsonObject, key: string, defaultValue?: boolean) {
	const raw = input[key]
	if (typeof raw === 'boolean') return raw
	if (defaultValue != null) return defaultValue
	throw new TransportValidationError(`Invalid ${key}`)
}

export function readIntInRange(
	input: JsonObject,
	key: string,
	options: { min: number; max: number; defaultValue?: number; message?: string }
) {
	const raw = input[key]
	if (raw == null && options.defaultValue != null) return options.defaultValue
	const value = Number.parseInt(String(raw), 10)
	if (!Number.isFinite(value) || value < options.min || value > options.max) {
		throw new TransportValidationError(options.message ?? `Invalid ${key}`)
	}
	return value
}

export function readEnum<T extends string>(
	input: JsonObject,
	key: string,
	allowed: readonly T[],
	message?: string
) {
	const raw = input[key]
	if (typeof raw !== 'string' || !allowed.includes(raw as T)) {
		throw new TransportValidationError(message ?? `Invalid ${key}`)
	}
	return raw as T
}

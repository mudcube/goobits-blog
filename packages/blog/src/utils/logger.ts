/**
 * Logger utility for @goobits/blog
 */

// Log level type
export type LogLevel = 0 | 1 | 2 | 3

// Log levels
export const LogLevels: Readonly<{
	ERROR: 0
	WARN: 1
	INFO: 2
	DEBUG: 3
}> = {
	ERROR: 0,
	WARN: 1,
	INFO: 2,
	DEBUG: 3
} as const

// Logger configuration interface
export interface LoggerConfig {
	enabled: boolean
	level: LogLevel
	prefix: string
}

// Logger instance interface
export interface Logger {
	error: (message: string, ...args: unknown[]) => void
	warn: (message: string, ...args: unknown[]) => void
	info: (message: string, ...args: unknown[]) => void
	debug: (message: string, ...args: unknown[]) => void
}

// Console method type
type ConsoleMethod = 'error' | 'warn' | 'info' | 'debug' | 'log'

// Global logger configuration
let globalConfig: LoggerConfig = {
	enabled: true,
	level: LogLevels.INFO,
	prefix: '@goobits/blog'
}

/**
 * Configure the global logger
 *
 * @param config - Logger configuration
 */
export function configureLogger(config: Partial<LoggerConfig>): void {
	globalConfig = { ...globalConfig, ...config }
}

/**
 * Create a logger instance for a specific module
 *
 * @param module - Module name
 * @returns Logger instance with error, warn, info, and debug methods
 */
export function createLogger(module: string): Logger {
	const prefix = `[${ globalConfig.prefix }:${ module }]`

	const shouldLog = (level: LogLevel): boolean => globalConfig.enabled && level <= globalConfig.level

	const log = (level: LogLevel, method: ConsoleMethod, message: string, ...args: unknown[]): void => {
		if (!shouldLog(level)) { return }

		const timestamp = new Date().toISOString()
		const logMethod = console[method]
		logMethod(`${ timestamp } ${ prefix } ${ message }`, ...args)
	}

	return {
		error: (message: string, ...args: unknown[]): void => { log(LogLevels.ERROR, 'error', message, ...args); },
		warn: (message: string, ...args: unknown[]): void => { log(LogLevels.WARN, 'warn', message, ...args); },
		info: (message: string, ...args: unknown[]): void => { log(LogLevels.INFO, 'info', message, ...args); },
		debug: (message: string, ...args: unknown[]): void => { log(LogLevels.DEBUG, 'debug', message, ...args); }
	}
}

#!/usr/bin/env node
/**
 * @fileoverview Nano Banana CLI - Single image generation from command line.
 * @module nano-banana/cli
 */

import dotenv from 'dotenv'
import fs from 'fs/promises'
import path from 'path'
import { parseArgs } from 'util'

import {
	DEFAULT_CONFIG,
	VALID_ASPECT_RATIOS,
	VALID_RESOLUTIONS,
	VALID_STYLES
} from './config.js'
import NanoBananaClient from './nano_banana_client.js'

dotenv.config({ quiet: true })

function formatJSONError(message, details = null) {
	return JSON.stringify({
		success: false,
		error: message,
		...(details && { details })
	})
}

function parseArguments() {
	const options = {
		'output-dir': { type: 'string', short: 'o', default: path.resolve(DEFAULT_CONFIG.outputDir) },
		'prompt': { type: 'string', short: 'p' },
		'prompt-file': { type: 'string', short: 'f' },
		'filename': { type: 'string', short: 'n' },
		'aspect-ratio': { type: 'string', short: 'a', default: DEFAULT_CONFIG.aspectRatio },
		'resolution': { type: 'string', short: 'r', default: DEFAULT_CONFIG.resolution },
		'style': { type: 'string', short: 's', default: DEFAULT_CONFIG.style },
		'no-style': { type: 'boolean', default: false },
		'url-only': { type: 'boolean', short: 'u', default: false },
		'dry-run': { type: 'boolean', short: 'd', default: false },
		'json': { type: 'boolean', short: 'j', default: false },
		'capabilities': { type: 'boolean', short: 'c', default: false },
		'help': { type: 'boolean', short: 'h', default: false }
	}

	const { values: args, positionals } = parseArgs({
		options,
		allowPositionals: true,
		strict: false
	})

	return { ...args, _: positionals }
}

function showHelp() {
	console.log(`
Nano Banana Image Generation CLI
Using Google's Gemini 2.5 Flash Image

Usage: pnpm task:nano-banana [options] "Your prompt here"

Arguments:
  prompt                     The image description/prompt (positional or use -p)

Image Settings:
  -a, --aspect-ratio <ratio> Aspect ratio for the image (default: ${ DEFAULT_CONFIG.aspectRatio })
                             Options: ${ VALID_ASPECT_RATIOS.join(', ') }
  -r, --resolution <res>     Image resolution (default: ${ DEFAULT_CONFIG.resolution })
                             Options: ${ VALID_RESOLUTIONS.join(', ') }
  -s, --style <preset>       Style preset (default: ${ DEFAULT_CONFIG.style })
                             Options: ${ VALID_STYLES.join(', ') }
      --no-style             No style preset (raw prompt only)

Output Options:
  -o, --output-dir <dir>     Output directory (default: ${ DEFAULT_CONFIG.outputDir })
  -n, --filename <name>      Custom filename (without .png extension)
  -u, --url-only             Return base64 data without saving
  -j, --json                 Output results as JSON
  -d, --dry-run              Preview settings without generating

Other:
  -p, --prompt <text>        Prompt as named option
  -f, --prompt-file <path>   Read prompt from file
  -c, --capabilities         Show all provider capabilities
  -h, --help                 Display this help

Examples:
  pnpm task:nano-banana "A jar of honey in sunlight"
  pnpm task:nano-banana "A bee on a flower" -s product -r 2K
  pnpm task:nano-banana "Wide landscape" -a 16:9 -s hero
  pnpm task:nano-banana --no-style "A simple honeycomb pattern"
  pnpm task:nano-banana "Test prompt" --dry-run --json

Requirements:
  GOOGLE_API_KEY or GEMINI_API_KEY in .env file
  Get your key: https://aistudio.google.com/apikey
`)
}

async function showCapabilities(jsonOutput) {
	try {
		const client = new NanoBananaClient()
		const capabilities = await client.getCapabilities()

		if (jsonOutput) {
			console.log(JSON.stringify({ success: true, ...capabilities }, null, 2))
		} else {
			console.log('--- Nano Banana Provider Capabilities ---')
			console.log(JSON.stringify(capabilities, null, 2))
		}
	} catch(error) {
		if (jsonOutput) {
			console.log(formatJSONError('Failed to get capabilities', error.message))
		} else {
			console.error('Error getting capabilities:', error.message)
		}
		process.exit(1)
	}
}

function validateOutputDir(outputDir) {
	try {
		const resolved = path.resolve(outputDir)
		const cwd = path.resolve(process.cwd())
		const allowedBase = path.resolve(DEFAULT_CONFIG.outputDir)

		const isSafe =
			resolved.startsWith(cwd + path.sep) ||
			resolved === cwd ||
			resolved.startsWith(allowedBase + path.sep) ||
			resolved === allowedBase

		if (!isSafe) {
			return { valid: false, error: 'Output directory must be within project directory' }
		}

		if (outputDir.includes('..')) {
			return { valid: false, error: 'Path traversal not allowed' }
		}

		return { valid: true }
	} catch(error) {
		return { valid: false, error: `Invalid path: ${ error.message }` }
	}
}

function validateArguments(args) {
	const errors = []

	if (args['aspect-ratio'] && !VALID_ASPECT_RATIOS.includes(args['aspect-ratio'])) {
		errors.push(`Invalid aspect ratio: ${ args['aspect-ratio'] }. Valid: ${ VALID_ASPECT_RATIOS.join(', ') }`)
	}

	if (!VALID_RESOLUTIONS.includes(args.resolution)) {
		errors.push(`Invalid resolution: ${ args.resolution }. Valid: ${ VALID_RESOLUTIONS.join(', ') }`)
	}

	if (args.style && !VALID_STYLES.includes(args.style)) {
		errors.push(`Invalid style: ${ args.style }. Valid: ${ VALID_STYLES.join(', ') }`)
	}

	return {
		valid: errors.length === 0,
		errors
	}
}

function formatPrompt(prompt, maxLen = 100) {
	const truncated = prompt.length > maxLen
	return {
		preview: truncated ? prompt.substring(0, maxLen - 3) + '...' : prompt,
		full: prompt,
		length: prompt.length,
		truncated
	}
}

async function resolvePrompt(args, jsonOutput) {
	if (args.prompt) {
		return args.prompt
	}

	if (args['prompt-file']) {
		try {
			const filePath = path.resolve(args['prompt-file'])
			const cwd = path.resolve(process.cwd())
			if (!filePath.startsWith(cwd + path.sep) && filePath !== cwd) {
				throw new Error('Prompt file must be within project directory')
			}
			return (await fs.readFile(filePath, 'utf-8')).trim()
		} catch(error) {
			if (jsonOutput) {
				console.log(formatJSONError('Could not read prompt file', error.message))
			} else {
				console.error(`Error: Could not read prompt file: ${ error.message }`)
			}
			process.exit(1)
		}
	}

	return args._?.[0]
}

async function main() {
	const args = parseArguments()
	const jsonOutput = args.json

	if (args.help) {
		showHelp()
		return
	}

	if (args.capabilities) {
		await showCapabilities(jsonOutput)
		return
	}

	const outputDirValidation = validateOutputDir(args['output-dir'])
	if (!outputDirValidation.valid) {
		if (jsonOutput) {
			console.log(formatJSONError(outputDirValidation.error))
		} else {
			console.error(`Error: ${ outputDirValidation.error }`)
		}
		process.exit(1)
	}

	const argValidation = validateArguments(args)
	if (!argValidation.valid) {
		if (jsonOutput) {
			console.log(formatJSONError('Invalid arguments', argValidation.errors.join('; ')))
		} else {
			console.error('Error: Invalid arguments')
			argValidation.errors.forEach(e => console.error(`  - ${ e }`))
		}
		process.exit(1)
	}

	const prompt = await resolvePrompt(args, jsonOutput)

	if (!prompt || prompt.trim().length === 0) {
		if (jsonOutput) {
			console.log(formatJSONError('No prompt provided'))
		} else {
			console.error('Error: No prompt provided. Use --prompt, --prompt-file, or a positional prompt.')
			showHelp()
		}
		process.exit(1)
	}

	const promptInfo = formatPrompt(prompt)
	const isDryRun = args['dry-run']

	if (!isDryRun && !process.env.GOOGLE_API_KEY && !process.env.GEMINI_API_KEY) {
		if (jsonOutput) {
			console.log(formatJSONError('API key not configured'))
		} else {
			console.error('Error: GOOGLE_API_KEY or GEMINI_API_KEY environment variable not set.')
			console.error('Get your key: https://aistudio.google.com/apikey')
		}
		process.exit(1)
	}

	const config = {
		prompt,
		aspectRatio: args['aspect-ratio'],
		resolution: args.resolution,
		style: args.style,
		appendStylePrompt: !args['no-style'],
		output: args['url-only'] ? 'url' : 'file',
		outputDir: args['output-dir'],
		filename: args.filename
	}

	if (isDryRun) {
		const dryRunResult = {
			dryRun: true,
			promptPreview: promptInfo.preview,
			promptLength: promptInfo.length,
			promptTruncated: promptInfo.truncated,
			style: args['no-style'] ? 'none' : args.style,
			aspectRatio: args['aspect-ratio'],
			resolution: args.resolution,
			outputDir: path.relative(process.cwd(), args['output-dir']),
			model: DEFAULT_CONFIG.model
		}

		if (jsonOutput) {
			dryRunResult.promptFull = prompt
			console.log(JSON.stringify({ success: true, ...dryRunResult }, null, 2))
		} else {
			console.log('--- Nano Banana Image Generation (Dry Run) ---')
			console.log(`Prompt: "${ promptInfo.preview }"`)
			if (promptInfo.truncated) {
				console.log(`  (Full prompt is ${ promptInfo.length } characters)`)
			}
			console.log(`Style: ${ dryRunResult.style }`)
			console.log(`Aspect Ratio: ${ dryRunResult.aspectRatio }`)
			console.log(`Resolution: ${ dryRunResult.resolution }`)
			console.log(`Output Dir: ${ dryRunResult.outputDir }`)
			console.log(`Model: ${ dryRunResult.model }`)
			console.log('\n[Dry Run] No image generated.')
		}
		return
	}

	if (!jsonOutput) {
		console.log('--- Nano Banana Image Generation ---')
		console.log(`Prompt: "${ promptInfo.preview }"`)
		if (promptInfo.truncated) {
			console.log(`  (Full prompt is ${ promptInfo.length } characters)`)
		}
		console.log(`Style: ${ args['no-style'] ? 'none' : args.style }`)
		console.log(`Aspect Ratio: ${ args['aspect-ratio'] }`)
		console.log(`Resolution: ${ args.resolution }`)
	}

	try {
		const client = new NanoBananaClient()
		const result = await client.generateImage(config)

		if (jsonOutput) {
			console.log(JSON.stringify({
				success: true,
				...result,
				relativePath: result.relativePath || path.relative(process.cwd(), result.path)
			}, null, 2))
		} else {
			console.log('\n--- Image Generation Successful ---')

			if (args['url-only']) {
				console.log('Note: Gemini returns base64 data, not hosted URLs.')
				console.log('Use --output-dir to save the file instead.')
			} else {
				console.log(`Image saved to: ${ result.relativePath }`)
			}

			console.log(`Model: ${ result.model }`)
		}
	} catch(error) {
		if (jsonOutput) {
			console.log(formatJSONError('Image generation failed', error.message))
		} else {
			console.error('\n--- Image Generation Failed ---')
			console.error(`Error: ${ error.message }`)
		}
		process.exit(1)
	}
}

main().catch(err => {
	console.error('\nUnhandled error:', err.message || err)
	process.exit(1)
})

#!/usr/bin/env node

import path from 'path'
import { parseArgs } from 'util'

import {
	DEFAULT_GENERATION_OPTIONS,
	VALID_ASPECT_RATIOS,
	VALID_OUTPUT_MODES,
	VALID_RESOLUTIONS,
	VALID_STYLES
} from './config.js'
import NanoBananaClient from './client.js'
import { readPromptFile } from './utils.js'

function jsonResult(payload) {
	console.log(JSON.stringify(payload, null, 2))
}

function jsonError(message, details = undefined) {
	jsonResult({
		success: false,
		error: message,
		...(details ? { details } : {})
	})
}

function parseCliArgs() {
	const { values, positionals } = parseArgs({
		allowPositionals: true,
		options: {
			'aspect-ratio': { type: 'string', short: 'a', default: DEFAULT_GENERATION_OPTIONS.aspectRatio },
			'capabilities': { type: 'boolean', short: 'c', default: false },
			'dry-run': { type: 'boolean', short: 'd', default: false },
			'filename': { type: 'string', short: 'n' },
			'help': { type: 'boolean', short: 'h', default: false },
			'json': { type: 'boolean', short: 'j', default: false },
			'no-style': { type: 'boolean', default: false },
			'output': { type: 'string', default: DEFAULT_GENERATION_OPTIONS.output },
			'output-dir': { type: 'string', short: 'o', default: DEFAULT_GENERATION_OPTIONS.outputDir },
			'prompt': { type: 'string', short: 'p' },
			'prompt-file': { type: 'string', short: 'f' },
			'reference-image': { type: 'string' },
			'resolution': { type: 'string', short: 'r', default: DEFAULT_GENERATION_OPTIONS.resolution },
			'style': { type: 'string', short: 's', default: DEFAULT_GENERATION_OPTIONS.style },
			'url-only': { type: 'boolean', short: 'u', default: false }
		},
		strict: true
	})

	return {
		...values,
		positionals
	}
}

function showHelp() {
	console.log(`
Nano Banana image task

Usage:
  pnpm task:nano-banana "A jar of honey in sunlight"
  pnpm task:nano-banana --style hero --aspect-ratio 16:9 "A wide storybook header"

Prompt:
  -p, --prompt <text>         Prompt as an option
  -f, --prompt-file <path>    Read prompt from a repo-local file

Image:
  -s, --style <style>         ${ VALID_STYLES.join(', ') }
  -a, --aspect-ratio <ratio>  ${ VALID_ASPECT_RATIOS.join(', ') }
  -r, --resolution <size>     ${ VALID_RESOLUTIONS.join(', ') }
      --reference-image <path> Use a repo-local source image as the visual base
      --no-style              Send only the raw prompt

Output:
      --output <mode>         ${ VALID_OUTPUT_MODES.join(', ') }
  -o, --output-dir <path>     Default: ${ DEFAULT_GENERATION_OPTIONS.outputDir }
  -n, --filename <name>       Custom PNG filename
  -u, --url-only              Alias for --output base64

Other:
  -d, --dry-run               Print resolved options without calling Gemini
  -j, --json                  Print machine-readable output
  -c, --capabilities          Print supported settings
  -h, --help                  Show this help

Environment:
  GOOGLE_API_KEY or GEMINI_API_KEY must be available for real generation.
  The task reads config/env/.env and .env when present, without requiring either.
`)
}

function validateCliOptions(args) {
	const errors = []

	if (!VALID_STYLES.includes(args.style)) {
		errors.push(`Invalid style "${ args.style }"`)
	}
	if (!VALID_ASPECT_RATIOS.includes(args['aspect-ratio'])) {
		errors.push(`Invalid aspect ratio "${ args['aspect-ratio'] }"`)
	}
	if (!VALID_RESOLUTIONS.includes(args.resolution)) {
		errors.push(`Invalid resolution "${ args.resolution }"`)
	}
	if (!VALID_OUTPUT_MODES.includes(args.output)) {
		errors.push(`Invalid output "${ args.output }"`)
	}

	return errors
}

async function resolvePrompt(args) {
	if (args.prompt) return args.prompt
	if (args['prompt-file']) return readPromptFile(args['prompt-file'])
	return args.positionals[0]
}

function toGenerationOptions(args, prompt) {
	return {
		prompt,
		aspectRatio: args['aspect-ratio'],
		resolution: args.resolution,
		style: args.style,
		referenceImage: args['reference-image'],
		appendStylePrompt: !args['no-style'],
		output: args['url-only'] ? 'base64' : args.output,
		outputDir: args['output-dir'],
		filename: args.filename
	}
}

function printDryRun(options, jsonOutput) {
	const payload = {
		success: true,
		dryRun: true,
		...options,
		style: options.appendStylePrompt ? options.style : 'none',
		outputDir: path.relative(process.cwd(), path.resolve(options.outputDir))
	}

	if (jsonOutput) {
		jsonResult(payload)
		return
	}

	console.log('Nano Banana dry run')
	console.log(`Prompt: ${ options.prompt }`)
	console.log(`Style: ${ payload.style }`)
	console.log(`Aspect ratio: ${ options.aspectRatio }`)
	console.log(`Resolution: ${ options.resolution }`)
	if (options.referenceImage) {
		console.log(`Reference image: ${ options.referenceImage }`)
	}
	console.log(`Output: ${ options.output }`)
	console.log(`Output dir: ${ payload.outputDir }`)
}

async function main() {
	const args = parseCliArgs()

	if (args.help) {
		showHelp()
		return
	}

	const client = new NanoBananaClient()

	if (args.capabilities) {
		const capabilities = client.getCapabilities()
		if (args.json) {
			jsonResult({ success: true, ...capabilities })
		} else {
			console.log(JSON.stringify(capabilities, null, 2))
		}
		return
	}

	const validationErrors = validateCliOptions(args)
	if (validationErrors.length > 0) {
		if (args.json) jsonError('Invalid options', validationErrors.join('; '))
		else console.error(`Invalid options: ${ validationErrors.join('; ') }`)
		process.exit(1)
	}

	const prompt = await resolvePrompt(args)
	if (!prompt || prompt.trim().length === 0) {
		if (args.json) jsonError('No prompt provided')
		else console.error('No prompt provided. Pass a positional prompt, --prompt, or --prompt-file.')
		process.exit(1)
	}

	const options = toGenerationOptions(args, prompt.trim())

	if (args['dry-run']) {
		printDryRun(options, args.json)
		return
	}

	try {
		const result = await client.generateImage(options)

		if (args.json) {
			jsonResult({ success: true, ...result })
			return
		}

		console.log('Nano Banana generation complete')
		if (result.relativePath) {
			console.log(`Image: ${ result.relativePath }`)
		} else {
			console.log('Image returned as base64 data')
		}
		console.log(`Model: ${ result.model }`)
	} catch(error) {
		if (args.json) jsonError('Image generation failed', error.message)
		else console.error(`Image generation failed: ${ error.message }`)
		process.exit(1)
	}
}

main().catch(error => {
	console.error(error?.message || error)
	process.exit(1)
})

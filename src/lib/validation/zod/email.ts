import { z } from 'zod'

export const emailSchema = z
	.string()
	.trim()
	.min(1, 'Email is required')
	.email('Email is invalid')
	.max(320, 'Email is invalid')

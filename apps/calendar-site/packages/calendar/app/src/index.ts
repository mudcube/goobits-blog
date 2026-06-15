import {
	enforceSameOrigin,
	forbidden,
	logAdminEvent,
	noStoreHeaders,
	requireAdminSession,
	unauthorized
} from './admin-api-helpers'
import {
	buildCalendarLoginErrorPath,
	getRedirectLocationFromError,
	hasValidOAuthCallbackParams,
	isStatusError,
	resolveCallbackProvider,
	resolveRequestedProvider,
	shouldWrapAsOauthFailure
} from './oauth-routing'
import { createCalendarAuthHandles } from './hooks'
import { mergeRuntimeEnv, resolveBaseUrl, resolveRuntimeDb } from './server/runtime'
import { registerUser, type RegisterUserInput, type RegisterUserResult } from './server/auth/register'
import { consumeEmailVerificationToken, issueEmailVerification } from './server/email/verification'

export {
	buildCalendarLoginErrorPath,
	consumeEmailVerificationToken,
	createCalendarAuthHandles,
	enforceSameOrigin,
	forbidden,
	getRedirectLocationFromError,
	hasValidOAuthCallbackParams,
	isStatusError,
	issueEmailVerification,
	logAdminEvent,
	mergeRuntimeEnv,
	noStoreHeaders,
	registerUser,
	requireAdminSession,
	resolveBaseUrl,
	resolveCallbackProvider,
	resolveRequestedProvider,
	resolveRuntimeDb,
	shouldWrapAsOauthFailure,
	unauthorized
}

export type { RegisterUserInput, RegisterUserResult }

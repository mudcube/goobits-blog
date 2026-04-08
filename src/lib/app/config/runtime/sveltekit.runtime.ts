import * as jsModule from './sveltekit.runtime.js'

type HasStaticFile = (urlPath: string) => boolean
type HandlePrerenderHttpError = (pathname: string, message: string) => void

export const hasStaticFile = jsModule.hasStaticFile as HasStaticFile
export const handlePrerenderHttpError =
	jsModule.handlePrerenderHttpError as HandlePrerenderHttpError

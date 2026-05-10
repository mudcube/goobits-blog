// Media sub-entry for @calendar/core.
//
// Hero image upload helpers (validation, storage, URL extraction).

export {
	putEventHero,
	deleteEventHero,
	extractHeroKeyFromUrl,
	HeroUploadError,
	ALLOWED_HERO_MIME_TYPES,
	MAX_HERO_BYTES,
	type AllowedHeroMimeType,
	type PutHeroResult
} from './media/hero-upload.ts'

export const emojiOptions = [
	// Fitness / movement
	'💪', '🏋️', '🤸', '🧘', '🏃', '🚴', '🏊', '⛹️', '🤽', '🤾',
	// Sports
	'⚽', '🏀', '🎾', '🏈', '⚾', '🏐', '🏓', '🏸', '🥊', '🥋',
	// Arts / performance
	'🎨', '🎭', '🎪', '🎬', '🎤', '🎵', '🎶', '🎹', '🎸', '🥁',
	// Food / drink
	'🍕', '🍔', '🌮', '🍣', '🍰', '🍪', '☕', '🍷', '🍺', '🍱',
	// Travel / outdoors
	'✈️', '🚗', '🚲', '🏖️', '🏕️', '🌄', '🗺️', '⛺', '🌳', '🏔️',
	// Symbols / vibes
	'✨', '🌈', '🔥', '🎯', '⭐', '💫', '🎉', '❤️', '💡', '🌱'
]

export function emojiToTwemojiUrl(emoji: string): string {
	const code = Array.from(emoji.replace(/️/g, ''))
		.map((ch) => ch.codePointAt(0)?.toString(16))
		.filter((part): part is string => !!part)
		.join('-')
	return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${code}.svg`
}

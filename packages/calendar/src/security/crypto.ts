function toUint8ArrayFromBase64(base64: string) {
	const binary = atob(base64)
	const bytes = new Uint8Array(binary.length)
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i)
	}
	return bytes
}

function toBase64(bytes: Uint8Array) {
	let binary = ''
	for (let i = 0; i < bytes.length; i++) {
		binary += String.fromCharCode(bytes[i])
	}
	return btoa(binary)
}

async function getKey(base64Key: string) {
	const raw = toUint8ArrayFromBase64(base64Key)
	return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, [ 'encrypt', 'decrypt' ])
}

export async function encryptString({
	plaintext,
	base64Key
}: {
	plaintext: string
	base64Key: string
}) {
	const key = await getKey(base64Key)
	const iv = crypto.getRandomValues(new Uint8Array(12))
	const encoded = new TextEncoder().encode(plaintext)
	const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded)
	return `${toBase64(iv)}.${toBase64(new Uint8Array(cipher))}`
}

export async function decryptString({
	ciphertext,
	base64Key
}: {
	ciphertext: string
	base64Key: string
}) {
	const [ivB64, dataB64] = ciphertext.split('.')
	if (!ivB64 || !dataB64) throw new Error('Invalid ciphertext')
	const key = await getKey(base64Key)
	const iv = toUint8ArrayFromBase64(ivB64)
	const data = toUint8ArrayFromBase64(dataB64)
	const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data)
	return new TextDecoder().decode(plain)
}

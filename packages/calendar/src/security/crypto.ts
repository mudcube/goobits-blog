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
		binary += String.fromCharCode(bytes[i] ?? 0)
	}
	return btoa(binary)
}

async function getKey(base64Key: string) {
	const raw = toUint8ArrayFromBase64(base64Key)
	const keyBytes = raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength)
	return crypto.subtle.importKey('raw', keyBytes, 'AES-GCM', false, [ 'encrypt', 'decrypt' ])
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
	const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as unknown as BufferSource }, key, encoded as unknown as BufferSource)
	return `${toBase64(iv)}.${toBase64(new Uint8Array(cipher))}`
}

export async function decryptString({
	ciphertext,
	base64Key
}: {
	ciphertext: string
	base64Key: string
}) {
	if (!ciphertext || typeof ciphertext !== 'string') {
		throw new Error('decryptString: ciphertext must be a non-empty string')
	}
	const parts = ciphertext.split('.')
	if (parts.length !== 2 || !parts[0] || !parts[1]) {
		throw new Error('decryptString: invalid ciphertext format (expected "iv.data")')
	}
	const [ivB64, dataB64] = parts
	let iv: Uint8Array, data: Uint8Array
	try {
		iv = toUint8ArrayFromBase64(ivB64)
		data = toUint8ArrayFromBase64(dataB64)
	} catch {
		throw new Error('decryptString: ciphertext contains invalid base64')
	}
	const key = await getKey(base64Key)
	const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv as unknown as BufferSource }, key, data as unknown as BufferSource)
	return new TextDecoder().decode(plain)
}

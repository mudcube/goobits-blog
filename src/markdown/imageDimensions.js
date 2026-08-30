const PNG_SIGNATURE = '89504e470d0a1a0a'
const MAX_SVG_HEADER_BYTES = 256 * 1024
const JPEG_START_OF_FRAME_MARKERS = new Set([
	0xc0, 0xc1, 0xc2, 0xc3,
	0xc5, 0xc6, 0xc7,
	0xc9, 0xca, 0xcb,
	0xcd, 0xce, 0xcf
])

function dimensions(width, height) {
	return Number.isFinite(width) && width > 0 && Number.isFinite(height) && height > 0
		? { width, height }
		: null
}

function readPng(buffer) {
	if (buffer.length < 24 || buffer.subarray(0, 8).toString('hex') !== PNG_SIGNATURE) return null
	return dimensions(buffer.readUInt32BE(16), buffer.readUInt32BE(20))
}

function readGif(buffer) {
	if (buffer.length < 10 || !/^GIF8[79]a$/.test(buffer.subarray(0, 6).toString('ascii'))) return null
	return dimensions(buffer.readUInt16LE(6), buffer.readUInt16LE(8))
}

function readWebp(buffer) {
	if (
		buffer.length < 25 ||
		buffer.subarray(0, 4).toString('ascii') !== 'RIFF' ||
		buffer.subarray(8, 12).toString('ascii') !== 'WEBP'
	) return null

	const format = buffer.subarray(12, 16).toString('ascii')
	if (format === 'VP8X' && buffer.length >= 30) {
		return dimensions(buffer.readUIntLE(24, 3) + 1, buffer.readUIntLE(27, 3) + 1)
	}
	if (format === 'VP8L' && buffer[20] === 0x2f) {
		const width = 1 + buffer[21] + ((buffer[22] & 0x3f) << 8)
		const height = 1 + (buffer[22] >> 6) + (buffer[23] << 2) + ((buffer[24] & 0x0f) << 10)
		return dimensions(width, height)
	}
	if (
		format === 'VP8 ' &&
		buffer.length >= 30 &&
		buffer[23] === 0x9d &&
		buffer[24] === 0x01 &&
		buffer[25] === 0x2a
	) {
		return dimensions(buffer.readUInt16LE(26) & 0x3fff, buffer.readUInt16LE(28) & 0x3fff)
	}
	return null
}

function readJpeg(buffer) {
	if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null

	let offset = 2
	while (offset < buffer.length) {
		while (buffer[offset] === 0xff) offset += 1
		const marker = buffer[offset]
		offset += 1
		if (marker === undefined || marker === 0xd9 || marker === 0xda) return null
		if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue
		if (offset + 2 > buffer.length) return null

		const length = buffer.readUInt16BE(offset)
		if (length < 2 || offset + length > buffer.length) return null
		if (JPEG_START_OF_FRAME_MARKERS.has(marker) && length >= 7) {
			return dimensions(buffer.readUInt16BE(offset + 5), buffer.readUInt16BE(offset + 3))
		}
		offset += length
	}
	return null
}

function readSvg(buffer) {
	const header = buffer.subarray(0, MAX_SVG_HEADER_BYTES).toString('utf8')
	const svg = header.match(/<svg\b[^>]*>/i)?.[0]
	if (!svg) return null

	const width = Number(svg.match(/\bwidth\s*=\s*['"]\s*([0-9]+(?:\.[0-9]+)?)/i)?.[1])
	const height = Number(svg.match(/\bheight\s*=\s*['"]\s*([0-9]+(?:\.[0-9]+)?)/i)?.[1])
	const explicit = dimensions(width, height)
	if (explicit) return explicit

	const viewBox = svg.match(
		/\bviewBox\s*=\s*['"]\s*[-+0-9.eE]+[\s,]+[-+0-9.eE]+[\s,]+([-+0-9.eE]+)[\s,]+([-+0-9.eE]+)/i
	)
	return viewBox ? dimensions(Math.abs(Number(viewBox[1])), Math.abs(Number(viewBox[2]))) : null
}

/** Read dimensions from common web image formats without decoding image data. */
export function readImageDimensions(buffer) {
	return readPng(buffer) ?? readGif(buffer) ?? readWebp(buffer) ?? readJpeg(buffer) ?? readSvg(buffer)
}

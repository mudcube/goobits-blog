export function removeChildNodes(o) {
	while (o.hasChildNodes()) {
		o.removeChild(o.firstChild)
	}
}

export function createHeader(title) {
	const div = document.createElement("div")
	div.className = "header"
	div.textContent = title
	cnt.appendChild(div)
	return div
}

export function createInput(props) {
	const $div = document.createElement("div")
	$div.style.cssText = "padding-top: 5px;"
	var d = document.createElement("span")
	d.textContent = props.title || props.id
	d.className = "formSpan"
	$div.appendChild(d)
	var d = document.createElement("input")
	d.setAttribute("type", "range")
	Event.add(d, 'mousedown', Event.stop)
	for (let key in props) {
		if (key.substr(0, 2) === "on") d[key] = props[key]
		else d.setAttribute(key, props[key])
	}
	if (props.type === "number" && d.onchange) {
		d.onkeyup = d.onchange
		d.onmouseup = d.onchange
	}
	$div.appendChild(d)
	return $div
}

window.canvas = document.createElement("canvas")
window.ctx = canvas.getContext('2d')

window.config = {
	textureEnabled: true,
	alpha: 0.75,
	scale: 1,
	seed: 11899,
	grayscale: true,
	rotate: Math.PI / 2
}

window.noise = document.createElement("canvas")
window.ctx_noise = noise.getContext('2d')
noise.width = 128
noise.height = 128
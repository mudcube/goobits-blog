if (typeof (BG) === "undefined") var BG = {}

BG = (function (root) {

	root.createPicker = function () {
		var o = BG.gradient.stops[BG.gradient.active]
		var rgba = {R: o.R, G: o.G, B: o.B, A: 255}
		BG.picker.update(rgba)
		BG.picker.drawSample()
		BG.picker.toggle(true)
	}

	root.render = function (event) {
		ctx.clearRect(0, 0, BG.width, BG.height)
		var stops = BG.gradient.stops
		var size = BG.width
		if (BG.gradient.stops.length === 1) {
			var g = Color.Space.RGBA_W3(stops[BG.gradient.active])
		} else {
			if (config.rotate % Math.PI) {
				var size = BG.height
				var g = ctx.createLinearGradient(0, 0, BG.height, 0)
			} else {
				var g = ctx.createLinearGradient(0, 0, BG.width, 0)
			}
			for (var key in stops) {
				var color = BG.gradient.stops[key]
				g.addColorStop(color.stop, Color.Space.RGBA_W3(color))
			}
		}
		ctx.save()
		ctx.beginPath()
		ctx.fillStyle = g
		ctx.rect(0, 0, BG.width, BG.height)
		//
		ctx.save()
		ctx.translate(size / 2, size / 2)
		ctx.rotate(config.rotate)
		ctx.translate(-size / 2, -size / 2)
		ctx.fill()
		ctx.restore()
		///
		if (!config.textureEnabled) return
		///
		if (false) {
			// scale texture
			dctx.save()
			dctx.clearRect(0, 0, BG.width, BG.height)
			dctx.globalAlpha = config.alpha
			dctx.scale(config.scale, config.scale)
			dctx.fillStyle = root.texture.pattern
			dctx.fillRect(0, 0, BG.width, BG.height)
			dctx.restore()
			//
			var data1 = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
			var data2 = dctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
			var data = Color.Blend._Glow(data2, data1, true)
			ctx.putImageData(data, 0, 0)
		} else {
			ctx.save()
			ctx.globalCompositeOperation = "source-over"
			ctx.globalAlpha = config.alpha
			ctx.scale(config.scale, config.scale)
			ctx.fillStyle = root.texture.pattern
			ctx.fill()
			ctx.restore()
		}
		//
		ctx.restore()
	}

	root.createColorStops = function () {
		if (!window.stopContainer) return
		// remove children nodes
		removeChildNodes(stopContainer)
		removeChildNodes(stopHeader)
		// "add" for control points
		var $image = document.createElement("img")
		Event.add($image, 'mousedown', Event.cancel)
		Event.add($image, "click", function () {
			var CPStop = BG.gradient.stops
			var active = CPStop[BG.gradient.active]
			var change = 1 - (1 / CPStop.length)
			for (var key = 0, length = CPStop.length; key < length; key++) { // scale gradients to allow for addition
				CPStop[key].stop = change * CPStop[key].stop || 0
			}
			BG.gradient.active = CPStop.length
			CPStop.push(new root.colorStop({
				R: active.R,
				G: active.G,
				B: active.B,
				stop: 1
			}))
			root.createColorStops()
			root.render()
			root.createPicker()
		})
		$image.src = "./media/plus.png"
		$image.className = "colorStopControl"
		$image.style.cssText = "position: relative; left: -1px"
		stopHeader.appendChild($image)

		// "remove" for control points
		var $image = document.createElement("img")
		Event.add($image, 'mousedown', Event.cancel)
		Event.add($image, "click", function () {
			var CPStop = BG.gradient.stops
			if (CPStop.length === 1) return
			var replace = []
			var previous = undefined
			var next = false
			var idx = 0
			for (var key in CPStop) {
				if (next) {
					BG.gradient.active = idx
					next = false
				}
				if (key === BG.gradient.active) {
					if (typeof (previous) === "number") {
						BG.gradient.active = previous
					} else {
						next = true;
					}
				} else {
					replace.push(CPStop[key])
					previous = idx++
				}
			}
			BG.gradient.stops = replace
			root.createColorStops()
			root.render()
		})
		$image.src = "./media/minus.png"
		$image.className = "colorStopControl"
		$image.style.cssText = "position: relative; left: -4px"
		stopHeader.appendChild($image)

		var swatches = document.createElement("div")
		swatches.className = "swatches"
		stopContainer.appendChild(swatches)

		// color swatches
		var CPStop = BG.gradient.stops
		for (var key in CPStop) {
			(function (key) {
				var $div = document.createElement("div")
				$div.id = `CP${key}`
				Event.add($div, 'mousedown', Event.cancel)
				Event.add($div, "click", function () {
					BG.gradient.active = key
					root.createColorStops()
					root.createPicker()
				})
				$div.className = "colorStop"
				$div.style.background = Color.Space.RGBA_W3(CPStop[key])
				if (key === BG.gradient.active) $div.style.border = "1px solid #fff"
				swatches.appendChild($div)
			})(key)
		}
	}

	root.getColorStops = function () {
		var stops = {}
		var CPStop = BG.gradient.stops
		for (var n = 0, length = CPStop.length; n < length; n++) { // scale gradients to allow for addition
			var color = CPStop[n]
			stops[color.stop] = Color.Space(color, "RGB>HEX>W3")
		}
		return stops
	}

	root.colorStop = function (props) {
		if (props.hex) {
			var color = Color.Space(props.hex, "HEX>RGB")
			this.R = color.R
			this.G = color.G
			this.B = color.B
		} else {
			this.R = props.R || 0
			this.G = props.G || 0
			this.B = props.B || 0
		}
		this.stop = props.stop || 0
		return this
	}

	return root

})(BG)
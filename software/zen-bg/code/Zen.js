import {createTexture} from './Textures.js'

window.BG || (window.BG = {});

BG.onload = function () {
	BG.loader = new widgets.Loader("starting...")
	/// load blend pixel shaders
	eval(Color.Blend.createKernals())
	///
	BG.uploader = new widgets.Uploader({
		confirm: "text", // json, boolean, text
		action: "./upload.php",
		mode: "read",
		maxFiles: 1,
		dropAreaStyle: "position: absolute; background: rgba(0, 200, 0, 1);",
		dropAreaMessage: "Drop Photo Here",
		onChange: function (self, files) {
			for (let key in files)
			var file = files[key]
			BG.createSeamlessTexture(file.src, function (canvas) {
				createTexture(canvas.toDataURL(), function () {
					tctx.clearRect(0, 0, tcanvas.width, tcanvas.height)
					tctx.drawImage(BG.texture, 0, 0)
					BG.render()
				})
			})
		},
		onProgress: function (self) {
			document.getElementById("upload-bar").style.width = self.transferPercent + "%"
			document.getElementById("upload-bar-percent").innerHTML = self.transferPercent + "%"
		}
	})
	///
	BG.pickerColor = "22FF74"

	BG.picker = new Color.Picker({
		feature: {
			closeButton: true,
			hexInput: true
		},
		modules: {
			hue: {
				column: 2,
				enable: true,
				width: 30,
				height: 192
			},
			satval: {
				column: 2,
				enable: true,
				width: 192,
				height: 192
			},
			alpha: {
				column: 2,
				enable: false,
				width: 30,
				height: 192
			}
		},
		id: "ColorPicker",
		style: "top: 220px; right: 270px", // sets style to picker element
		color: "#" + BG.pickerColor,
		display: true,
		onMouseDown: function (self) {
			BG.toggleRemoteFrame("down")
		},
		onMouseUp: function (self) {
			BG.toggleRemoteFrame("up")
		},
		callback: function (color, state) {
			const gd = BG.gradient
			BG.toggleRemoteFrame(state)
			const type = gd["active"]
			const active = gd.stops[type]
			active.R = color.R
			active.G = color.G
			active.B = color.B
			const d = document.getElementById("CP" + type)
			if (d) d.style.background = Color.Space.RGBA_W3(gd.stops[type])
			BG.render()
		}
	})

	eventjs.add(document.querySelector("#ColorPicker"), "mousedown", function (event) {
		widget.windows.drag(this, event)
	})

	BG.picker.element.style.top = 20 + "px"
	BG.picker.element.style.left = 1000 + "px"
	///
	BG.gradient = {
		active: 0,
		stops: [
			new BG.colorStop({hex: 0x229CFF, stop: 0}),
			new BG.colorStop({hex: 0x00AA77, stop: 1})
		]
	}
	BG.width = canvas.width = window.innerWidth
	BG.height = canvas.height = window.innerHeight
	///

	if (window.location.hash) {
		const hash = window.location.hash.substr(1).split("%22").join('"')
		const ret = JSON.parse(hash)
		if (ret.config && ret.width && ret.height && ret.gradient) {
			config = ret.config
			BG.gradient.stops = []
			const gradient = ret.gradient
			for (var key in gradient) {
				if (BG.pickerColor === "008BE1") BG.pickerColor = gradient[key]
				BG.gradient.stops.push(new BG.colorStop({
					hex: "0x" + gradient[key].substr(1),
					stop: key
				}))
			}
		}
	}
	BG.createGeneratorUI()
	///
	const sidebar = document.getElementById("sidebar")
	eventjs.proxy.drag({
		position: "move",
		target: sidebar,
		listener: function (event, self) {
			BG.toggleRemoteFrame(self.state)
			sidebar.style.left = self.x + "px"
			sidebar.style.top = self.y + "px"
			eventjs.prevent(event)
		}
	})
	///
	const element = document.querySelector("#textures")
	Event.add(element, 'mousedown', Event.cancel)
	Event.add(element, "click", function () {
		if (element.style.height) {
			element.style.width = ""
			element.style.height = ""
			element.scrollTop = 0
		} else {
			element.style.height = "432px"
		}
	})
	///
	dcanvas = document.createElement("canvas")
	dctx = dcanvas.getContext("2d")
	///
	const twidth = 244
	const theight = 46
	const thumbnailer = new widgets.Thumbnailer()
	///
	tcanvas = document.createElement("canvas")
	tctx = tcanvas.getContext("2d")
	tcanvas.width = twidth
	tcanvas.height = theight
	element.appendChild(tcanvas)
	///
	for (var key in textures) {
		element.appendChild(thumbnailer.generate({
			title: textures[key],
			src: textures[key].replace(".jpeg", "_thumb.jpeg"),
			maxWidth: twidth,
			maxHeight: theight,
			crop: "None", // Fit, Edge, None
			callback: function (canvas) {
				eventjs.add(canvas, "click", function (event, self) {
					if (!element.style.height) return
					BG.texture.src = self.target.src.replace("_thumb", "")
					texture = createTexture(BG.texture.src, function () {
						tctx.clearRect(0, 0, tcanvas.width, tcanvas.height)
						tctx.drawImage(BG.texture, 0, 0)
						BG.render()
					})
					BG.texture.onload = function () {
						noise.width = BG.texture.width
						noise.height = BG.texture.height
						BG.render()
					}
				})
			}
		}))
	}
	///
	BG.generateNoise(true)

	///
	function loadTexture(src) {
		BG.texture = createTexture(src, function () {
			tctx.clearRect(0, 0, tcanvas.width, tcanvas.height)
			tctx.drawImage(BG.texture, 0, 0)
			// remote access
			// create default noise
			window.onresize()
			BG.render()
			BG.gradient.active = "0"
			BG.createColorStops()
			BG.createPicker()

			if (window.location.search) {
				BG.createRemoteFrame()
			} else {
				BG.loader.stop()
			}
		})
		BG.texture.src = src
	}
	///
	loadTexture(config.textureID || "./textures/texturise/wood_009.jpeg")
	///
	BG.fileSaver = new widgets.FileSaver({
		jsDir: "./inc/",
		callback: function (self) {
			self.button({
				parent: document.querySelector("#sidebar"),
				id: "downloadWallpaper",
				title: "Download Wallpaper",
				fileName: "ZenBG",
				fileType: "png",
				format: "base64",
				getData: function () {
					return canvas
				}
			})
		}
	})
}

BG.onresize = function () {
	BG.width = canvas.width = window.innerWidth
	BG.height = canvas.height = window.innerHeight
	// resize iframe
	const iframe = document.getElementById("iframe")
	if (iframe) iframe.style.width = (window.innerWidth) + "px"
	//
	dcanvas.width = ctx.canvas.width
	dcanvas.height = ctx.canvas.height
	// rescale gradient
	BG.render()
}

window.addEventListener('DOMContentLoaded', BG.onload)
window.addEventListener('resize', BG.onresize)
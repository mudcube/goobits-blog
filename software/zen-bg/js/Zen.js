if (typeof (BG) === "undefined") var BG = {};

function removeChildNodes(o) {
	while (o.hasChildNodes()) {
		o.removeChild(o.firstChild);
	}
};

function createHeader(title) {
	var div = document.createElement("div");
	div.className = "header";
	div.textContent = title;
	cnt.appendChild(div);
	return div;
};

function createInput(props) {
	var div = document.createElement("div");
	div.style.cssText = "padding-top: 5px;"
	var d = document.createElement("span");
	d.textContent = props.title || props.id;
	d.className = "formSpan";
	div.appendChild(d);
	var d = document.createElement("input");
	d.setAttribute("type", "range");
	d.onmousedown = function (e) { e.stopPropagation(); };
	for (var key in props) {
		if (key.substr(0, 2) === "on") d[key] = props[key];
		else d.setAttribute(key, props[key]);
	}
	if (props.type === "number" && d.onchange) {
		d.onkeyup = d.onchange;
		d.onmouseup = d.onchange;
	}
	div.appendChild(d);
	return div;
};

BG.onload = function () {
	BG.loader = new widgets.Loader("starting...");
	/// load blend pixel shaders
	eval(Color.Blend.createKernals());
	///
	BG.uploader = new widgets.Uploader({
		confirm: "text", // json, boolean, text
		action: "./upload.php",
		mode: "read",
		maxFiles: 1,
		dropAreaStyle: "position: absolute; background: rgba(0, 200, 0, 1);",
		dropAreaMessage: "Drop Photo Here",
		onChange: function (self, files) {
			for (var key in files) ;
			var file = files[key];
			BG.createSeamlessTexture(file.src, function (canvas) {
				createTexture(canvas.toDataURL(), function () {
					tctx.clearRect(0, 0, tcanvas.width, tcanvas.height);
					tctx.drawImage(BG.texture, 0, 0);
					BG.render()
				});
			});
		},
		onProgress: function (self) {
			document.getElementById("upload-bar").style.width = self.transferPercent + "%";
			document.getElementById("upload-bar-percent").innerHTML = self.transferPercent + "%";
		}
	});
	///
	BG.pickerColor = "22FF74";

	BG.picker = new Color.Picker({
		display: false,
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
			BG.toggleRemoteFrame("down");
		},
		onMouseUp: function (self) {
			BG.toggleRemoteFrame("up");
		},
		callback: function (color, state) {
			var gd = BG.gradient;
			var colorStop = gd.stops;
			///
			//			colorStop[gd.active].stop = 1 - color.A / 255;
			///
			BG.toggleRemoteFrame(state);
			var type = gd["active"];
			var active = gd.stops[type];
			active.R = color.R;
			active.G = color.G;
			active.B = color.B;
			var d = document.getElementById("CP" + type);
			if (d) d.style.background = Color.Space.RGBA_W3(gd.stops[type]);
			BG.render();
		}
	});

	eventjs.add(document.querySelector("#ColorPicker"), "mousedown", function (event) {
		proxy = widget.windows.drag(this, event);
	});

	BG.picker.element.style.top = 20 + "px";
	BG.picker.element.style.left = 1000 + "px";
	///
	BG.gradient = {
		active: 0,
		stops: [
			new BG.colorStop({hex: 0x229CFF, stop: 0}),
			new BG.colorStop({hex: 0x00AA77, stop: 1})
		]
	};
	BG.width = canvas.width = window.innerWidth;
	BG.height = canvas.height = window.innerHeight;
	///

	if (window.location.hash) {
		var hash = window.location.hash.substr(1).split("%22").join('"');
		var ret = JSON.parse(hash);
		if (ret.config && ret.width && ret.height && ret.gradient) {
			config = ret.config;
			BG.gradient.stops = [];
			var gradient = ret.gradient;
			for (var key in gradient) {
				if (BG.pickerColor === "008BE1") BG.pickerColor = gradient[key];
				BG.gradient.stops.push(new BG.colorStop({
					hex: "0x" + gradient[key].substr(1),
					stop: key
				}));
			}
		}
	}
	BG.createGeneratorUI();
	///
	var sidebar = document.getElementById("sidebar");
	eventjs.proxy.drag({
		position: "move",
		target: sidebar,
		listener: function (event, self) {
			BG.toggleRemoteFrame(self.state);
			sidebar.style.left = self.x + "px";
			sidebar.style.top = self.y + "px";
			eventjs.prevent(event);
		}
	});
	///
	var element = document.getElementById("textures");
	eventjs.add(element, "click", function (event) {
		if (element.style.height) {
			element.style.width = "";
			element.style.height = "";
			element.scrollTop = 0;
		} else {
			//			element.style.width = "496px";
			element.style.height = "432px";
		}
	});
	///
	dcanvas = document.createElement("canvas");
	dctx = dcanvas.getContext("2d");
	///
	var twidth = 244;
	var theight = 46;
	var thumbnailer = new widgets.Thumbnailer();
	///
	tcanvas = document.createElement("canvas");
	tctx = tcanvas.getContext("2d");
	tcanvas.width = twidth;
	tcanvas.height = theight;
	element.appendChild(tcanvas);
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
					if (!element.style.height) return;
					BG.texture.src = self.target.src.replace("_thumb", "");
					texture = createTexture(BG.texture.src, function () {
						tctx.clearRect(0, 0, tcanvas.width, tcanvas.height);
						tctx.drawImage(BG.texture, 0, 0);
						BG.render()
					});
					BG.texture.onload = function () {
						noise.width = BG.texture.width;
						noise.height = BG.texture.height;
						BG.render();
					};
				});
			}
		}));
	}
	///
	BG.generateNoise(true);

	///
	function loadTexture(src) {
		BG.texture = createTexture(src, function () {
			tctx.clearRect(0, 0, tcanvas.width, tcanvas.height);
			tctx.drawImage(BG.texture, 0, 0);
			// remote access
			BG.createRemoteFrame();
			// create default noise
			window.onresize();
			BG.render();
			BG.gradient.active = "0";
			BG.createColorStops();
			BG.createPicker();
			BG.loader.stop();
		});
		BG.texture.src = src;
	};
	///
	loadTexture(config.textureID || "./textures/texturise/wood_009.jpeg");
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
					return canvas;
				}
			});
		}
	});
};

BG.onresize = function () {
	BG.width = canvas.width = window.innerWidth;
	BG.height = canvas.height = window.innerHeight;
	// resize iframe
	var iframe = document.getElementById("iframe");
	if (iframe) iframe.style.width = (window.innerWidth) + "px";
	//
	dcanvas.width = ctx.canvas.width;
	dcanvas.height = ctx.canvas.height;
	// rescale gradient
	BG.render();
};

window.addEventListener('DOMContentLoaded', BG.onload)
window.addEventListener('resize', BG.onresize)
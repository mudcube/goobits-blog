/* 
	----------------------------------------------------
	Color Picker : 1.1.6 : 2013/04/15
	----------------------------------------------------
	https://github.com/mudcube/Color.Picker.js
	----------------------------------------------------
	Firefox 2+, Safari 3+, Opera 9+, Google Chrome, IE9+
	----------------------------------------------------
	var picker = new Color.Picker({
		display: true,
		id: "ColorPicker",
		color: "#643263", // accepts rgb(), rgba(), hsl(), hsla(), or #hex
		style: "top: 220px; right: 270px", // sets style to picker element
		callback: function(rgba, state, type) {
			document.body.style.background = Color.Space(rgba, "RGBA>W3");
		}
	});
	///
	picker.close(); // close ColorPicker
	picker.open(); // open ColorPicker
	picker.toggle(); // toggle ColorPicker
	picker.element; // this is the DOM element container
	----------------------------------------------------
	@ColorPicker #Event.js #Color/Space.js
*/

if (typeof(Color) === "undefined") var Color = {};

(function() { "use strict";

Color.Picker = function (conf) {
	if (typeof(arrow) === "function") arrow = arrow();
	if (typeof(circle) === "function") circle = circle();
	if (typeof(interlace) === "function") interlace = interlace(8, "#FFF", "#eee");
	///
	if (!window.zIndexGlobal) window.zIndexGlobal = 100;
	var that = this;
	var modules = conf.modules;
	if (typeof(modules) === "undefined") {
		modules = {
			hue: true,
			satval: true,
			alpha: true
		};
	}
	/// loading properties
	if (typeof(conf) === "undefined") conf = {};
	this.pixelRatio = 1; //window.devicePixelRatio || 1;
	this.state = "colorPicker"; // the other state is "eyeDropper"
	this.callback = conf.callback; // bind custom function
	this.color = getHSVA(conf.color);
	this.container = conf.container || document.body;
	this.margin = conf.margin || 10; // margins on colorpicker
	this.offset = this.margin / 2;
	this.strokeColor = conf.strokeColor || "rgba(255,255,255,0.15)";
	this.recordId = conf.recordId;
	this.feature = conf.feature || {};
	this.eyeDropper = this.feature.eyeDropper || {};
	this.conf = {};
	if (modules.hue) {
		var tmp = modules.hue;
		this.conf.hue = {
			column: 0,
			enable: isFinite(tmp.enable) ? tmp.enable : false,
			width: isFinite(tmp.width) ? tmp.width : 30,
			height: isFinite(tmp.height) ? tmp.height : 200
		};
	}
	if (modules.satval) {
		var tmp = modules.satval;
		this.conf.satval = {
			column: 1,
			enable: isFinite(tmp.enable) ? tmp.enable : false,
			width: isFinite(tmp.width) ? tmp.width : 30,
			height: isFinite(tmp.height) ? tmp.height : 200
		};
	}
	if (modules.alpha) {
		var tmp = modules.alpha;
		this.conf.alpha = {
			column: 2,
			enable: isFinite(tmp.enable) ? tmp.enable : false,
			width: isFinite(tmp.width) ? tmp.width : 30,
			height: isFinite(tmp.height) ? tmp.height : 200
		};
	}

	/// Useful for toggling focus when picker is over an iframe.
	this.onMouseDown = conf.onMouseDown || conf.onmousedown; 
	this.onMouseUp = conf.onMouseUp || conf.onmousedown;

	/// Creating our color picker.
	var plugin = document.createElement("div");
	plugin.id = conf.id || "ColorPicker";
	if (conf.className) plugin.className = conf.className;
	///
	this.getMetrics = function() {
		var ret = {};
		ret.width = 0;
		ret.height = 0;
		var row = -1;
		for (var key in that.conf) {
			var tmp = that.conf[key];
			if (tmp.enable === false) continue;
			ret.width += tmp.width + that.margin + that.offset - 5;
			if (row !== tmp.row) {
				ret.height += tmp.height + that.margin * 2;
				row = tmp.row;
			}
		}
		ret.width *= that.pixelRatio;
		ret.height *= that.pixelRatio;
		return ret;
	};
	///
	var metrics = this.getMetrics();
	plugin.style.cssText = conf.style;

	/// appending to element
	this.container.appendChild(plugin);
	this.element = plugin;

	if (this.feature.closeButton) {
		/// Creating the close button.
		var hexClose = document.createElement("div");
		hexClose.title = "Close";
		hexClose.className = "hexClose";
		hexClose.innerHTML = "x";
		Event.add(hexClose, "click", function(event) {
			that.close();
		});
		plugin.appendChild(hexClose);
	}

	if (this.feature.hexInput) {
		/// Current selected color as the background of this box.
		var hexBoxContainer = document.createElement("div");
		if (interlace.data) hexBoxContainer.style.backgroundImage = "url("+interlace.data+")";
		hexBoxContainer.className = "hexBox";
		hexBoxContainer.title = "Eyedropper";
		///
		var hexBox = document.createElement("div");
		hexBoxContainer.appendChild(hexBox);
		plugin.appendChild(hexBoxContainer);
		///
		if (that.eyeDropper.target) {
			hexBox.style.cursor = "pointer";
			///
			var hexBoxImage = document.createElement("span");
			hexBoxImage.className = "icon-eyedropper";
			if (that.feature.closeButton) hexBoxImage.style.marginRight = "16px";
			plugin.appendChild(hexBoxImage);
			///
			var mouseLayerTitle;
			var mouseLayerUpdate = function(event) {
				Event.prevent(event);
				var coord = Event.proxy.getCoord(event);
				var bbox = Event.proxy.getBoundingBox(that.eyeDropper.target);
				coord.x += bbox.scrollLeft - bbox.x1;
				coord.y += bbox.scrollTop - bbox.y1;
				///			
				var ctx = that.eyeDropper.canvas.getContext("2d");
				var data = ctx.getImageData(coord.x, coord.y, 1, 1);
				if (data.data[3] === 0) return;
				var color = Color.Space(data.data, "RGBA>HSVA");
				if (!modules.alpha) color.A = 255;
				that.update(color, "HSVA");
			};
			var mouseLayerExit = function() {
				hexBoxContainer.className = "hexBox";
				that.eyeDropper.target.style.cursor = "default";
				that.eyeDropper.target.title = mouseLayerTitle;
				Event.remove(document.body, "mouseup", mouseLayerExit);
				Event.remove(that.eyeDropper.target, "mousemove", mouseLayerUpdate);
				setTimeout(function() { 
					that.state = "colorPicker";
				}, 50);
			};
			Event.add([hexBoxContainer, hexBoxImage], "click", function(event) {
				if (that.state === "eyeDropper") return mouseLayerExit();
				that.state = "eyeDropper";
				mouseLayerTitle = that.eyeDropper.target.title;
				hexBoxContainer.className = "hexBox active";
				that.eyeDropper.target.style.cursor = "crosshair";
				that.eyeDropper.target.title = "Pick color";
				Event.add(document.body, "mouseup", mouseLayerExit);
				Event.add(that.eyeDropper.target, "mousemove", mouseLayerUpdate);
			});
		}

		/// Creating the HEX input element.
		var isHex = /[^a-f0-9]/gi;
		var hexInput = document.createElement("input");
		hexInput.title = "HEX Code";
		hexInput.className = "hexInput";
		hexInput.size = 6;
		hexInput.type = "text";
		//
		Event.add(hexInput, "mousedown", Event.stop);
		Event.add(hexInput, "keydown change", function(event) {
			Event.stop(event);
			var code = event.keyCode;
			var value = hexInput.value.replace(isHex, '').substr(0, 6);
			var hex = parseInt("0x" + value, 16);
			if (event.type === "keydown") {
				if (code === 40) { // less
					hex = Math.max(0, hex - (event.shiftKey ? 10 : 1));
					hexInput.value = Color.Space(hex, "HEX24>W3").toUpperCase().substr(1);
				} else if (code === 38) { // more
					hex = Math.min(0xFFFFFF, hex + (event.shiftKey ? 10 : 1));
					hexInput.value = Color.Space(hex, "HEX24>W3").toUpperCase().substr(1);
				} else {
					return;
				}
			}
			if (String(hex) === "NaN") return;
			if (hex > 0xFFFFFF) hex = 0xFFFFFF;
			if (hex < 0) hex = 0;
			var update = (event.type === "change") ? "" : "hex";
			that.update(Color.Space(hex, "HEX24>RGB"), "RGB");
			if (event.keyCode === 27) this.blur();
		});
		//
		plugin.appendChild(hexInput);
		plugin.appendChild(document.createElement("br"));
	}

	/// Creating colorpicker sliders.
	var canvas = document.createElement("canvas");
	var ctx = canvas.getContext("2d");
	this.canvas = canvas;
	plugin.appendChild(canvas);
	///
	Event.add(canvas, "drag", function (event, self) {
		Event.stop(event); // for ie
		///
		var isPointerDown = (self.state === "down");
		var isPointerUp = (self.state === "up");
		///
		if (isPointerDown) {
			if (typeof(mouseLayerExit) === "function") {
				mouseLayerExit();
			}
			if (that.onMouseDown) {
				that.onMouseDown(event);
			}
		}
		///
		if (isPointerUp && that.onMouseUp) {
			that.onMouseUp(event);
		}
		///
		var offset = that.margin / 2;
		var x0 = self.x - offset;
		var y0 = self.y - offset;
		var x = clamp(x0, 0, canvas.width);
		var y = clamp(y0, 0, canvas.height);
		///
		if (self.target.className === "hexInput") {
			if (isPointerDown) Event.stop(event);
			plugin.style.cursor = "text";
			return; // allow selection of HEX		
		} else if (x !== x0 || y !== y0) { // move colorpicker
			if (that.feature.drag) {
				plugin.style.cursor = "move";
				plugin.title = "Move";
				if (isPointerDown) Event.proxy.drag({
					position: "move",
					event: event,
					target: plugin,
					listener: function (event, self) {
						var x1 = 0;
						var y1 = 0;
						var x2 = window.innerWidth;
						var y2 = window.innerHeight;
						var width = self.target.offsetWidth;
						var height = self.target.offsetHeight;
						if (self.x + width > x2) self.x = x2 - width;
						if (self.y + height > y2) self.y = y2 - height;
						if (self.x < x1) self.x = x1;
						if (self.y < y1) self.y = y1;
						///
						plugin.style.left = self.x + "px";
						plugin.style.top = self.y + "px";
						if (self.state === "down") {
							plugin.style.zIndex = window.zIndexGlobal ++;
						} else if (self.state === "up") {
							if (conf.recordWindow) {
								conf.recordWindow({ 
									id: that.recordId || plugin.id, 
									left: self.x / x2, 
									top: self.y / y2,
									display: "block"
								});
							}
						}
						Event.prevent(event);
					}
				});
			} else { ///
				plugin.style.cursor = "default";
			}
		} else if (x <= that.conf.satval.width) { // saturation-value selection
			if (that.conf.satval.enable === false) return;
			if (isPointerDown) Event.stop(event);
			plugin.style.cursor = "crosshair";
			plugin.title = "Saturation + Value";
			if (isPointerDown) Event.proxy.drag({
				position: "relative",
				event: event,
				target: canvas,
				listener: function (event, self) {
					var x = clamp(self.x - that.offset, 0, that.conf.satval.width);
					var y = clamp(self.y - that.offset, 0, that.conf.satval.height);
					that.color.S = x / that.conf.satval.width * 100; // scale saturation
					that.color.V = 100 - (y / that.conf.satval.height * 100); // scale value
					that.drawSample(self.state, true);
					Event.prevent(event);
				}
			});
		} else if (x > that.conf.satval.width + that.margin && x <= that.conf.satval.width + that.margin + that.offset + that.conf.hue.width) { // hue selection
			if (that.conf.hue.enable === false) return;
			if (isPointerDown) Event.stop(event);
			plugin.style.cursor = "crosshair";
			plugin.title = "Hue";
			if (isPointerDown) Event.proxy.drag({
				position: "relative",
				event: event,
				target: canvas,
				listener: function (event, self) {
					var y = clamp(self.y - that.offset, 0, that.conf.satval.height);
					that.color.H = 360 - (Math.min(1, y / that.conf.satval.height) * 360);
					that.drawSample(self.state, true);
					Event.prevent(event);
				}
			});
		} else if (that.conf.alpha && x > that.conf.satval.width + that.conf.alpha.width + that.margin * 2 && x <= that.conf.satval.width + that.margin * 2 + that.offset + that.conf.alpha.width * 2) { // alpha selection
			if (that.conf.alpha.enable === false) return;
			if (isPointerDown) Event.stop(event);
			plugin.style.cursor = "crosshair";
			plugin.title = "Alpha";
			if (isPointerDown) Event.proxy.drag({
				position: "relative",
				event: event,
				target: canvas,
				listener: function (event, self) {
					var y = clamp(self.y - that.offset, 0, that.conf.satval.height);
					that.color.A = (1 - Math.min(1, y / that.conf.satval.height)) * 255;
					that.drawSample(self.state, true);
					Event.prevent(event);
				}
			});
		} else { // margin between hue/saturation-value
			plugin.style.cursor = "default";
		}
		return false; // prevent selection
	});

	/// helper functions
	
	this.update = function(color, alpha) { // accepts HEX, RGB, and HSV
		if (color) that.color = getHSVA(color);
		if (typeof(alpha) === "number") that.color.A = alpha;
		///
		var metrics = that.getMetrics();
		///
		if (canvas.width !== metrics.width || canvas.height !== metrics.height) {
			canvas.width = metrics.width;
			canvas.height = metrics.height;
			canvas.style.cssText = "left: " + -(that.offset - 1) + "px;";
			///
			plugin.style.height = metrics.height + "px";
			plugin.style.width = metrics.width + "px";
		}
		///
		that.drawSample("update", true);
	};
	
	this.drawSample = function (state, update) {
		// clearing canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		that.drawSquare();
		that.drawHue();
		///
		if (this.conf.alpha.enabled) {
			that.drawAlpha();
		}
		// retrieving hex-code
		var rgba = Color.Space(that.color, "HSVA>RGBA");
		var hex = Color.Space(rgba, "RGB>HEX24>W3");
		if (this.feature.hexInput) {
			// display hex string
			hexInput.value = hex.toUpperCase().substr(1);
			// display background color
			try {
				hexBox.style.backgroundColor = Color.Space(rgba, "RGBA>W3");
			} catch(e) {
				hexBox.style.backgroundColor = Color.Space(rgba, "RGB>W3");
			}
		}
		// draw controls
		ctx.save();
		if (this.conf.alpha.enabled) { // arrow-selection
			ctx.globalAlpha = this.conf.alpha.enable ? 1.0 : 0;
			var left = that.conf.satval.width + that.margin * 2 + that.conf.hue.width + that.conf.alpha.width + that.offset;
			var y = ((255 - that.color.A) / 255) * that.conf.satval.height - 2;
			ctx.drawImage(arrow, left + 2, Math.round(y) + that.offset - 1);
		}
		if (this.conf.hue) { // arrow-selection
			ctx.globalAlpha = this.conf.hue.enable ? 1.0 : 0;
			var left = that.conf.satval.width + that.margin + that.offset + that.conf.hue.width;
			var y = ((360 - that.color.H) / 362) * that.conf.satval.height - 2;
			ctx.drawImage(arrow, left + 2, Math.round(y) + that.offset - 1);
		}
		if (this.conf.satval) { // circle-selection
			ctx.globalAlpha = this.conf.satval.enable ? 1.0 : 0;
			var x = that.color.S / 100 * that.conf.satval.width;
			var y = (1 - (that.color.V / 100)) * that.conf.satval.height;
			x = x - circle.width / 2;
			y = y - circle.height / 2;
			ctx.drawImage(circle, Math.round(x) + that.offset, Math.round(y) + that.offset);
		}
		ctx.restore();

		/// run custom code
		if (that.callback && state && update) {
			var w3 = that.toString(rgba);
			that.callback(rgba, state, w3);
		}
	};
	
	this.toString = function(color) {
		color = color || that.color;
		if (isFinite(color.H)) {
			color = Color.Space(color, "HSVA>RGBA");
		}
		if (color.A === 255) {
			return Color.Space(color, "RGB>HEX24>W3");
		} else {
			return Color.Space(color, "RGBA>W3");
		}
	};

	this.drawSquare = function () {
		// retrieving hex-code
		var hex = Color.Space({
			H: that.color.H,
			S: 100,
			V: 100
		}, "HSV>RGB>HEX24>W3");
		var rgb = Color.Space.HEX_RGB("0x"+hex);
		var offset = that.offset;
		var width = that.conf.satval.width;
		var height = that.conf.satval.height;
		// drawing color
		ctx.save();
		ctx.fillStyle = interlace;
		ctx.fillRect(offset, that.offset, that.conf.satval.width, that.conf.satval.height);
		ctx.globalAlpha = that.color.A / 255;
		ctx.fillStyle = grayscale(hex, "satval");
		ctx.fillRect(offset, offset, width, height);
		// overlaying saturation
		var gradient = ctx.createLinearGradient(offset, offset, width + offset, 0);
		gradient.addColorStop(0, grayscale("rgba(255, 255, 255, 1)", "satval"));
		gradient.addColorStop(1, grayscale("rgba(255, 255, 255, 0)", "satval"));
		ctx.fillStyle = gradient;
		ctx.fillRect(offset, offset, width, height);
		// overlaying value
		var gradient = ctx.createLinearGradient(0, offset, 0, height + offset);
		gradient.addColorStop(0.0, "rgba(0, 0, 0, 0)");
		gradient.addColorStop(1.0, "rgba(0, 0, 0, 1)");
		ctx.fillStyle = gradient;
		ctx.fillRect(offset, offset, width, height);
		// drawing outer bounds
		ctx.strokeStyle = grayscale(this.strokeColor, "satval");
		ctx.strokeRect(offset+0.5, offset+0.5, width-1, height-1);
		ctx.restore();
	};
	
	var grayscale = function(color, type) {
		if (that.conf[type].enable === true) {
			return color;
		}
		if (color.substr(0, 4) === "rgba") {
			color = Color.Space(color, "W3>RGBA");
		} else { // HEX
			color = Color.Space(color, "W3>HEX32>RGBA");
		}
		var L = Math.round(0.33 * color.R + 0.33 * color.G + 0.33 * color.B);
		return "rgba(" + L + "," + L + "," + L + "," + ((color.A / 255) * 0.42) + ")";
	};

	this.drawHue = function () {
		// drawing hue selector
		var left = that.conf.satval.width + that.margin + that.offset;
		ctx.fillStyle = interlace;
		ctx.fillRect(left, that.offset, that.conf.hue.width, that.conf.hue.height);
		///
		var gradient = ctx.createLinearGradient(0, 0, 0, that.conf.hue.height + that.offset);
		gradient.addColorStop(0, grayscale("rgba(255, 0, 0, 1)", "hue"));
		gradient.addColorStop(5/6, grayscale("rgba(255, 255, 0, 1)", "hue"));
		gradient.addColorStop(4/6, grayscale("rgba(0, 255, 0, 1)", "hue"));
		gradient.addColorStop(3/6, grayscale("rgba(0, 255, 255, 1)", "hue"));
		gradient.addColorStop(2/6, grayscale("rgba(0, 0, 255, 1)", "hue"));
		gradient.addColorStop(1/6, grayscale("rgba(255, 0, 255, 1)", "hue"));
		gradient.addColorStop(1, grayscale("rgba(255, 0, 0, 1)", "hue"));
		ctx.save();
		ctx.globalAlpha = that.color.A / 255;
		ctx.fillStyle = gradient;
		ctx.fillRect(left, that.offset, that.conf.hue.width, that.conf.hue.height);
		// drawing outer bounds
		ctx.strokeStyle = grayscale(this.strokeColor, "hue");
		ctx.strokeRect(left + 0.5, that.offset + 0.5, that.conf.hue.width - 1, that.conf.hue.height - 1);
		ctx.restore();
	};
	
	this.drawAlpha = function () {
		// drawing hue selector
		var left = that.conf.satval.width + that.margin * 2 + that.conf.hue.width + that.offset;
		ctx.fillStyle = interlace;
		ctx.fillRect(left, that.offset, that.conf.alpha.width, that.conf.satval.height);
		///
		var rgb = Color.Space.HSV_RGB({ H: that.color.H, S: that.color.S, V: that.color.V });
		var gradient = ctx.createLinearGradient(0, 0, 0, that.conf.satval.height);
		rgb.A = 255;
		gradient.addColorStop(0, grayscale(Color.Space.RGBA_W3(rgb), "alpha"));
		rgb.A = 0;
		gradient.addColorStop(1, grayscale(Color.Space.RGBA_W3(rgb), "alpha"));
		ctx.fillStyle = gradient;
		ctx.fillRect(left, that.offset, that.conf.alpha.width, that.conf.satval.height);
		// drawing outer bounds
		ctx.strokeStyle = this.strokeColor;
		ctx.strokeRect(left + 0.5, that.offset + 0.5, that.conf.alpha.width - 1, that.conf.satval.height - 1);
	};
	
	this.toggle = function (value) {
		if (value || (" " + plugin.className + " ").indexOf(" opened ") === -1) {
			this.open();
		} else {
			this.close();
		}
	};
	
	this.open = function () {
		var id = that.recordId || plugin.id;
		var element = document.getElementById(id);
		if (conf.recordWindow) {
			if (conf.recordWindow) {
				conf.recordWindow({
					id: id,
					display: "block"
				});
			}
		}
		///
		if ((" " + element.className + " ").indexOf(" opened ") === -1) {
			element.className = (element.className + " opened").trim();
		}
		element.style.display = "block";
		element.style.zIndex = window.zIndexGlobal ++;
		window.clearTimeout(element.interval);
	};
	
	this.close = function () {
		var id = that.recordId || plugin.id;
		var element = document.getElementById(id);
		if (conf.recordWindow) {
			conf.recordWindow({
				id: id,
				display: "none"
			});
		}
		///
		element.className = (" " + element.className + " ").replace(" opened ", " ").trim();
		element.interval = window.setTimeout(function () {
			element.style.display = "none";
		}, 250);
	};

	this.destory = function () {
		document.body.removeChild(plugin);
		for (var key in that) delete that[key];
	};

	// drawing color selection
	this.drawSample("create");
	///
	if (typeof(conf.display) !== "undefined") {
		if (conf.display) {
			this.open();
		} else {
			this.close();
		}
	}
	//
	return this;
};

var getHSVA = function(color) {
	if (typeof(color) === "string") {
		if (color.substr(0, 4) === "hsla") {
			color = Color.Space(color, "W3>HSLA>RGBA>HSVA");
		} else if (color.substr(0, 4) === "rgba") {
			color = Color.Space(color, "W3>RGBA>HSVA");
		} else if (color.substr(0, 3) === "rgb") {
			color = Color.Space(color, "W3>RGB>HSV");
		} else if (Color.WebColors[color]) { // web color
			color = Color.Space(Color.WebColors[color], "W3>HEX24>RGB>HSV");
		} else { // HEX
			color = Color.Space(color, "W3>HEX24>RGB>HSV");
		}
	} else if (typeof(color.R) !== "undefined") {
		color = Color.Space(color, "RGB>HSV");
	} else if (typeof(color.H) !== "undefined") {
		color = color;
	}
	if (typeof(color.A) === "undefined") {
		color.A = 255;
	}
	return color;
};

/// Creating the arrows.
var arrow = function () { // creating arrow
	var canvas = document.createElement("canvas");
	var ctx = canvas.getContext("2d");
	var size = 16;
	var width = size / 3;
	canvas.width = size;
	canvas.height = size;
	var top = -size / 4;
	var left = 0;
	for (var n = 0; n < 20; n++) { // multiply anti-aliasing
		ctx.beginPath();
		ctx.fillStyle = "#fff";
		ctx.moveTo(left, size / 2 + top);
		ctx.lineTo(left + size / 4, size / 4 + top);
		ctx.lineTo(left + size / 4, size / 4 * 3 + top);
		ctx.fill();
	}
	ctx.translate(-width, -size);
	return canvas;
};

/// Creating the circle indicator.
var circle = function () { // creating circle-selection
	var canvas = document.createElement("canvas");
	canvas.width = 10;
	canvas.height = 10;
	var ctx = canvas.getContext("2d");
	ctx.lineWidth = 1;
	ctx.beginPath();
	var x = canvas.width / 2;
	var y = canvas.width / 2;
	ctx.arc(x, y, 4.5, 0, Math.PI * 2, true);
	ctx.strokeStyle = '#000';
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(x, y, 3.5, 0, Math.PI * 2, true);
	ctx.strokeStyle = '#FFF';
	ctx.stroke();
	return canvas;
};

/// Creating the interlacing background.
var interlace = function (size, color1, color2) {
	var proto = document.createElement("canvas").getContext("2d");
	proto.canvas.width = size * 2;
	proto.canvas.height = size * 2;
	proto.fillStyle = color1; // top-left
	proto.fillRect(0, 0, size, size);
	proto.fillStyle = color2; // top-right
	proto.fillRect(size, 0, size, size);
	proto.fillStyle = color2; // bottom-left
	proto.fillRect(0, size, size, size);
	proto.fillStyle = color1; // bottom-right
	proto.fillRect(size, size, size, size);
	var pattern = proto.createPattern(proto.canvas, "repeat");
	try {
		pattern.data = proto.canvas.toDataURL();
	} catch(e) {};
	return pattern;
};

/// 
var clamp = function(n, min, max) {
	return (n < min) ? min : ((n > max) ? max : n);
};

})();
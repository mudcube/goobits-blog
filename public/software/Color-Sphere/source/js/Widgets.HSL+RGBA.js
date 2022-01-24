/*
	Color.Picker.HSL+RGBA : 0.9 : mudcu.be
	-----------------------------------
	requires: Event.js, Event.dragElement.js
	-----------------------------------
	colorPicker = new Color.Picker({
		id: "ColorPicker", // id of your color picker for css-styling
		parentNode: document.getElementById("content"), // when null uses document.body
		// can use either rgb, or hsl input
		RGB: { R: 255, G: 0, B: 100 },
		HSL: { H: 320, S: 100, L: 0 },
		// this is the width & height of individual color controllers
		canvasWidth: 300,
		canvasHeight: 58,
		// calls your custom function whenever the color changes
		callback: function(rgb, type) {	
			console.log(rgb, type);
		}
	});
	// update your color externally;
	colorPicker.update("RGB", { R: 255, G: 0, B: 100 });
	colorPicker.update("HSL", { H: 320, S: 100, L: 0 });
	// remove the color picker;
	this.destroy();
	// reset the color picker
	this.reset();
	
*/

if (!window.Color) Color = {};

(function() {

Color.Picker = function(config) {
	var gridImage = createInterlace(8, "rgba(40,40,40,1)", "rgba(0,0,0,1)");
	//
	if (!config) config = {};
	if (!config.id) config.id = "ColorPicker";
	//
	var parentNode = config.parentNode || document.body;
	var that = this;
	this.canvasWidth = config.canvasWidth || 405;
	this.canvasHeight = config.canvasHeight || 35;
	this.elements = {};
	this.callback = config.callback;
	//
	this.update = function (type, values, subtype, state) {
		var o = that[type];
		for (var key in values) {
			o.values[key] = values[key];
		}
		if (type == "HSL") {
			var alpha = that.RGB.values.A;
			that.RGB.values = Color.Space.HSL_RGB(o.values);
			that.RGB.values.A = alpha;
		} else if (type == "RGB") { // update HSL
			that.HSL.values = Color.Space.RGB_HSL(o.values);
		}
		that.run(subtype, state);
	};

	this.run = function (type, state) {
		var rgb = that.RGB.values;
		var hsl = that.HSL.values;
		var alpha = rgb.A/100;
		var colors = {
			'Hue': [
				[ 0.00, [   0, hsl.S, hsl.L ] ],
				[ 0.15, [ 300, hsl.S, hsl.L ] ],
				[ 0.30, [ 240, hsl.S, hsl.L ] ],
				[ 0.50, [ 180, hsl.S, hsl.L ] ],
				[ 0.65, [ 120, hsl.S, hsl.L ] ],
				[ 0.85, [  60, hsl.S, hsl.L ] ],
				[ 1.00, [   0, hsl.S, hsl.L ] ]
			],
			'Saturation': [ 
				[ 0.00, [ hsl.H, 100, hsl.L ] ],
				[ 1.00, [ hsl.H,   0, hsl.L ] ]
			],
			'Luminance': [ 
				[ 0.00, [ hsl.H, hsl.S, 100 ] ],
				[ 0.50, [ hsl.H, hsl.S,  50 ] ],
				[ 1.00, [ hsl.H, hsl.S,   0 ] ]
			],
			'Red': [ 
				[ 0.00, [ 255, rgb.G, rgb.B, alpha ] ],
				[ 1.00, [   0, rgb.G, rgb.B, alpha ] ]
			],
			'Green': [ 
				[ 0.00, [ rgb.R, 255, rgb.B, alpha ] ],
				[ 1.00, [ rgb.R,   0, rgb.B, alpha ] ]
			],
			'Blue': [ 
				[ 0.00, [ rgb.R, rgb.G, 255, alpha ] ],
				[ 1.00, [ rgb.R, rgb.G,   0, alpha ] ]
			],
			'Alpha': [ 
				[ 0.00, [ rgb.R, rgb.G, rgb.B, 1 ] ],
				[ 1.00, [ rgb.R, rgb.G, rgb.B, 0 ] ]
			]
		};
		// gather offset information
		var element = that.elements.Red;
		var offsetLeft = element.canvas.offsetLeft - element.control.firstChild.offsetWidth;
		//
		for (var key in colors) {
			if (!that.elements[key]) continue;
			var ctx = that.elements[key].canvas;
			if (!ctx.getContext) continue;
			ctx = ctx.getContext("2d");
			var g = ctx.createLinearGradient(0, 0, that.canvasWidth, 0);
			for (var n = 0, length = colors[key].length; n < length; n ++) {
				var data = colors[key][n];
				if (that.HSL.named[key]) {
					var color = Color.Space.HSL_RGB({
						H: data[1][0],
						S: data[1][1],
						L: data[1][2]
					});
					g.addColorStop(data[0], 'rgba(' + (color.R >> 0) + ',' + (color.G >> 0) + ',' + (color.B >> 0) + ', ' + alpha + ')');
				} else {
					var color = data[1];
					g.addColorStop(data[0], 'rgba(' + (color[0] >> 0) + ',' + (color[1] >> 0) + ',' + (color[2] >> 0) + ', ' + (color[3]) + ')');
				}
			};
			ctx.clearRect(0, 0, that.canvasWidth, that.canvasHeight);
			ctx.fillStyle = g;
			ctx.fillRect(0, 0, that.canvasWidth, that.canvasHeight);
			if (that.HSL.named[key]) {
				var value = Math.round(hsl[key.substr(0,1)]);
				var scale = value / that.HSL.named[key];
			} else {
				var value = Math.round(rgb[key.substr(0,1)]);
				var scale = value / that.RGB.named[key];
			}
			var width = that.canvasWidth + 1;
			var element = that.elements[key];
			element.control.style.left = parseInt((width - scale * width) + offsetLeft) + 'px';
			if (parseInt(element.input.value) != value) {
				element.input.value = value;
			}
		};
		if (this.callback) {
			this.callback(rgb, hsl, state, type);
		}
		return rgb;
	};

	this.reset = function() {
		this.HSL = cloneObject(defaultHSL);
		this.RGB = cloneObject(defaultRGB);
	};

	this.destroy = function () {
		parentNode.removeChild(this.picker);
		this.reset();
	};

	this.build = function (type) {
		var controls = {};
		if (type.indexOf("HSL") !== -1) {
			controls.Hue = "HSL";
			controls.Saturation = "HSL";
			controls.Luminance = "HSL";
		}
		if (type.indexOf("RGB") !== -1) {
			controls.Red = "RGB";
			controls.Green = "RGB";
			controls.Blue = "RGB";
		}
		if (type.indexOf("RGBA") !== -1) {
			controls.Alpha = "RGB";
		}
		// check for picker existance
		this.picker = document.getElementById(config.id);
		if (this.picker) return; // picker already exists, or the namespace is used
		this.picker = document.createElement("div");
		this.picker.id = config.id;
		parentNode.appendChild(this.picker);
		// loop through controllers
		for (var key in controls) {
			var control = that[controls[key]];
			var linebox = document.createElement("div");
			linebox.title = key;
			linebox.className = "selector";
			if (key == "Red") {
				var br = document.createElement("div");
				br.style.cssText = "clear: both; width: 100%; display: block; height: 41px;";
				this.picker.appendChild(br);
			}
			var input = document.createElement("input");
			var mouseEvent = function(event) {
				var title = this.parentNode.title;
				var element = that[controls[title]];
				var offset = 0;
				if (event.type == "keydown") {
					if (event.keyCode == 40) {
						offset = -1 * (event.shiftKey ? 10 : 1);
					} else if (event.keyCode == 38) {
						offset =  1 * (event.shiftKey ? 10 : 1);					
					}
				}
				var value = parseInt(this.value.replace(/[^0-9]/g, ''));
				var value = Math.max(0, Math.min(this.max, value + offset));
				element.values[title.substr(0,1)] = value;
				if (value != parseInt(this.pvalue)) {
					this.pvalue = value; // prevent update when not required
					that.update(element.type);
				}
				var code = event.keyCode;
				if (code == 27) this.blur();
			};
			Event.add(input, "click", mouseEvent);
			Event.add(input, "keydown", mouseEvent);
			Event.add(input, "keyup", mouseEvent);
			Event.add(input, "keypress", mouseEvent);
			Event.add(input, "change", mouseEvent);
			input.max = control.max[key.substr(0,1)];
			input.min = 0;
			input.className = "input";
			input.setAttribute("type", "text");
			parentNode.appendChild(input); // make offsetHeight readable
			input.style.top =  ((that.canvasHeight / 2) - (input.offsetHeight/2) - 2) + "px";
			linebox.appendChild(input);
			var func = (function(id, control, input) {
				return function(event) {
					Event.dragElement({
						type: "absolute",
						event: event,
						element: that.elements[id].control,
						callback: function (event, coords, state) {
							Event.stopPropagation(event);
							Event.preventDefault(event);
							if (window.focused) window.focused.blur();
							//
							var element = that.elements[id].canvas;
							var eleft = abPos(element).x;
							var ewidth = element.offsetWidth;
							var scale = 1 - (clamp(coords.x - eleft + 1, 0, ewidth) / ewidth);
							control.values[id.substr(0,1)] = Math.round(scale * control.named[id]);
							that.update(controls[id], control.values, id, state);
							input.focus();
						}
					});
				};
			})(key, control, input);
			//
			var control = document.createElement("div");
			Event.add(control, "mousedown", func);
			control.className = "controller";
			control.style.height = (that.canvasHeight + 10) + "px";
			var subcontrol = document.createElement("div");
			subcontrol.style.height = (that.canvasHeight + 8) + "px";
			control.appendChild(subcontrol);
			linebox.appendChild(control);
			//
			var canvas = document.createElement("canvas");
			Event.add(canvas, "mousedown", func);
			canvas.style.cssText = "background: url("+gridImage.data+")";
			canvas.height = that.canvasHeight;
			canvas.width = that.canvasWidth;
			linebox.appendChild(canvas);
			//
			var name = document.createElement("div");
			Event.add(name, "mousedown", func);
			name.className = "name";
			name.innerHTML = key.toUpperCase();
			parentNode.appendChild(name); // make offsetHeight readable
			name.style.top =  ((that.canvasHeight / 2) - (name.offsetHeight/2)) + "px";
			linebox.appendChild(name);
			//
			this.picker.appendChild(linebox);
			//
			that.elements[key] = {
				input: input,
				canvas: canvas,
				control: control
			}
		};
	};
	//
	var defaultHSL = {
		type: "HSL",
		named: {
			Hue: 360,
			Saturation: 100,
			Luminance: 100
		},
		values: { 
			H: 0,
			S: 100,
			L: 50
		},
		max: {
			H: 360,
			S: 100,
			L: 100
		}
	};
	// 
	var defaultRGB = {
		type: "RGBA",
		named: {
			Red: 255,
			Green: 255,
			Blue: 255,
			Alpha: 100
		},
		values: {
			R: 255,
			G: 0,
			B: 0,
			A: 100
		},
		max: {
			R: 255,
			G: 255,
			B: 255,
			A: 100
		}
	};
	//
	this.HSL = clone(defaultHSL);
	this.RGB = clone(defaultRGB);
	//
	this.build("HSL+RGB");
	this.update();
	//
	return this;
};

// helper functions

var clamp = function(n, min, max) {
	return (n < min) ? min : ((n > max) ? max : n);
};

var clone = function(obj) {
	if (!obj || typeof(obj) != "object") return obj;
	var temp = new obj.constructor();
	for (var key in obj) temp[key] = clone(obj[key]);
	return temp;
};

var createInterlace = function (size, color1, color2) {
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
	pattern.data = proto.canvas.toDataURL();
	return pattern;
};

})();
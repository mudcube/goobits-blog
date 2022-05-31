/*
	---------------------------------------------------
	Widgets.Thumbnailer : 0.3 : mudcu.be : 2012/06/15
	----------------------------------------------------
	// Setup thumbnail properties.
	var thumbnailer = new widgets.Thumbnailer({
		backdrop: "#000",
		maxHeight: 250,
		maxWidth: 250,
		center: true,
		crop: "Fit", // Fit, Edge, None
		click: function(event) {
			console.log("This event is attached to all images.");
			console.log(this.src);
		}
	});
	// Generate thumbnail. 
	var canvas = thumbnailer.generate({
		src: "https://www.google.com/images/srpr/logo3w.png", // or could be a <canvas> element
		title: "Google",
		callback: function() {
			console.log("Image has loaded!")
		},
		click: function(event) {
			console.log("This event overwrites that event.");
			console.log(this.src);
		}
	});
*/

if (typeof(widgets) === "undefined") var widgets = {};

widgets.Thumbnailer = (function(root) {

var defaultConfig = {
	backdrop: "#000",
	maxWidth: 300,
	maxHeight: 100,
	center: true, // centers the image horizontally + vertically
	crop: "Fit", // Fit, Edge, None
	srcs: []
};

root = function(conf) {
	var that = this;
	if (!conf) conf = {};
	for (var key in defaultConfig) {
		if (typeof(conf[key]) === "undefined") {
			conf[key] = defaultConfig[key];
		}
	}
	//
	this.images = {};
	this.conf = conf;
	this.maxHeight = conf.maxHeight;
	this.maxWidth = conf.maxWidth;
	this.generate = function(props) {
		var image;
		var src = props.src;
		var canvas = props.canvas;
		var title = props.title;
		var isFlashCanvas = typeof(FlashCanvas) !== "undefined";
		///
		var crop = props.crop || conf.crop;
		var center = props.center || conf.center;
		var backdrop = props.backdrop || conf.backdrop;
		var maxWidth = props.maxWidth || conf.maxWidth;
		var maxHeight = props.maxHeight || conf.maxHeight;
		var callback = props.callback || conf.callback;
		/// Check to see whether requires new canvas.
		if (typeof(canvas) === "undefined") {
			if (!this.images[src]) { // Create new canvas.
				canvas = document.createElement("canvas");
				if (Event && Event.add) {
					var events = {}; // Combine events.
					for (var key in conf) events[key] = conf[key];
					for (var key in props) events[key] = props[key];
					Event.add(canvas, events);
				}
			} else { // Reuse canvas.
				canvas = this.images[src].canvas;
			}
		}
		///
		var ctx = canvas.getContext("2d");
		///
		var render = function() {
			if (maxWidth === "auto") {
				canvas.height = maxHeight;
				canvas.width = maxWidth = image.width / image.height * maxHeight;
			} else if (maxHeight === "auto") {
				canvas.height = maxHeight = image.height / image.width * maxWidth;
				canvas.width = maxWidth;
			} else {
				canvas.height = maxHeight;
				canvas.width = maxWidth;
			}
			//
			if (title) canvas.title = title;
			// Calculate scaling ratio.
			var ratio = 1;
			if (crop !== "None") {
				var isWide = maxWidth / maxHeight < image.width / image.height;
				var toEdge = crop === "Fit";
				if (toEdge && isWide || !toEdge && !isWide) { 
					ratio = maxHeight / image.height;
				} else { 
					ratio = maxWidth / image.width;
				}
			}
			///
			var width = Math.round(image.width * ratio) || 1;
			var height = Math.round(image.height * ratio) || 1;
			var left = Math.round(center ? (maxWidth - width) / 2 : 0);
			var top = Math.round(center ? (maxHeight - height) / 2 : 0);
			///
			ctx.save();
			ctx.beginPath();
			ctx.fillStyle = backdrop;
			ctx.rect(0, 0, maxWidth, maxHeight);
			ctx.fill();
			ctx.clip();
			ctx.translate(left, top);
			ctx.scale(ratio, ratio);
			ctx.drawImage(image, 0, 0);
			ctx.restore();
			// Indicate image has loaded.
			if (callback) callback(canvas);
		};
		///
		var type = String(src);
		if (type === "[object HTMLCanvasElement]" || (isFlashCanvas && type === "[object]")) {
			image = src;
			render();
		} else if (!this.images[src]) { // not loaded
			canvas.src = src;
			image = new Image();
			that.images[src] = image;
			that.images[src].canvas = canvas;
			if (isFlashCanvas) {
				image.src = src;
				ctx.loadImage(image, render);
			} else { // native
				image.onload = render;
				image.src = src;
			}
		} else { // already loaded
			image = this.images[src];
			render();
		}
		///
		return canvas;
	};
	//
	this.regenerate = function(type, that) {
		// update the srcs
		var count = 0;
		for (var key in this.images) {
			thumb.generate({
				src: key,
				canvas: this.images[key].canvas
			});	
		}
	};
	//
	return this;
};

return root;

})({});
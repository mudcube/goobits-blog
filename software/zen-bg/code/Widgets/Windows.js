/*
	--------------------------------------------
	WINDOWS : 0.2.1 : 2013/08/08
	--------------------------------------------
	widget.windows.setClamp({
		element: document.querySelector("#sketchpad"),
		format: "px",
//		x: 0,
//		y: 0,
//		width: window.innerWidth,
//		height: window.innerHeight
	});
	///
	widget.windows.add({
		"sketch-tools": {
			format: "px",
			zIndexFixed: true, // prevent zIndex increment
			objectBoundingBox: true, // align from objectBoundingBox
			display: "block", // block | none | BLOCK | NONE
			position: "top left",
			left: -86,
			top: 0
		}
	});
*/

if (typeof(zIndexGlobal) === "undefined") var zIndexGlobal = 100;
if (typeof(widget) === "undefined") window.widget = {};

widget = (function (root) { "use strict";

var windows = root.windows = [];
windows.focused = []; // last focused element
windows.idToIdx = {};

/* Maintenance
------------------------------------- */
windows.add = function (conf, left, top, display) {
	var callback = typeof(left) === "function" ? left : null;
	if (typeof(conf) === "string") {
		conf = {
			id: conf,
			left: left,
			top: top,
			display: display
		};
	} else if (conf.id) {
		if (conf.format === "px") {
			conf.x = conf.left; // original coords
			conf.y = conf.top;
			conf.left = conf.left / window.innerWidth; // float
			conf.top = conf.top / window.innerHeight;
		}
	} else {
		for (var key in conf) {
			var item = conf[key];
			item.id = key;
			windows.add(item);
		}
		windows.restore();
		if (callback) callback();
		return;
	}
	///
	var position = (conf.position || "top left").split(" ");
	delete conf.position;
	conf.vAlign = position[0] || "top";
	conf.hAlign = position[1] || "left";
	///
	if (isFinite(display)) {
		display = display ? "block" : "none";
	}
	///
	windows.idToIdx[conf.id] = windows.length;
	windows.push(conf);
	///
	sketch.getItem(conf.id, function(value) {
		if (!value) return;
		var json = JSON.parse(value);
		if (typeof(display) === "boolean" && display) {
			json.display = "block";
		} else if (display) {
			json.display = display;
		}
		///
		if (conf.display === "NONE") json.display = "none";
		if (conf.display === "BLOCK") json.display = "block";
		///
		mergeObject(json, conf);
	});
};

windows.setCurrentTab = function(id, className) {
	if (!id || !className) return;
	dom.setClassName({
		className: "selected",
		list: "div",
		target: document.querySelector("#"+id+" " + className)
	});
	widget.windows.record({
		id: id,
		className: className
	});
};

windows.getWindowById = function (id) {
	var idx = windows.idToIdx[id];
	if (typeof(idx) === "undefined") {
		return false;
	} else {
		return windows[idx];
	}
};

windows.record = function (conf) {
	var o = windows.getWindowById(conf.id);
	if (!o) return;
	if (typeof (conf.x) !== "undefined") o.x = conf.x;
	if (typeof (conf.y) !== "undefined") o.y = conf.y;
	if (typeof (conf.left) !== "undefined") o.left = conf.left;
	if (typeof (conf.top) !== "undefined") o.top = conf.top;
	if (typeof (conf.display) !== "undefined") o.display = conf.display;
	if (typeof (conf.index) !== "undefined") o.index = conf.index;
	if (typeof (conf.className) !== "undefined") o.className = conf.className;
	var str = JSON.stringify(o);
	sketch.setItem(conf.id, str);
	///
	windows.focusElement(conf.id, o.display);
};

windows.restore = function () {
	var scrollTop = document.body.scrollTop;
	var scrollLeft = document.body.scrollLeft;
	var width = window.innerWidth;
	var height = window.innerHeight;
	///
	if (CLAMP.element) { // recalculate metrics
		windows.setContainer(CLAMP.element);
	}
	///
	var position = [];
	var offset = {};
	for (var n = 0; n < windows.length; n++) {
		var o = windows[n];
		var vAlign = o.vAlign;
		var hAlign = o.hAlign;
		var el = document.getElementById(o.id);
		if (!el || !el.style) continue;
		el.style.display = "block"; // to measure offsets
		/// position of CLAMP element
		var metrics = Event.proxy.getBoundingBox(el);
		var clampTop = CLAMP[vAlign || "top"];
		var clampLeft = CLAMP[hAlign || "left"];
		///
		if (o.objectBoundingBox) {
			o.x = 0.5 * width - metrics.width / 2;
			o.y = 0.5 * height - metrics.height / 2 + 20;
		}

		/// position of target element
		var targetTop = (isFinite(o.y) ? o.y : o.top * height) + clampTop;
		var targetLeft = (isFinite(o.x) ? o.x : o.left * width) + clampLeft;
		targetTop += scrollTop;
		targetLeft += scrollLeft;

		/// deviance to compensate for out of element bounds
		var offsetTop = Math.min(targetTop, height);
		var offsetLeft = Math.min(targetLeft, width);

		/// calculate offsets from edges
		offset.BOTTOM = (targetTop + metrics.height) - height;
		offset.TOP = offsetTop - targetTop;
		offset.RIGHT = (targetLeft + metrics.width) - width;
		offset.LEFT = offsetLeft - targetLeft;

		/// find maximum deviance
		offset[vAlign] = Math.max(offset[vAlign] || 0, offset[vAlign.toUpperCase()]);
		offset[hAlign] = Math.max(offset[hAlign] || 0, offset[hAlign.toUpperCase()]);

		///
		targetTop -= Math.max(0, offset.BOTTOM);
//		targetLeft -= Math.max(0, offset.RIGHT);
		///
		position.push({
			top: Math.max(CLAMP.y, targetTop),
			left: Math.max(CLAMP.x, targetLeft)
		});
	}
	///
	var minZIndex = 100;
	for (var n = 0; n < windows.length; n++) {
		var o = windows[n];
		if (!o.display || o.display === true) o.display = "block";
		var el = document.getElementById(o.id);
		if (!el || !el.style) continue;
		///
		var data = position[n];
		var top;
		if (o.vAlign === "bottom") {
			top = data.top - offset.bottom;
		} else { // top
			top = data.top + offset.top;
		}
		///
		var left;
		if (o.hAlign === "right") {
			left = data.left - offset.right;
		} else {
			left = data.left + offset.left;
		}
		///
		top = Math.ceil(top);
		left = Math.ceil(left);
		///
		el.style.top = top + "px";
		el.style.left = left + "px";
		///
		el.style.display = o.display || "block";
		el.style.zIndex = o.zIndexFixed || o.index || ++ minZIndex;
		zIndexGlobal = Math.max(zIndexGlobal, o.index || 0);
		if (o.display === "block" && el.className.indexOf("opened") === -1) {
			el.className += " opened";
		}
	}
};

/* Display state
------------------------------------- */
windows.blink = function (id, callback) {
	var element = document.getElementById(id);
	if (!windows.isOpen(element)) windows.open(id);
	///
	setTimeout(function() {
		element.blinking = false;
	}, 250);
	///
	if (element.blinking) {
		if (callback) callback(true);
		return;
	}
	///
	element.blinking = true;
	element.className = (" " + element.className + " ").split(" blink ").join(" blink-stall ").trim();
	///
	setTimeout(function() {
		element.className = (" " + element.className + " ").split(" blink-stall ").join(" ").trim();
		if (element.className.indexOf("opened") === -1) {
				windows.open(id);
				if (callback) callback(true);
		} else {
				element.className += " blink";
				if (callback) callback(true);
		}
	}, 0);
};

windows.open = function (id) {
	var element = document.getElementById(id);
	if (!element) return;
	if ((" " + element.className + " ").indexOf(" opened ") === -1) {
		element.className = (element.className + " opened").trim();
	}
	///
	var o = windows.getWindowById(id);
	var index = o.zIndexFixed ? o.zIndexFixed : ++ zIndexGlobal;
	element.style.display = "block";
	element.style.zIndex = index;
	element.style.opacity = 1;
	clearTimeout(element.interval);
	windows.record({
		id: id,
		display: "block",
		index: index
	});
};


/* Focus
--------------------------------------------------- */
windows.focus = function (id) {
	var element = document.getElementById(id);
	if (!element) return;
	var o = windows.getWindowById(id);
	var index = o.zIndexFixed ? o.zIndexFixed : ++ zIndexGlobal;
	element.style.zIndex = index;
	windows.record({
		id: id,
		index: index
	});
};

windows.clearFocus = function() {
	windows.focused = [];
};

windows.focusElement = function(id, display) {
	if (display === "none") return; //- remove element with this id
	var focusId = windows.focused.slice(-1)[0];
	var arr = " " + windows.focused.join(" ") + " ";
	if (focusId !== id && arr.indexOf(id) === -1) {
		windows.focused.push(id);
	}
};

windows.hasFocus = function() {
	return !!windows.idToIdx[windows.focused.slice(-1)[0]];
};

windows.closeFocused = function() {
	var focusId = windows.focused.pop();
	windows.close(focusId);
};

windows.close = function (id) {
	var element = document.getElementById(id);
	element.style.opacity = 0;
	element.className = (" " + element.className + " ").split(" opened ").join(" ").trim();
	element.interval = setTimeout(function () {
		element.style.opacity = 1;
		element.style.display = "none";
		windows.record({
			id: id,
			display: "none"
		});
	}, 250);
};

windows.isOpen = function (element) {
	if (typeof(element) === "string") {
		if (element.indexOf("#") === -1) element = "#" + element;
		element = document.querySelector(element);
	}
	if (!element) return;
	if (element.style.display === "none") return false;
	return (" " + element.className + " ").indexOf(" opened ") !== -1;
};

windows.isClosed = function (element) {
	return !windows.isOpen(element);
};

windows.toggle = function (id, callback) {
	var display;
	var element = document.getElementById(id);
	if (!element) return console.log("missing", id);
	if (windows.isOpen(element)) {
		windows.close(id);
		display = false;
	} else {
		windows.open(id);
		windows.restore();
		display = true;
	}
	///
	if (callback) setTimeout(function() {
		callback(display);
	}, 1);
};

/* Clamp
------------------------------------- */
var CLAMP = {
	x: 0,
	y: 0,
	left: 0,
	right: 0,
	top: 0,
	bottom: 0,
	vAlign: "top",
	hAlign: "left"
};

windows.setClamp = function(x, y, width, height, format) {
	if (typeof(x) === "object") {
		if (x.element) windows.setContainer(x.element);
		format = x.format;
		height = x.height;
		width = x.width;
		y = x.y;
		x = x.x;
	}
	///
	CLAMP.x = x || null;
	CLAMP.y = y || null;
	CLAMP.width = width || null;
	CLAMP.height = height || null;
	CLAMP.format = format;
};

windows.setContainer = function(el) {
	var metrics = Event.proxy.getBoundingBox(el);
	CLAMP.element = el;
	CLAMP.metrics = metrics;
	CLAMP.left = metrics.x1;
	CLAMP.right = metrics.x2;
	CLAMP.top = metrics.y1;
	CLAMP.bottom = metrics.y2;
};

/* Events
------------------------------------- */

windows.drag = function (that, event) {
	var scrollTop = document.body.scrollTop;
	var scrollLeft = document.body.scrollLeft;
	return Event.proxy.drag({
		event: event,
		target: that,
		position: "move",
		listener: function (event, self) {
			Event.cancel(event);
			var metrics = Event.proxy.getBoundingBox(self.target);
			var borderLeft = metrics.border[0];
			var borderTop = metrics.border[2]
			self.target.state = self.state;
			self.width = metrics.width;
			self.height = metrics.height;
			clamp(self);
			///
			that.style.left = Math.ceil(self.x - borderLeft) + "px"; // + scrollLeft 'absolute'
			that.style.top = Math.ceil(self.y - borderTop) + "px";
			///
			var o = windows.getWindowById(that.id);
			if (self.state === "down") {
				var index = o.zIndexFixed ? o.zIndexFixed : ++ zIndexGlobal;
				that.style.zIndex = index;
			} else if (self.state === "up") {
				var top;
				if (o.vAlign === "bottom") {
					top = self.y - CLAMP.bottom;
				} else { // top
					top = self.y - CLAMP.top - scrollTop;
				}
				///
				var left;
				if (o.hAlign === "right") {
					left = self.x - CLAMP.right;
				} else { // left
					left = self.x - CLAMP.left - scrollLeft;
				}
				///
				windows.record({
					id: that.id,
					x: left - borderLeft,
					y: top - borderTop,
					left: left / window.innerWidth,
					top: top / window.innerHeight,
					index: zIndexGlobal
				});
				windows.restore()
			}
		}
	});
};

/* Helpers
------------------------------------- */
windows.write = function(type) {
	sketch.ui.foxybox(type);
	var element = document.querySelector("#sketch-help .content");
	if (element) Event.proxy.wheelPreventElasticBounce(element);
	windows.restore();
};

windows.lazyloader = function(selector) {
	var area = document.querySelectorAll(selector);
	for (var n = 0; n < area.length; n ++) {
		var d = area[n];
		d.src = d.getAttribute("data-src");
		d.className = (" " + d.className + " ").replace(" lazy ", " ").trim();
	}
};

var clamp = function (self) {
	var x1 = CLAMP.x || 0;
	var y1 = CLAMP.y || 0;
	var x2 = CLAMP.width || window.innerWidth;
	var y2 = CLAMP.height || window.innerHeight;
	if (self.x + self.width > x2) self.x = x2 - self.width;
	if (self.x < x1) self.x = x1;
	if (self.y + self.height > y2) self.y = y2 - self.height;
	if (self.y < y1) self.y = y1;
	return self;
};

return root;

})(widget);
/*
	-------------------------------------------------------
	Math : 0.1.1 : 2013/12/18 : https://sketch.io
	-------------------------------------------------------
*/

window.sketch || (window.sketch = {})
if (typeof (sketch.util) === "undefined") sketch.util = {};

(function (root) {
	"use strict";

	root.util.RAD_DEG = 180 / Math.PI; // Radians to Degrees
	root.util.DEG_RAD = 1 / root.util.RAD_DEG; // Degrees to Radians
	root.util.INFINITY = 4294967295;
	root.util.INFINITY_MINUS_24bit = root.util.INFINITY - 0xffffff; // reserved for elements forced to top of stack
	root.util.INFINITY_MINUS_16bit = root.util.INFINITY - 0xffff; // ?
	root.util.INFINITY_MINUS_8bit = root.util.INFINITY - 0xff; // reserved for elements in genesis

	/* Park Miller (1988) "minimal standard" linear congruential pseudo-random number generator.
	------------------------------------------------------- */
	root.util.Random = function (seed) {
		this.seed = (typeof seed === "number") ? seed : root.util.Random.seed();
		this.n = Number(this.seed);
		return this;
	};

	root.util.Random.seed = function () {
		return Math.random() * 2147483648 >> 0;
	};

	root.util.Random.prototype = {
		toInt: function () { // unsigned integer (31 bits)
			return this.n = (this.n * 16807) % 2147483647;
		},
		toDouble: function () { // double between nearly 0 and nearly 1.0
			return (this.n = (this.n * 16807) % 2147483647) / 2147483647;
		},
		intRange: function (min, max) { // unsigned integer (31 bits) between a given range
			min -= 0.4999;
			max += 0.4999;
			return Math.round(min + ((max - min) * ((this.n = (this.n * 16807) % 2147483647) / 2147483647)));
		},
		doubleRange: function (min, max) { // double between a given range
			return min + ((max - min) * ((this.n = (this.n * 16807) % 2147483647) / 2147483647));
		}
	};

	/* Monitor specific conversions - PX, PT, PC, IN, FT, YD, MM, CM, M, PX, EX, EM
	------------------------------------------------------- */
	root.util.getScreenMetrics = function () {
		//- Examine these in the context of devicePixelRatio, as well.
		var measure = function (type) {
			try { // prevent error in older browsers.
				div.style.fontSize = type;
			} catch (e) { //
				div.style.fontSize = "";
			}
			return div.offsetHeight / 10000;
		};

		/// Add element to measure with.
		var container = document.createElement("div"); // fix for iframe resizing on iOS
		container.style.cssText = "position: relative; width: 1px; height: 1px; overflow: scroll;";
		///
		var div = document.createElement("div");
		div.style.cssText = "position: absolute; width: 100em; height: 10000em; overflow: hidden;";
		container.appendChild(div);
		document.body.appendChild(container);

		/// Measure textual styles
		var types = ["normal", "xx-small", "x-small", "small", "medium", "large", "x-large", "xx-large"];
		var ret = {};
		for (var n = 0; n < types.length; n++) {
			ret[types[n] + "_px"] = measure(types[n]);
		}

		/// Measure conversions for units
		ret["%>px"] = measure("100%") / 100; // Percent
		ret["px>pt"] = 1 / measure("1pt"); // Points
		ret["pt>pc"] = 1 / 12.0; // Picas
		ret["px>in"] = 1 / measure("72pt"); // Inches
		ret["in>ft"] = 1 / 12.0; // Feet
		ret["ft>yd"] = 1 / 3.0; // Yards
		ret["px>mm"] = 25.4 * ret["px>in"]; // Millimeter
		ret["mm>cm"] = 1 / 10.0; // Centimeter
		ret["cm>m"] = 1 / 100.0; // Meter
		ret["px>ex"] = 1 / measure("1ex"); // Ex
		ret["ex>em"] = 1 / ret["px>ex"] / measure("1em"); // Em
		ret["px>px"] = 1;

		/// Remove the measuring element.
		document.body.removeChild(container);

		/// Create pathways of conversion between all the types.
		var compute = function (o, table, b, c) {
			for (var a in table) {
				if (typeof (c = table[a]) === "object") {
					compute(o, c, a);
					continue;
				}
				if (b) {
					o["px>" + a] = o["px>" + b] * o[b + ">" + a];
					o[b + ">" + c] = o[b + ">" + a] * o[a + ">" + c];
					o[b + ">px"] = 1 / o["px>" + b];
					o[c + ">" + b] = 1 / o[a + ">" + c] * 1 / o[b + ">" + a];
					o[a + ">" + b] = 1 / o[b + ">" + a];
				}
				o["px>" + c] = o["px>" + a] * o[a + ">" + c];
				o[a + ">px"] = 1 / o["px>" + a];
				o[c + ">px"] = 1 / o["px>" + a] * 1 / o[a + ">" + c];
				o[c + ">" + a] = 1 / o[a + ">" + c];
			}
		};
		///
		compute(ret, {
			"pt": "pc",
			"mm": {
				"cm": "m"
			},
			"in": {
				"ft": "yd"
			},
			"ex": "em"
		});
		///
		return ret;
	};

	/* Hash - Dan Bernstein (djb2)
	------------------------------------------------------- */
	root.util.createHash = function (str) {
		if (!str) return 0;
		var hash = 5381;
		for (var n = 0, length = str.length; n < length; n++) {
			var c = str[n].charCodeAt();
			hash = ((hash << 5) + hash) + c;
		}
		return hash;
	};

})(sketch);
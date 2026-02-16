/*
	Color Blend : 0.3 : 2012/05/16
	----------------------------------------------------------
	_: Soft Light, Tint, Red, Green, Blue
	----------------------------------------------------------
	SourceIn, SourceOver, DestinationOut
	Normal, Dissolve, Average
	Darker, Darken, Multiply, Color Burn, Color Burn Inverse, Soft Burn, Linear Burn, Darker Color
	Lighter, Lighten, Screen, Color Dodge, Color Dodge Inverse, Soft Dodge, Linear Dodge, Lighter Color
	Overlay, Soft Light, Fuzzy Light, Hard Light, Vivid Light, Linear Light, Pin Light, Hard Mix, Grain Extract, Grain Merge
	Difference, Exclusion, Negation, Invert
	Hue, Saturation, Color, Luminosity, Red, Green, Blue, Tint
	Reflect, Glow, Heat, Freeze
	Additive, Subtractive, Subtract, Stamp, Interpolation, Divide
	XOR, AND, OR
	----------------------------------------------------------
	Dissolve requires RAND()
	----------------------------------------------------------
 	var modes = [ 'Difference', 'Exclusion', 'Hue', 'Saturation', 'Color', 'Luminosity', 'Darker','Lighter','Dissolve', 'Additive', 'Subtractive', 'Multiply', 'Color Burn', 'Linear Burn', 'Screen', 'Color Dodge', 'Linear Dodge', 'Overlay', 'Soft Light', 'Hard Light', 'Vivid Light', 'Linear Light', 'Pin Light', 'Hard Mix' ];

*/

window.Color || (window.Color = {});
if (typeof(Color.Blend) === "undefined") Color.Blend = {};

(function (root) {

root.modes = {
	'COMPOSITE': ['SourceIn', 'SourceOver', 'DestinationOut'],
	'OPACITY': ['Normal', 'Dissolve', 'Average'],
	'DARKEN': ['Darker', 'Darken', 'Multiply', 'Color Burn', 'Color Burn Inverse', 'Soft Burn', 'Linear Burn', 'Darker Color'],
	'LIGHTEN': ['Lighter', 'Lighten', 'Screen', 'Color Dodge', 'Color Dodge Inverse', 'Soft Dodge', 'Linear Dodge', 'Lighter Color'],
	'LIGHTING': ['Overlay', 'Soft Light', 'Fuzzy Light', 'Hard Light', 'Vivid Light', 'Linear Light', 'Pin Light', 'Hard Mix', 'Grain Extract', 'Grain Merge'],
	'INVERT': ['Difference', 'Exclusion', 'Negation', 'Invert'],
	'COLOR': ['Hue', 'Saturation', 'Color', 'Luminosity', 'Red', 'Green', 'Blue', 'Tint'],
	'THERMAL': ['Reflect', 'Glow', 'Heat', 'Freeze'],
	'MATH': ['Additive', 'Subtractive', 'Subtract', 'Stamp', 'Interpolation', 'Divide'],
	'LOGIC': ['XOR', 'AND', 'OR']
};

root.isAlphaRequired = (function (data) { // Return object of booleans.
	for (var i = 0, o = {}; i < data.length; i++) {
		o[data[i].replace(" ", "")] = true;
	}
	return o;
})([ // These modes require 32-bit colors.
	'Darker', 'Lighter', 'SourceIn', 'SourceOver', 'DestinationOut',
	'Luminosity', 'Tint', 'DarkerColor', 'LighterColor', 'Hue',
	'Saturation', 'Color', 'Red', 'Green', 'Blue', 'Cyan', 'Magenta',
	'Yellow', 'Dissolve'
]);

root.apply = function (imageData1, imageData2, mode, preserveAlpha) {
	var blend = root[mode];
	var data1 = imageData1.data;
	var data2 = imageData2.data;
	var length = data1.length;
	if (root.isAlphaRequired[mode]) {
		root.apply32bit(blend, data1, data2, length);
	} else {
		root.apply24bit(blend, data1, data2, length);
	}
	return imageData2;
};

root.apply24bit = function (blend, data1, data2, length) {
	for (var i = 0; i < length; i += 4) {
		var alpha = data1[i + 3] / 255;
		if (data1[i + 3] > 0) {
			data2[i] = blend(data1[i], data2[i]); //	Red
			data2[i + 1] = blend(data1[i + 1], data2[i + 1]); //	Blue
			data2[i + 2] = blend(data1[i + 2], data2[i + 2]); //	Green
			data2[i + 3] = data2[i + 3];
		} else { // draw original pixels (to get blending started in drawing mode)
			data2[i] = data2[i];
			data2[i + 1] = data2[i + 1]
			data2[i + 2] = data2[i + 2]
			data2[i + 3] = data2[i + 3];
		}
	}
};

root.apply32bit = function (blend, data1, data2, length) {
	for (var i = 0; i < length; i += 4) {
		if (data1[i + 3] > 0) {
			var rgb = blend({
				R: data1[i + 0],
				G: data1[i + 1],
				B: data1[i + 2],
				A: data1[i + 3]
			}, {
				R: data2[i + 0],
				G: data2[i + 1],
				B: data2[i + 2],
				A: data2[i + 3]
			});
			data2[i] = rgb >>> 16 & 0xFF;
			data2[i + 1] = rgb >>> 8 & 0xFF; //	Blue
			data2[i + 2] = rgb & 0xFF; //	Green
			if (!preserveAlpha) data2[i + 3] = rgb >>> 24;
		} else {
			data2[i] = data2[i];
			data2[i + 1] = data2[i + 1]
			data2[i + 2] = data2[i + 2]
			data2[i + 3] = data2[i + 3];
		}
	}
};

/*
	----------------------------------------------------------
	OPACITY
	----------------------------------------------------------
*/

root.SourceIn = function (src, dst) {
	_a = src.A * dst.A;
	_r = src.R * dst.A;
	_g = src.G * dst.A;
	_b = src.B * dst.A;
	return (_a << 24 | _r << 16 | _g << 8 | _b) >>> 0;
};

root.DestinationOut = function (src, dst) {
	var _a = dst.A * (1 - src.A);
	var _r = dst.R * (1 - src.A);
	var _g = dst.G * (1 - src.A);
	var _b = dst.B * (1 - src.A);
	return (_a << 24 | _r << 16 | _g << 8 | _b) >>> 0;
};

root.SourceOver = function (src, dst) { //+
	var _a = src.A + dst.A * (1 - (src.A / 255));
	var _r = src.R + dst.R * (1 - (src.A / 255));
	var _g = src.G + dst.G * (1 - (src.A / 255));
	var _b = src.B + dst.B * (1 - (src.A / 255));
	return (_a << 24 | _r << 16 | _g << 8 | _b) >>> 0;
};

root.Dissolve = function (src, dst) { //+
	if ((RAND.toDouble() * 0xFF) > dst.A) {
		return (dst.A << 24 | src.R << 16 | src.G << 8 | src.B) >>> 0; // TRANSPARENCY
	} else {
		return (dst.A << 24 | dst.R << 16 | dst.G << 8 | dst.B) >>> 0; // OPAQUE
	}
};

root.Average = function (A, B) { //+
	return (A + B) >> 1;
};

/*
	----------------------------------------------------------
	DARKEN
	----------------------------------------------------------
*/

root.Darken = function (A, B) { //+
	return (A < B) ? A : B;
};

root.Multiply = function (A, B) { //+
	return A * B / 0xFF;
};

root.ColorBurn = function (A, B) { //+
	if (B === 0x00) {
		return 0x00;
	} else {
		var C = 255 - (((0xFF - A) << 8) / B);
		return (C < 0) ? 0 : C;
	}
};

root.ColorBurnInverse = function (A, B) { //+
	if (A === 0x00) return 0x00;
	else {
		var C = 255 - (((0xFF - B) << 8) / A);
		return (C < 0) ? 0 : C;
	}
};

root.SoftBurn = function (A, B) { //+
	if (A + B < 256) {
		if (A === 0xFF) return 0xFF;
		else {
			var C = (B << 7) / (A ^ 0xFF);
			return (C > 0xFF) ? 0xFF : C;
		}
	} else {
		var C = (((A ^ 0xFF) << 7) / B) ^ 0xFF;
		return (C < 0x00) ? 0x00 : C;
	}
};

root.LinearBurn = function (A, B) { //+
	var C = A + B - 0xFF;
	return (C < 0x00) ? 0x00 : C;
};

root.DarkerColor = function (src, dst) { //+
	var z = ((src.R << 16 | src.G << 8 | src.B) > (dst.R << 16 | dst.G << 8 | dst.B)) ? b : a;
	return (Math.min(src.A + dst.A, 0xFF) << 24 | z.R << 16 | z.G << 8 | z.B) >>> 0;
};

/*
	----------------------------------------------------------
	LIGHTEN
	----------------------------------------------------------
*/

root.Lighter = function (src, dst) { // aka. CompositePlusLighter or Plus
	var a = src.A / 0xFF;
	var r = src.R;
	var g = src.G;
	var b = src.B;
	var A = dst.A / 0xFF;
	var R = dst.R;
	var G = dst.G;
	var B = dst.B;
	var a0 = A * 0xFF;
	//http://lists.w3.org/Archives/Public/public-canvas-api/2009OctDec/0021.html
	//http://lists.whatwg.org/htdig.cgi/whatwg-whatwg.org/2007-March/010609.html
	//http://skisrc.googlecode.com/svn/trunk/docs/html/class_sk_porter_duff.html
	var r0 = Math.max(R, (r * (a)) + (R * (A)));
	var g0 = Math.max(G, (g * (a)) + (G * (A)));
	var b0 = Math.max(B, (b * (a)) + (B * (A)));
	if (r0 > 0xFF) r0 = 0xFF;
	if (g0 > 0xFF) g0 = 0xFF;
	if (b0 > 0xFF) b0 = 0xFF;
	return (a0 << 24 | r0 << 16 | g0 << 8 | b0) >>> 0;
};

root.Darker = function (src, dst) { // aka. CompositePlusDarker
	var a = src.A / 255;
	var r = src.R / 255;
	var g = src.G / 255;
	var b = src.B / 255;
	var A = dst.A / 255;
	var R = dst.R / 255;
	var G = dst.G / 255;
	var B = dst.B / 255;
	//http://skisrc.googlecode.com/svn/trunk/docs/html/class_sk_porter_duff.html
	//[Sa + Da - Sa*Da, Sc*(1 - Da) + Dc*(1 - Sa) + min(Sc, Dc)]
	var a0 = a + A - a * A;
	var r0 = Math.min(0xFF, (r * (1 - A) + R * (1 - a) + Math.min(r, R)) * 0xFF);
	var g0 = Math.min(0xFF, (g * (1 - A) + G * (1 - a) + Math.min(g, G)) * 0xFF);
	var b0 = Math.min(0xFF, (b * (1 - A) + B * (1 - a) + Math.min(b, B)) * 0xFF);
	return (a0 << 24 | r0 << 16 | g0 << 8 | b0) >>> 0;
};

root.Lighten = function (A, B) { //+
	return (A > B) ? A : B;
};

root.Screen = function (A, B) { //+
	return 0xFF - ((0xFF - A) * (0xFF - B) >> 8);
};

root.ColorDodge = function (A, B) { //+
	if (B === 0xFF) return 0xFF;
	else {
		var C = (A << 8) / (0xFF - B);
		return (C > 0xFF) ? 0xFF : C;
	}
};

root.ColorDodgeInverse = function (A, B) { //+
	if (A === 0xFF) return 0xFF;
	else {
		var C = (B << 8) / (0xFF - A);
		return (C > 0xFF) ? 0xFF : C >> 0;
	}
};

root.SoftDodge = function (A, B) { //+
	if (A + B < 256) {
		if (B === 0xFF) return 0xFF;
		else {
			var C = (A << 7) / (B ^ 0xFF);
			return (C > 0xFF) ? 0xFF : C;
		}
	} else {
		var C = (((B ^ 0xFF) << 7) / A) ^ 0xFF;
		return (C < 0x00) ? 0x00 : C;
	}
};

root.LinearDodge = function (A, B) { //+
	var C = A + B;
	return (C > 0xFF) ? 0xFF : C;
};

root.LighterColor = function (src, dst) { //+
	var z = ((src.R << 16 | src.G << 8 | src.B) < (dst.R << 16 | dst.G << 8 | dst.B)) ? b : a;
	return (Math.min(src.A + dst.A, 0xFF) << 24 | z.R << 16 | z.G << 8 | z.B) >>> 0;
};

/*
	----------------------------------------------------------
	LIGHTING
	----------------------------------------------------------
*/

root.Overlay = function (A, B) { //+
	if (A < 128) return (A * B) >> 7;
	return 255 - ((255 - A) * (255 - B) >> 7);
};

root.SoftLight = function (A, B) { //-
	/*
	// soft_light (libpsd)
	#define PSD_BLEND_SOFTLIGHT(b, f, a)
	do {
	psd_int c1, c2;
	c1 = b * f >> 8;
	c2 = 255 - ((255 - b) * (255 - f) >> 8);
	f = ((255 - b) * c1 >> 8) + (b * c2 >> 8);
	b = PSD_BLEND_CHANNEL(b, f, a);
	} while(0)
	*/
	return Math.pow(A / 255, 1 / (B / 170.0 + 0.5)) * 255; // gamma
	function D(x) {
		return (x <= 0x40) ? ((16 * x - 3060) * x + 1020) * x : Math.sqrt(x);
	}
	if (B <= 0x80) return A - (0xFF - 2 * B) * A * (0xFF - A);
	else return A + (2 * B - 0xFF) * (D(A) - A);
};

root.FuzzyLight = function (A, B) { //+
	var C = A * B / 0xFF;
	return C + A * (0xFF - ((A ^ 0xFF) * (B ^ 0xFF) / 0xFF) - C) / 0xFF;
};

root.HardLight = function (A, B) { //+
	if (B < 128) return (B * A) >> 7;
	else return 255 - ((255 - B) * (255 - A) >> 7);
};

root.VividLight = function (A, B) { //+
	if (B < 0x80) return 255 - Math.min(255, (255 - A) * 255 / (2 * B));
	else return Math.min(255, A * 255 / (2 * (255 - B)));
};

root.LinearLight = function (A, B) { //+
	return Math.min(255, Math.max(0, A + 2 * B - 255));
	//	if(A < 0x80) return (A < 0xFF - B * 2) ? 0x00 : B * 2 + A - 0xFF;
	//	else return (A < 0x200 - B * 2) ? B * 2 + A - 0xFF : 0xFF;
};

root.PinLight = function (A, B) { //+
	if (B > 0x80) return Math.max(A, 2 * (B - 0x80));
	else return Math.min(A, 2 * B);
};

root.HardMix = function (A, B) { //+
	return (A < 0xFF - B) ? 0 : 0xFF;
};

root.GrainExtract = function (A, B) { //+
	return Math.min(0xFF, Math.max(0, A - B + 0x80));
};

root.GrainMerge = function (A, B) { //+
	return Math.min(0xFF, Math.max(0, A + B - 0x80));
};

/*
	----------------------------------------------------------
	INVERT
	----------------------------------------------------------
*/

root.Difference = function (A, B) { //+
	var C = A - B;
	return (C < 0) ? -C : C;
};

root.Exclusion = function (A, B) { //+
	//	return A + B - 2 * A * B / 0xFF;
	return A + B - (A * B >> 7);
};

root.Negation = function (A, B) { //+
	var C = 0xFF - A - B;
	return (C < 0 ? -C : C) ^ 0xFF;
};

root.Invert = function (A, B) { //+
	return A ^ 0xFF;
};

/*
	----------------------------------------------------------
	COLOR
	----------------------------------------------------------
*/

root.Tint = function (src, dst) { //-
	var lum = dst.R * 0.3 + dst.G * 0.59 + dst.B * 0.11;
	return (Math.min(src.A + dst.A, 0xFF) << 24 | Math.min(255, (src.R + lum) * 0.5 + dst.R * 0.5) << 16 | Math.min(255, (src.G + lum) * 0.5 + dst.G * 0.5) << 8 | Math.min(255, (src.B + lum) * 0.5 + dst.B * 0.5)) >>> 0;
};

root.Red = function (src, dst) { //-
	return (Math.min(src.A + dst.A, 0xFF) << 24 | dst.R << 16 | src.G << 8 | src.B) >>> 0;
};

root.Green = function (src, dst) { //-
	return (Math.min(src.A + dst.A, 0xFF) << 24 | src.R << 16 | dst.G << 8 | src.B) >>> 0;
};

root.Blue = function (src, dst) { //-
	return (Math.min(src.A + dst.A, 0xFF) << 24 | src.R << 16 | src.G << 8 | dst.B) >>> 0;
};

(function() {
	var NUM_to_RGB = { 0: "R", 1: "G", 2: "B" };
	var SetSat = function (R, G, B, s) {
		var r0 = 0;
		var g0 = 1;
		var b0 = 2;
		if (R > G) {
			R ^= G;
			G ^= R;
			R ^= G;
			r0 ^= g0;
			g0 ^= r0;
			r0 ^= g0;
		}
		if (R > B) {
			R ^= B;
			B ^= R;
			R ^= B;
			r0 ^= b0;
			b0 ^= r0;
			r0 ^= b0;
		}
		if (G > B) {
			G ^= B;
			B ^= G;
			G ^= B;
			g0 ^= b0;
			b0 ^= g0;
			g0 ^= b0;
		}
		if (B > R) {
			G = ((G - R) * s) / (B - R);
			B = s;
		} else {
			G = B = 0;
		}
		R = 0;
		var ret = {};
		ret[NUM_to_RGB[r0]] = R;
		ret[NUM_to_RGB[g0]] = G;
		ret[NUM_to_RGB[b0]] = B;
		return ret;
	};

	var Lum = function (r, g, b) {
		return 0.3 * r + 0.59 * g + 0.11 * b;
	};

	var SetLum = function (r, g, b, l) {
		if (typeof r === "object") {
			l = g;
			b = r.B;
			g = r.G;
			r = r.R;
		}
		var d = l - Lum(r, g, b);
		r = r + d;
		g = g + d;
		b = b + d;
		var l = Lum(r, g, b);
		var n = Math.min(r, g, b);
		var x = Math.max(r, g, b);
		if (n < 0x00) {
			r = l + (((r - l) * l) / (l - n));
			g = l + (((g - l) * l) / (l - n));
			b = l + (((b - l) * l) / (l - n));
		}
		if (x > 0xFF) {
			r = l + (((r - l) * (0xFF - l)) / (x - l));
			g = l + (((g - l) * (0xFF - l)) / (x - l));
			b = l + (((b - l) * (0xFF - l)) / (x - l));
		}
		return r << 16 | g << 8 | b;
	};

	root.Hue = function (src, dst) { //+
		var sat = Math.max(src.R, src.G, src.B) - Math.min(src.R, src.G, src.B);
		var a0 = Math.min(src.A + dst.A, 0xFF);
		var color = SetLum(SetSat(dst.R, dst.G, dst.B, sat), Lum(src.R, src.G, src.B));
		return (a0 << 24 | color) >>> 0;
	};

	root.Saturation = function (src, dst) { //+
		var sat = Math.max(dst.R, dst.G, dst.B) - Math.min(dst.R, dst.G, dst.B);
		var a0 = Math.min(src.A + dst.A, 0xFF);
		var color = SetLum(SetSat(src.R, src.G, src.B, sat), Lum(src.R, src.G, src.B));
		return (a0 << 24 | color) >>> 0;
	};

	root.Color = function (src, dst) { //+
		var a0 = Math.min(src.A + dst.A, 0xFF);
		var color = SetLum(dst.R, dst.G, dst.B, Lum(src.R, src.G, src.B));
		return (a0 << 24 | color) >>> 0;
	};

	root.Luminosity = function (src, dst) { //+
		var a0 = Math.min(src.A + dst.A, 0xFF);
		var color = SetLum(src.R, src.G, src.B, Lum(dst.R, dst.G, dst.B));
		return (a0 << 24 | color) >>> 0;
	};
})();

/*
	----------------------------------------------------------
	THERMAL
	----------------------------------------------------------
*/

root.Reflect = function (A, B) { //+
	if (B === 0xFF) return 0xFF;
	var C = (A * A) / (0xFF - B);
	return (C > 0xFF) ? 0xFF : C;
};

root.Glow = function (A, B) { //+
	if (A === 0xFF) return 0xFF;
	var C = (B * B) / (0xFF - A);
	return (C > 0xFF) ? 0xFF : C;
};

root.Freeze = function (A, B) { //+
	if (B === 0x00) return 0x00;
	var C = 0xFF - Math.pow(A ^ 0xFF, 2) / B;
	return (C < 0x00) ? 0x00 : C;
};

root.Heat = function (A, B) { //+
	if (A === 0x00) return 0x00;
	var C = 0xFF - Math.pow(B ^ 0xFF, 2) / A;
	return (C < 0x00) ? 0x00 : C;
};

/*
	----------------------------------------------------------
	MATH
	----------------------------------------------------------
*/

root.Additive = function (A, B) { //+
	var C = A + B;
	return (C > 0xFF) ? 0xFF : C;
};

root.Subtractive = function (A, B) { //+
	var C = A + B - 256;
	return (C < 0x00) ? 0x00 : C;
};

root.Subtract = function (A, B) { //+
	var C = A - B;
	return (C < 0x00) ? 0x00 : C;
};

root.Stamp = function (A, B) { //+
	var C = A + 2 * B - 256;
	return (C < 0x00) ? 0x00 : (C > 0xFF) ? 0xFF : C;
};

(function() {
	var r_cos = [];
	var PI = Math.PI / 0xFF;
	for (var i = 0; i < 256; i++) {
		r_cos[i] = Math.round(64 - Math.cos(i * PI) * 64);
	}
	root.Interpolation = function (A, B) { //+
		var C = r_cos[B] + r_cos[A];
		return (C > 0xFF) ? 0xFF : C;
	};
})();

root.Divide = function (A, B) { //+
	return Math.min(0xFF, (A * 256) / (B + 1));
};

/*
	----------------------------------------------------------
	LOGIC
	----------------------------------------------------------
*/

root.XOR = function (A, B) { //+
	return A ^ B;
};

root.AND = function (A, B) { //+
	return A & B;
};

root.OR = function (A, B) { //+
	return A | B;
};

/*
	----------------------------------------------------------
	UTILITIES
	----------------------------------------------------------
*/

root.createKernals = function () {
	var modes = {};
	for (var key in root.modes) {
		for (var name in root.modes[key]) {
			modes[root.modes[key][name]] = true;
		}
	}
	var blendmodes = [];
	for (var key in modes) {
		var blend = String(root[key.split(" ").join("")]);
		var isAlphaRequired = (blend.indexOf("function (A, B)") === -1);
		var text = blend.substr(blend.indexOf("{") + 1);
		text = text.substr(0, text.lastIndexOf("}"));
		text = text.replace("//+", "");
		if (isAlphaRequired) {
			var bit = text.split("src.A").join("sA");
			bit = bit.split("src.R").join("sR");
			bit = bit.split("src.G").join("sG");
			bit = bit.split("src.B").join("sB");
			bit = bit.split("dst.A").join("dA");
			bit = bit.split("dst.R").join("dR");
			bit = bit.split("dst.G").join("dG");
			bit = bit.split("dst.B").join("dB");
			bit = bit.split("return ", "var hex = ");
			blendmodes.push("Color.Blend['_"+key.split(" ").join("")+"'] = function(src, dst, preserveAlpha) {"+
			"	var data1 = src.data, data2 = dst.data;"+
			"	var length = data1.length;"+
			"	for (var n = 0; n < length; n += 4) {"+
			"		var sR = data1[n], sG = data1[n+1], sB = data1[n+2], sA = data1[n+3];"+
			"		var dR = data2[n], dG = data2[n+1], dB = data2[n+2], dA = data2[n+3];"+
			bit +
			"		if (sA > 0) {"+
			"			data2[n] = hex >>> 16 & 0xFF;"+
			"			data2[n + 1] = hex >>> 8 & 0xFF;"+
			"			data2[n + 2] = hex & 0xFF;"+
			"			if (!preserveAlpha) data2[n + 3] = hex >>> 24;"+
			"		} else {"+
			"			data2[n] = dR;"+
			"			data2[n + 1] = dG;"+
			"			data2[n + 2] = dB;"+
			"			data2[n + 3] = dA;"+
			"		}"+
			"	}" +
			"return dst;" +
			"};");
		} else { // rgb blending
			var rbit = text.split("B").join("dR");
			rbit = rbit.split("A").join("sR");
			rbit = rbit.split("return ").join("data2[n] = ");
			var gbit = text.split("B").join("dG");
			gbit = gbit.split("A").join("sG");
			gbit = gbit.split("return ").join("data2[n + 1] = ");
			var bbit = text.split("B").join("dB");
			bbit = bbit.split("A").join("sB");
			bbit = bbit.split("return ").join("data2[n + 2] = ");
			blendmodes.push("Color.Blend['_"+key.split(" ").join("")+"'] = function(src, dst) {"+
			"	var data1 = src.data, data2 = dst.data;"+
			"	var length = data1.length;"+
			"	for (var n = 0; n < length; n += 4) {"+
			"		var sR = data1[n], sG = data1[n+1], sB = data1[n+2], sA = data1[n+3];"+
			"		var dR = data2[n], dG = data2[n+1], dB = data2[n+2], dA = data2[n+3];"+
			"		if (sA > 0) {"+
			rbit +
			gbit +
			bbit +
			"			data2[n + 3] = sA;"+
			"		} else {"+
			"			data2[n] = dR;"+
			"			data2[n + 1] = dG;"+
			"			data2[n + 2] = dB;"+
			"			data2[n + 3] = dA;"+
			"		}"+
			"	}"+
			"return dst;" +
			"};");
		}
	};
	///
	return blendmodes.join("\r");
};

return root;

})(Color.Blend);
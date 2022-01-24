var createTexture = (function() {
	var canvas = document.createElement("canvas");
	var ctx = canvas.getContext('2d');
	var image = new Image();
	///
	return function(src, callback) {
		BG.loader.message("loading...");
/*		if (src.substr(0, 5) === "data:") {
			image.onload = function() {
				ctx.drawImage(image, 0, 0);
				canvas.pattern = ctx.createPattern(image, "repeat");
				if (callback) callback(canvas);
			};
			image.src = src;			
			return canvas;
		}*/
		image = new Image();
		image.onload = function() {
			var width = image.width = this.width;
			var height = image.height = this.height;
			// lum in sRGB
			var lum = { r: 0.33, g: 0.33, b: 0.33 };
			var width = image.width
			var height = image.height
			// resize canvas
			canvas.width = width;
			canvas.height = height;
			// draw images
			ctx.drawImage(image, 0, 0, width, height);
			// get imageData
			var imageData = ctx.getImageData(0, 0, width, height);
			var src = imageData.data;
			var length = src.length;
			var light = 0;
			for (var n = 0; n < length; n += 4) {
				// Source #
				var r = src[n];
				var g = src[n + 1];
				var b = src[n + 2];
				var a = src[n + 3];
				// Source #2
				var R = light;
				var G = light;
				var B = light;
				// Apply effect to pixels (in this case Subtract)
				if (light) {
					var er = Math.min(255, r + R); // delete light colors
					var eg = Math.min(255, g + G);
					var eb = Math.min(255, b + B);
				} else {
					var er = Math.max(0, R < r ? R : r); // delete dark colors
					var eg = Math.max(0, G < g ? G : g);
					var eb = Math.max(0, B < b ? B : b);
				}
				// Remove color that would have otherwise been changed
				src[n] = 0;
				src[n + 1] = 0;
				src[n + 2] = 0;
				// Calculate amount of modification
				var mr = er - r;
				var mg = eg - g;
				var mb = eb - b;
				var ma = Math.abs(mr) * lum.r + Math.abs(mg) * lum.g + Math.abs(mb) * lum.b;
				// Combined alpha of changed pixels (erase)
				src[n + 3] = a - ma;
			}
			ctx.putImageData(imageData, 0, 0);
///			if (image.height !== 512) window.location = canvas.toDataURL();
			canvas.pattern = ctx.createPattern(canvas, "repeat");
			///
			canvas.style.cssText = "z-index: 1000; position: absolute; right: 0;";
//			document.body.appendChild(canvas);
			///
			if (callback) callback(canvas);
			///
			BG.loader.stop();
		};
		image.src = src;
		return canvas;
	};
})();

var textures = [
	"textures/texturise/wood_001.jpeg",
	"textures/texturise/wood_002.jpeg",
	"textures/texturise/wood_003.jpeg",
	"textures/texturise/wood_004.jpeg",
	"textures/texturise/wood_005.jpeg",
	"textures/texturise/wood_006.jpeg",
	"textures/texturise/wood_007.jpeg",
	"textures/texturise/wood_008.jpeg",
	"textures/texturise/wood_009.jpeg",
	"textures/texturise/wood_010.jpeg",
	"textures/texturise/wood_011.jpeg",
	"textures/texturise/wood_012.jpeg",
	"textures/texturise/wood_013.jpeg",
	"textures/texturise/wood_014.jpeg",
	"textures/texturise/wood_015.jpeg",
	"textures/texturise/rust_001.jpeg",
	"textures/texturise/rust_002.jpeg",
	"textures/texturise/rust_003.jpeg",
	"textures/texturise/rocks_001.jpeg",
	"textures/texturise/rocks_002.jpeg",
	"textures/texturise/rocks_003.jpeg",
	"textures/texturise/rocks_004.jpeg",
	"textures/texturise/rocks_005.jpeg",
	"textures/texturise/rocks_006.jpeg",
	"textures/texturise/rocks_007.jpeg",
	"textures/texturise/rocks_008.jpeg",
	"textures/texturise/rocks_009.jpeg",
	"textures/texturise/rocks_010.jpeg",
	"textures/texturise/rocks_011.jpeg",
	"textures/texturise/plastic_001.jpeg",
	"textures/texturise/plastic_002.jpeg",
	"textures/texturise/plastic_003.jpeg",
	"textures/texturise/plastic_004.jpeg",
	"textures/texturise/plastic_005.jpeg",
	"textures/texturise/plastic_006.jpeg",
	"textures/texturise/plastic_007.jpeg",
	"textures/texturise/plastic_008.jpeg",
	"textures/texturise/plastic_009.jpeg",
	"textures/texturise/plastic_010.jpeg",
	"textures/texturise/plastic_011.jpeg",
	"textures/texturise/plastic_012.jpeg",
	"textures/texturise/plastic_013.jpeg",
	"textures/texturise/paper_001.jpeg",
	"textures/texturise/paper_002.jpeg",
	"textures/texturise/paper_003.jpeg",
	"textures/texturise/paper_004.jpeg",
	"textures/texturise/paper_005.jpeg",
	"textures/texturise/paper_006.jpeg",
	"textures/texturise/paper_007.jpeg",
	"textures/texturise/paper_008.jpeg",
	"textures/texturise/paper_009.jpeg",
	"textures/texturise/paper_010.jpeg",
	"textures/texturise/paper_011.jpeg",
	"textures/texturise/paper_012.jpeg",
	"textures/texturise/paper_013.jpeg",
	"textures/texturise/paper_014.jpeg",
	"textures/texturise/paper_015.jpeg",
	"textures/texturise/paper_016.jpeg",
	"textures/texturise/paper_017.jpeg",
	"textures/texturise/paper_018.jpeg",
	"textures/texturise/paper_019.jpeg",
	"textures/texturise/paper_020.jpeg",
	"textures/texturise/paper_021.jpeg",
	"textures/texturise/paper_022.jpeg",
	"textures/texturise/paper_023.jpeg",
	"textures/texturise/paper_024.jpeg",
	"textures/texturise/paint_001.jpeg",
	"textures/texturise/paint_002.jpeg",
	"textures/texturise/paint_003.jpeg",
	"textures/texturise/paint_004.jpeg",
	"textures/texturise/paint_005.jpeg",
	"textures/texturise/paint_006.jpeg",
	"textures/texturise/paint_007.jpeg",
	"textures/texturise/paint_008.jpeg",
	"textures/texturise/paint_009.jpeg",
	"textures/texturise/paint_010.jpeg",
	"textures/texturise/paint_011.jpeg",
	"textures/texturise/fabric_001.jpeg",
	"textures/texturise/fabric_002.jpeg",
	"textures/texturise/fabric_003.jpeg",
	"textures/texturise/fabric_004.jpeg",
	"textures/texturise/fabric_005.jpeg",
	"textures/texturise/fabric_006.jpeg",
	"textures/texturise/concrete_001.jpeg",
	"textures/texturise/concrete_002.jpeg",
	"textures/texturise/concrete_003.jpeg",
	"textures/texturise/concrete_004.jpeg",
	"textures/texturise/concrete_005.jpeg",
	"textures/texturise/concrete_006.jpeg",
	"textures/texturise/concrete_007.jpeg",
	"textures/texturise/concrete_008.jpeg",
	"textures/texturise/concrete_009.jpeg",
	"textures/texturise/concrete_010.jpeg",
	"textures/texturise/concrete_011.jpeg",
	"textures/texturise/concrete_013.jpeg",
	"textures/texturise/concrete_014.jpeg"
];
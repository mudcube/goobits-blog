marqueeID = false;
mixin = function (o) {
	var len = arguments.length;
	for (var i = 1; i < len; i++)
		for (var j in arguments[i])
			o[j] = arguments[i][j];
	return o;
};
var dtx2D = document.createElement("canvas");
var ctx2D;
try { ctx2D = dtx2D.getContext('2d'); } catch (e) {}
var data2pattern = function (obj, data) {
	if (ctx2D == null) ctx2D = dtx2D.getContext('2d');

	function createPattern(src, id) {
		var image = new Image();
		image.onload = function () {
			obj[id] = ctx2D.createPattern(image, "repeat");
		};
		image.src = src;
	};
	for (var key in data) {
		createPattern(data[key], key);
	}
};
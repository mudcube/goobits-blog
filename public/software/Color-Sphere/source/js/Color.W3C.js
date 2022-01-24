///------ Color.Accessibility

if (!window.Color) Color = {};

(function() {

var root = Color.W3C = { // W3C specs
    getBrightness: function (a, b) { // color brightness >= 125.
        var aa = ((a.R * 299) + (a.G * 587) + (a.B * 114)) / 1000;
        var bb = ((b.R * 299) + (b.G * 587) + (b.B * 114)) / 1000;
        return Math.abs(aa - bb);
    },
    getDifference: function (a, b) { // color difference >= 500
        var r = Math.max(a.R, b.R) - Math.min(a.R, b.R);
        var g = Math.max(a.G, b.G) - Math.min(a.G, b.G);
        var b = Math.max(a.B, b.B) - Math.min(a.B, b.B);
        return r + g + b;
    },
	test: function(rgb1, rgb2) {
		var brightness = root.getBrightness(rgb1, rgb2) < 125;
		var difference = root.getDifference(rgb1, rgb2) < 500;
		return brightness && difference;
	}
};

})();
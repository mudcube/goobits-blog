(function () {

style = {};
style.textMetrics = {data: {}};
style.padLeft = 18;
style.padTop = 18;
style.padRight = 18;
style.padBottom = 18;
style.lineHeight = 14;
style.fontSize = 13;
///
textInPath = function(ctx) {
	/// search by pixelData, isPointInPath, line-intersection?
	///
	var perf = Galactic.perf();
	///
	var fontSize = style.fontSize;
	var text = ("Color or colour (see spelling differences) is the visual perceptual property corresponding in humans to the categories called red, blue, yellow, green and others. Color derives from the spectrum of light (distribution of light power versus wavelength) interacting in the eye with the spectral sensitivities of the light receptors. Color categories and physical specifications of color are also associated with objects or materials based on their physical properties such as light absorption, reflection, or emission spectra. By defining a color space, colors can be identified numerically by their coordinates. Because perception of color stems from the varying spectral sensitivity of different types of cone cells in the retina to different parts of the spectrum, colors may be defined and quantified by the degree to which they stimulate these cells. These physical or physiological quantifications of color, however, do not fully explain the psychophysical perception of color appearance. The science of color is sometimes called chromatics, chromatography, colorimetry, or simply color science. It includes the perception of color by the human eye and brain, the origin of color in materials, color theory in art, and the physics of electromagnetic radiation in the visible range (that is, what we commonly refer to simply as light). Electromagnetic radiation is characterized by its wavelength (or frequency) and its intensity. When the wavelength is within the visible spectrum (the range of wavelengths humans can perceive, approximately from 390 nm to 700 nm), it is known as \"visible light\"." +
				" Although Aristotle and other ancient scientists had already written on the nature of light and color vision, it was not until Newton that light was identified as the source of the color sensation. In 1810, Goethe published his comprehensive Theory of Colors in which he ascribed physiological effects to color that are now understood as psychological." +
				" In 1801 Thomas Young proposed his trichromatic theory, based on the observation that any color could be matched with a combination of three lights. This theory was later refined by James Clerk Maxwell and Hermann von Helmholtz. As Helmholtz puts it, \"the principles of Newton's law of mixture were experimentally confirmed by Maxwell in 1856. Young's theory of color sensations, like so much else that this marvelous investigator achieved in advance of his time, remained unnoticed until Maxwell directed attention to it.\"[5]" +
				" At the same time as Helmholtz, Ewald Hering developed the opponent process theory of color, noting that color blindness and afterimages typically come in opponent pairs (red-green, blue-orange, yellow-violet, and black-white). Ultimately these two theories were synthesized in 1957 by Hurvich and Jameson, who showed that retinal processing corresponds to the trichromatic theory, while processing at the level of the lateral geniculate nucleus corresponds to the opponent theory.[6]" +
				" In 1931, an international group of experts known as the Commission internationale de l'éclairage (CIE) developed a mathematical color model, which mapped out the space of observable colors and assigned a set of three numbers to each." +
				" Most light sources are mixtures of various wavelengths of light. Many such sources can still effectively produce a spectral color, as the eye cannot distinguish them from single-wavelength sources. For example, most computer displays reproduce the spectral color orange as a combination of red and green light; it appears orange because the red and green are mixed in the right proportions to allow the eye's cones to respond the way they do to the spectral color orange." +
				" A useful concept in understanding the perceived color of a non-monochromatic light source is the dominant wavelength, which identifies the single wavelength of light that produces a sensation most similar to the light source. Dominant wavelength is roughly akin to hue." +
				" There are many color perceptions that by definition cannot be pure spectral colors due to desaturation or because they are purples (mixtures of red and violet light, from opposite ends of the spectrum). Some examples of necessarily non-spectral colors are the achromatic colors (black, gray, and white) and colors such as pink, tan, and magenta." +
				" Two different light spectra that have the same effect on the three color receptors in the human eye will be perceived as the same color. They are metamers of that color. This is exemplified by the white light emitted by fluorescent lamps, which typically has a spectrum of a few narrow bands, while daylight has a continuous spectrum. The human eye cannot tell the difference between such light spectra just by looking into the light source, although reflected colors from objects can look different. (This is often exploited; for example, to make fruit or tomatoes look more intensely red.)" +
				" Similarly, most human color perceptions can be generated by a mixture of three colors called primaries. This is used to reproduce color scenes in photography, printing, television, and other media. There are a number of methods or color spaces for specifying a color in terms of three particular primary colors. Each method has its advantages and disadvantages depending on the particular application." +
				" No mixture of colors, however, can produce a response truly identical to that of a spectral color, although one can get close, especially for the longer wavelengths, where the CIE 1931 color space chromaticity diagram has a nearly straight edge. For example, mixing green light (530 nm) and blue light (460 nm) produces cyan light that is slightly desaturated, because response of the red color receptor would be greater to the green and blue light in the mixture than it would be to a pure cyan light at 485 nm that has the same intensity as the mixture of blue and green." +
				" Because of this, and because the primaries in color printing systems generally are not pure themselves, the colors reproduced are never perfectly saturated spectral colors, and so spectral colors cannot be matched exactly. However, natural scenes rarely contain fully saturated colors, thus such scenes can usually be approximated well by these systems. The range of colors that can be reproduced with a given color reproduction system is called the gamut. The CIE chromaticity diagram can be used to describe the gamut." +
				" Another problem with color reproduction systems is connected with the acquisition devices, like cameras or scanners. The characteristics of the color sensors in the devices are often very far from the characteristics of the receptors in the human eye. In effect, acquisition of colors can be relatively poor if they have special, often very \"jagged\", spectra caused for example by unusual lighting of the photographed scene. A color reproduction system \"tuned\" to a human with normal color vision may give very inaccurate results for other observers." +
				" The different color response of different devices can be problematic if not properly managed. For color information stored and transferred in digital form, color management techniques, such as those based on ICC profiles, can help to avoid distortions of the reproduced colors. Color management does not circumvent the gamut limitations of particular output devices, but can assist in finding good mapping of input colors into the gamut that can be reproduced.").split(" ").join("- -").split("-");
	var textWord = text[0];
	var textPos = 0;
	var textLength = text.length - 1;
	var textWidth = 0;
	var lineHeight = style.lineHeight// - app.lineHeight%2;
	var lineHasText = false;
	var lineIsActive = false;
	var padding = 5;
	var padTop = style.padTop >> 0;
	var padLeft = style.padLeft >> 0;
	var padRight = style.padRight >> 0;
	var padBottom = style.padBottom >> 0;
	var width = window.innerWidth;
	var height = window.innerHeight;
	var size = width * height;
	var truthy;
	///
	ctx.canvas.width = width;
	ctx.canvas.height = height;
	ctx.canvas.style.background = "#f00";
	///
	ctx.textBaseline = "top";
	ctx.textAlign = "left";
	ctx.font = "normal " + fontSize + "px arial";
	///
	ctx.stroke();
	ctx.fill();
	///
	ctx.moveTo(0, padTop);
	ctx.lineTo(99999, padTop);
	ctx.moveTo(0, height - padBottom);
	ctx.lineTo(99999, height - padBottom);
	ctx.moveTo(padLeft, 0);
	ctx.lineTo(padLeft, 99999);
	ctx.moveTo(width - padRight, 0);
	ctx.lineTo(width - padRight, 99999);
	ctx.stroke();
	///
	ctx.save();
	ctx.rect(0, 0, width, height);
	ctx.clip();
	///
	setupPath(ctx);
	///
	ctx.fillStyle = "black";
	///
	textWidth = Math.round(ctx.measureText(text[textPos]).width);
	///
	var textMetrics = style.textMetrics;
	if (textMetrics.fontSize !== fontSize) {
		textMetrics = style.textMetrics = {
			fontSize: fontSize,
			data: {}
		};
	}
	///
	var pixelData = style.pixelData || (style.pixelData = ctx.getImageData(0, 0, width, height));
	var data = pixelData.data;
	var scanHeight = Math.max(lineHeight, fontSize);
	for (var n = 0; /*padTop * width;*/ n < size; n ++) {
		var x = n % width;
		var y = n / width >> 0;
		///
		if (textPos > textLength) {
			break;
		}
		///
		if (lineIsActive === false) {
			if (textWord === " ") {
				textWord = text[++textPos];
				textWidth = textMetrics.data[textPos] || (textMetrics.data[textPos] = Math.round(ctx.measureText(textWord).width));
			}
		}
		///
		/*if (x < padLeft) { // less than min-x (to min-x)
			n = y * width + padLeft;
			continue;
		} else*/ if (x + textWidth > width) { // greater than total width (to next line)
			n = Math.round(y + lineHeight) * width;
			lineHasText = false;
			lineIsActive = false;
			continue;
		} else if (data[n * 4 + 3]) { // is in path
			for (var ty = 0; ty < scanHeight; ty ++) { // vertical scan
				if (!(truthy = !!data[(n + ty * width) * 4 + 3])) { // top point
					break;
				}
			}
			///
			if (truthy) {
				var offsetX = lineIsActive ? 0 : padLeft;
				var endX = textWidth + offsetX;
				for (var tx = 0; tx < endX+padRight; tx ++) { // horizontal scan
					if (!(truthy = !!data[(n + tx) * 4 + 3])) { // top point
						break;
					}
					if (!(truthy = !!data[(n + tx + ty * width) * 4 + 3])) { // bottom point
						break;
					}
//					if (!(truthy = !!data[(n + tx + (ty - ty % 2) * width / 2) * 4 + 3])) { // middle point
//						break;
//					}
				}
				///
				tx = endX;
				if (truthy) { // draw text
					lineHasText = true;
					lineIsActive = true;
					ctx.fillStyle = "black";
					ctx.fillText(textWord, x + offsetX, y);
					ctx.fillStyle = "rgba(0,255,0,0.25)";
					ctx.fillRect(x + offsetX, y, textWidth, Math.min(lineHeight, fontSize));
					x = x + endX - 1; // skip forwards x
					n = y * width + x;
					textWord = text[++textPos];
					textWidth = textMetrics.data[textPos] || (textMetrics.data[textPos] = Math.round(ctx.measureText(textWord).width));
				} else {
					lineIsActive = false;
				}
			} else {
				lineIsActive = false;
			}
		}
		///
		///
		if (x >= width - 1) {
			if (lineHasText) { // skip forwards y
				n = Math.round(y + lineHeight) * width;
				lineHasText = false;
				lineIsActive = false;
			}
		}
	}
	///
	console.log(perf() + "ms");
};

var getGradient2 = function(ctx) {
	var grd = ctx.createLinearGradient(300, 250, 100, 450);
	grd.addColorStop(0, "#2FA1D6");
	grd.addColorStop(1, "#ff0000");
	return grd;
};

var setupPath = function(ctx) {
	ctx.beginPath();
//	ctx.rect(0, 0, 1000, 1000)
//	ctx.fill();
	ctx.fillStyle = getGradient2(ctx);
	ctx.save();
	sketch.shapes.star(ctx, 300, 300, 300, 5, 1.5)
//	sketch.shapes.burst(ctx, 150, 650, 150, 5, 0.75)
//	sketch.shapes.burst(ctx, 550, 650, 350, 5, 2.75)
	ctx.closePath();
	ctx.translate(100, 100)
//	ctx.arc(850, 550, 240, 0, Math.PI*2, 0);
	ctx.closePath();
	ctx.translate(450, -180)
	ctx.scale(4, 4);
    ctx.moveTo(75,40);
    ctx.bezierCurveTo(75,37,70,25,50,25);
    ctx.bezierCurveTo(20,25,20,62.5,20,62.5);
    ctx.bezierCurveTo(20,80,40,102,75,120);
    ctx.bezierCurveTo(110,102,130,80,130,62.5);
    ctx.bezierCurveTo(130,62.5,130,25,100,25);
    ctx.bezierCurveTo(85,25,75,37,75,40);
	ctx.closePath();
	ctx.lineWidth = 0.5;
	ctx.stroke();
	ctx.fill();
	ctx.restore();
};

})();
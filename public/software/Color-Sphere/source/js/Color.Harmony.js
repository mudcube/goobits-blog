/*

	Color Harmony : v0.2 : 2008.07.09
	———————————————————————————————————————————
	Compliment, Neutral, Analogous, Triad, Tetrad, Four-Tone, Five-Tone, Six-Tone, Clash,
	Complimentary, Split-Complimentary, Left-Complimentary, Right-Complimentary, Compound & Blender

*/

if (typeof(Color)=="undefined") Color = {};
if (typeof(Color.Harmony)=="undefined") Color.Harmony = {};

Color.Harmony.data = {

	'Neutral':[0,15,30,45,60,75],
	'Analogous':[0,30,60,90,120,150],
	'Clash':[0,90,270],
	'Complementary':[0,180],
	'Split-Complementary':[0,150,210],
	'Triadic':[0,120,240],
	'Tetradic':[0,90,180,270],
	'Four-Tone':[0,60,180,240],
	'Five-Tone':[0,115,155,205,245],
	'Six-Tone':[0,30,120,150,240,270] };

Color.Harmony.scheme = function(o, data) { var r=[], j=0;

	for(var i in data) r[j++] = { H: (o.H+data[i])%360, S: o.S, L: o.L };
	
	return r;

};

Color.Harmony.rotate = function(o,n) { n=(o.H+n)%360;

	return { H: n>0?n:n+360, S: o.S, L: o.L };

};
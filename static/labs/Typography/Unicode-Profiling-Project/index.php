<?php

function getIP() {
	if (!empty($_SERVER['HTTP_CLIENT_IP'])) { // check ip from share internet
		$ip = $_SERVER['HTTP_CLIENT_IP'];
	} else if(!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) { // to check ip is pass from proxy
		$ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
	} else {
		$ip = $_SERVER['REMOTE_ADDR'];
	}
	return $ip;
};

if ($_REQUEST['speed'] && $_REQUEST['unicode']) {
	$myFile = "getUnicodeSupport.txt";
	$fh = fopen($myFile, "a") or die("can't open file");
	$json = Array(
		"speed"=>$_REQUEST['speed'],
		"unicode"=>$_REQUEST['unicode'],
		"ip"=>getIP(),
		"userAgent"=>$_SERVER['HTTP_USER_AGENT'],
		"language"=>$_SERVER['HTTP_ACCEPT_LANGUAGE']	
	);
	fwrite($fh, json_encode($json) . "\n");
	fclose($fh);
	return;
}

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns = "http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>Unicode Profiling Project</title>
<script>

/*

Find supported unicodes within a unicode block:
Create a hash of the symbol to check against in the default font
The default font must cover the entire unicode block range (we'd need to do research for blocks and fonts that cover them, and they're statistic availability), otherwise false negatives will occur.
Compare text of defaultHash vs. new one, if it's changed, the specific character is supported.
2x processing time as basic unicode detection
...
a perk for helping with the statistic analysis is a unicode character selector (ScrollView/TiledLayer copy unicode to clipboard)
store encoded binary in localStorage
...
isFontSupported: grab list from Flash plugin of installed fonts, check in <canvas> report availability in Flash and <canvas> -- return information to server along with system/browser/language information

*/

// osx: 
// safari: 49,493 available - [size:11,24] - NOTE:  n/a
// firefox 3.6: 49,428 available - [size:11] - NOTE:  each undefined symbol has a unique hash unless text size is <=11
// google chrome 7: 49,493 available - [size:11,24] - NOTE:  n/a
// chromium 8: 49,494 available - [size:11,24] - NOTE:  n/a
// opera 10.6: 47,672 available - [size:24] - NOTE:  supports different fonts in <canvas> than regular DOM

// windows:
// ie9: 50,826 available - [size:10,24] - NOTE:  some false positives... each range has it's own undefined symbol
// firefox 3.6: 51,208 available - [size:10] - NOTE:  each undefined symbol has a unique hash unless text size is <=10
// google chrome 7: 47,267 available - [size:10] - NOTE:  <textarea>&#64575;</textarea> gives different results than &#64575
// opera 10.6: 56,024 available - [size:24] - NOTE:  supports different fonts in <canvas> than regular DOM... also, more fonts than others by far, included in package?

var ranges = [
	[ "Basic Latin", "0x0000", "0x007F", "128" ],
	[ "Latin-1 Supplement", "0x0080", "0x00FF", "128" ],
	[ "Latin Extended-A", "0x0100", "0x017F", "128" ],
	[ "Latin Extended-B", "0x0180", "0x024F", "208" ],
	[ "IPA Extensions", "0x0250", "0x02AF", "96" ],
	[ "Spacing Modifier Letters", "0x02B0", "0x02FF", "80" ],
	[ "Combining Diacritical Marks", "0x0300", "0x036F", "112" ],
	[ "Greek and Coptic", "0x0370", "0x03FF", "134" ],
	[ "Cyrillic", "0x0400", "0x04FF", "256" ],
	[ "Cyrillic Supplement", "0x0500", "0x052F", "40" ],
	[ "Armenian", "0x0530", "0x058F", "86" ],
	[ "Hebrew", "0x0590", "0x05FF", "87" ],
	[ "Arabic", "0x0600", "0x06FF", "252" ],
	[ "Syriac", "0x0700", "0x074F", "77" ],
	[ "Arabic Supplement", "0x0750", "0x077F", "48" ],
	[ "Thaana", "0x0780", "0x07BF", "50" ],
	[ "NKo", "0x07C0", "0x07FF", "59" ],
	[ "Samaritan", "0x0800", "0x083F", "61" ],
	[ "Mandaic", "0x0840", "0x085F", "29" ],
	[ "Devanagari", "0x0900", "0x097F", "127" ],
	[ "Bengali", "0x0980", "0x09FF", "92" ],
	[ "Gurmukhi", "0x0A00", "0x0A7F", "79" ],
	[ "Gujarati", "0x0A80", "0x0AFF", "83" ],
	[ "Oriya", "0x0B00", "0x0B7F", "90" ],
	[ "Tamil", "0x0B80", "0x0BFF", "72" ],
	[ "Telugu", "0x0C00", "0x0C7F", "93" ],
	[ "Kannada", "0x0C80", "0x0CFF", "86" ],
	[ "Malayalam", "0x0D00", "0x0D7F", "98" ],
	[ "Sinhala", "0x0D80", "0x0DFF", "80" ],
	[ "Thai", "0x0E00", "0x0E7F", "87" ],
	[ "Lao", "0x0E80", "0x0EFF", "65" ],
	[ "Tibetan", "0x0F00", "0x0FFF", "211" ],
	[ "Myanmar", "0x1000", "0x109F", "160" ],
	[ "Georgian", "0x10A0", "0x10FF", "83" ],
	[ "Hangul Jamo", "0x1100", "0x11FF", "256" ],
	[ "Ethiopic", "0x1200", "0x137F", "358" ],
	[ "Ethiopic Supplement", "0x1380", "0x139F", "26" ],
	[ "Cherokee", "0x13A0", "0x13FF", "85" ],
	[ "Unified Canadian Aboriginal Syllabics", "0x1400", "0x167F", "640" ],
	[ "Ogham", "0x1680", "0x169F", "29" ],
	[ "Runic", "0x16A0", "0x16FF", "81" ],
	[ "Tagalog", "0x1700", "0x171F", "20" ],
	[ "Hanunoo", "0x1720", "0x173F", "23" ],
	[ "Buhid", "0x1740", "0x175F", "20" ],
	[ "Tagbanwa", "0x1760", "0x177F", "18" ],
	[ "Khmer", "0x1780", "0x17FF", "114" ],
	[ "Mongolian", "0x1800", "0x18AF", "156" ],
	[ "Unified Canadian Aboriginal Syllabics Extended", "0x18B0", "0x18FF", "70" ],
	[ "Limbu", "0x1900", "0x194F", "66" ],
	[ "Tai Le", "0x1950", "0x197F", "35" ],
	[ "New Tai Lue", "0x1980", "0x19DF", "83" ],
	[ "Khmer Symbols", "0x19E0", "0x19FF", "32" ],
	[ "Buginese", "0x1A00", "0x1A1F", "30" ],
	[ "Tai Tham", "0x1A20", "0x1AAF", "127" ],
	[ "Balinese", "0x1B00", "0x1B7F", "121" ],
	[ "Sundanese", "0x1B80", "0x1BBF", "55" ],
	[ "Batak", "0x1BC0", "0x1BFF", "56" ],
	[ "Lepcha", "0x1C00", "0x1C4F", "74" ],
	[ "Ol Chiki", "0x1C50", "0x1C7F", "48" ],
	[ "Vedic Extensions", "0x1CD0", "0x1CFF", "35" ],
	[ "Phonetic Extensions", "0x1D00", "0x1D7F", "128" ],
	[ "Phonetic Extensions Supplement", "0x1D80", "0x1DBF", "64" ],
	[ "Combining Diacritical Marks Supplement", "0x1DC0", "0x1DFF", "43" ],
	[ "Latin Extended Additional", "0x1E00", "0x1EFF", "256" ],
	[ "Greek Extended", "0x1F00", "0x1FFF", "233" ],
	[ "General Punctuation", "0x2000", "0x206F", "107" ],
	[ "Superscripts and Subscripts", "0x2070", "0x209F", "42" ],
	[ "Currency Symbols", "0x20A0", "0x20CF", "26" ],
	[ "Combining Diacritical Marks for Symbols", "0x20D0", "0x20FF", "33" ],
	[ "Letterlike Symbols", "0x2100", "0x214F", "80" ],
	[ "Number Forms", "0x2150", "0x218F", "58" ],
	[ "Arrows", "0x2190", "0x21FF", "112" ],
	[ "Mathematical Operators", "0x2200", "0x22FF", "256" ],
	[ "Miscellaneous Technical", "0x2300", "0x23FF", "244" ],
	[ "Control Pictures", "0x2400", "0x243F", "39" ],
	[ "Optical Character Recognition", "0x2440", "0x245F", "11" ],
	[ "Enclosed Alphanumerics", "0x2460", "0x24FF", "160" ],
	[ "Box Drawing", "0x2500", "0x257F", "128" ],
	[ "Block Elements", "0x2580", "0x259F", "32" ],
	[ "Geometric Shapes", "0x25A0", "0x25FF", "96" ],
	[ "Miscellaneous Symbols", "0x2600", "0x26FF", "256" ],
	[ "Dingbats", "0x2700", "0x27BF", "191" ],
	[ "Miscellaneous Mathematical Symbols-A", "0x27C0", "0x27EF", "46" ],
	[ "Supplemental Arrows-A", "0x27F0", "0x27FF", "16" ],
	[ "Braille Patterns", "0x2800", "0x28FF", "256" ],
	[ "Supplemental Arrows-B", "0x2900", "0x297F", "128" ],
	[ "Miscellaneous Mathematical Symbols-B", "0x2980", "0x29FF", "128" ],
	[ "Supplemental Mathematical Operators", "0x2A00", "0x2AFF", "256" ],
	[ "Miscellaneous Symbols and Arrows", "0x2B00", "0x2BFF", "87" ],
	[ "Glagolitic", "0x2C00", "0x2C5F", "94" ],
	[ "Latin Extended-C", "0x2C60", "0x2C7F", "32" ],
	[ "Coptic", "0x2C80", "0x2CFF", "121" ],
	[ "Georgian Supplement", "0x2D00", "0x2D2F", "38" ],
	[ "Tifinagh", "0x2D30", "0x2D7F", "57" ],
	[ "Ethiopic Extended", "0x2D80", "0x2DDF", "79" ],
	[ "Cyrillic Extended-A", "0x2DE0", "0x2DFF", "32" ],
	[ "Supplemental Punctuation", "0x2E00", "0x2E7F", "50" ],
	[ "CJK Radicals Supplement", "0x2E80", "0x2EFF", "115" ],
	[ "Kangxi Radicals", "0x2F00", "0x2FDF", "214" ],
	[ "Ideographic Description Characters", "0x2FF0", "0x2FFF", "12" ],
	[ "CJK Symbols and Punctuation", "0x3000", "0x303F", "64" ],
	[ "Hiragana", "0x3040", "0x309F", "93" ],
	[ "Katakana", "0x30A0", "0x30FF", "96" ],
	[ "Bopomofo", "0x3100", "0x312F", "41" ],
	[ "Hangul Compatibility Jamo", "0x3130", "0x318F", "94" ],
	[ "Kanbun", "0x3190", "0x319F", "16" ],
	[ "Bopomofo Extended", "0x31A0", "0x31BF", "27" ],
	[ "CJK Strokes", "0x31C0", "0x31EF", "36" ],
	[ "Katakana Phonetic Extensions", "0x31F0", "0x31FF", "16" ],
	[ "Enclosed CJK Letters and Months", "0x3200", "0x32FF", "254" ],
	[ "CJK Compatibility", "0x3300", "0x33FF", "256" ],
	[ "CJK Unified Ideographs Extension A", "0x3400", "0x4DBF", "6582" ],
	[ "Yijing Hexagram Symbols", "0x4DC0", "0x4DFF", "64" ],
	[ "CJK Unified Ideographs", "0x4E00", "0x9FFF", "20940" ],
	[ "Yi Syllables", "0xA000", "0xA48F", "1165" ],
	[ "Yi Radicals", "0xA490", "0xA4CF", "55" ],
	[ "Lisu", "0xA4D0", "0xA4FF", "48" ],
	[ "Vai", "0xA500", "0xA63F", "300" ],
	[ "Cyrillic Extended-B", "0xA640", "0xA69F", "80" ],
	[ "Bamum", "0xA6A0", "0xA6FF", "88" ],
	[ "Modifier Tone Letters", "0xA700", "0xA71F", "32" ],
	[ "Latin Extended-D", "0xA720", "0xA7FF", "129" ],
	[ "Syloti Nagri", "0xA800", "0xA82F", "44" ],
	[ "Common Indic Number Forms", "0xA830", "0xA83F", "10" ],
	[ "Phags-pa", "0xA840", "0xA87F", "56" ],
	[ "Saurashtra", "0xA880", "0xA8DF", "81" ],
	[ "Devanagari Extended", "0xA8E0", "0xA8FF", "28" ],
	[ "Kayah Li", "0xA900", "0xA92F", "48" ],
	[ "Rejang", "0xA930", "0xA95F", "37" ],
	[ "Hangul Jamo Extended-A", "0xA960", "0xA97F", "29" ],
	[ "Javanese", "0xA980", "0xA9DF", "91" ],
	[ "Cham", "0xAA00", "0xAA5F", "83" ],
	[ "Myanmar Extended-A", "0xAA60", "0xAA7F", "28" ],
	[ "Tai Viet", "0xAA80", "0xAADF", "72" ],
	[ "Ethiopic Extended-A", "0xAB00", "0xAB2F", "32" ],
	[ "Meetei Mayek", "0xABC0", "0xABFF", "56" ],
	[ "Hangul Syllables", "0xAC00", "0xD7AF", "2" ],
	[ "Hangul Jamo Extended-B", "0xD7B0", "0xD7FF", "72" ],
	[ "High Surrogates", "0xD800", "0xDB7F", "2" ],
	[ "High Private Use Surrogates", "0xDB80", "0xDBFF", "2" ],
	[ "Low Surrogates", "0xDC00", "0xDFFF", "2" ],
	[ "Private Use Area", "0xE000", "0xF8FF", "2" ],
	[ "CJK Compatibility Ideographs", "0xF900", "0xFAFF", "470" ],
	[ "Alphabetic Presentation Forms", "0xFB00", "0xFB4F", "58" ],
	[ "Arabic Presentation Forms-A", "0xFB50", "0xFDFF", "611" ],
	[ "Variation Selectors", "0xFE00", "0xFE0F", "16" ],
	[ "Vertical Forms", "0xFE10", "0xFE1F", "10" ],
	[ "Combining Half Marks", "0xFE20", "0xFE2F", "7" ],
	[ "CJK Compatibility Forms", "0xFE30", "0xFE4F", "32" ],
	[ "Small Form Variants", "0xFE50", "0xFE6F", "26" ],
	[ "Arabic Presentation Forms-B", "0xFE70", "0xFEFF", "141" ],
	[ "Halfwidth and Fullwidth Forms", "0xFF00", "0xFFEF", "225" ],
	[ "Specials", "0xFFF0", "0xFFFF", "5" ]
];

var defaultFont = "Arial";
var defaultFontSize = "57px";
var defaultOffsetX = 2;
var defaultOffsetY = 50;
var defaultText = undefined;
var canvas, ctx, width, height;

canvasHelper = {
	load: function(id, w, h) {
		if(document.getElementById(id)) {
			canvas = document.getElementById(id);
		} else {
			canvas = document.createElement("canvas");
			canvas.id = id;
			canvas.title = id;
			canvas.setAttribute("style", "display: ; background: #ffe; left: 400px");
			document.getElementById("content").appendChild(canvas);
			document.getElementById("content").appendChild(document.createElement("br"));
		}
		ctx = canvas.getContext("2d");
		canvas.width = width = w;
		canvas.height = height = h;
	},
	getHash: function(text) {
		if(!text) text = defaultText;
		ctx.clearRect(0, 0, width, height);
		ctx.fillText(text, defaultOffsetX, defaultOffsetY); 
		return canvas.toDataURL();
	}
};

if(!window.console) console={log:function(){}}

var unav = navigator.userAgent.toLowerCase();
var isOpera = unav.indexOf("opera") > -1;
var isMac = unav.indexOf("mac") > -1;
var UNICODEHTML = "<button value='Missing' onclick='displayMissing()' class='button'>Show Missing</button> <button value='Available' onclick='displayAvailable()' class='button'>Show Available (slow!)</button> <button value='Binary' onclick='displayBinary()' class='button'>Show Binary</button><br><br>";
var visibleText = [];
var missingText = [];
var missing = 0;
var speedText = "";

isUnicodeSupported = function(font) {
	if(position > 0) return;
	if(!font) font = defaultFont;
	console.log("Testing unicode support for " + font + "&hellip;");
	var time = (new Date()).getTime();
	// Create <canvas>
	var fontsize = isOpera ? 24 : (isMac ? 11 : 10);
	canvasHelper.load("unicodeSupport", fontsize * 2.6, fontsize * 2.6);
	defaultFontSize = fontsize + "px";
	defaultOffsetY = fontsize * 1.55;
	defaultOffsetX = fontsize * 0.78;
	// Check unicode support
	ctx.font = defaultFontSize + " " + font + ", " + defaultFont;
	ctx.fillStyle = "#000000";
	binary = "";
	var plus = 71;
	var position = 0;

	var lastHash = [];
	var filterHash = {};
	var exists = {};
	
	filterHash[canvasHelper.getHash(String.fromCharCode(0))] = { count: 1, ids: [0] }; // missing character
	filterHash[canvasHelper.getHash(String.fromCharCode(65533))] = { count: 1, ids: [65533] }; // missing character
	filterHash[canvasHelper.getHash(String.fromCharCode(65535))] = { count: 1, ids: [65535] }; // non-character

	var rangeid = 0;
	var range = -1;
	var rangeblock = undefined;

	var interval = function() {
		ptime = (new Date()).getTime();
		var bin = "";
		for(var n = position; n < position + plus; n ++) {
			defaultText = String.fromCharCode(n);
			if(n == 65535) {
				UNICODE.style.fontSize = "20px";
				UNICODE.innerHTML = UNICODEHTML;
				for(var key in filterHash) { // process and make sure characters are truely dead
					var thishash = filterHash[key];
					var ids = thishash.ids;
					for(var id in ids) {
						exists[ids[id]] = (thishash.count > 3) ? false : true;
					}
				}
				missing = 0;
				for(var key in exists) {
					if(exists[key]) {
						binary += "1";
						visibleText.push(String.fromCharCode(key));
					} else {
						missing ++;
						binary += "0";
						missingText.push(String.fromCharCode(key));
					}
				}
				var speed = -(time - (new Date()).getTime());
				speedText = speed + "ms";

				displayBinary();

				var iframe = document.createElement("iframe");
				iframe.onload = function() { document.body.removeChild(iframe); }
				iframe.src = "index.php?speed=" + speed + "&unicode=" + compressbinary(binary);
				document.body.appendChild(iframe);

				return;
			}
			if(n > range) { // next unicode block name
				var block = ranges[rangeid++];
				rangeblock = block[0] + " [" + block[1] + "&ndash;" + block[2] + " or " + addCommas(parseInt(block[2]) - parseInt(block[1])) + "]";
				range = parseInt(block[2]);
			}
			var hash = canvasHelper.getHash();
			if(filterHash[hash]) {
				filterHash[hash].count ++;
				filterHash[hash].ids.push(n);
				exists[n] = false;
				missing ++;
				bin += "0";
			} else if(lastHash == hash) { 
				filterHash[hash] = { 
					count: 1,
					ids: [ n, n-1 ] 
				};
				exists[n] = false;
				missing ++;
				bin += "0";
			} else {
				lastHash = hash;
				exists[n] = true;
				bin += "1";
			}
		}
		position = n;
		UNICODE.style.fontSize = "48px";
		UNICODE.innerHTML = "" +
			"<span style='font-size: 20px'>calculating = " + n + " of " + 65535 + "<br>" + 
			"unicode block = " + rangeblock + "<br>"+
			"total time = " + -(time - (new Date()).getTime()) + "ms<br>"+
			"cycle = " + -(ptime - (new Date()).getTime()) + "ms<br>" + 
			"missing = " + missing + "<br>" +
			"binary += " + bin + "<br>" +
			"</span><br><div style='margin: 65px 0 0 40px; font-size: 190px; color: #"+(bin.substr(bin.length-1)=="1"?"000000":"FF0000")+"'>" + defaultText + "</div>";
		setTimeout(interval, 0);
	};
	interval();
}

window.onload = function() {
	UNICODE = document.getElementById("UNICODE");
	document.getElementById("tests").style.display = "none";
	TEST = document.getElementById("TEST");
	TEST.setAttribute("style", " height: 400px; width: 98%; font-size: 20px;")
	TEST2 = document.getElementById("TEST2");
	TEST2.setAttribute("style", " height: 700px; margin-top: 5px; width: 98%; font-size: 500px;")
	canvasHelper.load("unicodeSupport", 10, 10);
	var toDataURL = canvas.toDataURL ? true : false;
	if (toDataURL) {
		toDataURL = canvas.toDataURL();
		toDataURL = (!toDataURL || toDataURL == "data:,") ? false : true;
	}
	if(!toDataURL) {
		document.getElementById("profile").style.display = "none";
		document.getElementById("about").innerHTML += "<li>You're browser doesn't support canvas.toDataURL()";
	}
	if(!ctx.fillText) {
		document.getElementById("profile").style.display = "none";
		document.getElementById("about").innerHTML += "<li>You're browser doesn't support ctx.fillText()";
	}
};

displayAvailable = function() {
	UNICODE.innerHTML = UNICODEHTML + addCommas(65535 - missing) + " available symbols in &lt;canvas&gt;<br><br>";
	TEST.value = visibleText.join(", ");
	document.getElementById("tests").style.display = "block";
};

displayMissing = function() {
	UNICODE.innerHTML = UNICODEHTML + addCommas(missing) + " missing symbols (or non-visible) in &lt;canvas&gt;<br><br>";
	TEST.value = missingText.join(", ");
	document.getElementById("tests").style.display = "block";
};

displayBinary = function() {
	UNICODE.innerHTML = UNICODEHTML + addCommas(missing) + " missing (or non-visible) // " + addCommas(65535 - missing) + " available // found in " + speedText + "<br><br>The following binary string represents each position in the unicode set, and it&rsquo;s availability:<br><br>"
	TEST.value = binary;
	document.getElementById("tests").style.display = "block";
};

function compressbinary(binary) { // compress binary string
	var cur = "", prev = "0", n = -1;
	var newstr = [];
	for(var key in binary) {
		cur = binary[key];
		n ++;
		if(cur != prev) {
			newstr.push(n == 1 ? "" : String(n));
			n = 0;
		}
		prev = cur;
	};
	var end = newstr.length - 1; // update last
	newstr[end] = (newstr[end]) + 2;
	return newstr;
};

function addCommas(nStr) {
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
};

</script>
<style type="text/css">
body { line-height: 0.9em; margin: 1%; }
body, input { background: #eee; font-size: 18px; }
#UNICODE { font-size: 20px; line-height: 0.7em; }
.button { background: #ef0000; color: #fff; font-size: 16px; }
</style>
</head>
<body>
<div id="content" style="height: 800px">
<div id="about" style="padding: 0 0 3px; line-height: 1.2em;">
The <i><b>Unicode Profiling Project</b></i> (aka <i>Unicode Acid Test</i>) gathers statistics on unicode support in web browsers. Information on your computer's font support, remote address, user agent and processing speed will be submitted to the server when the test completes &mdash; an aggregate of the information will be published detailing the current state of unicode support on the web.<br><br>
Click &ldquo;<b>Profile your computers unicode support</b>&rdquo; to begin the test, it may take a few minutes as the software checks each character in your systems UTF-8 catalog (65,535 glyphs).  Feel free to get a cup of coffee, and take a load off, it's been a long day!<br><br>
<input type="hidden" value="" id="binary" >
<input type="button" class="button" id="profile" value="Profile your computers unicode support&hellip;" onmousedown="isUnicodeSupported(); this.parentNode.removeChild(this);">
</div>
<div id="UNICODE" style="font-size: 64px; padding: 0 0 0 30px"></div>
<div id="tests">
<textarea id="TEST"></textarea><br><br>
Paste unicode here to see larger versions:<br>
<textarea id="TEST2">!</textarea>
</div>
</div>
<script>
  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-400768-7']);
  _gaq.push(['_trackPageview']);
  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();
</script>
</body>
</html>
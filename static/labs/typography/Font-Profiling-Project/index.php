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

if ($_REQUEST['speed'] && $_REQUEST['fontFamily']) {
	$myFile = "getFontSupport.txt";
	$fh = fopen($myFile, "a") or die("can't open file");
	$json = Array(
		"speed"=>$_REQUEST['speed'],
		"fontFamily"=>$_REQUEST['fontFamily'],
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
<title>Font Profiling Project</title>
<script src="./unicodeRanges.js"></script>
<script>
(function() {

var defaultHash = undefined;
var defaultFontSize = "25px";
var defaultFont = "Arial";
var defaultOffsetX = 2;
var defaultOffsetY = 50;
var defaultText = "";
var canvas, ctx, width, height;

canvasHelper = {
	load: function(id, w, h) {
		if(document.getElementById(id)) {
			canvas = document.getElementById(id);
		} else {
			canvas = document.createElement("canvas");
			canvas.id = id;
			canvas.title = id;
			canvas.setAttribute("style", "background: #ffe;  left: 400px");
			document.getElementById("header").appendChild(canvas);
			document.getElementById("header").appendChild(document.createElement("br"));
		}
		ctx = canvas.getContext("2d");
		canvas.width = width = w;
		canvas.height = height = h;
	},
	getHash: function(font) {
		ctx.clearRect(0, 0, width, height);
		ctx.fillText(defaultText, defaultOffsetX, defaultOffsetY/2); 
		ctx.fillText(defaultText.substr(45), defaultOffsetX, defaultOffsetY); 
		return canvas.toDataURL();
	}
};

checkRange = function() {
	var text = document.getElementById("about").textContent;
	var targetRange = {};
	for (var key in text) {
		var charcode = text[key].charCodeAt();
		for (var n = 0, length = unicodeRanges.length; n < length; n ++) {
			var range = unicodeRanges[n];
			if (charcode < range[2]) {
				if (!targetRange[range[0]]) {
					targetRange[range[0]] = {
						count: 0,
						start: parseInt(range[1]),
						end: parseInt(range[2])
					};
				}
				targetRange[range[0]].count ++;				
				break;
			}
		}
	}
	var target = { count: 0 };
	for (var key in targetRange) {
		if (targetRange[key].count > target.count) {
			target = targetRange[key];
			target.name = key;
		}
	}
	document.getElementById("charset").innerHTML = target.name;
	return target;
};

isFontSupported = function() {
	var target = checkRange();
	for (var n = target.start, length = target.start + 100; n < length; n ++) {
		defaultText += String.fromCharCode(n);
	}

	document.getElementById('content').appendChild(writeTo);
	console.log("Testing font-family support...");
	speed = (new Date()).getTime();
	// Create <canvas>
	canvasHelper.load("fontSupport", 600, 64);
	canvas.setAttribute("style", "background: #ffe;  left: 400px");
	// Default values
	defaultOffsetX = 2;
	defaultOffsetY = 50;
//	defaultText = "thequickbrownfoxjumpsoverthelazydog";
	// Check font support
	ctx.font = defaultFontSize + " " + defaultFont + ", " + defaultFont;
	ctx.fillStyle = "#000000";
	// Create default hash
	defaultHash = canvasHelper.getHash();
	getFont(fonts.length-1);
};

function getFont(length) {
	var font = fonts[length];
	ctx.font = defaultFontSize + " '" + font + "', " + defaultFont;
	var hash = canvasHelper.getHash();
	var bool = hash != defaultHash || font == defaultFont;
	if (
		font.match(/[_\-\s]Italic$/)
		|| font.match(/[_\-\s](Demi)?[Bb]old/)
		|| font.match(/[_\-\s]Medium/)
		|| font.match(/[_\-\s](Ultra)?[Ll]ight/)
		|| font.match(/[_\-\s]Condensed/)
		|| font.match(/[_\-\s]Oblique/)
		|| font.match(/[_\-\s]Regular/)
		|| font.match(/[_\-\s]Pro/)
		|| font.match(/[_\-\s]Semi/)
		) {
	
	} else {
		write(font, bool);
		if(bool) {
			fontFamily[font] = 1; // font-exists!
		} else {
			fontFamily[font] = 0; // font doesn't work in canvas
			ctx.fillStyle = "#EF0000";
			var hash = canvasHelper.getHash();
			ctx.fillStyle = "#000";
		}
	}
	window.setTimeout(function() {
		if ((--length) > 0) {
			getFont(length);
		} else {
			speed = ((new Date()).getTime() - speed);
			var iframe = document.createElement("iframe");
			iframe.onload = function() { document.body.removeChild(iframe); }
			iframe.src = "index.php?speed=" + speed + "&fontFamily=" + JSON.stringify(fontFamily);
			document.body.appendChild(iframe);
		}
	}, 1);
};

var writeTo = document.createElement("div");
var write = function() {
	var text = "";
	for (var n = 0, length = arguments.length; n < length; n ++) {
		if (typeof(arguments[n]) == "boolean") {
			text += "<span style='background: #"+(arguments[n]?"ccffaa":"ffcccc")+"'>" + arguments[n] + "</span>";
		} else {
			text += "<span style=\"font-family: '"+arguments[n]+"'\">"+arguments[n] + "</span>";
		}
	}
	writeTo.innerHTML = text + "<br>" + writeTo.innerHTML ;
};

})();

var fontFamily = {};
var fonts = [];
function populateFontList(fontArr) {
	// http://hasseg.org/blog/post/526/getting-a-list-of-installed-fonts-with-flash-and-javascript/
	var regular = [];
	for (var key in fontArr) {
		var fontName = fontArr[key];
		fontName = fontName.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
		regular.push(fontName);
	}
	fonts = regular;
	checkRange();
};

</script>
<style type="text/css">
body { line-height: 0.9em; margin: 1%; }
body, input { background: #eee; font-size: 18px; }
#fontFamily { line-height: 0.7em; font-size: 64px; padding: 0 0 0 30px}
#about { padding: 10px 0 3px; line-height: 1.2em }
#content { height: 800px }
#charset { color: #f00; }
.button { background: #ef0000; color: #fff; font-size: 16px; }
</style>
</head>
<body>
<div id="content">
<div id="about">
*beta*<br><br>
The <i><b>Font Profiling Project</b></i> gathers statistics on font-family support in web browsers. Information on your computer's font support, remote address, user agent and processing speed will be submitted to the server when the test completes &mdash; an aggregate of the information will be published detailing the current state of font-family support on the web.<br><br>
Fonts are found through the Actionscript&rsquo;s ExternalInterface&mdash;from there, the test checks whether each of those fonts are supported by the &lt;canvas&gt; tag, within this web-pages current language unicode range (automatically calculated as &ldquo;<span id="charset"></span>&rdquo; using native DOM statistical analysis&mdash;translate this page to Japanese with Google Translate, and notice the unicode range change).<br><br>
Click &ldquo;<b>Profile your computers &lt;canvas&gt; font-support</b>&rdquo; to begin the test, it may take a few minutes as the software checks through a list of all the font-familys found on users systems. Feel free to get a cup of coffee, and take a load off, it's been a long day!<br><br>
<input type="hidden" value="" id="binary" >
<input type="button" class="button" id="profile" value="Profile your computers &lt;canvas&gt; font-support!" onmousedown="isFontSupported(); this.parentNode.removeChild(this);">
</div>
<div id="fontFamily"></div>
<div id="header"></div>
</div>
<object type="application/x-shockwave-flash" data="FontList.swf" width="1" height="1"> 
<param name="movie" value="FontList.swf"> 
<embed src="FontList.swf" width="1" height="1"></embed> 
</object>
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
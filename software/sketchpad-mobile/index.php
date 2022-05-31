<?php

// Prevent people snooping for raw source code.
if ($_SERVER["SERVER_NAME"] !== "localhost" && strpos($_SERVER["REQUEST_URI"], "SketchMobile")) {
	exit;
}

$qs = $_SERVER["QUERY_STRING"];
if ($qs && strlen($qs) == 17) {
	echo <<<X
<meta http-equiv="content-type" content="text/html; charset=utf-8" />
<meta name="description" content="Check out my drawing made with Sketch Mobile; http://sketch.io" />
<meta name="viewport" content="minimum-scale=1.0,maximum-scale=1.0,initial-scale=1.0,user-scalable=no" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black" />
<style type="text/css">
	body{margin:0;background:#000;font-family:sans-serif; color: #fff}
	h1{margin:1em;line-height:1.5em}
	a {color: #fff;	-webkit-transition-property: color;-webkit-transition-duration: 0.25s;}
	a:hover {color:#f70}
</style>
<script src="./js/Widgets/Loader.js" type="text/javascript"></script>
<script type="text/javascript">
	window.onload = function() {
		var loader = widgets.Loader("Loading...");
		var image = new Image();
		var div = document.createElement("h1");
		div.innerHTML = "Created with <a href='http://sketch.io/'>Sketch Mobile</a>";
		document.body.appendChild(div);
		image.src = "https://sketch.io/render/skm-{$_SERVER['QUERY_STRING']}.jpeg";
		image.onload = function() {
			document.body.appendChild(image);
			loader.stop();
		};
		image.onerror = function() {
			var div = document.createElement("h1");
			div.innerHTML = "Your image is being processed, check back in a minute...";
			document.body.appendChild(div);
			loader.stop();
		}
	};
</script>
X;
} else if (false) {
		session_start();
		list($micro, $time) = explode(" ", microtime());
		$_SESSION['uid'] = $time . str_pad($micro * 1000000, 7, "0");
		$oi = "http://oi.sketch.io/?" . $_SESSION['uid'];
} else {
		session_start();
		list($micro, $time) = explode(" ", microtime());
		$_SESSION['uid'] = $time . str_pad($micro * 1000000, 7, "0");
		$oi = "http://oi.sketch.io/?" . $_SESSION['uid'];
		$file = file_get_contents("./sketch.html");
		$file = str_replace('{$oi}', $oi, $file);
		echo $file;
		exit;
}
///
echo <<<X

<script type="text/javascript">
	var _gaq = _gaq || [];
	_gaq.push(['_setAccount', 'UA-400768-15']);
	_gaq.push(['_setDomainName', 'sketch.io']);
	_gaq.push(['_trackPageview']);
	(function() {
	  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
	  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	})();
</script>
X;

exit;

?>

<script type="text/javascript">
	document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1"></' + 'script>');
</script>

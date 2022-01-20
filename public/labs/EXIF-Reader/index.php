<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns = "http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<script src="./Event.js" type="text/javascript"></script>
<script src="./Widgets.Uploader.js" type="text/javascript"></script>
<script src="./exif.js" type="text/javascript"></script>
<title>EXIF: Drag and Drop!</title>
<style type="text/css">
body {
	font-family: arial;
	line-height: 2em;
	background: #fcfae9;
	background-attachment: fixed;
	background-image: url("http://mudcu.be/media/bg_wood2.jpeg"), url("http://mudcu.be/media/bg_wood1.jpeg");
	background-repeat: repeat-x, repeat;
	color: #907d62;
	margin: 0 50px;
}
h3 { 
	width: 1000px;
	margin: 70px auto 15px;
	font-weight: normal;
	line-height: 2em;
}
</style>
<link href="../../media/main.css" rel="stylesheet" type="text/css" />
</head>
<body>
<?php
include("../../header.php");
?>
<h3>
<li>Supports browsers with native FileReader with Drag and Drop support.
<li>EXIF data is parsed with <a href="http://blog.nihilogic.dk/2008/05/reading-exif-data-with-javascript.html">exif.js</a> written by Jacob Seidelin.
</h3>
<textarea id="TEST" style="display: block; padding: 10px; height: 400px; width: 980px; margin: 0 auto; font-size: 16px;">
Drag file from desktop to view meta-data :)
</textarea>
<script type="text/javascript">

window.onload = function() {
	var image = new Image();
	image.style.cssText = "position: absolute; left: 475px;";
	document.body.appendChild(image);
	//
	uploader = new widgets.uploader({ 
		callback: function(status, files) {
			if (files) {
				for (var key in files) {};
				if (!files[key] || !files[key].src) return;
				var TEST = document.getElementById("TEST");
				var reader = new FileReader();
				reader.onloadend = function() {				
					var data = EXIF.readFromBinaryFile(reader.result);
					var ret = "";
					for (var key in data) {
						 ret += key + ": " + data[key] + "\n";
					}
					TEST.innerHTML = ret;
				}
				reader.readAsBinaryString(files[key]);
				//
				image.src = files[key].src;
			}
		},
		singleFile: true
	});
};

</script>
<script type="text/javascript">
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
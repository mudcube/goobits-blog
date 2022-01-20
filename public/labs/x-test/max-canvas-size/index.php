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

if (isset($_REQUEST['maxSize'])) {
	$myFile = "support.txt";
	$fh = fopen($myFile, "a") or die("can't open file");
	$json = Array(
		"maxSize"=>$_REQUEST['maxSize'],
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
<title>Canvas Max Size</title>
</head>
<body style="background: #000; font-family: futura; color: #0f0">
<div id="test"></div>
<script src="CanvasToBlob.js" type="text/javascript"></script>
<script type="text/javascript">

window.onload = function() {
	var sizeTarget = 256;
	var sizeSuccess = 0;
	var sizeFail = Infinity;
	var test = document.getElementById("test");
	var stats = [];
	///
	var record = function(value) {
		var iframe = document.createElement("iframe");
		iframe.onload = function() { document.body.removeChild(iframe); }
		iframe.src = "canvas-size.php?maxSize=" + JSON.stringify(stats);
		document.body.appendChild(iframe);
		test.innerHTML = "<br>CanvasMaxSize: " + value + test.innerHTML;
	};
	var testnext = function() {
		setTimeout(function() {
			sizeTarget = Math.round(sizeTarget * 2);
			testsize();
		}, 250);
	};
	var testsize = function() {
		try {
			var time = (new Date()).getTime();
			var canvas = document.createElement("canvas");
			var ctx = canvas.getContext("2d");
			canvas.width = sizeTarget;
			canvas.height = sizeTarget;
			test.innerHTML = "<br><span style='color: #0f0'>testing: " + sizeTarget + "px</span>" + test.innerHTML;
			///
			setTimeout(function() {
			if (false) {
				canvas.toBlob(function(blob) {
					var dataUrl = URL.createObjectURL(blob);
					if (blob.size === 0) {
						if (sizeFail === sizeTarget) {
							return record(sizeSuccess);
						}
						die();
					} else {
						var ms = ((new Date()).getTime() - time);
						stats.push({ px: sizeTarget, ms: ms });
						console.log("success", sizeTarget, dataUrl.length, ms);
						if (ms > 1000) return record(sizeSuccess);
						sizeSuccess = sizeTarget;
						testnext();
					}
				});
			} else {
				var dataUrl = canvas.toDataURL("image/png");
				if (dataUrl.length <= 6) {
					if (sizeFail === sizeTarget) {
						return record(sizeSuccess);
					}
					die();
				} else {
					var ms = ((new Date()).getTime() - time);
					stats.push({ px: sizeTarget, ms: ms });
					console.log("success", sizeTarget, dataUrl.length, ms);
					if (ms > 1000) {
						return record(sizeSuccess);
					}
					sizeSuccess = sizeTarget;
					testnext();
				}
			}
			}, 10)
		} catch(e) {
			if (sizeSuccess > 2048) return record(sizeSuccess);
			if (sizeFail > sizeTarget) sizeFail = sizeTarget;
			test.innerHTML = "<br><span style='color: #f00'>fail: " + sizeTarget + "px</span>" + test.innerHTML;
			console.log("fail", sizeTarget, sizeSuccess, sizeFail, sizeFail - sizeSuccess)
			sizeTarget = sizeSuccess + (sizeFail - sizeSuccess) / 2;
			if (sizeTarget < sizeSuccess) return record(sizeSuccess);
			testnext(sizeTarget /= 2);
		}
	};
	testsize();
};

</script>
</body>
</html>
<?php
session_start();
session_cache_expire(30);
$_SESSION['request'] ++;
if ($_SERVER['HTTP_HOST'] !== 'localhost' && isset($_SESSION['request'])) {
	if ($_SESSION['request'] > 50) {
		echo "too many requests, come back later :(";
		return;
	}
}

$url = $_REQUEST['q'];
if (!$url) {
	echo "url invalid :(";
	return;
}

// use curl to forward the users browser

$ch = curl_init();
curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT']);
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_FAILONERROR, false);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_AUTOREFERER, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_VERBOSE, false);
$string = curl_exec($ch);

if (!$string) {
	echo "failed to load website :(";
	return;
}

// DOM Document

$dom = new DOMDocument();
@$dom->loadHTML($string);

// replace html background to transparent

$html = $dom->getElementsByTagName('html')->item(0);
$style = $html->getAttribute("style");
$html->setAttribute("style", $style . "; background: transparent;");

// replace body background to transparent

$body = $dom->getElementsByTagName('body')->item(0);
$style = $body->getAttribute("style");
$body->setAttribute("style", $style . "; background: transparent;");
$body->setAttribute("onload", "");

// remove <script> + <iframe> tags

$remove = array(); 
$nodes = $dom->getElementsByTagname('script'); 
foreach($nodes as $element) $remove[] = $element; 
$nodes = $dom->getElementsByTagname('iframe'); 
foreach($nodes as $element) $remove[] = $element;
foreach($remove as $element) {
	$element->parentNode->removeChild($element); 
}

// relative -> absolute paths

$self = $_SERVER['HTTP_HOST'];
$host = parse_url($url);
$path = $host['path'] ? $host['path'] : "/";
$path = substr($path, 0, strrpos($path, "/") + 1);
$host = $host['scheme'].'://'.$host['host'];
$items = $dom->getElementsByTagName('*');
foreach($items as $key=>$value) {
	if ($value->getAttribute("src")) {
		$tmp = @parse_url($value->getAttribute("src"));
		if(isset($tmp['host'])) continue;
		$src = $value->getAttribute("src");
		if (substr($src, 0, 1) != '/') $src = $path.$src;
		$value->setAttribute("src", $host . $src);
	} else if ($value->getAttribute("href")) {
		$tmp = @parse_url($value->getAttribute("href"));
		if(isset($tmp['host'])) continue;
		$src = $value->getAttribute("href");
		if (substr($src, 0, 1) != '/') $src = $path.$src;
		$value->setAttribute("href", $host . $src);
	}
}

// echo document

echo $dom->saveHTML();

?>
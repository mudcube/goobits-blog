<?php
function getlist($dir) {
	$r = Array();
	if ($handle = opendir($dir)) {
		while (false !== ($file = readdir($handle))) {
			if ($file != "." && $file != ".." && $file != ".DS_Store") {
				$r[$dir . "/" . $file] = str_replace(".jpg", "", $file);
			}
		}
		closedir($handle);
	}
	return $r;
};
$dir = 'texturise';
$r = getlist($dir);
$ret = Array();
foreach ($r as $key=>$value) {
	$ret = array_merge(getlist($dir . "/" . $value), $ret);
}
echo json_encode($ret);
?>
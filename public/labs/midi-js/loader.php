<?php

$path = './soundfont/' . basename($_GET['file']);
$filesize = filesize($path);
header("Content-Type: text/javascript");
header("Content-Length-Raw: " . $filesize);
header("Cache-Control: max-age=604800"); // 1-wk
echo file_get_contents($path);
exit;

?>
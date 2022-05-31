<?php
require('/srv/sketch.io/inc/aws/aws.phar');
require('/srv/sketch.io/inc/aws/aws-uploader.php');

session_start();
if (!$_POST["image"]) exit;
if (!$_SESSION['uid']) {
	list($micro, $time) = explode(" ", microtime());
	$_SESSION['uid'] = $time . str_pad($micro * 1000000, 7, "0");
}
$method = $_SERVER['QUERY_STRING'];
if ($method === "new") {
	list($micro, $time) = explode(" ", microtime());
	$_SESSION['uid'] = $time . str_pad($micro * 1000000, 7, "0");
	$file_name = $_SESSION['uid'];
} else if ($method === "sync") {
	$file_name = $_SESSION['uid'];
} else {
	exit;
}
$image = explode(",",$_POST["image"]);
$file_type = explode(";",$image[0]);
$file_type = array_pop(explode(":",$file_type[0]));
$ext = array_pop(explode("/",$file_type));
$file_data = base64_decode($image[1]);
///
$name = "{$file_name}.{$ext}";
if (is_dir("./s3")) {
	$src = "./s3/{$name}";
} else {
	$src = "../../../s3/{$name}";
}

$fp = "skm-".$name;
$s3 = S3Uploader::sendFile(array(
	'bucket' => 'sketch.io-render',
	'filepath' => $fp,
	'source' => $file_data,
	'mime' => 'img/jpeg'
));

if($s3->error) {
	echo "Oops! Please try again";
	syslog(LOG_WARNING, json_encode($s3));
} else {
	echo $name;
}
///
exit;
?>

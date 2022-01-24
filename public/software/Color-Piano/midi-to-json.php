<?php
if (false) {
	if ($handle = opendir('./audio')) {
	    while (false !== ($entry = readdir($handle))) {
	        if (strpos($entry, ".mid") && !strpos($entry, ".js")) {
				$b64 = base64_encode(file_get_contents("./audio/" . $entry));
				$data = "Piano.files['$entry'] = 'data:audio/midi;base64," . $b64 . "';";
				file_put_contents("./audio/" . urlencode($entry) . ".js", $data);
	        }
	    }
	    closedir($handle);
	}
} else {
	$query = basename($_GET["query"]);
	$data = base64_encode(file_get_contents("./audio/" . $query));
	echo "Piano.loadExternalMIDICallback('data:audio/midi;base64," . $data . "')";
}
?>
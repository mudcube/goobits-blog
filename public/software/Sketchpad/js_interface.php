<?php

if ($query = $_SERVER['QUERY_STRING']) {
	$q = query_parse($query);
	if ($q['session_stab']) { // write session
		$o = str_replace(Array('%20', '%22'), Array(' ', '"'), $q['session_stab']);
		$o = json_decode($o);
		foreach($o as $key => $value) {
			if (gettype($value) === "NULL") unset($_SESSION[$key]);
			$_SESSION[$key] = $value;
		}
		echo 1;
		exit;
	}
	if ($q['session_grab']) { // read session
		$o = $q['session_grab'];
		switch (gettype($o)) {
			case "string":
				$o = 'SKETCHPAD_' . $o;
				if ($_SESSION[$o]) {
					if (gettype($_SESSION[$o]) === 'string') {
						echo $_SESSION[$o];
					} else {
						echo json_encode($_SESSION[$o]);
					}
				}
			case "array":
				$z = Array();
				foreach($o as $n => $value) {
					$z[$value] = $_SESSION[$value];
				}
				echo json_encode($z);
				break;
		}
		exit;
	}
}

?>
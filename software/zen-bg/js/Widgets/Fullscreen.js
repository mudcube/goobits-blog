/*
	Widgets.FullScreen : 0.1 : mudcu.be
	-------------------------------------
	Inspired by; http://html5-demos.appspot.com/static/fullscreen.html
	-------------------------------------
	widgets.FullScreen.enter();
	widgets.FullScreen.exit(); 
	
	function toggleFullScreen() {
		var root = widgets.FullScreen;
		if (!root.enter) return; // fullscreen not supported
		if (root.state === "exited") {
			root.enter();
		} else {
			root.exit();
		}
	};

*/

if (typeof(widgets) === "undefined") widgets = {};

(function(root) {
	if (document.cancelFullScreen) {
		var onChange = "onfullscreenchange";		
	} else if (document.webkitCancelFullScreen) {
		var onChange = "onwebkitfullscreenchange";
		document.cancelFullScreen = document.webkitCancelFullScreen;
	} else if (document.mozCancelFullScreen) {
		var onChange = "onmozfullscreenchange";
		document.cancelFullScreen = document.mozCancelFullScreen;
	} else { // no support
		return;
	}
	//- how to detect whether we're in fullscreen?
	root.state = "exited"; 
	// external functions
	root.addKeyboardEvents = function() {
		Event.add(window, 'keydown', function (event) {
			switch (event.keyCode) {
				case 13: // esc to exit fullscreen
					event.preventDefault();
					document.cancelFullScreen();
					break;
				case 70: // f to enter fullscreen
					root.enter();
					break;
			}
		});
	};
	root.enter = function () {
		var d = document.body;
		d[onChange] = function() {
			root.state = "entered";
			d[onChange] = function () {
				root.state = "exited";
			};
		};
		if (d.webkitRequestFullScreen) { // webkit
			d.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
		} else { // mozilla
			d.mozRequestFullScreen();
		}
	};
	root.exit = function () {
		document.cancelFullScreen();
	};
})(widgets.FullScreen = {});
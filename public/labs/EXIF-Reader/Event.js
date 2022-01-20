/*

	Event.js : v1.0 : 2011.05.21
	-----------------------------
	Event.add(window, "error", function(message, url, code) {       }); //- send to server for processing
	Event.add(window, "close", function() { }); //- first saves everything and then moves away from the page, without any confirm boxes...
	Event.add(window, "beforeunload", function() {  }); //- ditto
	Event.add(document, "blur", Key.blur); // stop keypress

	// Might want to clear the mouse too.

*/

var Event;

(function() {

	var useragent = navigator.userAgent.toLowerCase();
	var counter = 0;
	var getID = function(object) {
		if (object == window) return "#window";
		if (object == document) return "#document";
		// FIXME: Happens in iOS
		if (!object) object = {};
		if (!object.uniqueID) {
			object.uniqueID = "id" + counter++;
		}
		return object.uniqueID;
	};
	
	var wrappers = {};
	
	var wrap = function(type, target, listener, scope) {
		var wrapperID = type + getID(target) + "." + getID(listener);
		if (!wrappers[wrapperID]) {
			if(listener)
			wrappers[wrapperID] = function(event) {
				return listener.call(scope, event);
			};
		}
		return wrappers[wrapperID];
	};
	
	var fix = function(type) { // fix any browser discrepancies
		if(!document.addEventListener){
			return "on" + type;
		}
		if(type == "mousewheel" && useragent.indexOf("firefox") != -1) {
			return "DOMMouseScroll";
		} else {
			return type;
		}
	};
	 
	Event = {};
	
	var add = document.addEventListener ? 'addEventListener' : 'attachEvent';
	var remove = document.addEventListener ? 'removeEventListener' : 'detachEvent';
	
	Event.add = function(target, type, listener, scope) {
		target[add](fix(type), wrap(type, target, listener, scope || target), false);
		return listener;
	};
	
	Event.remove = function(target, type, listener, scope) {
		target[remove](fix(type), wrap(type, target, listener, scope || target), false);
		return listener;
	};
	
	Event.stopPropagation = function(event) {
		if (event.stopPropagation) {
			event.stopPropagation();
		} else { // <= IE8
			event.cancelBubble = true;
		}
	};
	
	Event.preventDefault = function(event) {
		if (event.preventDefault) {
			event.preventDefault();
		} else { // <= IE8
			event.returnValue = false;
		}
	};

})();
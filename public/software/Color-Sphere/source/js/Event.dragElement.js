/*

	Event.dragElement : 0.3 : mudcu.be
	-----------------------------------

*/


if (typeof(Event)=="undefined") Event = {};

Event.dragElement = function(props) {
	var self = {
		cancel: function() {
			window.removeEventListener("mousemove", mouseMove, false);
			window.removeEventListener("mouseup", mouseUp, false);
		}
	};
	function mouseMove(event, state) {
		if (typeof(state) == "undefined") state = "move";
		var coord = XY(event);
		switch (props.type) {
			case "move": // move
				props.callback(event, {
					x: coord.x + oX - eX,
					y: coord.y + oY - eY
				}, state, self);
				break;
			case "difference": // relative, from position within element
				props.callback(event, {
					x: coord.x - oX,
					y: coord.y - oY
				}, state, self);
				break;
			case "relative": // eveything is relative from origin
				props.callback(event, {
					x: coord.x - eX,
					y: coord.y - eY
				}, state, self);
				break;
			default: // "absolute", origin is 0x0
				props.callback(event, {
					x: coord.x,
					y: coord.y
				}, state, self);
				break;
		}
	};
	function mouseUp(event) {
		self.cancel();
		mouseMove(event, "up");
	};
	// current element position
	var el = props.element || document.body;
	var origin = abPos(el);
	var oX = origin.x;
	var oY = origin.y;
	// current mouse position
	var event = props.event;
	var coord = XY(event);
	var eX = coord.x;
	var eY = coord.y;
	// events
	window.addEventListener("mousemove", mouseMove, false);
	window.addEventListener("mouseup", mouseUp, false);
	mouseMove(event, "down"); // run mouse-down
};

if (window.ActiveXObject) {
	var XY = function(event) {
		return {
			x: event.clientX + document.documentElement.scrollLeft,
			y: event.clientY + document.documentElement.scrollTop
		};
	};
} else {
	var XY = function(event) {
		return {
			x: event.pageX,
			y: event.pageY
		};
	};
}

///// DOM.absPos

var abPos = function(o) { 
	o = typeof(o) == 'object' ? o : document.getElementById(o);
	var offset = { x: 0, y: 0 };
	while(o != null) { 
		offset.x += o.offsetLeft; 
		offset.y += o.offsetTop; 
		o = o.offsetParent; 
	};
	return offset;
};
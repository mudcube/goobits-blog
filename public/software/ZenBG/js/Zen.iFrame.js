/*
	Remote iFrame Control : 0.1 : http://mudcu.be/
	------------------------------------------------------------
	Works with getWebsite.php to allow for real-time website manipulation
*/

if (typeof(BG) === "undefined") var BG = {};

(function() {

var iframepage = window.location.href;
var timeout = 0;

function activate(waiting) {
	var iframe = document.getElementById("iframe");
	var d = iframe.contentWindow.document;
	if (!d.body || (iframepage === d.location.href && waiting)) {
		if ((new Date()).getTime() - timeout > 30000) return;
		setTimeout(function () {
			activate(true);
		}, 10);
		return;
	} else {
		timeout = 0;
	}
	iframepage = d.location.href;
	d.body.style.background = "none";
	BG.uploader.createDropArea(d.body);
	var location = window.location;
	var elms = d.getElementsByTagName("a");
	for (var n = 0, length = elms.length; n < length; n++) {
		Event.add(elms[n], "click mousedown", function (event) {
			BG.remoteFrame = this;
			event.preventDefault();
			event.stopPropagation();
			this.style.background = "none";
			if (!this.href) return;
			if (iframe.src === this.href) return;
			BG.onFormSubmit(location.origin + location.pathname + "?" + this.href);
			return false;
		});
	}
};

BG.remoteFrame = undefined; // webpage in iframe

BG.toggleRemoteFrame = function (state) {
	var frame = document.getElementById("remoteFrame");
	if (!frame) return;
	if (state === "down") {
		frame.style.display = "block";
	} else if (state === "up") {
		frame.style.display = "none";
	}
};

BG.createRemoteFrame = function() {
	if (window.location.search) {
		document.getElementById("main").innerHTML = "";
		/// 
		var iframe = document.createElement('iframe');
		iframe.id = "iframe";
		iframe.style.cssText = "width: " + (window.innerWidth) + "px; height: 100%; border: 0; position: absolute; top: 0;";
		iframe.src = "./getWebsite.php?q=" + window.location.search.substr(1);
		iframe.onload = function () {
			var w = iframe.contentWindow;
			var d = w.document;
			d.body.style.background = "transparent";
			activate();
		};
		document.getElementById("main").appendChild(iframe);
		/// 
		var frame = document.createElement("div");
		frame.style.cssText = "width: 100%; height: 100%; z-index: 1; display: none; position: absolute; top: 0;";
		frame.id = "remoteFrame";
		document.body.appendChild(frame);
	}
};

})();
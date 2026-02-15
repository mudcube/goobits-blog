/*

Daltonizing: Accessibility for Color-blind Users
------------------------------------------------
Daltonizing is a technique to modify a photograph for color-blind 
users so that features, which otherwise may have gone unnoticed, 
are more evident. This extension supports Protanopia, Deuteranopia, 
and Tritanopia.

*/

(function() {

// create Queue of elements to be parsed
var Queue = [ ],
	Current = 0,
	Loaded = false,
	Time = 0,
	Test = null;	
	
var Daltonize = function() {
	Time = (new Date()).getTime();
	Loaded = true;
	// create test div
	if(Daltonize.ShowTime == "true") {
		Test = document.createElement("textarea");
		Test.id = "TEST";
		Test.setAttribute("style", "position: absolute; left: 0; top: 0; z-index: 10000; background: rgba(0,0,0,0.5); color: #fff; padding: 5px 10px;");
		document.body.appendChild(Test);
	}
	// run daltonization
	var images = document.getElementsByTagName("img");
	if(window.location == images[0].src) { // document is image
		var image = images[0];
		Color.Vision[Daltonize.TYPE](image, {
			type: Daltonize.CVD,
			callback: function(canvas) {
				image.parentNode.appendChild(canvas);			
				image.parentNode.removeChild(image);
			}
		});
	} else { // create queue of images
		var tags = document.getElementsByTagName("*");
		if(tags.length) { // aggregate images from HTML
			for(var n = 0, len = tags.length; n < len; n ++) {
				var tag = tags[n],
					type = tag + "";
				if(type == "[object HTMLLinkElement]") {
					if(tag.type == "image/x-icon") {
						Queue.push({ type: "favicon", content: tag, src: tag.href });
					}
				} else if(type == "[object HTMLImageElement]") {
					if(!tag.src || !tag.width || !tag.height) continue;
					Queue.push({ type: "image", content: tag, src: tag.src });
				}
				if(tag.backgroundImage) {
					Queue.push({ type: "backgroundImage", content: tag, src: tag.src });
				}		
			}
		}
		var rules = document.styleSheets[0].cssRules;
		if(rules && rules.length) { // aggregate images from CSS
			for(var n = 0, len = rules.length; n < len; n ++) {
				var style = rules[n].style;
				if(typeof style == "undefined") continue;
				if(style.backgroundImage) {
					var src = style.backgroundImage;
					src = src.substr(4, src.length - 5); // clean url
					if(src[0] == "'" || src[0] == '"') {
						src = src.substr(1, src.length - 2);
					}
					Queue.push({ type: "backgroundImage", content: rules[n], src: src });
				}
			}
		}
		var Background = [];
		for(var key in Queue) {
			if(Queue[key].src) {
				Background.push(Queue[key].src);
			}
		}
		chrome.extension.sendRequest({ // send to background
			type: "daltonize", 
			data: Background
		});
	}
};

// update onload
chrome.extension.sendRequest({ type: "getLocalStorage" }, function(response) {
	for(var key in response) {
		Daltonize[key] = response[key];		
	}
	if(Daltonize.isLoaded == "true") {
		Daltonize();
	}
});

// add listener from browser button
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	if(request.type == "navButton") {
		if(Daltonize.isLoaded == "false" && !Loaded) {
			chrome.extension.sendRequest({ type: "getLocalStorage" }, function(response) {
				for(var key in response) {
					Daltonize[key] = response[key];		
				}
				Daltonize();
			});
		}
	} else {
		if(Test) {
			Test.innerHTML = ((new Date()).getTime() - Time) + " ms";
		}
		var row = Queue[request.id];
		switch(row.type) {
			case "favicon": 
				var link = document.createElement("link");
				link.href = request.data;
				link.rel = row.content.rel;
				link.type = row.content.type;
				document.head.removeChild(row.content);
				document.head.appendChild(link);
				break;
			case "backgroundImage":
				row.content.style.backgroundImage = "url("+ request.data +")";
				break;
			default: 
				row.content.src = request.data;				
				break;
		}
	}
});

})();
---
title: "Color Accessibility in the Browser"
date: "2011-10-20"
categories: 
  - "apps"
tags: 
  - "color"
coverImage: "images/hero.png"
---

Announcing the release of color-blindness daltonization + simulation bookmarklets; [daltonize.appspot.com](http://daltonize.appspot.com/)

The [Chrome Daltonize](https://chrome.google.com/webstore/detail/efeladnkafmoofnbagdbfaieabmejfcf) extension is faster in many cases, and uses less bandwidth than the bookmarklet, highly recommended when Google Chrome is an option!

**What is daltonization?**

_“Daltonization is a process performed by the computer that allows people with color vision deficiencies to distinguish a range of detail they are otherwise excluded from perceiving. For instance, in the daltonization of an Ishihara test plate (a popular test of color vision) numbers emerge from a pattern that were once invisible to the color blind person.”_

Read more about the [daltonization algorithm](http://www.daltonize.org/2010/05/lms-daltonization-algorithm.html) used on [daltonize.org](http://daltonize.org/).

**Technical hurdles with Cross Domain policies;**

The following highlight some of the options to get around Cross Domain issues with images;

1. CORS (Cross-Origin Resource Sharing)

- Must be recorded in the header of the image hosting website, and the browser must support CORS. This is the best option, it handles the image as if it were any other image. When creating the image use; image.crossOrigin = true;

3. Flash (crossdomain.xml)

- The website must have a crossdomain.xml in their root directory, and the browser must have Flash installed. When that is all in place, you can use the ExternalInterface to copy the base64 from Flash into a Image tags src, and subsequently onto `<canvas>`.

5. UniversalXPConnect (Firefox)

- Certain versions of Firefox support this… I haven’t been able to get it working lately, anyone? When it works, it requires the user to click “Accept” to a security box.

7. Base64 proxy from external server.

- Max Novakovic’s function [$.getImageData](http://www.maxnov.com/getimagedata/) using [Google App Engine](http://code.google.com/appengine/). This is used as a last-case scenario due to bandwidth concerns. The $.getImageData proxy is used as a last resort, as it produces bandwidth overhead.

[CORS](http://www.w3.org/TR/cors/) is the preferable method to access images from external domains. The problem is knowing whether a server supports it or not, the following snippet is a hack to figure out whether an browser/server combination supports CORS, or not;

```
function hasCORS(src, callback) { // Cross-Origin Resource Sharing (CORS)
	var method = "get";
	var req = new XMLHttpRequest();
	if ("withCredentials" in req) {
		req.open(method, src, true);
	} else if (typeof XDomainRequest != "undefined") {
		req = new XDomainRequest();
		req.open(method, src);
	} else { // browser doesn't support cors
		callback(false);
	}
	if (req) { // browser supports cors
		req.onload = function(response) { // server supports cors
			callback(true);
		};
		req.onerror = function(response) { // server doesn't support cors
			callback(false);
		};
		req.send();
	}
};

```

Hope this helps someone with the same problems!

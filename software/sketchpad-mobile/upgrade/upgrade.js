if (typeof(Modernizr) === "undefined") Modernizr = {};

Modernizr.upgrade = function() {
	var browsers = {
		"Chrome": {
			"description": "Runs websites and applications with lightning speed.",
			"stable": {
				"ver": "19.0.1084.56",
				"url": "http:\/\/www.google.com\/chrome"
			},
			"preview": {
				"ver": {
					"Beta": "20.0.1132.42b20.0.1132.42"
				},
				"url": "http:\/\/www.google.com\/landing\/chrome\/beta\/"
			}
		},
		"Firefox": {
			"description": "Firefox is free and made to help you get the most out of the web.",
			"stable": {
				"ver": "13.0.1",
				"url": "http:\/\/www.mozilla.com\/firefox\/"
			},
			"preview": null
		},
		"Safari": {
			"description": "Browse the web in smarter, more powerful ways.",
			"stable": {
				"ver": "5.1.7",
				"url": "http:\/\/www.apple.com\/safari\/download\/"
			},
			"preview": {
				"ver": "6.0",
				"url": "http:\/\/www.apple.com\/safari\/download\/"
			}
		},
		"Opera": {
			"description": "Secure, powerful and easy to use, with excellent privacy protection.",
			"stable": {
				"ver": "12.00",
				"url": "http:\/\/www.opera.com\/download\/"
			},
			"preview": {
				"ver": "none",
				"url": "http:\/\/www.opera.com\/browser\/next\/"
			}
		},
		"IE": {
			"description": "Designed to help you take control of your privacy and browse with confidence.",
			"stable": {
				"ver": "9.0.2",
				"url": "http:\/\/www.microsoft.com\/windows\/internet-explorer\/default.aspx"
			},
			"preview": {
				"ver": "10.0.8102.0 Platform Preview 3",
				"url": "http:\/\/ie.microsoft.com\/testdrive\/"
			}
		}
	};
	//////
	var head = document.getElementsByTagName("head")[0];
	var css = document.createElement("link");
	css.rel = "stylesheet";
	css.type = "text/css";
	css.media = "screen";
	css.href = "./upgrade.css";
	head.appendChild(css);
	//////
	var container = document.createElement("div");
	container.id = "browser-upgrade";
	var ul = document.createElement("ul");
	var h2 = document.createElement("h2");
	h2.className = "header";
	h2.innerHTML = "Please upgrade your browser to view this website";
	ul.appendChild(h2);
	for (var key in browsers) {
		var browser = browsers[key];
		var li = document.createElement("li");
		li.id = "sprite-" + key.toLowerCase();
		var a = document.createElement("a");
		a.href = browser.stable.url;
		a.title = key;
		var div = document.createElement("div");
		div.className = "icon";
		a.appendChild(div);
		var h2 = document.createElement("h2");
		h2.innerHTML = key;
		div.appendChild(h2);
		var p = document.createElement("p");
		p.className = "version";
		p.innerHTML = "Version: <strong>"+browser.stable.ver+"</strong>";
		a.appendChild(p);
		var p = document.createElement("p");
		p.className = "info";
		p.innerHTML = "&ldquo;" + browser.description + "&rdquo;";
		a.appendChild(p);
		li.appendChild(a);
		ul.appendChild(li);
	}
	container.appendChild(ul);
	document.body.appendChild(container);
};
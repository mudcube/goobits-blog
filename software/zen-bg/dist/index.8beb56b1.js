/*
	ScriptLoader : 0.1
	--------------------
	ScriptLoader.add({
		strictOrder: true,
		srcs: [
			{
				src: "../js/jszip/jszip.js",
				verify: "JSZip",
				callback: function() {
					console.log(1)
				}
			},
			{ 
				src: "../inc/downloadify/js/swfobject.js",
				verify: "swfobject",
				callback: function() {
					console.log(2)
				}
			}
		],
		callback: function() {
			console.log(3)
		}
	});
*/ if (typeof DOMLoader === "undefined") DOMLoader = {};
DOMLoader.script = function() {
    this.loaded = {};
    this.loading = {};
    return this;
};
DOMLoader.script.prototype.add = function(config) {
    var that = this;
    var srcs = config.srcs;
    if (typeof srcs === "undefined") srcs = [
        {
            src: config.src,
            verify: config.verify
        }
    ];
    /// adding the elements to the head
    var doc = document.getElementsByTagName("head")[0];
    /// 
    var testElement = function(element, test) {
        if (that.loaded[element.src]) return;
        if (test && !eval(test)) return;
        that.loaded[element.src] = true;
        //
        if (that.loading[element.src]) that.loading[element.src]();
        delete that.loading[element.src];
        //
        if (element.callback) element.callback();
        if (typeof getNext !== "undefined") getNext();
    };
    ///
    var batchTest = [];
    var addElement = function(element) {
        if (/([\w\d.])$/.test(element.verify)) {
            element.test = "(typeof(" + element.verify + ') !== "undefined")';
            batchTest.push(element.test);
        }
        var script = document.createElement("script");
        script.onreadystatechange = function() {
            if (this.readyState !== "loaded" && this.readyState !== "complete") return;
            testElement(element);
        };
        script.onload = function() {
            testElement(element);
        };
        script.setAttribute("type", "text/javascript");
        script.setAttribute("src", element.src);
        doc.appendChild(script);
        that.loading[element.src] = function() {};
    };
    /// checking to see whether everything loaded properly
    var onLoad = function(element) {
        if (element) testElement(element, element.test);
        else for(var n = 0; n < srcs.length; n++)testElement(srcs[n], srcs[n].test);
        if (!config.strictOrder && eval(batchTest.join(" && "))) {
            if (config.callback) config.callback();
        } else setTimeout(function() {
            onLoad(element);
        }, 10);
    };
    /// loading methods;  strict ordering or loose ordering
    if (config.strictOrder) {
        var ID = -1;
        var getNext = function() {
            ID++;
            if (!srcs[ID]) {
                if (config.callback) config.callback();
            } else {
                var element = srcs[ID];
                var src = element.src;
                if (that.loading[src]) that.loading[src] = function() {
                    if (element.callback) element.callback();
                    getNext();
                };
                else if (!that.loaded[src]) {
                    addElement(element);
                    onLoad(element);
                } else getNext();
            }
        };
        getNext();
    } else {
        for(var ID = 0; ID < srcs.length; ID++){
            if (that.loaded[srcs[ID].src]) return;
            addElement(srcs[ID]);
        }
        onLoad();
    }
};
DOMLoader.script = new DOMLoader.script();

//# sourceMappingURL=index.8beb56b1.js.map

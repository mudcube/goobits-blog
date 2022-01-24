/*

	widgets.FileSaver : 0.1 : mudcu.be
	-------------------------------
	FileSaver.js (savings features)
	JSZip (for packaging zips)
	BlobBuilder.js (legacy support)
	SWFObject.js + Downloadify.js (for Flash support)
	DOMLoader.script.js (to get only required packages)
	-------------------------------
	var fileSaver = new widgets.FileSaver;
	fileSaver.download(); // download file immediately (supports HTML5)
	fileSaver.button(); // create button to trigger download (supports HTML5 & Flash)
	------------------------------------------------	
	fileSaver = new widgets.FileSaver({
		callback: function() {
			fileSaver.button({
				parent: document.getElementById("everything"), 
				id: "downloadify", 
				fileName: "PDXFoods", 
				fileType: "png", 
				format: "base64", 
				getData: that.toDataURL
			});
		}
	});
*/

if (typeof(widgets) === "undefined") var widgets = {};

(function() {

var dataFormat = {
	"text/css": "string",
	"text/html": "string",
	"text/plain": "string"
};

widgets.FileSaver = function(config) {
	if (typeof(config) === "undefined") config = {};
	var dir = config.jsDir || "./js/";
	var that = this;
	//
	var Blob = window.Blob = window.Blob || window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
	///
	this.html5 = typeof(ArrayBuffer) === "function";
	this.boot = function(callback) {
		return callback(that);
	};
	//
	this.download = function(config) {
		console.log()
		if (typeof(Blob) !== "function") return;
		if (!config.getData) return;
		var data = config.getData();
		var name = config.name;
		var mime = config.mime;
		var charset = config.charset;
		var extension = config.extension;
		var format = "";
		// handle packaging of arrays of data into .zip
		console.log(data)
		if (typeof(data) === "string") {
			// figure out what type of data we're dealing with
			if (data.indexOf("base64") !== -1) {
				var split = data.substr(5).split(",");
				data = split[1];
				mime = split[0].split(";")[0];
				if (!extension) extension = mime.split("/")[1];
				if (!dataFormat[split[0]]) format = "binary";
			}
		} else if (data.toDataURL) {
			format = "canvas";		
		} else { // package object into zip
			format = "blob";
			extension = "zip";
			data = packageZip(data);
		}
		//
		if (!name) name = "download";
		if (!mime) mime = "text/plain";
		if (!extension) extension = "txt";
		if (!format) format = dataFormat[mime] || "binary";
		//
		if (format === "blob") {
			saveAs(data, name + "." + extension);
		} else if (format === "canvas") {
			data.toBlob(function(blob) {
				saveAs(blob, name + "." + extension);
			});
		}
	};
	//
	this.button = function(config) {
		var parent = config.parent || document.body;
		var id = config.id;
		var fileName = config.fileName;
		var fileType = config.fileType;
		var getData = config.getData;
		var isFake = config.format === "fake";
		// create stylized downloadify element
		var container = document.createElement("div");
		container.className = "downloadifyContainer";
		var div = document.createElement("div");
		div.id = id;
		container.appendChild(div);
		//
		var div = document.createElement("div");
		div.className = "downloadify";
		div.style.cssText = "width: 90px; text-align: center;";
		div.innerHTML = config.title || fileName + "." + fileType;
		container.appendChild(div);
		parent.appendChild(container);
		//
		var element = document.getElementById(id);
		if (that.html5 || isFake) { // has native html5 support
			Event.add(div, "click", function() {
				if (isFake) 	return getData();
				that.download({
					name: fileName,
					extension: fileType,
					getData: getData
				});
			});
		}
	}; 	
	//
	var packageZip = function(data) {
		var zip = new JSZip();
		if (typeof(data.length) === "undefined") data = [ data ];
		for (var n = 0, length = data.length; n < length; n ++) {
			var split = data[n].data;
			var options = {};
			// figure out what type of data we're dealing with
			if (split.indexOf("base64") !== -1) {
				split = split.split(";");
				// it's base64, but is it binary also?
				if (dataFormat[split[0].substr(5)]) options.binary = false;
				options.base64 = true;
				split = split[1].substr(7); // extract base64 data
			}
			zip.file(data[n].name, split, options);
		}
		// record the zip back to data
		return zip.generate({type:"blob"});
	};
	//
	if (config.callback) {
		this.boot(config.callback);
	}
	//
	return this;
};

})();
/*
	----------------------------------------------------
	Uploader.js : 0.5 : 2012/07/02 : http://mudcu.be
	----------------------------------------------------
	Copyright 2010-2012 Michael Deal. All rights reserved.
	----------------------------------------------------
	FileReader, Blobs, XHR2, DnD, JSON.
	----------------------------------------------------
	var uploader = new widgets.Uploader({
		action: "./Uploader.php?upload=true", // Page to POST to.
		mode: "upload", // "read" or "upload"
		maxFiles: Infinity,
		dropArea: document.getElementById("canvas-area"),
		dropAreaMessage: "Drop Photo Here",
		dropAreaStyle: "position: absolute; background: rgba(255,0,0,1)",
		fakeInputParent: container,
		fakeInput: image,
		formats: "ggr,png",
		onChange: function(self, files) {

		}
	});
	// Example of upload from external source.
	new uploader.upload({
		src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQIW2NkAAIAAAoAAggA9GkAAAAASUVORK5CYII=",
		size: 92,
		name: "test.png"
	}, function(self, response) {
		console.log(self, response)
	});
	// Add drop are to an iFrame.
	uploader.createDropArea(iframe);
*/

window.widgets || (window.widgets = {})

widgets.Uploader = function(conf) {
	var that = this;

	/// Setup configuration.
	conf = conf || {};
	this.action = conf.action || "./upload.php?upload=true"; // Path to upload.
	this.confirm = conf.confirm || "boolean"; // json, boolean, or text
	this.onUpload = conf.onUpload;
	this.onProgress = conf.onProgress;
	this.onLoad = conf.onLoad;
	this.onError = conf.onError;
	this.onAbort = conf.onAbort;
	this.onChange = conf.onChange; // Callback for file drop.
	this.mode = conf.mode || "read"; // "read" or "upload"
	this.maxFiles = conf.maxFiles || 1; // Default to 1-file.
	this.maxFileSize = conf.maxFileSize || 104857600; // Default 100MB.
	this.directory = conf.directory || false;
	if (typeof(conf.fakeInput) === "object") {
		this.fakeInput = conf.fakeInput; // Stylized button to capture "file" input.
		this.fakeInputParent = conf.fakeInputParent || this.fakeInput.parentNode || document.body;
	} else if (typeof(conf.fileInput) === "object") {
		this.fileInput = conf.fileInput;
	}
	this.dropAreaContainer = conf.dropArea || document.body; // Element to initialize for dropping.
	this.dropAreaMessage = conf.dropAreaMessage || 'Drop File(s) Anywhere';
	this.dropAreaStyle = conf.dropAreaStyle || "";
	this.files = {}; // Collection of dropped files.
	this.formats = {}; // Default native <image> formats.
	var formats = conf.formats;
	if (formats && formats.indexOf(",") === -1) {
		this.formats[formats] = true;
	} else {
		formats = (conf.formats || "jpg,jpeg,gif,png").split(",");
		while(formats.length) this.formats[formats.shift().toLowerCase()] = true;
	}

	this.createFileInput = function() {
		if (that.fileInput) { // raw input area.
			var fileInput = that.fileInput;
		} else { // styled input area.
			var fileInput = that.fileInput = document.createElement("input");
			fileInput.style.cssText = "position: absolute; top: 0; z-index: 1000; font-size: 1000px; text-align: right; width: inherit; height: inherit; cursor: pointer; right: 0px; filter: alpha(opacity: 0); opacity: 0;";
			fileInput.setAttribute("type", "file");
			// Multiple file support.
			if (that.maxFiles > 1) {
				fileInput.setAttribute("name", "files[]");
				fileInput.setAttribute("multiple", "multiple");
			} else { // Single file support.
				fileInput.setAttribute("name", "file");
			}
			// Directory support.
			if (that.directory) {
				fileInput.setAttribute("directory", "");
				fileInput.setAttribute("mozdirectory", "");
				fileInput.setAttribute("webkitdirectory", "");
			}
			// Setup clickable element.
			var fakeInput = that.fakeInput;
			var fakeInputContainer = that.fakeInputContainer = document.createElement('div');
			fakeInputContainer.style.cssText = "position: relative; overflow: hidden;";
			fakeInputContainer.className = "fakeInputContainer";
			// Resizing elements to fit the area.
			var width = fakeInput.width || fakeInput.offsetWidth;
			var height = fakeInput.height || fakeInput.offsetHeight;
			fakeInput.onload = function() {
				var width = fakeInput.width || fakeInput.offsetWidth;
				var height = fakeInput.height || fakeInput.offsetHeight;
				fakeInputContainer.style.width = width + "px";
				fakeInputContainer.style.height = height + "px";
				// Attach to document.
				fakeInputContainer.appendChild(fakeInput);
				fakeInputContainer.appendChild(fileInput);
				that.fakeInputParent.appendChild(fakeInputContainer);
			};
			// Check whether resource has loaded.
			if (width !== 0 && height !== 0) fakeInput.onload();
		}
		// Setup listener.
		fileInput.onchange = function(event) {
			if (fileInput.files && fileInput.files.length) { // modern browsers.
				handleFiles(event.target.files);
			} else { // older browsers.
				var src = fileInput.value;
				var fileName = src.replace(/\\/g,'/').replace( /.*\//, '' );
				handleFiles([{
					src: src,
					name: fileName
				}]);
			}
		};
	};

	/// Create drop area.
	var dropArea = document.createElement("form");
	dropArea.style.cssText = "z-index: 10000; background: rgba(0,200,0, 0.5); position: fixed; width: 100%; height: 100%; left: 0; top: 0; display: none; font-weight: bold; font-size: 2.5em; color: #fff; line-height: 6em; text-align: center; text-shadow: 0 0 15px #000;";
	//
	this.createDropArea = function(container) {
		var hasContainer = !!container;
		var container = container || this.dropAreaContainer;
		if (that.dropAreaStyle) dropArea.style.cssText += that.dropAreaStyle;
		dropArea.innerHTML = that.dropAreaMessage;
		// Initialize event handling.
		dropArea.ondragenter = function(event) {
			event.preventDefault();
			event.stopPropagation();
			return false;
		};
		dropArea.ondragover = function(event) {
			event.preventDefault();
			event.stopPropagation();
			return false;
		};
		dropArea.ondrop = function(event) {
			event.preventDefault();
			event.stopPropagation();
			dropArea.style.display = "none";
			if (typeof(event.dataTransfer) === 'undefined') return;
			if (typeof(event.dataTransfer.files) === 'undefined') return;
			if (event.dataTransfer.files.length === 0) return;
			handleFiles(event.dataTransfer.files);
		};
		dropArea.ondragleave = function(event) {
			event.preventDefault();
			event.stopPropagation();
			setTimeout(function() { // prevent dragleave firing before drop
				dropArea.style.display = "none";
			}, 100);
		};

		/// Append the drop area to the element.
		var element = container;
		if (element === window) element = document.body;
		if (!hasContainer) element.appendChild(dropArea);
		// Initialize the drop area on "dragenter".
		element.ondragenter = function(event) {
			if (typeof(event.dataTransfer) === 'undefined') return;
			if (typeof(event.dataTransfer.files) === 'undefined') return;
			setTimeout(function() { // fix for Safari on Windows.
				dropArea.style.display = "block";
			}, 10);
		};
		// Resize the drop area on "resize".
		if (element === document.body) {
			(window.onresize = function(event) {
				if (!window.innerWidth && document.body && document.body.offsetWidth) {
					window.innerWidth = document.body.offsetWidth;
					window.innerHeight = document.body.offsetHeight;
				}
				if (window.innerWidth && window.innerHeight) {
					dropArea.style.width = window.innerWidth + "px";
					dropArea.style.height = window.innerHeight + "px";
				}
			})();
		}
	};

	var hash = { length: 0 };
	var handleFiles = function(files) {
		var idx = 0;
		var length = files.length;
		var getFileData = function(self, files) {
			if (typeof(files.src) !== "undefined") {
				files = [ files ];
			}
			///
			for (var key in files) {
				var file1 = files[key];
				var id = file1.name + file1.size;
				var nid = hash[id];
				var file0 = that.files[nid];
				if (typeof(file0) === "undefined") {
					var nid = hash[id] = hash[file1.name];
					delete hash[file1.name];
					file0 = that.files[nid];
				}
				file0.src = file1.src;
				file0.size = file1.size;
				file0.type = file1.type;
				file0.name = file1.name;
			}
			getNextFile();
		};
		var getLocalFileData = function(file) {
			var key = hash[file.name + (file.size || "")];
			if (file.type && file.type.indexOf("image") === -1) {
				var fileReader = new FileReader();
				fileReader.onload = function(text) {
					that.files[key].src = event.target.result;
					that.files[key].isLoaded = true;
					return getNextFile();
				};
				fileReader.readAsText(file)
				return;
			}
			try {
				var URL = window.URL || window.webkitURL;
				var src = URL.createObjectURL(file);
				that.files[key].src = src;
				that.files[key].isLoaded = true;
				return getNextFile();
			} catch (e) {
				try {
					var fileReader = new FileReader();
					fileReader.onload = function (event) {
						that.files[key].src = event.target.result;
						that.files[key].isLoaded = true;
						return getNextFile();
					};
					fileReader.readAsDataURL(file);
				} catch (e) {
					file.upload = new that.upload(file, getFileData);
				}
			}
		};

		var getNextFile = function() {
			var file = files[idx];
			if (++ idx > that.maxFiles || !file) { // When the queue is complete.
				if (that.maxFiles === 1) {
					var tmp = {};
					var file = files[0];
					var key = hash[file.name + (file.size || "")];
					tmp[key] = that.files[key];
					if (!that.files[key]) {
						if (that.onError) that.onError(that, "UPLOAD_ERR_FORMAT");
						return;
					}
					return that.onChange(that, tmp);
				} else {
					for (var key in that.files);
					if (!that.files[key]) return;
					return that.onChange(that, that.files);
				}
			}

			// Check whether file exists in queue.
			var id = file.name + (file.size || "");
			var tmp = that.files[hash[id]];
			if (tmp) { // File has been processed before.
				if (that.mode === "upload" && tmp.isUploaded) {
					return getNextFile(); // dont upload twice
				} else if (that.mode === "read" && tmp.isLoaded) {
					return getNextFile(); // dont preview twice
				}
			}

			// Check for extension.
			var key = hash[id] = hash.length ++;
			var name = file.name;
			var extension = name.substr(name.lastIndexOf(".") + 1).toLowerCase();

			// Not acceptable format.
			if (!that.formats[extension]) return getNextFile();

			// Check whether file is empty.
			var size = file.fileSize || file.size;
			if (size === 0) {
				return getNextFile();
			} else if (size && size > that.maxFileSize) {
				if (that.onError) that.onError(that, "UPLOAD_ERR_FORM_SIZE");
				return getNextFile();
			}

			// Add file to queue.
			that.files[key] = file;

			if (that.mode === "upload") {
				file.upload = new that.upload(file, getFileData);
			} else if (that.mode === "read") {
				getLocalFileData(file);
			} else { // queue.
				return getNextFile();
			}
		};
		///
		getNextFile();
	};

	//////

	this.errors = {
		"UPLOAD_ERR_INI_SIZE": "The uploaded file exceeds the upload_max_filesize directive",
		"UPLOAD_ERR_FORM_SIZE": "The uploaded file exceeds the MAX_FILE_SIZE directive",
		"UPLOAD_ERR_PARTIAL": "The uploaded file was only partially uploaded",
		"UPLOAD_ERR_NO_FILE": "No file was uploaded",
		"UPLOAD_ERR_NO_TMP_DIR": "Missing a temporary folder",
		"UPLOAD_ERR_CANT_WRITE": "Failed to write file to disk",
		"UPLOAD_ERR_EXTENSION": "A PHP extension stopped the file upload",
		"UPLOAD_ERR_FORMAT": "The uploaded file was an invalid format", // custom
		"UPLOAD_ERR_XHTTP": "" // custom
	};

	this.upload = function (files, callback) {
		var self = this;
		self.files = String(files) === "[object Object]" ? [files] : files;
		self.transferSpeed = 0;
		self.transferTotal = 0;
		self.transferPercent = 0;
		self.timeRemaining = 0;
		self.timeLapse = 0;
		self.bytes = 0;
		if (that.onUpload) that.onUpload(self);
		if (window.FormData) { // FormData
			uploadFormData(self, callback);
		} else { // iFrame
			uploadFrame(self, callback);
		}
	};

	var handleObject = function(files, callback) {
		switch(Object.prototype.toString.call(files)) {
			case "[object Array]": // multiple files in array.
				for (var n = 0, length = files.length; n < length; n ++) {
					callback(files[n]);
				}
				break;
			case "[object Object]": // multiple files in object.
				for (var key in files) {
					callback(files[key]);
				}
				break;
			default: // single file.
				callback(files);
				break;
		}
	};

	var uploadFormData = function(self, callback) {
		// Firefox 4+, Chrome 7+, Safari 5+, Opera 12+, IE 10+
		var data = new FormData();
		// Append files to FormData.
		handleObject(self.files, function(file) {
			if (typeof(file.data) !== "undefined") {
				data.append(file.name, file.data);
			} else if (file.src && file.src.substr(0, 5) === "data:") { // uploading base64 data.
				var content = JSON.stringify(file);
				data.append(file.name, content);
			} else { // uploading a file.
				var content = file;
				data.append(file.name + (file.size || ""), content);
			}
		});
		// Create HTTP Request.
		var xhttp = new XMLHttpRequest();
		xhttp.upload.onprogress = function (event) {
			if (event.lengthComputable) {
				var bytes = event.loaded;
				self.transferPercent = Math.round(bytes * 100 / event.total);
				self.transferTotal = getSizeFormat(bytes);
				// Get transfer speed.
				var bytesDiff = (bytes - self.bytes) * 2;
				if (bytesDiff !== 0) {
					self.bytes = bytes;
					self.transferSpeed = getSizeFormat(bytesDiff);
					self.timeRemaining = getTimeFormat((event.total - self.bytes) / bytesDiff);
					self.timeLapse = getTimeFormat(Date.now() - event.timeStamp);
				}
				if (that.onProgress) that.onProgress(self);
			} else {
				self.transferSpeed = 0;
				self.transferTotal = 0;
				self.transferPercent = 0;
				self.timeRemaining = 0;
			}
		};
		xhttp.onload = function (event) {
			// Indicate files as uploaded.
			handleObject(self.files, function(file) {
				if (typeof(file.date) !== "undefined") return;
				file.isUploaded = true;
			});
			// Send response.
			var response = event.target.responseText;
			if (that.confirm === "json") {
				try {
					response = JSON.parse(response);
				} catch(e) {
					console.log(event.target.responseText);
				}
			}
			if (that.errors[response]) {
				if (that.onError) that.onError(that, response);
			} else {
				if (that.onLoad) that.onLoad(self, response);
				if (callback) callback(self, response);
			}
		};
		xhttp.onerror = function (event) {
			if (that.onError) that.onError(that, "UPLOAD_ERR_XHTTP");
		};
		xhttp.onabort = function (event) {
			if (that.onAbort) that.onAbort(self);
		};
		xhttp.open("POST", that.action);
		xhttp.send(data);
	};

	var uploadFrame = function(self, callback) {
		// Fallback
		var form = document.createElement("form");
		document.body.appendChild(form);
		var iframe = document.createElement("iframe");
		iframe.setAttribute("id", "upload_iframe");
		iframe.setAttribute("name", "upload_iframe");
		iframe.setAttribute("width", "0");
		iframe.setAttribute("height", "0");
		iframe.setAttribute("border", "0");
		iframe.setAttribute("style", "width: 0; height: 0; border: none;");
		form.appendChild(iframe);
		///
		window.frames['upload_iframe'].name = "upload_iframe";
		///
		iframe.onload = function () {
			iframe.onload = "";
			// Get message from the server.
			if (iframe.contentDocument) {
				var body = iframe.contentDocument.body;
			} else if (iframe.contentWindow) {
				var body = iframe.contentWindow.document.body;
			} else if (iframe.document) {
				var body = iframe.document.body;
			}
			// Process message.
			if (body.innerHTML) {
				// Indicate files as uploaded.
				handleObject(self.files, function(file) {
					if (typeof(file.date) !== "undefined") return;
					file.isUploaded = true;
				});
				// Send response.
				var response = body.innerHTML;
				if (that.confirm === "json") {
					try {
						response = JSON.parse(response);
					} catch(e) {
						console.log(response);
					}
				}
				if (that.errors[response]) {
					if (that.onError) that.onError(that, response);
				} else {
					if (that.onLoad) that.onLoad(self, response);
					if (callback) callback(self, response);
				}
			}
			// Remove the iframe.
			setTimeout(function() {
				form.parentNode.removeChild(form);
				if (!that.fileInput.parent) return;
				that.fileInput.parent.appendChild(that.fileInput);
			}, 250);
		};
		///
		handleObject(self.files, function(file) {
			if (typeof(file.data) !== "undefined") {
				var input = document.createElement("input");
				input.type = "hidden";
				input.value = file.data;
				input.name = file.name;
				form.appendChild(input);
			} else if (file.src && file.src.substr(0, 11) === "data:image/") { // uploading base64 data.
				var input = document.createElement("input");
				input.type = "hidden";
				input.value = JSON.stringify(file);
				input.name = file.name;
				form.appendChild(input);
			} else { // uploading a file.
				var input = that.fileInput;
				input.parent = input.parentNode;
				form.appendChild(input);
			}
		});
		///
		form.setAttribute("target", "upload_iframe");
		form.setAttribute("action", that.action);
		form.setAttribute("method", "post");
		form.setAttribute("enctype", "multipart/form-data");
		form.setAttribute("encoding", "multipart/form-data");
		form.submit();
	};

	var getSizeFormat = function (bytes) {
		if (bytes > 1048576) {
			return (Math.round(bytes * 100 / 1048576) / 100) + "MB";
		} else if (bytes > 1024) {
			return Math.round(bytes / 1024) + "KB";
		} else {
			return bytes + "B";
		}
	};

	var getTimeFormat = function(time) {
		var hours = (time / 3600) >> 0;
		var minutes = ((time - (hours * 3600)) / 60) >> 0;
		var seconds = time - (hours * 3600) - (minutes * 60);
		if (hours < 10) hours = "0" + hours;
		if (minutes < 10) minutes = "0" + minutes;
		if (seconds < 10) seconds = "0" + seconds;
		return hours + ':' + minutes + ':' + seconds;
	};
	///
	if (this.dropAreaContainer) this.createDropArea();
	if (this.fakeInput || this.fileInput) this.createFileInput();
	///
	return this;
};
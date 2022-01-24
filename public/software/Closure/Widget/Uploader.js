/*
	----------------------------------------------------
	Uploader.js : 0.4.4 : 2012/11/19 : http://mudcu.be
	----------------------------------------------------
	Copyright 2010-2013 Mudcube. All rights reserved.
	----------------------------------------------------
	FileReader, Blobs, XHR2, DnD, JSON.
	----------------------------------------------------
	var uploader = new widget.Uploader({ 
		action: "./Uploader.php?upload=true", // Page to POST to.
		mode: "upload", // "read" or "upload"
		maxFiles: Infinity, // not required; default is 1
		dropArea: document.getElementById("canvas-area"),
		dropAreaMessage: "Drop Photo Here",
		dropAreaStyle: "position: absolute; background: rgba(255,0,0,1)",
		fakeInputParent: container, // not required; alternatively will replace fileInput, or append to document.body.
		fakeInput: image,
		formats: "ggr,png",
		onChange: function(self, event) {
			console.log(self.file); // when maxFiles=1
			console.log(self.files);
			console.log(self.changedFiles);
			console.log(event); // get the coords of the onDrop state
		},
		onLoad: function(self) {
			loader.stop();
		},
		onProgress: function(self) {
			loader.message("Transfer: " + self.transferPercent+"%");
		},
		onError: function(self, error, event) {
			/// XHTTP is special; http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html
			if (error === "UPLOAD_ERR_XHTTP") console.log(event);
			/// Other errors are defined below.
			console.log(self.translation[error]);
			loader.stop();
		}
	});
	// Example of upload from external source.
	new uploader.upload({
		action: "./save.php",
		files: {
			src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQIW2NkAAIAAAoAAggA9GkAAAAASUVORK5CYII=",
			size: 92,
			name: "test.png"
		}, 
		onUpload: function(self, response) {
			console.log(self, response)
		}
	});
	// Add drop are to an iFrame.
	uploader.createDropArea(iframe);
	//
	this.setLanguage({
		"UPLOAD_ERR_INI_SIZE": "The uploaded file exceeds the upload_max_filesize directive",
		"UPLOAD_ERR_FORM_SIZE": "The uploaded file exceeds the MAX_FILE_SIZE directive",
		"UPLOAD_ERR_PARTIAL": "The uploaded file was only partially uploaded",
		"UPLOAD_ERR_NO_FILE": "No file was uploaded",
		"UPLOAD_ERR_NO_TMP_DIR": "Missing a temporary folder",
		"UPLOAD_ERR_CANT_WRITE": "Failed to write file to disk",
		"UPLOAD_ERR_EXTENSION": "A PHP extension stopped the file upload",
		"UPLOAD_ERR_FORMAT": "The uploaded file was an invalid format"
	});
	////
	- figure out how to prevent internal dragging from triggering in ondragenter
*/

if (typeof(widget) === "undefined") var widget = {};

widget.Uploader = function(conf) { "use strict";
	var that = this;

	/// Setup configuration.
	conf = conf || {};
	this.debug = false;
	this.action = conf.action || "./filemanager.php?upload=true"; // Path to upload.
	this.confirm = conf.confirm || "text"; // json, boolean, or text
	this.onUpload = conf.onUpload || conf.onupload;
	this.onProgress = conf.onProgress || conf.onprogress; 
	this.onLoad = conf.onLoad || conf.onload;
	this.onInputReady = conf.onInputReady || conf.oninputready;
	this.onError = conf.onError || conf.onerror;
	this.onAbort = conf.onAbort || conf.onabort;
	this.onChange = conf.onChange || conf.onchange; // onUpload for file drop.
	this.mode = conf.mode || "read"; // "read" or "upload"
	this.maxFiles = conf.maxFiles || 1; // Default to 1-file.
	this.maxFileSize = conf.maxFileSize || 104857600; // Default 100MB.
	this.directory = conf.directory || false;
	if (typeof(conf.fakeInput) === "object") {
		this.fakeInput = conf.fakeInput; // Stylized button to capture "file" input.
		this.fakeInputParent = conf.fakeInputParent || null;
	} else if (typeof(conf.fileInput) === "object") {
		this.fileInput = conf.fileInput;
	}
	this.dropAreaContainer = conf.dropArea || document.body; // Element to initialize for dropping.
	this.dropAreaMessage = conf.dropAreaMessage || 'Drop File(s) Here';
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

	/// Uploader input field.
	this.createFileInput = function() {
		if (that.fileInput) { // raw input area.
			var fileInput = that.fileInput;
		} else { // styled input area.
			var fileInput = that.fileInput = document.createElement("input");
			fileInput.style.cssText = "position: absolute; top: 0; z-index: 1000; font-size: 1000px; text-align: right; width: inherit; height: inherit; cursor: pointer; right: 0; filter: alpha(opacity: 0); opacity: 0;";
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
			var parent = that.fakeInputParent || fakeInput.parentNode;
			fakeInputContainer.style.cssText = "position: relative; overflow: hidden; display: inline-block;";
			fakeInputContainer.className = "fakeInputContainer";
			// Resizing elements to fit the area.
			var skipcheck = { A: true, SPAN: true };
			var onload = function() {
				// Attach to document.
				if (that.fakeInputParent) { // Place into parent.
					that.fakeInputParent.appendChild(fakeInputContainer);
				} else { // Replace element.
					parent.replaceChild(fakeInputContainer, fakeInput);
				}
				fakeInputContainer.appendChild(fakeInput);
				fakeInputContainer.appendChild(fileInput);
				var width = fakeInput.width || fakeInput.offsetWidth;
				var height = fakeInput.height || fakeInput.offsetHeight;
				if (skipcheck[fakeInput.nodeName]) {
					if (that.onInputReady) that.onInputReady();
				} else {
					if (!width || !height) return setTimeout(onload, 250);
					fakeInputContainer.style.width = width + "px";
					fakeInputContainer.style.height = height + "px";
					if (that.onInputReady) that.onInputReady();
				}
			};
			// Check whether resource has loaded.
			var width = fakeInput.width || fakeInput.offsetWidth;
			var height = fakeInput.height || fakeInput.offsetHeight;
			if (!width && !height) { // IE bug.
				window.setTimeout(onload, 250);
			} else { //
				onload();
			}
		}
		// Setup listener.
		this.initFileInput(fileInput);
	};
	
	this.initFileInput = function(fileInput) {
		fileInput.onchange = function(event) {
			if (fileInput.files && fileInput.files.length) { // modern browsers.
				handleFiles(event.target.files, event);
			} else { // older browsers.
				var src = fileInput.value;
				var fileName = src.replace(/\\/g,'/').replace(/.*\//, '');
				handleFiles([{
					src: src,
					name: fileName
				}], event);
			}
		};
	};

	/// Create drop area.
	var dropArea = document.createElement("form");
	dropArea.style.cssText = "z-index: 999999999; background: rgba(0,200,0, 0.5); position: fixed; width: 100%; height: 100%; left: 0; top: 0; display: none; font-weight: bold; font-size: 2.5em; color: #fff; line-height: 6em; text-align: center; text-shadow: 0 0 15px #000;";
	///
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
			handleFiles(event.dataTransfer.files, event);
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
				if (window.innerWidth && window.innerHeight) {
					dropArea.style.width = window.innerWidth + "px";
					dropArea.style.height = window.innerHeight + "px";
				}
			})();
		}
	};
	
	var hashFiles = { length: 0 };
	var handleFiles = function(files, event) {
		if (that.onProgress) that.onProgress({ transferPercent: 100 });
		///
		var idx = 0;
		var length = files.length;
		var getFileData = function(self, files) {
			if (files.src) files = [ files ];
			///
			for (var key in files) {
				var file0 = that.files[key];
				var file1 = files[key];
				file0.src = file1.src;
				file0.size = file1.size;
				file0.type = file1.type;
				file0.name = file1.name;
			}
			///
			getNextFile();
		};
		var isWebImage = {
			jpg: true,
			jpeg: true,
			gif: true,
			png: true
		};
		var getLocalFileData = function(file) {
			var hash = file.hash;
			if (file.type && !isWebImage[file.type.substr(6).toLowerCase()]) {
				var fileReader = new FileReader();
				fileReader.onload = function(event) {
					that.files[hash].src = event.target.result;
					that.files[hash].isLoaded = true;
					return getNextFile();
				};
				fileReader.readAsText(file)
				return;
			}
			try {
				var URL = window.URL || window.webkitURL;
				var src = URL.createObjectURL(file);
				that.files[hash].src = src;
				that.files[hash].isLoaded = true;
				return getNextFile();
			} catch (e) {
				try {
					var fileReader = new FileReader();
					fileReader.onload = function (event) {
						that.files[hash].src = event.target.result;
						that.files[hash].isLoaded = true;
						return getNextFile();
					};
					fileReader.readAsDataURL(file);
				} catch (e) {
					file.upload = new that.upload({
						file: file, 
						onUpload: getFileData
					});
				}
			}
		};
		var getNextFile = function(instant) {
			if (instant) {
				getNext();
			} else { // allow time to breath
				setTimeout(getNext, 30);
			}
		};
		var getNext = function() {
			var file = files[idx];
			if (++ idx > that.maxFiles || !file) { // When the queue is complete.
				if (that.onLoad) that.onLoad();
				if (that.maxFiles === 1) {
					if (typeof(files[0]) === "undefined") {
						if (that.onError) that.onError(that, "UPLOAD_ERR_FORMAT");
						return;
					}
					that.file = files[0];
					return that.onChange(that, event);
				} else {
					for (var key in that.files);
					if (!that.files[key]) return;
					return that.onChange(that, event);
				}
			}
			// Check whether file exists in queue.
			var hash = that.createFileHash(file);
			var exists = that.files[hashFiles[hash]];
			if (exists) { // File has been processed before.
				that.changedFiles[hashFiles[hash]] = file;
				if (that.mode === "upload" && exists.isUploaded) {
					return getNextFile(true); // dont upload twice
				} else if (that.mode === "read" && exists.isLoaded) {
					return getNextFile(true); // dont preview twice
				}
			}

			// Check for extension.
			var key = hashFiles[hash] = hashFiles.length ++;
			var name = file.name;
			var extension = name.substr(name.lastIndexOf(".") + 1).toLowerCase();

			// Not acceptable format.
			if (!that.formats[extension]) {
				if (that.onError) that.onError(that, "UPLOAD_ERR_FORMAT");
				return getNextFile(true); 
			}

			// Check whether file is empty.
			var size = file.fileSize || file.size;
			if (size === 0) {
				if (that.onError) that.onError(that, "UPLOAD_ERR_NO_FILE");
				return getNextFile(true);
			} else if (size && size > that.maxFileSize) {
				if (that.onError) that.onError(that, "UPLOAD_ERR_FORM_SIZE");
				return getNextFile(true);
			}

			// Add file to queue.
			file.hash = hash;
			that.files[hash] = file;
			that.changedFiles[hash] = file;

			if (that.mode === "upload") {
				file.upload = new that.upload({
					file: file, 
					onUpload: getFileData
				});
			} else if (that.mode === "read") {
				getLocalFileData(file);
			} else { // queue.
				return getNextFile(true);
			}
		};
		///
		that.changedFiles = {};
		getNextFile();
	};
	
	//////
	
	this.createFileHash = function(file) {
		var safeFile = {};
		safeFile.name = file.name;
		safeFile.src = file.src;
		safeFile.size = file.size || file.fileSize;
		safeFile.type = file.type;
		var str = JSON.stringify(safeFile);
		var hash = 5381; // Dan Bernstein (djb2)
		for (var n = 0, length = str.length; n < length; n ++) {
			var c = str[n].charCodeAt();
			hash = ((hash << 5) + hash) + c;
		}
		return hash;
	};
	
	this.setLanguage = function(conf) {
		for (var key in conf) {
			this.translation[key] = conf[key];
		}
	};
	
	this.translation = { // language translations.
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
	
	this.upload = function (conf) {
		var self = this;
		self.onUpload = conf.onUpload;
		self.onProgress = conf.onProgress;
		self.action = conf.action || that.action;
		self.confirm = conf.confirm || that.confirm;
		self.files = String(conf.file).indexOf("[object") === 0 ? [conf.file] : conf.files;
		self.transferSpeed = 0;
		self.transferTotal = 0;
		self.transferPercent = 0;
		self.timeRemaining = 0;
		self.timeLapse = 0;
		self.bytes = 0;
		if (that.onUpload) that.onUpload(self);
		if (window.FormData) { // FormData
			uploadFormData(self, conf.onUpload);
		} else { // iFrame
			uploadFrame(self, conf.onUpload);
		}
	};

	var handleObject = function(files, onUpload) {
		switch(Object.prototype.toString.call(files)) {
			case "[object Array]": // multiple files in array.
				for (var n = 0, length = files.length; n < length; n ++) {
					onUpload(files[n]);
				}
				break;
			case "[object Object]": // multiple files in object.
				for (var key in files) {
					onUpload(files[key]);
				}
				break;
			default: // single file.
				onUpload(files);
				break;
		}	
	};

	var uploadFormData = function(self, onUpload) {
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
				data.append(file.hash, content);
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
				if (self.onProgress) {
					self.onProgress(self);
				} else if (that.onProgress) {
					that.onProgress(self);
				}
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
			if (self.confirm === "json") {
				try {
					response = JSON.parse(response);
				} catch(e) {
					console.log(event.target.responseText);			
				}
			}
			if (that.translation[response]) {
				if (that.onError) that.onError(that, response);
			} else {
				if (that.onLoad) that.onLoad(self, response);
				if (onUpload) onUpload(self, response);
			}
		};
		xhttp.onerror = function (event) {
			if (that.onError) that.onError(that, "UPLOAD_ERR_XHTTP", event);
		};
		xhttp.onabort = function (event) {
			if (that.onAbort) that.onAbort(self);
		};
		xhttp.open("POST", self.action);
		xhttp.send(data);
	};
	
	var uploadFrame = function(self, onUpload) {
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
		var onload = function () {
			// Get message from the server.
			try {
				var body = iframe.contentDocument.body;
			} catch(e) {
				try {
					var body = iframe.contentWindow.document.body;
				} catch(e) {
					var body = iframe.document.body;
				}
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
				if (self.confirm === "json") {
					try {
						response = JSON.parse(response);
					} catch(e) {
						console.log(response);			
					}
				}
				if (that.translation[response]) {
					if (that.onError) that.onError(that, response);
				} else {
					if (that.onLoad) that.onLoad(self, response);
					if (onUpload) onUpload(self, response);
				}
			}
			// Remove the iframe.
			setTimeout(function() {
				if (form.parentNode) form.parentNode.removeChild(form);
				if (!that.fileInput.parent) return;
				that.fileInput.parent.appendChild(that.fileInput);
			}, 250);
		};
		///
		if (iframe.addEventListener) {
			iframe.addEventListener("load", onload, true);
		} else if (iframe.attachEvent) {
			iframe.attachEvent("onload", onload);
		}
		///
		form.appendChild(iframe);
		///
		window.frames['upload_iframe'].name = "upload_iframe";
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
				input.name = file.hash;
				form.appendChild(input);
			}
		});
		///
		form.setAttribute("target", "upload_iframe");
		form.setAttribute("action", self.action);
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
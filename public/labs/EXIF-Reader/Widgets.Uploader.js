/*

	Uploader : 0.1 : mudcu.be
	--------------------------
	Requires Event.js
	--------------------------
	new widgets.uploader({ 
		callback: function(status, files, length) {
			if (files) {
				for (var key in files);
				if (!files[key] || !files[key].src) return; // no file exists
			}
		},
		formats: { "text/ggr": true },
		singleFile: true
	});
*/

if (typeof(widgets) == "undefined") var widgets = {};

widgets.uploader = function(props) {
	if (!props) props = {};
	var that = this;
	this.callback = props.callback;
	this.singleFile = props.singleFile || false;
	this.maxFiles = (this.singleFile ? 1 : props.max) || Infinity;
	this.fileCollection = {}; // contains files
	this.hasFileReader = window.FileReader ? true : false;
	this.acceptedFormats = props.formats || { 
		"image/jpg": true, 
		"image/jpeg": true, 
		"image/gif": true, 
		"image/png": true 
	};
	
	this.uploadCollection = function(callback) {
		var arr = [];
		var collection = uploader.fileCollection;
		for (var key in collection) {
			arr.push(collection[key]);
		}
		that.handleFiles(arr, { 
			upload: true,
			callback: callback
		});
	};
	
	this.preview = function(file) {
		// handle file-previewing
		var hash = file.name;
		var onLoadEndPreview = function(e) {
			that.fileCollection[hash].src = e.target.result;
			that.fileCollection[hash].preview = true;
			return getNext();
		};
		var preview = new FileReader();
		if (preview.addEventListener) { // firefox 3.6, webkit
			preview.addEventListener('loadend', onLoadEndPreview, false);
		} else { // chrome 7
			preview.onloadend = onLoadEndPreview;
		}
		preview.readAsDataURL(file);
	};
	
	this.upload = function(file) {
		var hash = file.name;
		if (that.hasFileReader) {
			// handle file-errors
			var onError = function(event) {
				switch(event.target.error.code) {
					case event.target.error.NOT_FOUND_ERR:
						that.status = 'File not found.';
						break;
					case event.target.error.NOT_READABLE_ERR:
						that.status = 'File not readable.';
						break;
					case event.target.error.ABORT_ERR:
						that.status = 'Upload has been aborted.';
						break; 
					default:
						that.status = 'Read error.';
						break;
				}
			}
			// update upload progress
			var onProgress = function(event) {
				if (event.lengthComputable) {
					that.status = Math.round((event.loaded * 100) / event.total);
				}				
			}
			// handle file-upload
			var onLoadEnd = function(e) {
				var xhttp = new XMLHttpRequest();
				xhttp.onreadystatechange = function(e) {
					if (xhttp.readyState == 4 && e.srcElement.responseText == "success") {
						that.fileCollection[hash].uploaded = true;
						return getNext();
					}
				};
				if (xhttp.sendAsBinary != null) { // firefox 3.6
					xhttp.open('POST', '?upload=true', true);
					var content = "--xxxxxxxxx\r\n";
					content += "Content-Disposition: form-data; name='upload'; filename='" + file.name + "'\r\n";
					content += "Content-Type: application/octet-stream\r\n\r\n";
					content += reader.result + "\r\n";
					content += "--xxxxxxxxx\r\n";
					xhttp.setRequestHeader('content-type', 'multipart/form-data; boundary=' + boundary);
					xhttp.sendAsBinary(content);
				} else { // chrome 7
					xhttp.open('POST', '?upload=true&base64=true', true);
					xhttp.setRequestHeader('X-FILENAME', file.name);
					xhttp.setRequestHeader('X-FILESIZE', file.size);
					xhttp.setRequestHeader('X-FILETYPE', file.type);
					xhttp.setRequestHeader('X-META', JSON.stringify(file.meta||{}));
					xhttp.send(window.btoa(reader.result));
				}
			};
			var reader = new FileReader();						
			if (reader.addEventListener) { // firefox 3.6, webkit
				reader.addEventListener('loadend', onLoadEnd, false);
				reader.addEventListener('error', onError, false);
				reader.addEventListener('progress', onProgress, false);
			} else { // chrome 7
				reader.onloadend = onLoadEnd;
				reader.onerror = onError;
				reader.onprogress = onProgress;
			}
			reader.readAsBinaryString(file);
		} else { // no FileReader (Opera)
			var xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function(e) {
				if (xhttp.readyState == 4 && e.srcElement.responseText == "success") {
					that.fileCollection[hash].uploaded = true;
					return getNext();
				}
			};
			xhttp.open('POST', '?upload=true', true);
			xhttp.setRequestHeader('X-FILENAME', file.name);
			xhttp.setRequestHeader('X-FILESIZE', file.size);
			xhttp.setRequestHeader('X-FILETYPE', file.type);
			xhttp.setRequestHeader('X-META', JSON.stringify(file.meta||{}));
			xhttp.send(file);
		}
	};
	
	var getNext = undefined;

	this.handleFiles = function(files, props) {
		var idx = 0;
		var length = files.length;
		if (!props) props = {};
		if (length > 0 && that.singleFile && props.upload != true) {
			that.fileCollection = {};
		}		
		(getNext = function() {
			var file = files[idx];
			var progress = {
				status: that.status,
				current: idx,
				length: length
			};
			if (++ idx > that.maxFiles || !file) {
				that.callback(progress, that.fileCollection, length - 1, props.event);
				return;
			} else { // status reporting
				that.callback(progress);
			}
			// check whether file exists in queue
			var hash = file.name;
			if (that.fileCollection[hash]) { 
				if (props.upload) {
					if (that.fileCollection[hash].uploaded) {
						return getNext(); // don't upload twice
					}
				} else if (that.fileCollection[hash].preview) {
					return getNext(); // don't preview twice
				}
			}
			that.fileCollection[hash] = file;
			// check for proper file-type
			var type = file.type;
			if (!type) type = "text/" + file.fileName.substr(file.fileName.lastIndexOf(".")+1);
			if (!that.acceptedFormats[type]) return getNext(); 
			// check whether file is empty
			var size = file.fileSize || file.size;
			if (size == 0) return getNext();
			//
			if (props.upload) {
				that.upload(file);
			} else if (props.preview && that.hasFileReader) {
				that.preview(file);
			} else { // nadda
				return getNext();
			}
		})();
	};

	// form area

	var form = document.createElement("form");
	form.action = "#";
	form.method = "post";
	form.enctype = "multipart/form-data";
	form.style.cssText = "z-index: 100; position: absolute; left: 0; top: 0; display: none;";
	form.addEventListener("dragenter", function(event) {

//-- this doesn't seem to work...
//		if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length == 0) {
//			return;
//		}

		Event.preventDefault(event); 
		Event.stopPropagation(event);
		form.style.background = "rgba(255,0,0,0.2)";
		return false;
	}, false); 
	form.addEventListener("dragover", function(event) {
		Event.preventDefault(event);
		Event.stopPropagation(event);
		return false;
	}, false); 
	form.addEventListener("drop", function(event) {
		Event.preventDefault(event); 
		Event.stopPropagation(event);
		form.style.display = "none";
		form.style.background = "none";
		if (event.dataTransfer && event.dataTransfer.files) {
			that.handleFiles(event.dataTransfer.files, { preview: true, event: event });
		}
	}, false);
	form.addEventListener("dragleave", function(event) {
		Event.preventDefault(event);
		Event.stopPropagation(event);
		window.setTimeout(function() { // prevent dragleave firing before drop
			form.style.display = "none";
			form.style.background = "none";
		}, 100);
	}, false);
	//
	var fileInput = document.createElement("input");
	fileInput.type = "file";
	fileInput.name = "files[]";
	if (!this.singleFile && this.maxFiles > 1) {
		fileInput.multiple = "multiple";
	}
	fileInput.style.cssText = "position: absolute; opacity: 0;";
	fileInput.addEventListener("change", function (event) {
		if (fileInput.files && fileInput.files[0]) { // multi-file upload via DragDrop
			that.handleFiles(fileInput.files, { preview: true, event: event });
		} else if (fileInput.value) { // old-school file upload
			console.log(fileInput.value);
			//--
		}
	}, false);
	fileInput.addEventListener("click", function (event) {
		Event.preventDefault(event);
		Event.stopPropagation(event);
	}, false);
	form.appendChild(fileInput);
	//
	var resize = function(event) {
		if (!window.innerWidth && document.body && document.body.offsetWidth) {
			window.innerWidth = document.body.offsetWidth;
			window.innerHeight = document.body.offsetHeight;
		}
		if (window.innerWidth && window.innerHeight) {
			form.style.width = window.innerWidth + "px";
			form.style.height = window.innerHeight + "px";
		}
	};
	resize();
	//
	window.addEventListener("dragenter", function(event) {
		form.style.display = "block";
	}, false);
	window.addEventListener("resize", resize, false);
	//
	document.body.appendChild(form);
	//
	return this;
};
/*
	Zen BG : 0.1 : http://mudcu.be
	----------------------------------------
 for Safari 5.03+ and Chrome 7+
background-image: -webkit-gradient(linear, left top, left bottom, color-stop(0, #ff0091), color-stop(1, #ff0091));

 for Firefox 3.6+
background-image: -moz-linear-gradient(top,  #ff0091 0%, #ff0091 100%);

 for Opera 11.1+
background-image: -o-linear-gradient(top,  #ff0091 0%, #ff0091 100%);

*/ if (typeof BG === "undefined") var BG = {};
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
var config = {
    textureEnabled: true,
    alpha: 0.75,
    scale: 1,
    seed: 11899,
    grayscale: true,
    rotate: Math.PI / 2
};
var noise = document.createElement("canvas");
var ctx_noise = noise.getContext("2d");
noise.width = 128;
noise.height = 128;
BG.generateNoise = function(grayscale) {
    if (!this.random) this.random = new sketch.util.Random(config.seed);
    var random = this.random;
    var time = new Date().getTime();
    var imgData = ctx_noise.getImageData(0, 0, noise.width, noise.height);
    var data = imgData.data;
    var xmax = imgData.width;
    var ymax = imgData.height;
    for(var y = 0; y < ymax; y++)for(var x = 0; x < xmax; x++){
        var i = y * 4 * xmax + x * 4;
        if (grayscale) {
            var r = random.intRange(0, 255);
            var g = random.intRange(0, 255);
            var b = random.intRange(0, 255);
            var lum = r * 0.3 + g * .59 + b * .11 >> 0;
            data[i] = lum;
            data[i + 1] = lum;
            data[i + 2] = lum;
            data[i + 3] = random.intRange(0, 255);
        } else {
            data[i] = random.intRange(0, 255);
            data[i + 1] = random.intRange(0, 255);
            data[i + 2] = random.intRange(0, 255);
            data[i + 3] = random.intRange(0, 255);
        }
    }
    ctx_noise.putImageData(imgData, 0, 0);
    return;
};
// CSS-Output
BG.generateCSSGradient = function() {
    var stops = BG.gradient.stops;
    var moz = ""; // create strings of color-stops
    var webkit = "";
    var hex = "";
    for(var key = 0, length = stops.length; key < length; key++){
        var colorStop = BG.gradient.stops[key];
        var stop = colorStop.stop;
        hex = Color.Space(colorStop, "RGB>HEX>W3");
        moz += "#" + hex + " " + (stop * 100 >> 0) + "%, ";
        webkit += "color-stop(" + stop + ", #" + hex + "), ";
        last = "#" + hex;
    }
    // via http://www.webdesignerwall.com/tutorials/cross-browser-css-gradient/
    return "background-image: -webkit-gradient(linear, left top, left bottom, " + webkit.substr(0, webkit.length - 2) + ");\n" + "background-image: -moz-linear-gradient(top,  " + moz.substr(0, moz.length - 2) + ");\n" + "background-image: -o-linear-gradient(top,  " + moz.substr(0, moz.length - 2) + ");";
};
BG.downloadCSS = function() {};
BG.closeFoxy = function() {
    document.getElementById("csscode").style.display = "none";
};
BG.generateCSS = function(e) {
    if (e) e.preventDefault();
    var href = document.createElement("a");
    href.href = window.location.href;
    BG.onFormSubmit(href.protocol + "//" + href.hostname + href.pathname + href.search);
    BG.picker.toggle(false);
    ///
    var inputZIP;
    function generate(value) {
        var p = document.createElement("p");
        p.style.cssText = "font: 16px courier; line-height: 1em";
        inputZIP = document.createElement("span");
        inputZIP.style.cssText = "margin: 0 2% 0 0";
        ///
        var inputReturn = document.createElement("input");
        inputReturn.type = "submit";
        inputReturn.value = "Return";
        inputReturn.onclick = BG.closeFoxy;
        inputReturn.style.cssText = "margin: 0";
        ///
        var span = document.createElement("span");
        span.style.cssText = "margin: 2% 0 0; background: rgba(255,120,200,0.75); padding: 0.65em 1em; border-radius: 4px; display: block";
        span.innerHTML = "CSS CODE";
        ///
        var pre = document.createElement("pre");
        pre.style.cssText = "font: 16px courier; margin: 2% 0 0 0; padding: 2%; border-radius: 4px; background: #333; line-height: 2em";
        pre.innerHTML = value;
        ///
        p.appendChild(inputZIP);
        p.appendChild(inputReturn);
        p.appendChild(span);
        p.appendChild(pre);
        ///
        return p;
    }
    ///
    var scale = config.scale;
    var temp = document.createElement("canvas");
    var ctx_temp = temp.getContext("2d");
    var cssArea = document.getElementById("foxybox");
    document.getElementById("csscode").style.display = "block";
    ///
    var imgContainer = document.createElement("div");
    var cssContainer = document.createElement("div");
    cssContainer.style.cssText = "margin: 2%;";
    cssArea.innerHTML = "";
    cssArea.appendChild(cssContainer);
    cssArea.appendChild(imgContainer);
    ///
    var maxWidth = config.textureEnabled ? BG.texture.width : 1;
    var maxHeight = config.textureEnabled ? BG.texture.height : 1;
    // use last color as the base background
    var stops = BG.gradient.stops;
    if (config.rotate < Math.PI) {
        var last = {
            id: 0,
            stop: -Infinity
        };
        for(var key in stops)if (stops[key].stop > last.stop) {
            last.id = key;
            last.stop = stops[key].stop;
        }
    } else {
        var last = {
            id: 0,
            stop: Infinity
        };
        for(var key in stops)if (stops[key].stop < last.stop) {
            last.id = key;
            last.stop = stops[key].stop;
        }
    }
    var hex = BG.gradient.stops[last.id];
    hex = Color.Space(hex, "RGB>HEX>W3");
    hex = "#" + hex;
    /// Single color.
    if (BG.gradient.stops.length === 1) {
        if (config.textureEnabled) {
            temp.width = maxWidth * scale;
            temp.height = maxHeight * scale;
            ctx_temp.drawImage(canvas, 0, 0);
            ///
            var data1 = temp.toDataURL("image/png");
            var image = document.createElement("img");
            image.src = data1;
            imgContainer.appendChild(image);
            ///
            var imagecode = [
                image
            ];
            var csscode = "background: " + hex + ';\nbackground-image: url("zenbg.png");';
            cssContainer.appendChild(generate(csscode));
        } else {
            var imagecode = [];
            var csscode = "background: " + hex;
            cssContainer.appendChild(generate(csscode));
        }
    } else {
        if (BG.width / scale < maxWidth) maxWidth = BG.width / scale;
        if (BG.height / scale < maxHeight) maxHeight = BG.height / scale;
        if (config.rotate % Math.PI) {
            var repeat = "repeat-x";
            temp.width = maxWidth * scale;
            temp.height = BG.height;
            ctx_temp.drawImage(canvas, 0, 0);
        } else {
            var repeat = "repeat-y";
            temp.width = BG.width;
            temp.height = maxHeight * scale;
            ctx_temp.drawImage(canvas, 0, 0);
        }
        var data1 = temp.toDataURL("image/png");
        var image = document.createElement("img");
        image.src = data1;
        imgContainer.appendChild(image);
        ///
        // decide whether we need to generate an image
        if (config.textureEnabled) {
            // cache and overwrite color-stops
            var cache = {
                active: BG.gradient.active,
                stops: []
            };
            for(var key in BG.gradient.stops)cache.stops.push(BG.gradient.stops[key]);
            // create image from last color-stop
            BG.gradient.stops = [
                BG.gradient.stops[last.id]
            ];
            BG.gradient.active = 0;
            BG.render();
            temp.width = maxWidth * scale;
            temp.height = maxHeight * scale;
            ctx_temp.drawImage(canvas, 0, 0);
            ///
            var data2 = temp.toDataURL("image/png");
            var image2 = document.createElement("img");
            image2.src = data2;
            imgContainer.appendChild(image2);
            ///
            // reset color-stops
            BG.gradient.stops = cache.stops;
            BG.gradient.active = cache.active;
            BG.render();
            // output css
            var imagecode = [
                image,
                image2
            ];
            var background = 'url("zenbg-1.png"), url("zenbg-2.png")';
            var csscode = "background: " + hex + ";\nbackground-image: " + background + ";\nbackground-repeat: " + repeat + ", repeat;";
            cssContainer.appendChild(generate(csscode));
            if (BG.remoteFrame) BG.remoteFrame.style.background = background;
        } else {
            var imagecode = [];
            var csscode = "background: " + hex + ";" + BG.generateCSSGradient() + ";\nbackground-repeat: " + repeat + ";";
            cssContainer.appendChild(generate(csscode));
            if (BG.remoteFrame) BG.remoteFrame.style.background = hex + background + repeat;
            imgContainer.style.display = "none";
        }
    }
    ///
    BG.fileSaver.button({
        parent: inputZIP,
        id: "csspackage",
        title: "ZenBG.zip",
        fileName: "ZenBG",
        fileType: "zip",
        format: "base64",
        getData: function() {
            var c = imagecode.length;
            var ret = [];
            ret.push({
                name: "style.css",
                data: "body {\n" + csscode + "\n}"
            });
            ret.push({
                name: "index.html",
                data: '<link href="./style.css" rel="stylesheet" type="text/css" />'
            });
            if (c === 0) return ret;
            ret.push({
                name: "ZenBG" + (c === 1 ? "" : "-1") + ".png",
                data: imagecode[0].src
            });
            if (c === 1) return ret;
            ret.push({
                name: "ZenBG-2.png",
                data: imagecode[1].src
            });
            return ret;
        }
    });
};
// User-Interface
BG.createGeneratorUI = function() {
    var content = document.getElementById("sidebar");
    cnt = document.createElement("div");
    content.appendChild(cnt);
    ///
    var span = document.createElement("span");
    span.style.cssText = "float: right;";
    var header = createHeader("Texture");
    var image = document.createElement("img");
    image.src = config.textureEnabled ? "./media/power.png" : "./media/powerOff.png";
    image.style.cssText = "position: relative; cursor: pointer; position: relative; left: -5px; top: -3px; ";
    var power = function() {
        var display = power.style.display;
        if (display === "none") {
            power.style.display = "block";
            config.textureEnabled = true;
            image.src = "./media/power.png";
        } else {
            power.style.display = "none";
            config.textureEnabled = false;
            image.src = "./media/powerOff.png";
        }
        BG.render();
    };
    Event.add(image, "click", power);
    Event.add(header, "dblclick", power);
    span.appendChild(image);
    header.appendChild(span);
    var power = document.createElement("div");
    power.style.cssText = "clear: both; padding: 0 7px;";
    if (!config.textureEnabled) power.style.display = "none";
    var div = document.createElement("div");
    div.style.cssText = "padding-top: 5px;";
    var element = document.createElement("div");
    element.id = "textures";
    div.appendChild(element);
    power.appendChild(div);
    power.appendChild(createInput({
        title: "Alpha",
        value: config.alpha * 100,
        onchange: function() {
            config.alpha = this.value / 100;
            BG.render();
        }
    }));
    power.appendChild(createInput({
        title: "Scale",
        min: 5,
        max: 50,
        value: 50,
        onchange: function() {
            if (this.value > 50) config.scale = (this.value - 50) / 50 + 1;
            else config.scale = this.value / 50;
            BG.render();
        }
    }));
    power.appendChild(document.createElement("br"));
    cnt.appendChild(power);
    // GRADIENT UI
    stopHeader = document.createElement("span");
    stopHeader.style.cssText = "float: right; position: relative; top: -8px";
    createHeader("Gradient").appendChild(stopHeader);
    stopContainer = document.createElement("div");
    stopContainer.style.cssText = "clear: both; padding: 0 7px";
    cnt.appendChild(stopContainer);
    BG.createColorStops();
    var br = document.createElement("div");
    br.style.cssText = "border-bottom: 1px solid #333; margin-top: 10px; clear: both;";
    cnt.appendChild(br);
    var div = document.createElement("div");
    var d = document.createElement("span");
    d.textContent = "Rotate:";
    d.className = "formSpan";
    div.appendChild(d);
    /// Left
    var rotateLeft = new Image();
    Event.add(rotateLeft, "click", function() {
        config.rotate = 0.0 * Math.PI * 2;
        BG.render();
    });
    rotateLeft.src = "./media/rotate-left.png";
    div.appendChild(rotateLeft);
    /// Top
    var rotateTop = new Image();
    Event.add(rotateTop, "click", function() {
        config.rotate = 0.25 * Math.PI * 2;
        BG.render();
    });
    rotateTop.src = "./media/rotate-up.png";
    div.appendChild(rotateTop);
    /// Right
    var rotateRight = new Image();
    Event.add(rotateRight, "click", function() {
        config.rotate = 0.5 * Math.PI * 2;
        BG.render();
    });
    rotateRight.src = "./media/rotate-right.png";
    div.appendChild(rotateRight);
    /// Bottom
    var rotateBottom = new Image();
    Event.add(rotateBottom, "click", function() {
        config.rotate = 0.75 * Math.PI * 2;
        BG.render();
    });
    rotateBottom.src = "./media/rotate-down.png";
    div.appendChild(rotateBottom);
    cnt.appendChild(div);
    var br = document.createElement("div");
    br.style.cssText = "border-bottom: 1px solid #333; margin-top: 10px; clear: both;";
    cnt.appendChild(br);
    cnt.appendChild(createInput({
        style: "float: right; margin: 5px 10px 10px;",
        title: " ",
        type: "submit",
        value: "Generate CSS3",
        onclick: BG.generateCSS
    }));
    var br = document.createElement("div");
    br.style.cssText = "border-bottom: 1px solid #333; margin-top: 10px; clear: both;";
    cnt.appendChild(br);
    //
    document.body.appendChild(canvas);
};
//
BG.onFormSubmit = function(url) {
    var location = window.location;
    var ret = JSON.stringify({
        width: BG.width,
        height: BG.height,
        config: config,
        gradient: BG.getColorStops()
    });
    if (document.getElementById("url")) var query = "?" + document.getElementById("url").value;
    else var query = "";
    url = url ? url : location.protocol + "//" + location.host + location.pathname + query;
    location.href = url + "#" + ret;
};
BG.saveStream = function(data) {
    document.location.href = data.replace("png", "image/octet-stream");
};
BG.createSeamlessTexture = function(src, callback) {
    var image = new Image();
    image.onload = function() {
        var canvas1 = document.createElement("canvas");
        var ctx1 = canvas1.getContext("2d");
        canvas1.width = image.width * 2;
        canvas1.height = image.height * 2;
        ///
        ctx1.drawImage(image, 0, 0);
        // flip horizontally
        ctx1.save();
        ctx1.translate(image.width * 2, 0);
        ctx1.scale(-1, 1);
        ctx1.drawImage(image, 0, 0);
        ctx1.restore();
        // flip horizontally + vertically
        ctx1.save();
        ctx1.translate(image.width * 2, image.height * 2);
        ctx1.scale(-1, -1);
        ctx1.drawImage(image, 0, 0);
        ctx1.restore();
        ctx1.save();
        ctx1.translate(0, image.height * 2);
        ctx1.scale(1, -1);
        ctx1.drawImage(image, 0, 0); // flip vertically
        ctx1.restore();
        ///
        callback(canvas1);
    };
    image.src = src;
};

//# sourceMappingURL=index.55cd6dc5.js.map

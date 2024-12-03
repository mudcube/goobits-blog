// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

(function (modules, entry, mainEntry, parcelRequireName, globalName) {
  /* eslint-disable no-undef */
  var globalObject =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
      ? global
      : {};
  /* eslint-enable no-undef */

  // Save the require from previous bundle to this closure if any
  var previousRequire =
    typeof globalObject[parcelRequireName] === 'function' &&
    globalObject[parcelRequireName];

  var cache = previousRequire.cache || {};
  // Do not use `require` to prevent Webpack from trying to bundle this call
  var nodeRequire =
    typeof module !== 'undefined' &&
    typeof module.require === 'function' &&
    module.require.bind(module);

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire =
          typeof globalObject[parcelRequireName] === 'function' &&
          globalObject[parcelRequireName];
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error("Cannot find module '" + name + "'");
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = (cache[name] = new newRequire.Module(name));

      modules[name][0].call(
        module.exports,
        localRequire,
        module,
        module.exports,
        this
      );
    }

    return cache[name].exports;

    function localRequire(x) {
      var res = localRequire.resolve(x);
      return res === false ? {} : newRequire(res);
    }

    function resolve(x) {
      var id = modules[name][1][x];
      return id != null ? id : x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [
      function (require, module) {
        module.exports = exports;
      },
      {},
    ];
  };

  Object.defineProperty(newRequire, 'root', {
    get: function () {
      return globalObject[parcelRequireName];
    },
  });

  globalObject[parcelRequireName] = newRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (mainEntry) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(mainEntry);

    // CommonJS
    if (typeof exports === 'object' && typeof module !== 'undefined') {
      module.exports = mainExports;

      // RequireJS
    } else if (typeof define === 'function' && define.amd) {
      define(function () {
        return mainExports;
      });

      // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }
})({"gWJjf":[function(require,module,exports) {
"use strict";
var global = arguments[3];
var HMR_HOST = null;
var HMR_PORT = null;
var HMR_SECURE = false;
var HMR_ENV_HASH = "d6ea1d42532a7575";
module.bundle.HMR_BUNDLE_ID = "73def2e4384ad77c";
/* global HMR_HOST, HMR_PORT, HMR_ENV_HASH, HMR_SECURE, chrome, browser, importScripts */ /*::
import type {
  HMRAsset,
  HMRMessage,
} from '@parcel/reporter-dev-server/src/HMRServer.js';
interface ParcelRequire {
  (string): mixed;
  cache: {|[string]: ParcelModule|};
  hotData: mixed;
  Module: any;
  parent: ?ParcelRequire;
  isParcelRequire: true;
  modules: {|[string]: [Function, {|[string]: string|}]|};
  HMR_BUNDLE_ID: string;
  root: ParcelRequire;
}
interface ParcelModule {
  hot: {|
    data: mixed,
    accept(cb: (Function) => void): void,
    dispose(cb: (mixed) => void): void,
    // accept(deps: Array<string> | string, cb: (Function) => void): void,
    // decline(): void,
    _acceptCallbacks: Array<(Function) => void>,
    _disposeCallbacks: Array<(mixed) => void>,
  |};
}
interface ExtensionContext {
  runtime: {|
    reload(): void,
  |};
}
declare var module: {bundle: ParcelRequire, ...};
declare var HMR_HOST: string;
declare var HMR_PORT: string;
declare var HMR_ENV_HASH: string;
declare var HMR_SECURE: boolean;
declare var chrome: ExtensionContext;
declare var browser: ExtensionContext;
*/ var OVERLAY_ID = "__parcel__error__overlay__";
var OldModule = module.bundle.Module;
function Module(moduleName) {
    OldModule.call(this, moduleName);
    this.hot = {
        data: module.bundle.hotData,
        _acceptCallbacks: [],
        _disposeCallbacks: [],
        accept: function(fn) {
            this._acceptCallbacks.push(fn || function() {});
        },
        dispose: function(fn) {
            this._disposeCallbacks.push(fn);
        }
    };
    module.bundle.hotData = undefined;
}
module.bundle.Module = Module;
var checkedAssets, acceptedAssets, assetsToAccept /*: Array<[ParcelRequire, string]> */ ;
function getHostname() {
    return HMR_HOST || (location.protocol.indexOf("http") === 0 ? location.hostname : "localhost");
}
function getPort() {
    return HMR_PORT || location.port;
} // eslint-disable-next-line no-redeclare
var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== "undefined") {
    var hostname = getHostname();
    var port = getPort();
    var protocol = HMR_SECURE || location.protocol == "https:" && !/localhost|127.0.0.1|0.0.0.0/.test(hostname) ? "wss" : "ws";
    var ws = new WebSocket(protocol + "://" + hostname + (port ? ":" + port : "") + "/"); // Safari doesn't support sourceURL in error stacks.
    // eval may also be disabled via CSP, so do a quick check.
    var supportsSourceURL = false;
    try {
        (0, eval)('throw new Error("test"); //# sourceURL=test.js');
    } catch (err) {
        supportsSourceURL = err.stack.includes("test.js");
    } // $FlowFixMe
    ws.onmessage = async function(event) {
        checkedAssets = {} /*: {|[string]: boolean|} */ ;
        acceptedAssets = {} /*: {|[string]: boolean|} */ ;
        assetsToAccept = [];
        var data = JSON.parse(event.data);
        if (data.type === "update") {
            // Remove error overlay if there is one
            if (typeof document !== "undefined") removeErrorOverlay();
            let assets = data.assets.filter((asset)=>asset.envHash === HMR_ENV_HASH); // Handle HMR Update
            let handled = assets.every((asset)=>{
                return asset.type === "css" || asset.type === "js" && hmrAcceptCheck(module.bundle.root, asset.id, asset.depsByBundle);
            });
            if (handled) {
                console.clear(); // Dispatch custom event so other runtimes (e.g React Refresh) are aware.
                if (typeof window !== "undefined" && typeof CustomEvent !== "undefined") window.dispatchEvent(new CustomEvent("parcelhmraccept"));
                await hmrApplyUpdates(assets);
                for(var i = 0; i < assetsToAccept.length; i++){
                    var id = assetsToAccept[i][1];
                    if (!acceptedAssets[id]) hmrAcceptRun(assetsToAccept[i][0], id);
                }
            } else if ("reload" in location) location.reload();
            else {
                // Web extension context
                var ext = typeof chrome === "undefined" ? typeof browser === "undefined" ? null : browser : chrome;
                if (ext && ext.runtime && ext.runtime.reload) ext.runtime.reload();
            }
        }
        if (data.type === "error") {
            // Log parcel errors to console
            for (let ansiDiagnostic of data.diagnostics.ansi){
                let stack = ansiDiagnostic.codeframe ? ansiDiagnostic.codeframe : ansiDiagnostic.stack;
                console.error("\uD83D\uDEA8 [parcel]: " + ansiDiagnostic.message + "\n" + stack + "\n\n" + ansiDiagnostic.hints.join("\n"));
            }
            if (typeof document !== "undefined") {
                // Render the fancy html overlay
                removeErrorOverlay();
                var overlay = createErrorOverlay(data.diagnostics.html); // $FlowFixMe
                document.body.appendChild(overlay);
            }
        }
    };
    ws.onerror = function(e) {
        console.error(e.message);
    };
    ws.onclose = function() {
        console.warn("[parcel] \uD83D\uDEA8 Connection to the HMR server was lost");
    };
}
function removeErrorOverlay() {
    var overlay = document.getElementById(OVERLAY_ID);
    if (overlay) {
        overlay.remove();
        console.log("[parcel] \u2728 Error resolved");
    }
}
function createErrorOverlay(diagnostics) {
    var overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    let errorHTML = '<div style="background: black; opacity: 0.85; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; font-family: Menlo, Consolas, monospace; z-index: 9999;">';
    for (let diagnostic of diagnostics){
        let stack = diagnostic.frames.length ? diagnostic.frames.reduce((p, frame)=>{
            return `${p}
<a href="/__parcel_launch_editor?file=${encodeURIComponent(frame.location)}" style="text-decoration: underline; color: #888" onclick="fetch(this.href); return false">${frame.location}</a>
${frame.code}`;
        }, "") : diagnostic.stack;
        errorHTML += `
      <div>
        <div style="font-size: 18px; font-weight: bold; margin-top: 20px;">
          🚨 ${diagnostic.message}
        </div>
        <pre>${stack}</pre>
        <div>
          ${diagnostic.hints.map((hint)=>"<div>\uD83D\uDCA1 " + hint + "</div>").join("")}
        </div>
        ${diagnostic.documentation ? `<div>📝 <a style="color: violet" href="${diagnostic.documentation}" target="_blank">Learn more</a></div>` : ""}
      </div>
    `;
    }
    errorHTML += "</div>";
    overlay.innerHTML = errorHTML;
    return overlay;
}
function getParents(bundle, id) /*: Array<[ParcelRequire, string]> */ {
    var modules = bundle.modules;
    if (!modules) return [];
    var parents = [];
    var k, d, dep;
    for(k in modules)for(d in modules[k][1]){
        dep = modules[k][1][d];
        if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) parents.push([
            bundle,
            k
        ]);
    }
    if (bundle.parent) parents = parents.concat(getParents(bundle.parent, id));
    return parents;
}
function updateLink(link) {
    var newLink = link.cloneNode();
    newLink.onload = function() {
        if (link.parentNode !== null) // $FlowFixMe
        link.parentNode.removeChild(link);
    };
    newLink.setAttribute("href", link.getAttribute("href").split("?")[0] + "?" + Date.now()); // $FlowFixMe
    link.parentNode.insertBefore(newLink, link.nextSibling);
}
var cssTimeout = null;
function reloadCSS() {
    if (cssTimeout) return;
    cssTimeout = setTimeout(function() {
        var links = document.querySelectorAll('link[rel="stylesheet"]');
        for(var i = 0; i < links.length; i++){
            // $FlowFixMe[incompatible-type]
            var href = links[i].getAttribute("href");
            var hostname = getHostname();
            var servedFromHMRServer = hostname === "localhost" ? new RegExp("^(https?:\\/\\/(0.0.0.0|127.0.0.1)|localhost):" + getPort()).test(href) : href.indexOf(hostname + ":" + getPort());
            var absolute = /^https?:\/\//i.test(href) && href.indexOf(location.origin) !== 0 && !servedFromHMRServer;
            if (!absolute) updateLink(links[i]);
        }
        cssTimeout = null;
    }, 50);
}
async function hmrApplyUpdates(assets) {
    global.parcelHotUpdate = Object.create(null);
    let scriptsToRemove;
    try {
        // If sourceURL comments aren't supported in eval, we need to load
        // the update from the dev server over HTTP so that stack traces
        // are correct in errors/logs. This is much slower than eval, so
        // we only do it if needed (currently just Safari).
        // https://bugs.webkit.org/show_bug.cgi?id=137297
        // This path is also taken if a CSP disallows eval.
        if (!supportsSourceURL) {
            let promises = assets.map((asset)=>{
                if (asset.type === "js") {
                    if (typeof document !== "undefined") {
                        let script = document.createElement("script");
                        script.src = asset.url;
                        return new Promise((resolve, reject)=>{
                            var _document$head;
                            script.onload = ()=>resolve(script);
                            script.onerror = reject;
                            (_document$head = document.head) === null || _document$head === void 0 || _document$head.appendChild(script);
                        });
                    } else if (typeof importScripts === "function") return new Promise((resolve, reject)=>{
                        try {
                            importScripts(asset.url);
                        } catch (err) {
                            reject(err);
                        }
                    });
                }
            });
            scriptsToRemove = await Promise.all(promises);
        }
        assets.forEach(function(asset) {
            hmrApply(module.bundle.root, asset);
        });
    } finally{
        delete global.parcelHotUpdate;
        if (scriptsToRemove) scriptsToRemove.forEach((script)=>{
            if (script) {
                var _document$head2;
                (_document$head2 = document.head) === null || _document$head2 === void 0 || _document$head2.removeChild(script);
            }
        });
    }
}
function hmrApply(bundle, asset) {
    var modules = bundle.modules;
    if (!modules) return;
    if (asset.type === "css") reloadCSS();
    else if (asset.type === "js") {
        let deps = asset.depsByBundle[bundle.HMR_BUNDLE_ID];
        if (deps) {
            if (modules[asset.id]) {
                // Remove dependencies that are removed and will become orphaned.
                // This is necessary so that if the asset is added back again, the cache is gone, and we prevent a full page reload.
                let oldDeps = modules[asset.id][1];
                for(let dep in oldDeps)if (!deps[dep] || deps[dep] !== oldDeps[dep]) {
                    let id = oldDeps[dep];
                    let parents = getParents(module.bundle.root, id);
                    if (parents.length === 1) hmrDelete(module.bundle.root, id);
                }
            }
            if (supportsSourceURL) // Global eval. We would use `new Function` here but browser
            // support for source maps is better with eval.
            (0, eval)(asset.output);
            let fn = global.parcelHotUpdate[asset.id];
            modules[asset.id] = [
                fn,
                deps
            ];
        } else if (bundle.parent) hmrApply(bundle.parent, asset);
    }
}
function hmrDelete(bundle, id1) {
    let modules = bundle.modules;
    if (!modules) return;
    if (modules[id1]) {
        // Collect dependencies that will become orphaned when this module is deleted.
        let deps = modules[id1][1];
        let orphans = [];
        for(let dep in deps){
            let parents = getParents(module.bundle.root, deps[dep]);
            if (parents.length === 1) orphans.push(deps[dep]);
        } // Delete the module. This must be done before deleting dependencies in case of circular dependencies.
        delete modules[id1];
        delete bundle.cache[id1]; // Now delete the orphans.
        orphans.forEach((id)=>{
            hmrDelete(module.bundle.root, id);
        });
    } else if (bundle.parent) hmrDelete(bundle.parent, id1);
}
function hmrAcceptCheck(bundle, id, depsByBundle) {
    if (hmrAcceptCheckOne(bundle, id, depsByBundle)) return true;
     // Traverse parents breadth first. All possible ancestries must accept the HMR update, or we'll reload.
    let parents = getParents(module.bundle.root, id);
    let accepted = false;
    while(parents.length > 0){
        let v = parents.shift();
        let a = hmrAcceptCheckOne(v[0], v[1], null);
        if (a) // If this parent accepts, stop traversing upward, but still consider siblings.
        accepted = true;
        else {
            // Otherwise, queue the parents in the next level upward.
            let p = getParents(module.bundle.root, v[1]);
            if (p.length === 0) {
                // If there are no parents, then we've reached an entry without accepting. Reload.
                accepted = false;
                break;
            }
            parents.push(...p);
        }
    }
    return accepted;
}
function hmrAcceptCheckOne(bundle, id, depsByBundle) {
    var modules = bundle.modules;
    if (!modules) return;
    if (depsByBundle && !depsByBundle[bundle.HMR_BUNDLE_ID]) {
        // If we reached the root bundle without finding where the asset should go,
        // there's nothing to do. Mark as "accepted" so we don't reload the page.
        if (!bundle.parent) return true;
        return hmrAcceptCheck(bundle.parent, id, depsByBundle);
    }
    if (checkedAssets[id]) return true;
    checkedAssets[id] = true;
    var cached = bundle.cache[id];
    assetsToAccept.push([
        bundle,
        id
    ]);
    if (!cached || cached.hot && cached.hot._acceptCallbacks.length) return true;
}
function hmrAcceptRun(bundle, id) {
    var cached = bundle.cache[id];
    bundle.hotData = {};
    if (cached && cached.hot) cached.hot.data = bundle.hotData;
    if (cached && cached.hot && cached.hot._disposeCallbacks.length) cached.hot._disposeCallbacks.forEach(function(cb) {
        cb(bundle.hotData);
    });
    delete bundle.cache[id];
    bundle(id);
    cached = bundle.cache[id];
    if (cached && cached.hot && cached.hot._acceptCallbacks.length) cached.hot._acceptCallbacks.forEach(function(cb) {
        var assetsToAlsoAccept = cb(function() {
            return getParents(module.bundle.root, id);
        });
        if (assetsToAlsoAccept && assetsToAccept.length) // $FlowFixMe[method-unbinding]
        assetsToAccept.push.apply(assetsToAccept, assetsToAlsoAccept);
    });
    acceptedAssets[id] = true;
}

},{}],"aNB2k":[function(require,module,exports) {
var _eventJs = require("./util/event.js");
var _langMathJs = require("./util/lang_math.js");
var _blendJs = require("./Color/Blend.js");
var _pickerClassicJs = require("./Color/Picker.Classic.js");
var _spaceJs = require("./Color/Space.js");
var _texturesJs = require("./Textures.js");
var _loaderJs = require("./Widgets/Loader.js");
var _fileSaverJs = require("./Widgets/FileSaver.js");
var _thumbnailerJs = require("./Widgets/Thumbnailer.js");
var _windowsJs = require("./Widgets/Windows.js");
var _uploaderJs = require("./Widgets/Uploader.js");
var _zenJs = require("./Zen.js");
var _zenIFrameJs = require("./Zen.iFrame.js");
var _zenGeneratorJs = require("./Zen.Generator.js");
var _zenGradientPickerJs = require("./Zen.Gradient.Picker.js");
var _canvasToBlobJs = require("../inc/File/CanvasToBlob.js");
var _fileSaverJs1 = require("../inc/File/FileSaver.js");
var _jszipJs = require("../inc/File/jszip.js");

},{"./util/event.js":"8qMRB","./util/lang_math.js":"juBnT","./Zen.js":"8nWN3","./Zen.iFrame.js":"4Gw9e","./Zen.Generator.js":"5KGJU","./Zen.Gradient.Picker.js":"kHyLD","./Color/Blend.js":"bafDL","./Color/Picker.Classic.js":"ahhvD","./Color/Space.js":"4hGN8","./Textures.js":"3veAE","./Widgets/Loader.js":"cFbML","./Widgets/FileSaver.js":"lgMZf","./Widgets/Thumbnailer.js":"aq1kJ","./Widgets/Windows.js":"asKRT","./Widgets/Uploader.js":"b9HL0","../inc/File/CanvasToBlob.js":"OjfGB","../inc/File/FileSaver.js":"7k6av","../inc/File/jszip.js":"cHPdL"}],"8qMRB":[function(require,module,exports) {
/*:
	----------------------------------------------------
	event.js : 1.1.5 : 2013/12/12 : MIT License
	----------------------------------------------------
	https://github.com/mudcube/Event.js
	----------------------------------------------------
	1  : click, dblclick, dbltap
	1+ : tap, longpress, drag, swipe
	2+ : pinch, rotate
	   : mousewheel, devicemotion, shake
	----------------------------------------------------
	Ideas for the future
	----------------------------------------------------
	* GamePad, and other input abstractions.
	* Event batching - i.e. for every x fingers down a new gesture is created.
	----------------------------------------------------
	http://www.w3.org/TR/2011/WD-touch-events-20110505/
	----------------------------------------------------
*/ window.eventjs || (window.eventjs = {});
(function(root) {
    "use strict";
    // Add custom *EventListener commands to HTMLElements (set false to prevent funkiness).
    root.modifyEventListener = false;
    // Add bulk *EventListener commands on NodeLists from querySelectorAll and others  (set false to prevent funkiness).
    root.modifySelectors = false;
    // Event maintenance.
    root.add = function(target, type, listener, configure) {
        return eventManager(target, type, listener, configure, "add");
    };
    root.remove = function(target, type, listener, configure) {
        return eventManager(target, type, listener, configure, "remove");
    };
    root.returnFalse = function(event) {
        return false;
    };
    root.stop = function(event) {
        if (!event) return;
        if (event.stopPropagation) event.stopPropagation();
        event.cancelBubble = true; // <= IE8
        event.cancelBubbleCount = 0;
    };
    root.prevent = function(event) {
        if (!event) return;
        if (event.preventDefault) event.preventDefault();
        else if (event.preventManipulation) event.preventManipulation(); // MS
        else event.returnValue = false; // <= IE8
    };
    root.cancel = function(event) {
        root.stop(event);
        root.prevent(event);
    };
    root.blur = function() {
        var node = document.activeElement;
        if (!node) return;
        var nodeName = document.activeElement.nodeName;
        if (nodeName === "INPUT" || nodeName === "TEXTAREA" || node.contentEditable === "true") {
            if (node.blur) node.blur();
        }
    };
    // Check whether event is natively supported (via @kangax)
    root.getEventSupport = function(target, type) {
        if (typeof target === "string") {
            type = target;
            target = window;
        }
        type = "on" + type;
        if (type in target) return true;
        if (!target.setAttribute) target = document.createElement("div");
        if (target.setAttribute && target.removeAttribute) {
            target.setAttribute(type, "");
            var isSupported = typeof target[type] === "function";
            if (typeof target[type] !== "undefined") target[type] = null;
            target.removeAttribute(type);
            return isSupported;
        }
    };
    var clone = function(obj) {
        if (!obj || typeof obj !== "object") return obj;
        var temp = new obj.constructor();
        for(var key in obj)if (!obj[key] || typeof obj[key] !== "object") temp[key] = obj[key];
        else temp[key] = clone(obj[key]);
        return temp;
    };
    /// Handle custom *EventListener commands.
    var eventManager = function(target, type, listener, configure, trigger, fromOverwrite) {
        configure = configure || {};
        // Check whether target is a configuration variable;
        if (String(target) === "[object Object]") {
            var data = target;
            target = data.target;
            delete data.target;
            ///
            if (data.type && data.listener) {
                type = data.type;
                delete data.type;
                listener = data.listener;
                delete data.listener;
                for(var key in data)configure[key] = data[key];
            } else {
                for(var param in data){
                    var value = data[param];
                    if (typeof value === "function") continue;
                    configure[param] = value;
                }
                ///
                var ret = {};
                for(var key in data){
                    var param = key.split(",");
                    var o = data[key];
                    var conf = {};
                    for(var k in configure)conf[k] = configure[k];
                    ///
                    if (typeof o === "function") var listener = o;
                    else if (typeof o.listener === "function") {
                        var listener = o.listener;
                        for(var k in o){
                            if (typeof o[k] === "function") continue;
                            conf[k] = o[k];
                        }
                    } else continue;
                    ///
                    for(var n2 = 0; n2 < param.length; n2++)ret[key] = eventjs.add(target, param[n2], listener, conf, trigger);
                }
                return ret;
            }
        }
        ///
        if (!target || !type || !listener) return;
        // Check for element to load on interval (before onload).
        if (typeof target === "string" && type === "ready") {
            if (window.eventjs_stallOnReady) {
                type = "load";
                target = window;
            } else {
                var time = new Date().getTime();
                var timeout = configure.timeout;
                var ms = configure.interval || 1000 / 60;
                var interval = window.setInterval(function() {
                    if (new Date().getTime() - time > timeout) window.clearInterval(interval);
                    if (document.querySelector(target)) {
                        window.clearInterval(interval);
                        setTimeout(listener, 1);
                    }
                }, ms);
                return;
            }
        }
        // Get DOM element from Query Selector.
        if (typeof target === "string") {
            target = document.querySelectorAll(target);
            if (target.length === 0) return createError("Missing target on listener!", arguments); // No results.
            if (target.length === 1) target = target[0];
        }
        /// Handle multiple targets.
        var event1;
        var events = {};
        if (target.length > 0 && target !== window) {
            for(var n0 = 0, length0 = target.length; n0 < length0; n0++){
                event1 = eventManager(target[n0], type, listener, clone(configure), trigger);
                if (event1) events[n0] = event1;
            }
            return createBatchCommands(events);
        }
        /// Check for multiple events in one string.
        if (typeof type === "string") {
            type = type.toLowerCase();
            if (type.indexOf(" ") !== -1) type = type.split(" ");
            else if (type.indexOf(",") !== -1) type = type.split(",");
        }
        /// Attach or remove multiple events associated with a target.
        if (typeof type !== "string") {
            if (typeof type.length === "number") for(var n1 = 0, length1 = type.length; n1 < length1; n1++){
                event1 = eventManager(target, type[n1], listener, clone(configure), trigger);
                if (event1) events[type[n1]] = event1;
            }
            else for(var key in type){
                if (typeof type[key] === "function") event1 = eventManager(target, key, type[key], clone(configure), trigger);
                else event1 = eventManager(target, key, type[key].listener, clone(type[key]), trigger);
                if (event1) events[key] = event1;
            }
            return createBatchCommands(events);
        } else if (type.indexOf("on") === 0) type = type.substr(2);
        // Ensure listener is a function.
        if (typeof target !== "object") return createError("Target is not defined!", arguments);
        if (typeof listener !== "function") return createError("Listener is not a function!", arguments);
        // Generate a unique wrapper identifier.
        var useCapture = configure.useCapture || false;
        var id = getID(target) + "." + getID(listener) + "." + (useCapture ? 1 : 0);
        // Handle the event.
        if (root.Gesture && root.Gesture._gestureHandlers[type]) {
            id = type + id;
            if (trigger === "remove") {
                if (!wrappers[id]) return; // Already removed.
                wrappers[id].remove();
                delete wrappers[id];
            } else if (trigger === "add") {
                if (wrappers[id]) {
                    wrappers[id].add();
                    return wrappers[id]; // Already attached.
                }
                // Retains "this" orientation.
                if (configure.useCall && !root.modifyEventListener) {
                    var tmp = listener;
                    listener = function(event, self) {
                        for(var key in self)event[key] = self[key];
                        return tmp.call(target, event);
                    };
                }
                // Create listener proxy.
                configure.gesture = type;
                configure.target = target;
                configure.listener = listener;
                configure.fromOverwrite = fromOverwrite;
                // Record wrapper.
                wrappers[id] = root.proxy[type](configure);
            }
            return wrappers[id];
        } else {
            var eventList = getEventList(type);
            for(var n2 = 0, eventId; n2 < eventList.length; n2++){
                type = eventList[n2];
                eventId = type + "." + id;
                if (trigger === "remove") {
                    if (!wrappers[eventId]) continue; // Already removed.
                    target[remove](type, listener, useCapture);
                    delete wrappers[eventId];
                } else if (trigger === "add") {
                    if (wrappers[eventId]) return wrappers[eventId]; // Already attached.
                    target[add](type, listener, useCapture);
                    // Record wrapper.
                    wrappers[eventId] = {
                        id: eventId,
                        type: type,
                        target: target,
                        listener: listener,
                        remove: function() {
                            for(var n = 0; n < eventList.length; n++)root.remove(target, eventList[n], listener, configure);
                        }
                    };
                }
            }
            return wrappers[eventId];
        }
    };
    /// Perform batch actions on multiple events.
    var createBatchCommands = function(events) {
        return {
            remove: function() {
                for(var key in events)events[key].remove();
            },
            add: function() {
                for(var key in events)events[key].add();
            }
        };
    };
    /// Display error message in console.
    var createError = function(message, data) {
        if (typeof console === "undefined") return;
        if (typeof console.error === "undefined") return;
        console.error(message, data);
    };
    /// Handle naming discrepancies between platforms.
    var pointerDefs = {
        "msPointer": [
            "MSPointerDown",
            "MSPointerMove",
            "MSPointerUp"
        ],
        "touch": [
            "touchstart",
            "touchmove",
            "touchend"
        ],
        "mouse": [
            "mousedown",
            "mousemove",
            "mouseup"
        ]
    };
    var pointerDetect = {
        // MSPointer
        "MSPointerDown": 0,
        "MSPointerMove": 1,
        "MSPointerUp": 2,
        // Touch
        "touchstart": 0,
        "touchmove": 1,
        "touchend": 2,
        // Mouse
        "mousedown": 0,
        "mousemove": 1,
        "mouseup": 2
    };
    var getEventSupport = function() {
        root.supports = {};
        if (window.navigator.msPointerEnabled) root.supports.msPointer = true;
        if (root.getEventSupport("touchstart")) root.supports.touch = true;
        if (root.getEventSupport("mousedown")) root.supports.mouse = true;
    }();
    var getEventList = function() {
        return function(type) {
            var prefix = document.addEventListener ? "" : "on"; // IE
            var idx = pointerDetect[type];
            if (isFinite(idx)) {
                var types = [];
                for(var key in root.supports)types.push(prefix + pointerDefs[key][idx]);
                return types;
            } else return [
                prefix + type
            ];
        };
    }();
    /// Event wrappers to keep track of all events placed in the window.
    var wrappers = {};
    var counter = 0;
    var getID = function(object) {
        if (object === window) return "#window";
        if (object === document) return "#document";
        if (!object.uniqueID) object.uniqueID = "e" + counter++;
        return object.uniqueID;
    };
    /// Detect platforms native *EventListener command.
    var add = document.addEventListener ? "addEventListener" : "attachEvent";
    var remove = document.removeEventListener ? "removeEventListener" : "detachEvent";
    /*
	Pointer.js
	----------------------------------------
	Modified from; https://github.com/borismus/pointer.js
*/ root.createPointerEvent = function(event, self, preventRecord) {
        var eventName = self.gesture;
        var target = self.target;
        var pts = event.changedTouches || root.proxy.getCoords(event);
        if (pts.length) {
            var pt = pts[0];
            self.pointers = preventRecord ? [] : pts;
            self.pageX = pt.pageX;
            self.pageY = pt.pageY;
            self.x = self.pageX;
            self.y = self.pageY;
        }
        ///
        var newEvent = document.createEvent("Event");
        newEvent.initEvent(eventName, true, true);
        newEvent.originalEvent = event;
        for(var k in self){
            if (k === "target") continue;
            newEvent[k] = self[k];
        }
        ///
        var type = newEvent.type;
        if (root.Gesture && root.Gesture._gestureHandlers[type]) //		target.dispatchEvent(newEvent);
        self.oldListener.call(target, newEvent, self, false);
    };
    /// Allows *EventListener to use custom event proxies.
    if (root.modifyEventListener && window.HTMLElement) (function() {
        var augmentEventListener = function(proto) {
            var recall = function(trigger) {
                var handle = trigger + "EventListener";
                var handler = proto[handle];
                proto[handle] = function(type, listener, useCapture) {
                    if (root.Gesture && root.Gesture._gestureHandlers[type]) {
                        var configure = useCapture;
                        if (typeof useCapture === "object") configure.useCall = true;
                        else configure = {
                            useCall: true,
                            useCapture: useCapture
                        };
                        eventManager(this, type, listener, configure, trigger, true);
                    //					handler.call(this, type, listener, useCapture);
                    } else {
                        var types = getEventList(type);
                        for(var n = 0; n < types.length; n++)handler.call(this, types[n], listener, useCapture);
                    }
                };
            };
            recall("add");
            recall("remove");
        };
        // NOTE: overwriting HTMLElement doesn't do anything in Firefox.
        if (navigator.userAgent.match(/Firefox/)) {
            // TODO: fix Firefox for the general case.
            augmentEventListener(HTMLDivElement.prototype);
            augmentEventListener(HTMLCanvasElement.prototype);
        } else augmentEventListener(HTMLElement.prototype);
        augmentEventListener(document);
        augmentEventListener(window);
    })();
    /// Allows querySelectorAll and other NodeLists to perform *EventListener commands in bulk.
    if (root.modifySelectors) (function() {
        var proto = NodeList.prototype;
        proto.removeEventListener = function(type, listener, useCapture) {
            for(var n = 0, length = this.length; n < length; n++)this[n].removeEventListener(type, listener, useCapture);
        };
        proto.addEventListener = function(type, listener, useCapture) {
            for(var n = 0, length = this.length; n < length; n++)this[n].addEventListener(type, listener, useCapture);
        };
    })();
    return root;
})(eventjs);
/*:
	----------------------------------------------------
	eventjs.proxy : 0.4.2 : 2013/07/17 : MIT License
	----------------------------------------------------
	https://github.com/mudcube/eventjs.js
	----------------------------------------------------
*/ window.eventjs || (window.eventjs = {});
if (typeof eventjs.proxy === "undefined") eventjs.proxy = {};
eventjs.proxy = function(root) {
    "use strict";
    /*
	Create a new pointer gesture instance.
*/ root.pointerSetup = function(conf, self) {
        /// Configure.
        conf.target = conf.target || window;
        conf.doc = conf.target.ownerDocument || conf.target; // Associated document.
        conf.minFingers = conf.minFingers || conf.fingers || 1; // Minimum required fingers.
        conf.maxFingers = conf.maxFingers || conf.fingers || Infinity; // Maximum allowed fingers.
        conf.position = conf.position || "relative"; // Determines what coordinate system points are returned.
        delete conf.fingers; //-
        /// Convenience data.
        self = self || {};
        self.enabled = true;
        self.gesture = conf.gesture;
        self.target = conf.target;
        self.env = conf.env;
        ///
        if (eventjs.modifyEventListener && conf.fromOverwrite) {
            conf.oldListener = conf.listener;
            conf.listener = eventjs.createPointerEvent;
        }
        /// Convenience commands.
        var fingers = 0;
        var type = self.gesture.indexOf("pointer") === 0 && eventjs.modifyEventListener ? "pointer" : "mouse";
        if (conf.oldListener) self.oldListener = conf.oldListener;
        ///
        self.listener = conf.listener;
        self.proxy = function(listener) {
            self.defaultListener = conf.listener;
            conf.listener = listener;
            listener(conf.event, self);
        };
        self.add = function() {
            if (self.enabled === true) return;
            if (conf.onPointerDown) eventjs.add(conf.target, type + "down", conf.onPointerDown);
            if (conf.onPointerMove) eventjs.add(conf.doc, type + "move", conf.onPointerMove);
            if (conf.onPointerUp) eventjs.add(conf.doc, type + "up", conf.onPointerUp);
            self.enabled = true;
        };
        self.remove = function() {
            if (self.enabled === false) return;
            if (conf.onPointerDown) eventjs.remove(conf.target, type + "down", conf.onPointerDown);
            if (conf.onPointerMove) eventjs.remove(conf.doc, type + "move", conf.onPointerMove);
            if (conf.onPointerUp) eventjs.remove(conf.doc, type + "up", conf.onPointerUp);
            self.reset();
            self.enabled = false;
        };
        self.pause = function(opt) {
            if (conf.onPointerMove && (!opt || opt.move)) eventjs.remove(conf.doc, type + "move", conf.onPointerMove);
            if (conf.onPointerUp && (!opt || opt.up)) eventjs.remove(conf.doc, type + "up", conf.onPointerUp);
            fingers = conf.fingers;
            conf.fingers = 0;
        };
        self.resume = function(opt) {
            if (conf.onPointerMove && (!opt || opt.move)) eventjs.add(conf.doc, type + "move", conf.onPointerMove);
            if (conf.onPointerUp && (!opt || opt.up)) eventjs.add(conf.doc, type + "up", conf.onPointerUp);
            conf.fingers = fingers;
        };
        self.reset = function() {
            conf.tracker = {};
            conf.fingers = 0;
        };
        ///
        return self;
    };
    /*
	Begin proxied pointer command.
*/ var sp = eventjs.supports; // Default pointerType
    ///
    eventjs.isMouse = !!sp.mouse;
    eventjs.isMSPointer = !!sp.touch;
    eventjs.isTouch = !!sp.msPointer;
    ///
    root.pointerStart = function(event, self, conf) {
        /// tracks multiple inputs
        var type = (event.type || "mousedown").toUpperCase();
        if (type.indexOf("MOUSE") === 0) {
            eventjs.isMouse = true;
            eventjs.isTouch = false;
            eventjs.isMSPointer = false;
        } else if (type.indexOf("TOUCH") === 0) {
            eventjs.isMouse = false;
            eventjs.isTouch = true;
            eventjs.isMSPointer = false;
        } else if (type.indexOf("MSPOINTER") === 0) {
            eventjs.isMouse = false;
            eventjs.isTouch = false;
            eventjs.isMSPointer = true;
        }
        ///
        var addTouchStart = function(touch, sid) {
            var bbox = conf.bbox;
            var pt = track[sid] = {};
            ///
            switch(conf.position){
                case "absolute":
                    pt.offsetX = 0;
                    pt.offsetY = 0;
                    break;
                case "differenceFromLast":
                    pt.offsetX = touch.pageX;
                    pt.offsetY = touch.pageY;
                    break;
                case "difference":
                    pt.offsetX = touch.pageX;
                    pt.offsetY = touch.pageY;
                    break;
                case "move":
                    pt.offsetX = touch.pageX - bbox.x1;
                    pt.offsetY = touch.pageY - bbox.y1;
                    break;
                default:
                    pt.offsetX = bbox.x1 - bbox.scrollLeft;
                    pt.offsetY = bbox.y1 - bbox.scrollTop;
                    break;
            }
            ///
            var x = touch.pageX - pt.offsetX;
            var y = touch.pageY - pt.offsetY;
            ///
            pt.rotation = 0;
            pt.scale = 1;
            pt.startTime = pt.moveTime = new Date().getTime();
            pt.move = {
                x: x,
                y: y
            };
            pt.start = {
                x: x,
                y: y
            };
            ///
            conf.fingers++;
        };
        ///
        conf.event = event;
        if (self.defaultListener) {
            conf.listener = self.defaultListener;
            delete self.defaultListener;
        }
        ///
        var isTouchStart = !conf.fingers;
        var track = conf.tracker;
        var touches = event.changedTouches || root.getCoords(event);
        var length = touches.length;
        // Adding touch events to tracking.
        for(var i = 0; i < length; i++){
            var touch1 = touches[i];
            var sid1 = touch1.identifier || Infinity; // Touch ID.
            // Track the current state of the touches.
            if (conf.fingers) {
                if (conf.fingers >= conf.maxFingers) {
                    var ids = [];
                    for(var sid1 in conf.tracker)ids.push(sid1);
                    self.identifier = ids.join(",");
                    return isTouchStart;
                }
                var fingers = 0; // Finger ID.
                for(var rid in track){
                    // Replace removed finger.
                    if (track[rid].up) {
                        delete track[rid];
                        addTouchStart(touch1, sid1);
                        conf.cancel = true;
                        break;
                    }
                    fingers++;
                }
                // Add additional finger.
                if (track[sid1]) continue;
                addTouchStart(touch1, sid1);
            } else {
                track = conf.tracker = {};
                self.bbox = conf.bbox = root.getBoundingBox(conf.target);
                conf.fingers = 0;
                conf.cancel = false;
                addTouchStart(touch1, sid1);
            }
        }
        ///
        var ids = [];
        for(var sid1 in conf.tracker)ids.push(sid1);
        self.identifier = ids.join(",");
        ///
        return isTouchStart;
    };
    /*
	End proxied pointer command.
*/ root.pointerEnd = function(event, self, conf, onPointerUp) {
        // Record changed touches have ended (iOS changedTouches is not reliable).
        var touches = event.touches || [];
        var length = touches.length;
        var exists = {};
        for(var i = 0; i < length; i++){
            var touch = touches[i];
            var sid = touch.identifier;
            exists[sid || Infinity] = true;
        }
        for(var sid in conf.tracker){
            var track = conf.tracker[sid];
            if (exists[sid] || track.up) continue;
            if (onPointerUp) onPointerUp({
                pageX: track.pageX,
                pageY: track.pageY,
                changedTouches: [
                    {
                        pageX: track.pageX,
                        pageY: track.pageY,
                        identifier: sid === "Infinity" ? Infinity : sid
                    }
                ]
            }, "up");
            track.up = true;
            conf.fingers--;
        }
        /*	// This should work but fails in Safari on iOS4 so not using it.
	var touches = event.changedTouches || root.getCoords(event);
	var length = touches.length;
	// Record changed touches have ended (this should work).
	for (var i = 0; i < length; i ++) {
		var touch = touches[i];
		var sid = touch.identifier || Infinity;
		var track = conf.tracker[sid];
		if (track && !track.up) {
			if (onPointerUp) { // add changedTouches to mouse.
				onPointerUp({
					changedTouches: [{
						pageX: track.pageX,
						pageY: track.pageY,
						identifier: sid === "Infinity" ? Infinity : sid
					}]
				}, "up");
			}
			track.up = true;
			conf.fingers --;
		}
	} */ // Wait for all fingers to be released.
        if (conf.fingers !== 0) return false;
        // Record total number of fingers gesture used.
        var ids = [];
        conf.gestureFingers = 0;
        for(var sid in conf.tracker){
            conf.gestureFingers++;
            ids.push(sid);
        }
        self.identifier = ids.join(",");
        // Our pointer gesture has ended.
        return true;
    };
    /*
	Returns mouse coords in an array to match event.*Touches
	------------------------------------------------------------
	var touch = event.changedTouches || root.getCoords(event);
*/ root.getCoords = function(event2) {
        if (typeof event2.pageX !== "undefined") root.getCoords = function(event) {
            return Array({
                type: "mouse",
                x: event.pageX,
                y: event.pageY,
                pageX: event.pageX,
                pageY: event.pageY,
                identifier: event.pointerId || Infinity // pointerId is MS
            });
        };
        else root.getCoords = function(event) {
            var doc = document.documentElement;
            event = event || window.event;
            return Array({
                type: "mouse",
                x: event.clientX + doc.scrollLeft,
                y: event.clientY + doc.scrollTop,
                pageX: event.clientX + doc.scrollLeft,
                pageY: event.clientY + doc.scrollTop,
                identifier: Infinity
            });
        };
        return root.getCoords(event2);
    };
    /*
	Returns single coords in an object.
	------------------------------------------------------------
	var mouse = root.getCoord(event);
*/ root.getCoord = function(event3) {
        if ("ontouchstart" in window) {
            var pX = 0;
            var pY = 0;
            root.getCoord = function(event) {
                var touches = event.changedTouches;
                if (touches && touches.length) return {
                    x: pX = touches[0].pageX,
                    y: pY = touches[0].pageY
                };
                else return {
                    x: pX,
                    y: pY
                };
            };
        } else if (typeof event3.pageX !== "undefined" && typeof event3.pageY !== "undefined") root.getCoord = function(event) {
            return {
                x: event.pageX,
                y: event.pageY
            };
        };
        else root.getCoord = function(event) {
            var doc = document.documentElement;
            event = event || window.event;
            return {
                x: event.clientX + doc.scrollLeft,
                y: event.clientY + doc.scrollTop
            };
        };
        return root.getCoord(event3);
    };
    /*
	Get target scale and position in space.
*/ var getPropertyAsFloat = function(o, type) {
        var n = parseFloat(o.getPropertyValue(type), 10);
        return isFinite(n) ? n : 0;
    };
    root.getBoundingBox = function(o) {
        if (o === window || o === document) o = document.body;
        ///
        var bbox = {};
        var bcr = o.getBoundingClientRect();
        bbox.width = bcr.width;
        bbox.height = bcr.height;
        bbox.x1 = bcr.left;
        bbox.y1 = bcr.top;
        bbox.scaleX = bcr.width / o.offsetWidth || 1;
        bbox.scaleY = bcr.height / o.offsetHeight || 1;
        bbox.scrollLeft = 0;
        bbox.scrollTop = 0;
        ///
        var style = window.getComputedStyle(o);
        var borderBox = style.getPropertyValue("box-sizing") === "border-box";
        ///
        if (borderBox === false) {
            var left = getPropertyAsFloat(style, "border-left-width");
            var right = getPropertyAsFloat(style, "border-right-width");
            var bottom = getPropertyAsFloat(style, "border-bottom-width");
            var top = getPropertyAsFloat(style, "border-top-width");
            bbox.border = [
                left,
                right,
                top,
                bottom
            ];
            bbox.x1 += left;
            bbox.y1 += top;
            bbox.width -= right + left;
            bbox.height -= bottom + top;
        }
        /*	var left = getPropertyAsFloat(style, "padding-left");
	var right = getPropertyAsFloat(style, "padding-right");
	var bottom = getPropertyAsFloat(style, "padding-bottom");
	var top = getPropertyAsFloat(style, "padding-top");
	bbox.padding = [ left, right, top, bottom ];*/ ///
        bbox.x2 = bbox.x1 + bbox.width;
        bbox.y2 = bbox.y1 + bbox.height;
        /// Get the scroll of container element.
        var position = style.getPropertyValue("position");
        var tmp = position === "fixed" ? o : o.parentNode;
        while(tmp !== null){
            if (tmp === document.body) break;
            if (tmp.scrollTop === undefined) break;
            var style = window.getComputedStyle(tmp);
            var position = style.getPropertyValue("position");
            if (position === "absolute") ;
            else if (position === "fixed") {
                //			bbox.scrollTop += document.body.scrollTop;
                //			bbox.scrollLeft += document.body.scrollLeft;
                bbox.scrollTop -= tmp.parentNode.scrollTop;
                bbox.scrollLeft -= tmp.parentNode.scrollLeft;
                break;
            } else {
                bbox.scrollLeft += tmp.scrollLeft;
                bbox.scrollTop += tmp.scrollTop;
            }
            ///
            tmp = tmp.parentNode;
        }
        ///
        bbox.scrollBodyLeft = window.pageXOffset !== undefined ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft;
        bbox.scrollBodyTop = window.pageYOffset !== undefined ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
        ///
        bbox.scrollLeft -= bbox.scrollBodyLeft;
        bbox.scrollTop -= bbox.scrollBodyTop;
        ///
        return bbox;
    };
    /*
	Keep track of metaKey, the proper ctrlKey for users platform.
	----------------------------------------------------
	http://www.quirksmode.org/js/keys.html
*/ (function() {
        var agent = navigator.userAgent.toLowerCase();
        var mac = agent.indexOf("macintosh") !== -1;
        var metaKeys;
        if (mac && agent.indexOf("khtml") !== -1) metaKeys = {
            91: true,
            93: true
        };
        else if (mac && agent.indexOf("firefox") !== -1) metaKeys = {
            224: true
        };
        else metaKeys = {
            17: true
        };
        root.metaTrackerReset = function() {
            root.fnKey = false;
            root.metaKey = false;
            root.ctrlKey = false;
            root.shiftKey = false;
            root.altKey = false;
        };
        root.metaTracker = function(event) {
            var metaCheck = !!metaKeys[event.keyCode];
            if (metaCheck) root.metaKey = event.type === "keydown";
            root.ctrlKey = event.ctrlKey;
            root.shiftKey = event.shiftKey;
            root.altKey = event.altKey;
            return metaCheck;
        };
    })();
    return root;
}(eventjs.proxy);
/*:
	----------------------------------------------------
	"MutationObserver" event proxy.
	----------------------------------------------------
	author: Selvakumar Arumugam - MIT LICENSE
	   src: http://stackoverflow.com/questions/10868104/can-you-have-a-javascript-hook-trigger-after-a-dom-elements-style-object-change
	----------------------------------------------------
*/ window.eventjs || (window.eventjs = {});
eventjs.MutationObserver = function() {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    var DOMAttrModifiedSupported = !MutationObserver && function() {
        var p = document.createElement("p");
        var flag = false;
        var fn = function() {
            flag = true;
        };
        if (p.addEventListener) p.addEventListener("DOMAttrModified", fn, false);
        else if (p.attachEvent) p.attachEvent("onDOMAttrModified", fn);
        else return false;
        ///
        p.setAttribute("id", "target");
        ///
        return flag;
    }();
    ///
    return function(container, callback) {
        if (MutationObserver) {
            var options = {
                subtree: false,
                attributes: true
            };
            var observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(e) {
                    callback.call(e.target, e.attributeName);
                });
            });
            observer.observe(container, options);
        } else if (DOMAttrModifiedSupported) eventjs.add(container, "DOMAttrModified", function(e) {
            callback.call(container, e.attrName);
        });
        else if ("onpropertychange" in document.body) eventjs.add(container, "propertychange", function(e) {
            callback.call(container, window.event.propertyName);
        });
    };
}();
/*:
	"Click" event proxy.
	----------------------------------------------------
	eventjs.add(window, "click", function(event, self) {});
*/ window.eventjs || (window.eventjs = {});
if (typeof eventjs.proxy === "undefined") eventjs.proxy = {};
eventjs.proxy = function(root) {
    "use strict";
    root.click = function(conf) {
        conf.gesture = conf.gesture || "click";
        conf.maxFingers = conf.maxFingers || conf.fingers || 1;
        /// Tracking the events.
        conf.onPointerDown = function(event) {
            if (root.pointerStart(event, self, conf)) eventjs.add(conf.target, "mouseup", conf.onPointerUp);
        };
        conf.onPointerUp = function(event) {
            if (root.pointerEnd(event, self, conf)) {
                eventjs.remove(conf.target, "mouseup", conf.onPointerUp);
                var pointers = event.changedTouches || root.getCoords(event);
                var pointer = pointers[0];
                var bbox = conf.bbox;
                var newbbox = root.getBoundingBox(conf.target);
                var y = pointer.pageY - newbbox.scrollBodyTop;
                var x = pointer.pageX - newbbox.scrollBodyLeft;
                ////
                if (x > bbox.x1 && y > bbox.y1 && x < bbox.x2 && y < bbox.y2 && bbox.scrollTop === newbbox.scrollTop) {
                    ///
                    for(var key in conf.tracker)break; //- should be modularized? in dblclick too
                    var point = conf.tracker[key];
                    self.x = point.start.x;
                    self.y = point.start.y;
                    ///
                    conf.listener(event, self);
                }
            }
        };
        // Generate maintenance commands, and other configurations.
        var self = root.pointerSetup(conf);
        self.state = "click";
        // Attach events.
        eventjs.add(conf.target, "mousedown", conf.onPointerDown);
        // Return this object.
        return self;
    };
    eventjs.Gesture = eventjs.Gesture || {};
    eventjs.Gesture._gestureHandlers = eventjs.Gesture._gestureHandlers || {};
    eventjs.Gesture._gestureHandlers.click = root.click;
    return root;
}(eventjs.proxy);
/*:
	"Double-Click" aka "Double-Tap" event proxy.
	----------------------------------------------------
	eventjs.add(window, "dblclick", function(event, self) {});
	----------------------------------------------------
	Touch an target twice for <= 700ms, with less than 25 pixel drift.
*/ window.eventjs || (window.eventjs = {});
if (typeof eventjs.proxy === "undefined") eventjs.proxy = {};
eventjs.proxy = function(root) {
    "use strict";
    root.dbltap = root.dblclick = function(conf) {
        conf.gesture = conf.gesture || "dbltap";
        conf.maxFingers = conf.maxFingers || conf.fingers || 1;
        // Setting up local variables.
        var delay = 700; // in milliseconds
        var time0, time1, timeout;
        var pointer0, pointer1;
        // Tracking the events.
        conf.onPointerDown = function(event) {
            var pointers = event.changedTouches || root.getCoords(event);
            if (time0 && !time1) {
                pointer1 = pointers[0];
                time1 = new Date().getTime() - time0;
            } else {
                pointer0 = pointers[0];
                time0 = new Date().getTime();
                time1 = 0;
                clearTimeout(timeout);
                timeout = setTimeout(function() {
                    time0 = 0;
                }, delay);
            }
            if (root.pointerStart(event, self, conf)) {
                eventjs.add(conf.target, "mousemove", conf.onPointerMove).listener(event);
                eventjs.add(conf.target, "mouseup", conf.onPointerUp);
            }
        };
        conf.onPointerMove = function(event) {
            if (time0 && !time1) {
                var pointers = event.changedTouches || root.getCoords(event);
                pointer1 = pointers[0];
            }
            var bbox = conf.bbox;
            var ax = pointer1.pageX - bbox.x1;
            var ay = pointer1.pageY - bbox.y1;
            if (!(ax > 0 && ax < bbox.width && ay > 0 && ay < bbox.height && Math.abs(pointer1.pageX - pointer0.pageX) <= 25 && Math.abs(pointer1.pageY - pointer0.pageY) <= 25)) {
                // Cancel out this listener.
                eventjs.remove(conf.target, "mousemove", conf.onPointerMove);
                clearTimeout(timeout);
                time0 = time1 = 0;
            }
        };
        conf.onPointerUp = function(event) {
            if (root.pointerEnd(event, self, conf)) {
                eventjs.remove(conf.target, "mousemove", conf.onPointerMove);
                eventjs.remove(conf.target, "mouseup", conf.onPointerUp);
            }
            if (time0 && time1) {
                if (time1 <= delay) {
                    self.state = conf.gesture;
                    for(var key in conf.tracker)break;
                    var point = conf.tracker[key];
                    self.x = point.start.x;
                    self.y = point.start.y;
                    conf.listener(event, self);
                }
                clearTimeout(timeout);
                time0 = time1 = 0;
            }
        };
        // Generate maintenance commands, and other configurations.
        var self = root.pointerSetup(conf);
        self.state = "dblclick";
        // Attach events.
        eventjs.add(conf.target, "mousedown", conf.onPointerDown);
        // Return this object.
        return self;
    };
    eventjs.Gesture = eventjs.Gesture || {};
    eventjs.Gesture._gestureHandlers = eventjs.Gesture._gestureHandlers || {};
    eventjs.Gesture._gestureHandlers.dbltap = root.dbltap;
    eventjs.Gesture._gestureHandlers.dblclick = root.dblclick;
    return root;
}(eventjs.proxy);
/*:
	"Drag" event proxy (1+ fingers).
	----------------------------------------------------
	CONFIGURE: maxFingers, position.
	----------------------------------------------------
	eventjs.add(window, "drag", function(event, self) {
		console.log(self.gesture, self.state, self.start, self.x, self.y, self.bbox);
	});
*/ window.eventjs || (window.eventjs = {});
if (typeof eventjs.proxy === "undefined") eventjs.proxy = {};
eventjs.proxy = function(root) {
    "use strict";
    root.dragElement = function(that, event4) {
        root.drag({
            event: event4,
            target: that,
            position: "move",
            listener: function(event, self) {
                that.style.left = self.x + "px";
                that.style.top = self.y + "px";
                eventjs.prevent(event);
            }
        });
    };
    root.drag = function(conf) {
        conf.gesture = "drag";
        conf.onPointerDown = function(event) {
            if (root.pointerStart(event, self, conf)) {
                if (!conf.monitor) {
                    eventjs.add(conf.doc, "mousemove", conf.onPointerMove);
                    eventjs.add(conf.doc, "mouseup", conf.onPointerUp);
                }
            }
            // Process event listener.
            conf.onPointerMove(event, "down");
        };
        conf.onPointerMove = function(event, state) {
            if (!conf.tracker) return conf.onPointerDown(event);
            //alertify.log('move')
            var bbox = conf.bbox;
            var touches = event.changedTouches || root.getCoords(event);
            var length = touches.length;
            for(var i = 0; i < length; i++){
                var touch = touches[i];
                var identifier = touch.identifier || Infinity;
                var pt = conf.tracker[identifier];
                // Identifier defined outside of listener.
                if (!pt) continue;
                pt.pageX = touch.pageX;
                pt.pageY = touch.pageY;
                // Record data.
                self.state = state || "move";
                self.identifier = identifier;
                self.start = pt.start;
                self.fingers = conf.fingers;
                if (conf.position === "differenceFromLast") {
                    self.x = pt.pageX - pt.offsetX;
                    self.y = pt.pageY - pt.offsetY;
                    pt.offsetX = pt.pageX;
                    pt.offsetY = pt.pageY;
                } else {
                    self.x = pt.pageX - pt.offsetX;
                    self.y = pt.pageY - pt.offsetY;
                }
                ///
                conf.listener(event, self);
            }
        };
        conf.onPointerUp = function(event) {
            // Remove tracking for touch.
            if (root.pointerEnd(event, self, conf, conf.onPointerMove)) {
                if (!conf.monitor) {
                    eventjs.remove(conf.doc, "mousemove", conf.onPointerMove);
                    eventjs.remove(conf.doc, "mouseup", conf.onPointerUp);
                }
            }
        };
        // Generate maintenance commands, and other configurations.
        var self = root.pointerSetup(conf);
        // Attach events.
        if (conf.event) conf.onPointerDown(conf.event);
        else {
            eventjs.add(conf.target, "mousedown", conf.onPointerDown);
            if (conf.monitor) {
                eventjs.add(conf.doc, "mousemove", conf.onPointerMove);
                eventjs.add(conf.doc, "mouseup", conf.onPointerUp);
            }
        }
        // Return this object.
        return self;
    };
    eventjs.Gesture = eventjs.Gesture || {};
    eventjs.Gesture._gestureHandlers = eventjs.Gesture._gestureHandlers || {};
    eventjs.Gesture._gestureHandlers.drag = root.drag;
    return root;
}(eventjs.proxy);
/*:
	"Gesture" event proxy (2+ fingers).
	----------------------------------------------------
	CONFIGURE: minFingers, maxFingers.
	----------------------------------------------------
	eventjs.add(window, "gesture", function(event, self) {
		console.log(
			self.x, // centroid
			self.y,
			self.rotation,
			self.scale,
			self.fingers,
			self.state
		);
	});
*/ window.eventjs || (window.eventjs = {});
if (typeof eventjs.proxy === "undefined") eventjs.proxy = {};
eventjs.proxy = function(root) {
    "use strict";
    var RAD_DEG = Math.PI / 180;
    var getCentroid = function(self, points) {
        var centroidx = 0;
        var centroidy = 0;
        var length = 0;
        for(var sid in points){
            var touch = points[sid];
            if (touch.up) continue;
            centroidx += touch.move.x;
            centroidy += touch.move.y;
            length++;
        }
        self.x = centroidx /= length;
        self.y = centroidy /= length;
        return self;
    };
    root.gesture = function(conf) {
        conf.gesture = conf.gesture || "gesture";
        conf.minFingers = conf.minFingers || conf.fingers || 2;
        // Tracking the events.
        conf.onPointerDown = function(event) {
            var fingers = conf.fingers;
            if (root.pointerStart(event, self, conf)) {
                eventjs.add(conf.doc, "mousemove", conf.onPointerMove);
                eventjs.add(conf.doc, "mouseup", conf.onPointerUp);
            }
            // Record gesture start.
            if (conf.fingers === conf.minFingers && fingers !== conf.fingers) {
                self.fingers = conf.minFingers;
                self.scale = 1;
                self.rotation = 0;
                self.state = "start";
                var sids = ""; //- FIXME(mud): can generate duplicate IDs.
                for(var key in conf.tracker)sids += key;
                self.identifier = parseInt(sids);
                getCentroid(self, conf.tracker);
                conf.listener(event, self);
            }
        };
        ///
        conf.onPointerMove = function(event, state) {
            var bbox = conf.bbox;
            var points = conf.tracker;
            var touches = event.changedTouches || root.getCoords(event);
            var length = touches.length;
            // Update tracker coordinates.
            for(var i = 0; i < length; i++){
                var touch = touches[i];
                var sid = touch.identifier || Infinity;
                var pt = points[sid];
                // Check whether "pt" is used by another gesture.
                if (!pt) continue;
                // Find the actual coordinates.
                pt.move.x = touch.pageX - bbox.x1;
                pt.move.y = touch.pageY - bbox.y1;
            }
            ///
            if (conf.fingers < conf.minFingers) return;
            ///
            var touches = [];
            var scale = 0;
            var rotation = 0;
            /// Calculate centroid of gesture.
            getCentroid(self, points);
            ///
            for(var sid in points){
                var touch = points[sid];
                if (touch.up) continue;
                var start = touch.start;
                if (!start.distance) {
                    var dx = start.x - self.x;
                    var dy = start.y - self.y;
                    start.distance = Math.sqrt(dx * dx + dy * dy);
                    start.angle = Math.atan2(dx, dy) / RAD_DEG;
                }
                // Calculate scale.
                var dx = touch.move.x - self.x;
                var dy = touch.move.y - self.y;
                var distance = Math.sqrt(dx * dx + dy * dy);
                scale += distance / start.distance;
                // Calculate rotation.
                var angle = Math.atan2(dx, dy) / RAD_DEG;
                var rotate = (start.angle - angle + 360) % 360 - 180;
                touch.DEG2 = touch.DEG1; // Previous degree.
                touch.DEG1 = rotate > 0 ? rotate : -rotate; // Current degree.
                if (typeof touch.DEG2 !== "undefined") {
                    if (rotate > 0) touch.rotation += touch.DEG1 - touch.DEG2;
                    else touch.rotation -= touch.DEG1 - touch.DEG2;
                    rotation += touch.rotation;
                }
                // Attach current points to self.
                touches.push(touch.move);
            }
            ///
            self.touches = touches;
            self.fingers = conf.fingers;
            self.scale = scale / conf.fingers;
            self.rotation = rotation / conf.fingers;
            self.state = "change";
            conf.listener(event, self);
        };
        conf.onPointerUp = function(event) {
            // Remove tracking for touch.
            var fingers = conf.fingers;
            if (root.pointerEnd(event, self, conf)) {
                eventjs.remove(conf.doc, "mousemove", conf.onPointerMove);
                eventjs.remove(conf.doc, "mouseup", conf.onPointerUp);
            }
            // Check whether fingers has dropped below minFingers.
            if (fingers === conf.minFingers && conf.fingers < conf.minFingers) {
                self.fingers = conf.fingers;
                self.state = "end";
                conf.listener(event, self);
            }
        };
        // Generate maintenance commands, and other configurations.
        var self = root.pointerSetup(conf);
        // Attach events.
        eventjs.add(conf.target, "mousedown", conf.onPointerDown);
        // Return this object.
        return self;
    };
    eventjs.Gesture = eventjs.Gesture || {};
    eventjs.Gesture._gestureHandlers = eventjs.Gesture._gestureHandlers || {};
    eventjs.Gesture._gestureHandlers.gesture = root.gesture;
    return root;
}(eventjs.proxy);
/*:
	"Pointer" event proxy (1+ fingers).
	----------------------------------------------------
	CONFIGURE: minFingers, maxFingers.
	----------------------------------------------------
	eventjs.add(window, "gesture", function(event, self) {
		console.log(self.rotation, self.scale, self.fingers, self.state);
	});
*/ window.eventjs || (window.eventjs = {});
if (typeof eventjs.proxy === "undefined") eventjs.proxy = {};
eventjs.proxy = function(root) {
    "use strict";
    root.pointerdown = root.pointermove = root.pointerup = function(conf) {
        conf.gesture = conf.gesture || "pointer";
        if (conf.target.isPointerEmitter) return;
        // Tracking the events.
        var isDown = true;
        conf.onPointerDown = function(event) {
            isDown = false;
            self.gesture = "pointerdown";
            conf.listener(event, self);
        };
        conf.onPointerMove = function(event) {
            self.gesture = "pointermove";
            conf.listener(event, self, isDown);
        };
        conf.onPointerUp = function(event) {
            isDown = true;
            self.gesture = "pointerup";
            conf.listener(event, self, true);
        };
        // Generate maintenance commands, and other configurations.
        var self = root.pointerSetup(conf);
        // Attach events.
        eventjs.add(conf.target, "mousedown", conf.onPointerDown);
        eventjs.add(conf.target, "mousemove", conf.onPointerMove);
        eventjs.add(conf.doc, "mouseup", conf.onPointerUp);
        // Return this object.
        conf.target.isPointerEmitter = true;
        return self;
    };
    eventjs.Gesture = eventjs.Gesture || {};
    eventjs.Gesture._gestureHandlers = eventjs.Gesture._gestureHandlers || {};
    eventjs.Gesture._gestureHandlers.pointerdown = root.pointerdown;
    eventjs.Gesture._gestureHandlers.pointermove = root.pointermove;
    eventjs.Gesture._gestureHandlers.pointerup = root.pointerup;
    return root;
}(eventjs.proxy);
/*:
	"Device Motion" and "Shake" event proxy.
	----------------------------------------------------
	http://developer.android.com/reference/android/hardware/Sensoreventjs.html#values
	----------------------------------------------------
	eventjs.add(window, "shake", function(event, self) {});
	eventjs.add(window, "devicemotion", function(event, self) {
		console.log(self.acceleration, self.accelerationIncludingGravity);
	});
*/ window.eventjs || (window.eventjs = {});
if (typeof eventjs.proxy === "undefined") eventjs.proxy = {};
eventjs.proxy = function(root) {
    "use strict";
    root.shake = function(conf) {
        // Externally accessible data.
        var self = {
            gesture: "devicemotion",
            acceleration: {},
            accelerationIncludingGravity: {},
            target: conf.target,
            listener: conf.listener,
            remove: function() {
                window.removeEventListener("devicemotion", onDeviceMotion, false);
            }
        };
        // Setting up local variables.
        var threshold = 4; // Gravitational threshold.
        var timeout = 1000; // Timeout between shake events.
        var timeframe = 200; // Time between shakes.
        var shakes = 3; // Minimum shakes to trigger event.
        var lastShake = new Date().getTime();
        var gravity = {
            x: 0,
            y: 0,
            z: 0
        };
        var delta = {
            x: {
                count: 0,
                value: 0
            },
            y: {
                count: 0,
                value: 0
            },
            z: {
                count: 0,
                value: 0
            }
        };
        // Tracking the events.
        var onDeviceMotion = function(e) {
            var alpha = 0.8; // Low pass filter.
            var o = e.accelerationIncludingGravity;
            gravity.x = alpha * gravity.x + (1 - alpha) * o.x;
            gravity.y = alpha * gravity.y + (1 - alpha) * o.y;
            gravity.z = alpha * gravity.z + (1 - alpha) * o.z;
            self.accelerationIncludingGravity = gravity;
            self.acceleration.x = o.x - gravity.x;
            self.acceleration.y = o.y - gravity.y;
            self.acceleration.z = o.z - gravity.z;
            ///
            if (conf.gesture === "devicemotion") {
                conf.listener(e, self);
                return;
            }
            var data = "xyz";
            var now = new Date().getTime();
            for(var n = 0, length = data.length; n < length; n++){
                var letter = data[n];
                var ACCELERATION = self.acceleration[letter];
                var DELTA = delta[letter];
                var abs = Math.abs(ACCELERATION);
                /// Check whether another shake event was recently registered.
                if (now - lastShake < timeout) continue;
                /// Check whether delta surpasses threshold.
                if (abs > threshold) {
                    var idx = now * ACCELERATION / abs;
                    var span = Math.abs(idx + DELTA.value);
                    // Check whether last delta was registered within timeframe.
                    if (DELTA.value && span < timeframe) {
                        DELTA.value = idx;
                        DELTA.count++;
                        // Check whether delta count has enough shakes.
                        if (DELTA.count === shakes) {
                            conf.listener(e, self);
                            // Reset tracking.
                            lastShake = now;
                            DELTA.value = 0;
                            DELTA.count = 0;
                        }
                    } else {
                        // Track first shake.
                        DELTA.value = idx;
                        DELTA.count = 1;
                    }
                }
            }
        };
        // Attach events.
        if (!window.addEventListener) return;
        window.addEventListener("devicemotion", onDeviceMotion, false);
        // Return this object.
        return self;
    };
    eventjs.Gesture = eventjs.Gesture || {};
    eventjs.Gesture._gestureHandlers = eventjs.Gesture._gestureHandlers || {};
    eventjs.Gesture._gestureHandlers.shake = root.shake;
    return root;
}(eventjs.proxy);
/*:
	"Swipe" event proxy (1+ fingers).
	----------------------------------------------------
	CONFIGURE: snap, threshold, maxFingers.
	----------------------------------------------------
	eventjs.add(window, "swipe", function(event, self) {
		console.log(self.velocity, self.angle);
	});
*/ window.eventjs || (window.eventjs = {});
if (typeof eventjs.proxy === "undefined") eventjs.proxy = {};
eventjs.proxy = function(root) {
    "use strict";
    var RAD_DEG = Math.PI / 180;
    root.swipe = function(conf) {
        conf.snap = conf.snap || 90; // angle snap.
        conf.threshold = conf.threshold || 1; // velocity threshold.
        conf.gesture = conf.gesture || "swipe";
        // Tracking the events.
        conf.onPointerDown = function(event) {
            if (root.pointerStart(event, self, conf)) {
                eventjs.add(conf.doc, "mousemove", conf.onPointerMove).listener(event);
                eventjs.add(conf.doc, "mouseup", conf.onPointerUp);
            }
        };
        conf.onPointerMove = function(event) {
            var touches = event.changedTouches || root.getCoords(event);
            var length = touches.length;
            for(var i = 0; i < length; i++){
                var touch = touches[i];
                var sid = touch.identifier || Infinity;
                var o = conf.tracker[sid];
                // Identifier defined outside of listener.
                if (!o) continue;
                o.move.x = touch.pageX;
                o.move.y = touch.pageY;
                o.moveTime = new Date().getTime();
            }
        };
        conf.onPointerUp = function(event) {
            if (root.pointerEnd(event, self, conf)) {
                eventjs.remove(conf.doc, "mousemove", conf.onPointerMove);
                eventjs.remove(conf.doc, "mouseup", conf.onPointerUp);
                ///
                var velocity1;
                var velocity2;
                var degree1;
                var degree2;
                /// Calculate centroid of gesture.
                var start = {
                    x: 0,
                    y: 0
                };
                var endx = 0;
                var endy = 0;
                var length = 0;
                ///
                for(var sid in conf.tracker){
                    var touch = conf.tracker[sid];
                    var xdist = touch.move.x - touch.start.x;
                    var ydist = touch.move.y - touch.start.y;
                    ///
                    endx += touch.move.x;
                    endy += touch.move.y;
                    start.x += touch.start.x;
                    start.y += touch.start.y;
                    length++;
                    ///
                    var distance = Math.sqrt(xdist * xdist + ydist * ydist);
                    var ms = touch.moveTime - touch.startTime;
                    var degree2 = Math.atan2(xdist, ydist) / RAD_DEG + 180;
                    var velocity2 = ms ? distance / ms : 0;
                    if (typeof degree1 === "undefined") {
                        degree1 = degree2;
                        velocity1 = velocity2;
                    } else if (Math.abs(degree2 - degree1) <= 20) {
                        degree1 = (degree1 + degree2) / 2;
                        velocity1 = (velocity1 + velocity2) / 2;
                    } else return;
                }
                ///
                var fingers = conf.gestureFingers;
                if (conf.minFingers <= fingers && conf.maxFingers >= fingers) {
                    if (velocity1 > conf.threshold) {
                        start.x /= length;
                        start.y /= length;
                        self.start = start;
                        self.x = endx / length;
                        self.y = endy / length;
                        self.angle = -(((degree1 / conf.snap + 0.5 >> 0) * conf.snap || 360) - 360);
                        self.velocity = velocity1;
                        self.fingers = fingers;
                        self.state = "swipe";
                        conf.listener(event, self);
                    }
                }
            }
        };
        // Generate maintenance commands, and other configurations.
        var self = root.pointerSetup(conf);
        // Attach events.
        eventjs.add(conf.target, "mousedown", conf.onPointerDown);
        // Return this object.
        return self;
    };
    eventjs.Gesture = eventjs.Gesture || {};
    eventjs.Gesture._gestureHandlers = eventjs.Gesture._gestureHandlers || {};
    eventjs.Gesture._gestureHandlers.swipe = root.swipe;
    return root;
}(eventjs.proxy);
/*:
	"Tap" and "Longpress" event proxy.
	----------------------------------------------------
	CONFIGURE: delay (longpress), timeout (tap).
	----------------------------------------------------
	eventjs.add(window, "tap", function(event, self) {
		console.log(self.fingers);
	});
	----------------------------------------------------
	multi-finger tap // touch an target for <= 250ms.
	multi-finger longpress // touch an target for >= 500ms
*/ window.eventjs || (window.eventjs = {});
if (typeof eventjs.proxy === "undefined") eventjs.proxy = {};
eventjs.proxy = function(root) {
    "use strict";
    root.longpress = function(conf) {
        conf.gesture = "longpress";
        return root.tap(conf);
    };
    root.tap = function(conf) {
        conf.delay = conf.delay || 500;
        conf.timeout = conf.timeout || 250;
        conf.driftDeviance = conf.driftDeviance || 10;
        conf.gesture = conf.gesture || "tap";
        // Setting up local variables.
        var timestamp, timeout;
        // Tracking the events.
        conf.onPointerDown = function(event) {
            if (root.pointerStart(event, self, conf)) {
                timestamp = new Date().getTime();
                // Initialize event listeners.
                eventjs.add(conf.doc, "mousemove", conf.onPointerMove).listener(event);
                eventjs.add(conf.doc, "mouseup", conf.onPointerUp);
                // Make sure this is a "longpress" event.
                if (conf.gesture !== "longpress") return;
                timeout = setTimeout(function() {
                    if (event.cancelBubble && ++event.cancelBubbleCount > 1) return;
                    // Make sure no fingers have been changed.
                    var fingers = 0;
                    for(var key in conf.tracker){
                        var point = conf.tracker[key];
                        if (point.end === true) return;
                        if (conf.cancel) return;
                        fingers++;
                    }
                    // Send callback.
                    if (conf.minFingers <= fingers && conf.maxFingers >= fingers) {
                        self.state = "start";
                        self.fingers = fingers;
                        self.x = point.start.x;
                        self.y = point.start.y;
                        conf.listener(event, self);
                    }
                }, conf.delay);
            }
        };
        conf.onPointerMove = function(event) {
            var bbox = conf.bbox;
            var touches = event.changedTouches || root.getCoords(event);
            var length = touches.length;
            for(var i = 0; i < length; i++){
                var touch = touches[i];
                var identifier = touch.identifier || Infinity;
                var pt = conf.tracker[identifier];
                if (!pt) continue;
                var x = touch.pageX - bbox.x1;
                var y = touch.pageY - bbox.y1;
                ///
                var dx = x - pt.start.x;
                var dy = y - pt.start.y;
                var distance = Math.sqrt(dx * dx + dy * dy);
                if (!(x > 0 && x < bbox.width && y > 0 && y < bbox.height && distance <= conf.driftDeviance)) {
                    // Cancel out this listener.
                    eventjs.remove(conf.doc, "mousemove", conf.onPointerMove);
                    conf.cancel = true;
                    return;
                }
            }
        };
        conf.onPointerUp = function(event) {
            if (root.pointerEnd(event, self, conf)) {
                clearTimeout(timeout);
                eventjs.remove(conf.doc, "mousemove", conf.onPointerMove);
                eventjs.remove(conf.doc, "mouseup", conf.onPointerUp);
                if (event.cancelBubble && ++event.cancelBubbleCount > 1) return;
                // Callback release on longpress.
                if (conf.gesture === "longpress") {
                    if (self.state === "start") {
                        self.state = "end";
                        conf.listener(event, self);
                    }
                    return;
                }
                // Cancel event due to movement.
                if (conf.cancel) return;
                // Ensure delay is within margins.
                if (new Date().getTime() - timestamp > conf.timeout) return;
                // Send callback.
                var fingers = conf.gestureFingers;
                if (conf.minFingers <= fingers && conf.maxFingers >= fingers) {
                    self.state = "tap";
                    self.fingers = conf.gestureFingers;
                    conf.listener(event, self);
                }
            }
        };
        // Generate maintenance commands, and other configurations.
        var self = root.pointerSetup(conf);
        // Attach events.
        eventjs.add(conf.target, "mousedown", conf.onPointerDown);
        // Return this object.
        return self;
    };
    eventjs.Gesture = eventjs.Gesture || {};
    eventjs.Gesture._gestureHandlers = eventjs.Gesture._gestureHandlers || {};
    eventjs.Gesture._gestureHandlers.tap = root.tap;
    eventjs.Gesture._gestureHandlers.longpress = root.longpress;
    return root;
}(eventjs.proxy);
/*:
	"Mouse Wheel" event proxy.
	----------------------------------------------------
	eventjs.add(window, "wheel", function(event, self) {
		console.log(self.state, self.wheelDelta);
	});
*/ window.eventjs || (window.eventjs = {});
if (typeof eventjs.proxy === "undefined") eventjs.proxy = {};
eventjs.proxy = function(root) {
    "use strict";
    root.wheelPreventElasticBounce = function(el) {
        if (!el) return;
        if (typeof el === "string") el = document.querySelector(el);
        eventjs.add(el, "wheel", function(event, self) {
            self.preventElasticBounce();
            eventjs.stop(event);
        });
    };
    root.wheel = function(conf) {
        // Configure event listener.
        var interval;
        var timeout = conf.timeout || 150;
        var count = 0;
        // Externally accessible data.
        var self = {
            gesture: "wheel",
            state: "start",
            wheelDelta: 0,
            target: conf.target,
            listener: conf.listener,
            preventElasticBounce: function(event) {
                var target = this.target;
                var scrollTop = target.scrollTop;
                var top = scrollTop + target.offsetHeight;
                var height = target.scrollHeight;
                if (top === height && this.wheelDelta <= 0) eventjs.cancel(event);
                else if (scrollTop === 0 && this.wheelDelta >= 0) eventjs.cancel(event);
                eventjs.stop(event);
            },
            add: function() {
                conf.target[add](type, onMouseWheel, false);
            },
            remove: function() {
                conf.target[remove](type, onMouseWheel, false);
            }
        };
        // Tracking the events.
        var onMouseWheel = function(event) {
            event = event || window.event;
            self.state = count++ ? "change" : "start";
            self.wheelDelta = event.detail ? event.detail * -20 : event.wheelDelta;
            conf.listener(event, self);
            clearTimeout(interval);
            interval = setTimeout(function() {
                count = 0;
                self.state = "end";
                self.wheelDelta = 0;
                conf.listener(event, self);
            }, timeout);
        };
        // Attach events.
        var add = document.addEventListener ? "addEventListener" : "attachEvent";
        var remove = document.removeEventListener ? "removeEventListener" : "detachEvent";
        var type = eventjs.getEventSupport("mousewheel") ? "mousewheel" : "DOMMouseScroll";
        conf.target[add](type, onMouseWheel, false);
        // Return this object.
        return self;
    };
    eventjs.Gesture = eventjs.Gesture || {};
    eventjs.Gesture._gestureHandlers = eventjs.Gesture._gestureHandlers || {};
    eventjs.Gesture._gestureHandlers.wheel = root.wheel;
    return root;
}(eventjs.proxy);
///
var addEvent = eventjs.add;
var removeEvent = eventjs.remove;
///
(function() {
    for(var key in eventjs)Event[key] = eventjs[key];
    for(var key in eventjs.proxy)addEvent[key] = eventjs.proxy[key];
})();

},{}],"juBnT":[function(require,module,exports) {
/*
	-------------------------------------------------------
	Math : 0.1.1 : 2013/12/18 : https://sketch.io
	-------------------------------------------------------
*/ window.sketch || (window.sketch = {});
if (typeof sketch.util === "undefined") sketch.util = {};
(function(root) {
    "use strict";
    root.util.RAD_DEG = 180 / Math.PI; // Radians to Degrees
    root.util.DEG_RAD = 1 / root.util.RAD_DEG; // Degrees to Radians
    root.util.INFINITY = 4294967295;
    root.util.INFINITY_MINUS_24bit = root.util.INFINITY - 0xffffff; // reserved for elements forced to top of stack
    root.util.INFINITY_MINUS_16bit = root.util.INFINITY - 0xffff; // ?
    root.util.INFINITY_MINUS_8bit = root.util.INFINITY - 0xff; // reserved for elements in genesis
    /* Park Miller (1988) "minimal standard" linear congruential pseudo-random number generator.
	------------------------------------------------------- */ root.util.Random = function(seed) {
        this.seed = typeof seed === "number" ? seed : root.util.Random.seed();
        this.n = Number(this.seed);
        return this;
    };
    root.util.Random.seed = function() {
        return Math.random() * 2147483648 >> 0;
    };
    root.util.Random.prototype = {
        toInt: function() {
            return this.n = this.n * 16807 % 2147483647;
        },
        toDouble: function() {
            return (this.n = this.n * 16807 % 2147483647) / 2147483647;
        },
        intRange: function(min, max) {
            min -= 0.4999;
            max += 0.4999;
            return Math.round(min + (max - min) * ((this.n = this.n * 16807 % 2147483647) / 2147483647));
        },
        doubleRange: function(min, max) {
            return min + (max - min) * ((this.n = this.n * 16807 % 2147483647) / 2147483647);
        }
    };
    /* Monitor specific conversions - PX, PT, PC, IN, FT, YD, MM, CM, M, PX, EX, EM
	------------------------------------------------------- */ root.util.getScreenMetrics = function() {
        //- Examine these in the context of devicePixelRatio, as well.
        var measure = function(type) {
            try {
                div.style.fontSize = type;
            } catch (e) {
                div.style.fontSize = "";
            }
            return div.offsetHeight / 10000;
        };
        /// Add element to measure with.
        var container = document.createElement("div"); // fix for iframe resizing on iOS
        container.style.cssText = "position: relative; width: 1px; height: 1px; overflow: scroll;";
        ///
        var div = document.createElement("div");
        div.style.cssText = "position: absolute; width: 100em; height: 10000em; overflow: hidden;";
        container.appendChild(div);
        document.body.appendChild(container);
        /// Measure textual styles
        var types = [
            "normal",
            "xx-small",
            "x-small",
            "small",
            "medium",
            "large",
            "x-large",
            "xx-large"
        ];
        var ret = {};
        for(var n = 0; n < types.length; n++)ret[types[n] + "_px"] = measure(types[n]);
        /// Measure conversions for units
        ret["%>px"] = measure("100%") / 100; // Percent
        ret["px>pt"] = 1 / measure("1pt"); // Points
        ret["pt>pc"] = 1 / 12.0; // Picas
        ret["px>in"] = 1 / measure("72pt"); // Inches
        ret["in>ft"] = 1 / 12.0; // Feet
        ret["ft>yd"] = 1 / 3.0; // Yards
        ret["px>mm"] = 25.4 * ret["px>in"]; // Millimeter
        ret["mm>cm"] = 0.1; // Centimeter
        ret["cm>m"] = 0.01; // Meter
        ret["px>ex"] = 1 / measure("1ex"); // Ex
        ret["ex>em"] = 1 / ret["px>ex"] / measure("1em"); // Em
        ret["px>px"] = 1;
        /// Remove the measuring element.
        document.body.removeChild(container);
        /// Create pathways of conversion between all the types.
        var compute = function(o, table, b, c) {
            for(var a in table){
                if (typeof (c = table[a]) === "object") {
                    compute(o, c, a);
                    continue;
                }
                if (b) {
                    o["px>" + a] = o["px>" + b] * o[b + ">" + a];
                    o[b + ">" + c] = o[b + ">" + a] * o[a + ">" + c];
                    o[b + ">px"] = 1 / o["px>" + b];
                    o[c + ">" + b] = 1 / o[a + ">" + c] * 1 / o[b + ">" + a];
                    o[a + ">" + b] = 1 / o[b + ">" + a];
                }
                o["px>" + c] = o["px>" + a] * o[a + ">" + c];
                o[a + ">px"] = 1 / o["px>" + a];
                o[c + ">px"] = 1 / o["px>" + a] * 1 / o[a + ">" + c];
                o[c + ">" + a] = 1 / o[a + ">" + c];
            }
        };
        ///
        compute(ret, {
            "pt": "pc",
            "mm": {
                "cm": "m"
            },
            "in": {
                "ft": "yd"
            },
            "ex": "em"
        });
        ///
        return ret;
    };
    /* Hash - Dan Bernstein (djb2)
	------------------------------------------------------- */ root.util.createHash = function(str) {
        if (!str) return 0;
        var hash = 5381;
        for(var n = 0, length = str.length; n < length; n++){
            var c = str[n].charCodeAt();
            hash = (hash << 5) + hash + c;
        }
        return hash;
    };
})(sketch);

},{}],"8nWN3":[function(require,module,exports) {
var _texturesJs = require("./Textures.js");
window.BG || (window.BG = {});
BG.onload = function() {
    BG.loader = new widgets.Loader("starting...");
    /// load blend pixel shaders
    eval(Color.Blend.createKernals());
    ///
    BG.uploader = new widgets.Uploader({
        confirm: "text",
        action: "./upload.php",
        mode: "read",
        maxFiles: 1,
        dropAreaStyle: "position: absolute; background: rgba(0, 200, 0, 1);",
        dropAreaMessage: "Drop Photo Here",
        onChange: function(self, files) {
            for(let key in files)var file = files[key];
            BG.createSeamlessTexture(file.src, function(canvas) {
                (0, _texturesJs.createTexture)(canvas.toDataURL(), function() {
                    tctx.clearRect(0, 0, tcanvas.width, tcanvas.height);
                    tctx.drawImage(BG.texture, 0, 0);
                    BG.render();
                });
            });
        },
        onProgress: function(self) {
            document.getElementById("upload-bar").style.width = self.transferPercent + "%";
            document.getElementById("upload-bar-percent").innerHTML = self.transferPercent + "%";
        }
    });
    ///
    BG.pickerColor = "22FF74";
    BG.picker = new Color.Picker({
        feature: {
            closeButton: true,
            hexInput: true
        },
        modules: {
            hue: {
                column: 2,
                enable: true,
                width: 30,
                height: 192
            },
            satval: {
                column: 2,
                enable: true,
                width: 192,
                height: 192
            },
            alpha: {
                column: 2,
                enable: false,
                width: 30,
                height: 192
            }
        },
        id: "ColorPicker",
        style: "top: 220px; right: 270px",
        color: "#" + BG.pickerColor,
        display: true,
        onMouseDown: function(self) {
            BG.toggleRemoteFrame("down");
        },
        onMouseUp: function(self) {
            BG.toggleRemoteFrame("up");
        },
        callback: function(color, state) {
            const gd = BG.gradient;
            BG.toggleRemoteFrame(state);
            const type = gd["active"];
            const active = gd.stops[type];
            active.R = color.R;
            active.G = color.G;
            active.B = color.B;
            const d = document.getElementById("CP" + type);
            if (d) d.style.background = Color.Space.RGBA_W3(gd.stops[type]);
            BG.render();
        }
    });
    eventjs.add(document.querySelector("#ColorPicker"), "mousedown", function(event) {
        widget.windows.drag(this, event);
    });
    BG.picker.element.style.top = "20px";
    BG.picker.element.style.left = "1000px";
    ///
    BG.gradient = {
        active: 0,
        stops: [
            new BG.colorStop({
                hex: 0x229CFF,
                stop: 0
            }),
            new BG.colorStop({
                hex: 0x00AA77,
                stop: 1
            })
        ]
    };
    BG.width = canvas.width = window.innerWidth;
    BG.height = canvas.height = window.innerHeight;
    ///
    if (window.location.hash) {
        const hash = window.location.hash.substr(1).split("%22").join('"');
        const ret = JSON.parse(hash);
        if (ret.config && ret.width && ret.height && ret.gradient) {
            config = ret.config;
            BG.gradient.stops = [];
            const gradient = ret.gradient;
            for(var key1 in gradient){
                if (BG.pickerColor === "008BE1") BG.pickerColor = gradient[key1];
                BG.gradient.stops.push(new BG.colorStop({
                    hex: "0x" + gradient[key1].substr(1),
                    stop: key1
                }));
            }
        }
    }
    BG.createGeneratorUI();
    ///
    const sidebar = document.getElementById("sidebar");
    eventjs.proxy.drag({
        position: "move",
        target: sidebar,
        listener: function(event, self) {
            BG.toggleRemoteFrame(self.state);
            sidebar.style.left = self.x + "px";
            sidebar.style.top = self.y + "px";
            eventjs.prevent(event);
        }
    });
    ///
    const element = document.querySelector("#textures");
    Event.add(element, "mousedown", Event.cancel);
    Event.add(element, "click", function() {
        if (element.style.height) {
            element.style.width = "";
            element.style.height = "";
            element.scrollTop = 0;
        } else element.style.height = "432px";
    });
    ///
    window.dcanvas = document.createElement("canvas");
    window.dctx = dcanvas.getContext("2d");
    ///
    const twidth = 244;
    const theight = 46;
    const thumbnailer = new widgets.Thumbnailer();
    ///
    window.tcanvas = document.createElement("canvas");
    window.tctx = tcanvas.getContext("2d");
    tcanvas.width = twidth;
    tcanvas.height = theight;
    element.appendChild(tcanvas);
    ///
    for(var key1 in textures)element.appendChild(thumbnailer.generate({
        title: textures[key1],
        src: textures[key1].replace(".jpeg", "_thumb.jpeg"),
        maxWidth: twidth,
        maxHeight: theight,
        crop: "None",
        callback: function(canvas) {
            eventjs.add(canvas, "click", function(event, self) {
                if (!element.style.height) return;
                BG.texture.src = self.target.src.replace("_thumb", "");
                window.texture = (0, _texturesJs.createTexture)(BG.texture.src, function() {
                    tctx.clearRect(0, 0, tcanvas.width, tcanvas.height);
                    tctx.drawImage(BG.texture, 0, 0);
                    BG.render();
                });
                BG.texture.onload = function() {
                    noise.width = BG.texture.width;
                    noise.height = BG.texture.height;
                    BG.render();
                };
            });
        }
    }));
    ///
    BG.generateNoise(true);
    ///
    function loadTexture(src) {
        BG.texture = (0, _texturesJs.createTexture)(src, function() {
            tctx.clearRect(0, 0, tcanvas.width, tcanvas.height);
            tctx.drawImage(BG.texture, 0, 0);
            // remote access
            // create default noise
            window.onresize();
            BG.render();
            BG.gradient.active = "0";
            BG.createColorStops();
            BG.createPicker();
            if (window.location.search) BG.createRemoteFrame();
            else BG.loader.stop();
        });
        BG.texture.src = src;
    }
    ///
    loadTexture(config.textureID || "./textures/texturise/wood_009.jpeg");
    ///
    BG.fileSaver = new widgets.FileSaver({
        jsDir: "./inc/",
        callback: function(self) {
            self.button({
                parent: document.querySelector("#sidebar"),
                id: "downloadWallpaper",
                title: "Download Wallpaper",
                fileName: "ZenBG",
                fileType: "png",
                format: "base64",
                getData: function() {
                    return canvas;
                }
            });
        }
    });
};
BG.onresize = function() {
    BG.width = canvas.width = window.innerWidth;
    BG.height = canvas.height = window.innerHeight;
    // resize iframe
    const iframe = document.getElementById("iframe");
    if (iframe) iframe.style.width = window.innerWidth + "px";
    //
    dcanvas.width = ctx.canvas.width;
    dcanvas.height = ctx.canvas.height;
    // rescale gradient
    BG.render();
};
window.addEventListener("DOMContentLoaded", BG.onload);
window.addEventListener("resize", BG.onresize);

},{"./Textures.js":"3veAE"}],"3veAE":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "createTexture", ()=>createTexture);
const createTexture = function() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    let $image = new Image();
    return function(src1, callback) {
        BG.loader.message("loading...");
        $image = new Image();
        $image.onerror = console.error;
        $image.onload = function() {
            // lum in sRGB
            const lum = {
                r: 0.33,
                g: 0.33,
                b: 0.33
            };
            var width = $image.width;
            var height = $image.height;
            // resize canvas
            canvas.width = width;
            canvas.height = height;
            // draw images
            ctx.drawImage($image, 0, 0, width, height);
            // get imageData
            const imageData = ctx.getImageData(0, 0, width, height);
            const src = imageData.data;
            const length = src.length;
            const light = 0;
            for(let n = 0; n < length; n += 4){
                // Source #
                const r = src[n];
                const g = src[n + 1];
                const b = src[n + 2];
                const a = src[n + 3];
                // Source #2
                const R = light;
                const G = light;
                const B = light;
                // Apply effect to pixels (in this case Subtract)
                if (light) {
                    var er = Math.min(255, r + R); // delete light colors
                    var eg = Math.min(255, g + G);
                    var eb = Math.min(255, b + B);
                } else {
                    var er = Math.max(0, R < r ? R : r); // delete dark colors
                    var eg = Math.max(0, G < g ? G : g);
                    var eb = Math.max(0, B < b ? B : b);
                }
                // Remove color that would have otherwise been changed
                src[n] = 0;
                src[n + 1] = 0;
                src[n + 2] = 0;
                // Calculate amount of modification
                const mr = er - r;
                const mg = eg - g;
                const mb = eb - b;
                const ma = Math.abs(mr) * lum.r + Math.abs(mg) * lum.g + Math.abs(mb) * lum.b;
                // Combined alpha of changed pixels (erase)
                src[n + 3] = a - ma;
            }
            ctx.putImageData(imageData, 0, 0);
            canvas.pattern = ctx.createPattern(canvas, "repeat");
            canvas.style.cssText = "z-index: 1000; position: absolute; right: 0;";
            // BG.loader.stop()
            if (callback) callback(canvas);
        };
        $image.src = src1;
        return canvas;
    };
}();
window.textures = [
    "textures/texturise/wood_001.jpeg",
    "textures/texturise/wood_002.jpeg",
    "textures/texturise/wood_003.jpeg",
    "textures/texturise/wood_004.jpeg",
    "textures/texturise/wood_005.jpeg",
    "textures/texturise/wood_006.jpeg",
    "textures/texturise/wood_007.jpeg",
    "textures/texturise/wood_008.jpeg",
    "textures/texturise/wood_009.jpeg",
    "textures/texturise/wood_010.jpeg",
    "textures/texturise/wood_011.jpeg",
    "textures/texturise/wood_012.jpeg",
    "textures/texturise/wood_013.jpeg",
    "textures/texturise/wood_014.jpeg",
    "textures/texturise/wood_015.jpeg",
    "textures/texturise/rust_001.jpeg",
    "textures/texturise/rust_002.jpeg",
    "textures/texturise/rust_003.jpeg",
    "textures/texturise/rocks_001.jpeg",
    "textures/texturise/rocks_002.jpeg",
    "textures/texturise/rocks_003.jpeg",
    "textures/texturise/rocks_004.jpeg",
    "textures/texturise/rocks_005.jpeg",
    "textures/texturise/rocks_006.jpeg",
    "textures/texturise/rocks_007.jpeg",
    "textures/texturise/rocks_008.jpeg",
    "textures/texturise/rocks_009.jpeg",
    "textures/texturise/rocks_010.jpeg",
    "textures/texturise/rocks_011.jpeg",
    "textures/texturise/plastic_001.jpeg",
    "textures/texturise/plastic_002.jpeg",
    "textures/texturise/plastic_003.jpeg",
    "textures/texturise/plastic_004.jpeg",
    "textures/texturise/plastic_005.jpeg",
    "textures/texturise/plastic_006.jpeg",
    "textures/texturise/plastic_007.jpeg",
    "textures/texturise/plastic_008.jpeg",
    "textures/texturise/plastic_009.jpeg",
    "textures/texturise/plastic_010.jpeg",
    "textures/texturise/plastic_011.jpeg",
    "textures/texturise/plastic_012.jpeg",
    "textures/texturise/plastic_013.jpeg",
    "textures/texturise/paper_001.jpeg",
    "textures/texturise/paper_002.jpeg",
    "textures/texturise/paper_003.jpeg",
    "textures/texturise/paper_004.jpeg",
    "textures/texturise/paper_005.jpeg",
    "textures/texturise/paper_006.jpeg",
    "textures/texturise/paper_007.jpeg",
    "textures/texturise/paper_008.jpeg",
    "textures/texturise/paper_009.jpeg",
    "textures/texturise/paper_010.jpeg",
    "textures/texturise/paper_011.jpeg",
    "textures/texturise/paper_012.jpeg",
    "textures/texturise/paper_013.jpeg",
    "textures/texturise/paper_014.jpeg",
    "textures/texturise/paper_015.jpeg",
    "textures/texturise/paper_016.jpeg",
    "textures/texturise/paper_017.jpeg",
    "textures/texturise/paper_018.jpeg",
    "textures/texturise/paper_019.jpeg",
    "textures/texturise/paper_020.jpeg",
    "textures/texturise/paper_021.jpeg",
    "textures/texturise/paper_022.jpeg",
    "textures/texturise/paper_023.jpeg",
    "textures/texturise/paper_024.jpeg",
    "textures/texturise/paint_001.jpeg",
    "textures/texturise/paint_002.jpeg",
    "textures/texturise/paint_003.jpeg",
    "textures/texturise/paint_004.jpeg",
    "textures/texturise/paint_005.jpeg",
    "textures/texturise/paint_006.jpeg",
    "textures/texturise/paint_007.jpeg",
    "textures/texturise/paint_008.jpeg",
    "textures/texturise/paint_009.jpeg",
    "textures/texturise/paint_010.jpeg",
    "textures/texturise/paint_011.jpeg",
    "textures/texturise/fabric_001.jpeg",
    "textures/texturise/fabric_002.jpeg",
    "textures/texturise/fabric_003.jpeg",
    "textures/texturise/fabric_004.jpeg",
    "textures/texturise/fabric_005.jpeg",
    "textures/texturise/fabric_006.jpeg",
    "textures/texturise/concrete_001.jpeg",
    "textures/texturise/concrete_002.jpeg",
    "textures/texturise/concrete_003.jpeg",
    "textures/texturise/concrete_004.jpeg",
    "textures/texturise/concrete_005.jpeg",
    "textures/texturise/concrete_006.jpeg",
    "textures/texturise/concrete_007.jpeg",
    "textures/texturise/concrete_008.jpeg",
    "textures/texturise/concrete_009.jpeg",
    "textures/texturise/concrete_010.jpeg",
    "textures/texturise/concrete_011.jpeg",
    "textures/texturise/concrete_013.jpeg",
    "textures/texturise/concrete_014.jpeg"
];

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"gkKU3":[function(require,module,exports) {
exports.interopDefault = function(a) {
    return a && a.__esModule ? a : {
        default: a
    };
};
exports.defineInteropFlag = function(a) {
    Object.defineProperty(a, "__esModule", {
        value: true
    });
};
exports.exportAll = function(source, dest) {
    Object.keys(source).forEach(function(key) {
        if (key === "default" || key === "__esModule" || dest.hasOwnProperty(key)) return;
        Object.defineProperty(dest, key, {
            enumerable: true,
            get: function() {
                return source[key];
            }
        });
    });
    return dest;
};
exports.export = function(dest, destName, get) {
    Object.defineProperty(dest, destName, {
        enumerable: true,
        get: get
    });
};

},{}],"4Gw9e":[function(require,module,exports) {
window.BG || (window.BG = {});
let iFrameHref = window.location.href;
let timeout = 0;
/**
 *
 * @param waiting
 */ function activate(waiting) {
    const $iframe = document.getElementById("iframe");
    const $document = $iframe.contentWindow.document;
    if (!$document.body || iFrameHref === $document.location.href && waiting) {
        if (new Date().getTime() - timeout > 30000) return;
        setTimeout(function() {
            activate(true);
        }, 10);
        return;
    } else timeout = 0;
    iFrameHref = $document.location.href;
    $document.body.style.background = "none";
    BG.uploader.createDropArea($document.body);
    const location = window.location;
    const elms = $document.getElementsByTagName("a");
    const length = elms.length;
    for(let i = 0; i < length; i++)Event.add(elms[i], "click mousedown", function(event) {
        BG.remoteFrame = this;
        event.preventDefault();
        event.stopPropagation();
        this.style.background = "none";
        if (!this.href) return;
        if ($iframe.src === this.href) return;
        BG.onFormSubmit(location.origin + location.pathname + "?" + this.href);
        return false;
    });
    BG.loader.stop();
}
BG.remoteFrame = undefined; // webpage in iframe
BG.toggleRemoteFrame = function(state) {
    const frame = document.getElementById("remoteFrame");
    if (!frame) return;
    if (state === "down") frame.style.display = "block";
    else if (state === "up") frame.style.display = "none";
};
BG.createRemoteFrame = async function() {
    BG.loader.message("Loading Website...");
    const $a = document.createElement("a");
    const $main = document.querySelector("#main");
    $main.innerHTML = "";
    const originalUrl = window.location.search.substr(1);
    const request = await fetch(`https://api.codetabs.com/v1/proxy?quest=${originalUrl}`);
    const html = await request.text();
    const blob = new Blob([
        html
    ], {
        type: "text/html"
    });
    const url = URL.createObjectURL(blob);
    const $iframe = document.createElement("iframe");
    $iframe.id = "iframe";
    $iframe.style.cssText = `width: ${window.innerWidth}px; height: 100%; border: 0; position: absolute; top: 0;`;
    $iframe.src = url;
    $iframe.onload = function() {
        const window = $iframe.contentWindow;
        const document = window.document;
        document.body.style.background = "transparent";
        $a.href = originalUrl;
        const origin = $a.origin;
        const $path = $a.pathname.substr(0, $a.pathname.indexOf("/") + 1);
        const $items = Object.values(document.getElementsByTagName("*"));
        $items.forEach(($element)=>{
            if ($element.getAttribute("src")) {
                $a.href = $element.getAttribute("src");
                if ($a.origin !== origin) {
                    let $src = $element.getAttribute("src");
                    if ($src.substr(0, 1) !== "/") $src = $path + $src;
                    $element.setAttribute("src", origin + $src);
                }
            } else if ($element.getAttribute("href")) {
                $a.href = $element.getAttribute("href");
                if ($a.origin !== origin) {
                    let $src = $element.getAttribute("href");
                    if ($src.substr(0, 1) !== "/") $src = $path + $src;
                    $element.setAttribute("href", origin + $src);
                }
            }
        });
        activate();
    };
    $main.appendChild($iframe);
    const $frame = document.createElement("div");
    $frame.style.cssText = "width: 100%; height: 100%; z-index: 1; display: none; position: absolute; top: 0;";
    $frame.id = "remoteFrame";
    document.body.appendChild($frame);
};

},{}],"5KGJU":[function(require,module,exports) {
var _globalsJs = require("./_globals.js");
window.BG || (window.BG = {});
BG.generateNoise = function(grayscale) {
    if (!this.random) this.random = new sketch.util.Random(config.seed);
    const random = this.random;
    const imgData = ctx_noise.getImageData(0, 0, noise.width, noise.height);
    const data = imgData.data;
    const xmax = imgData.width;
    const ymax = imgData.height;
    for(let y = 0; y < ymax; y++)for(let x = 0; x < xmax; x++){
        const i = y * 4 * xmax + x * 4;
        if (grayscale) {
            const r = random.intRange(0, 255);
            const g = random.intRange(0, 255);
            const b = random.intRange(0, 255);
            const lum = r * 0.3 + g * .59 + b * .11 >> 0;
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
};
// CSS-Output
BG.generateCSSGradient = function() {
    const stops = BG.gradient.stops;
    let moz = "" // create strings of color-stops
    ;
    let webkit = "";
    let hex = "";
    let key = 0;
    const length = stops.length;
    for(; key < length; key++){
        const colorStop = BG.gradient.stops[key];
        const stop = colorStop.stop;
        hex = Color.Space(colorStop, "RGB>HEX>W3");
        moz += `#${hex} ${stop * 100 >> 0}%, `;
        webkit += `color-stop(${stop}, #${hex}), `;
        window.last = `#${hex}`;
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
    const href = document.createElement("a");
    href.href = window.location.href;
    BG.onFormSubmit();
    BG.picker.toggle(false);
    let inputZIP;
    /**
	 *
	 * @param value
	 * @returns {HTMLParagraphElement}
	 */ function generate(value) {
        const p = document.createElement("p");
        p.style.cssText = "font: 16px courier; line-height: 1em";
        inputZIP = document.createElement("span");
        inputZIP.style.cssText = "margin: 0 2% 0 0";
        const inputReturn = document.createElement("input");
        inputReturn.type = "submit";
        inputReturn.value = "Return";
        inputReturn.onclick = BG.closeFoxy;
        inputReturn.style.cssText = "margin: 0";
        const span = document.createElement("span");
        span.style.cssText = "margin: 2% 0 0; background: rgba(255,120,200,0.75); padding: 0.65em 1em; border-radius: 4px; display: block";
        span.innerHTML = "CSS CODE";
        const pre = document.createElement("pre");
        pre.style.cssText = "font: 16px courier; margin: 2% 0 0 0; padding: 2%; border-radius: 4px; background: #333; line-height: 2em";
        pre.innerHTML = value;
        p.appendChild(inputZIP);
        p.appendChild(inputReturn);
        p.appendChild(span);
        p.appendChild(pre);
        return p;
    }
    const scale = config.scale;
    const temp = document.createElement("canvas");
    const ctx_temp = temp.getContext("2d");
    const cssArea = document.getElementById("foxybox");
    document.getElementById("csscode").style.display = "block";
    const imgContainer = document.createElement("div");
    const cssContainer = document.createElement("div");
    cssContainer.style.cssText = "margin: 2%;";
    cssArea.innerHTML = "";
    cssArea.appendChild(cssContainer);
    cssArea.appendChild(imgContainer);
    let maxWidth = config.textureEnabled ? BG.texture.width : 1;
    let maxHeight = config.textureEnabled ? BG.texture.height : 1;
    // use last color as the base background
    const stops = BG.gradient.stops;
    if (config.rotate < Math.PI) {
        var last = {
            id: 0,
            stop: -Infinity
        };
        for(let key in stops)if (stops[key].stop > last.stop) {
            last.id = key;
            last.stop = stops[key].stop;
        }
    } else {
        var last = {
            id: 0,
            stop: Infinity
        };
        for(let key in stops)if (stops[key].stop < last.stop) {
            last.id = key;
            last.stop = stops[key].stop;
        }
    }
    let hex = BG.gradient.stops[last.id];
    hex = Color.Space(hex, "RGB>HEX>W3");
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
            var csscode = `background: ${hex};
background-image: url("zenbg.png");`;
            cssContainer.appendChild(generate(csscode));
        } else {
            var imagecode = [];
            var csscode = `background: ${hex}`;
            cssContainer.appendChild(generate(csscode));
        }
    } else {
        /// Includes a gradient.
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
        // decide whether we need to generate an image
        if (config.textureEnabled) {
            // cache and overwrite color-stops
            const cache = {
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
            const data2 = temp.toDataURL("image/png");
            const image2 = document.createElement("img");
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
            var csscode = `background: ${hex};
background-image: ${background};
background-repeat: ${repeat}, repeat;`;
            cssContainer.appendChild(generate(csscode));
            if (BG.remoteFrame) BG.remoteFrame.style.background = background;
        } else {
            var imagecode = [];
            var csscode = `background: ${hex};${BG.generateCSSGradient()};
background-repeat: ${repeat};`;
            cssContainer.appendChild(generate(csscode));
            if (BG.remoteFrame) BG.remoteFrame.style.background = hex + repeat;
            imgContainer.style.display = "none";
        }
    }
    BG.fileSaver.button({
        parent: inputZIP,
        id: "csspackage",
        title: "ZenBG.zip",
        fileName: "ZenBG",
        fileType: "zip",
        format: "base64",
        getData: function() {
            const c = imagecode.length;
            const ret = [];
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
    const content = document.getElementById("sidebar");
    window.cnt = document.createElement("div");
    content.appendChild(cnt);
    ///
    const span = document.createElement("span");
    span.style.cssText = "float: right;";
    const header = (0, _globalsJs.createHeader)("Texture");
    const image = document.createElement("img");
    image.src = config.textureEnabled ? "./media/power.png" : "./media/powerOff.png";
    image.style.cssText = "position: relative; cursor: pointer; position: relative; left: -5px; top: -3px; ";
    var power = function() {
        const display = power.style.display;
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
    Event.add(image, "mousedown", Event.cancel);
    Event.add(image, "click", power);
    Event.add(header, "dblclick", power);
    span.appendChild(image);
    header.appendChild(span);
    var power = document.createElement("div");
    power.style.cssText = "clear: both; padding: 0 7px;";
    if (!config.textureEnabled) power.style.display = "none";
    var $div = document.createElement("div");
    $div.style.cssText = "padding-top: 5px;";
    const element = document.createElement("div");
    element.id = "textures";
    $div.appendChild(element);
    power.appendChild($div);
    power.appendChild((0, _globalsJs.createInput)({
        title: "Alpha",
        value: config.alpha * 100,
        onchange: function() {
            config.alpha = this.value / 100;
            BG.render();
        }
    }));
    power.appendChild((0, _globalsJs.createInput)({
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
    window.stopHeader = document.createElement("span");
    stopHeader.style.cssText = "float: right; position: relative; top: -8px";
    (0, _globalsJs.createHeader)("Gradient").appendChild(stopHeader);
    window.stopContainer = document.createElement("div");
    stopContainer.style.cssText = "clear: both; padding: 0 7px";
    cnt.appendChild(stopContainer);
    BG.createColorStops();
    var br = document.createElement("div");
    br.style.cssText = "border-bottom: 1px solid #333; margin-top: 10px; clear: both;";
    cnt.appendChild(br);
    var div = document.createElement("div");
    const d = document.createElement("span");
    d.textContent = "Rotate:";
    d.className = "formSpan";
    div.appendChild(d);
    /// Left
    const $rotateLeft = new Image();
    $rotateLeft.title = "Rotate Left";
    Event.add($rotateLeft, "mousedown", Event.cancel);
    Event.add($rotateLeft, "click", function() {
        config.rotate = 0;
        BG.render();
    });
    $rotateLeft.src = "./media/rotate-left.png";
    div.appendChild($rotateLeft);
    /// Top
    const $rotateTop = new Image();
    $rotateTop.title = "Rotate Top";
    Event.add($rotateTop, "mousedown", Event.cancel);
    Event.add($rotateTop, "click", function() {
        config.rotate = 0.25 * Math.PI * 2;
        BG.render();
    });
    $rotateTop.src = "./media/rotate-up.png";
    div.appendChild($rotateTop);
    /// Right
    const $rotateRight = new Image();
    $rotateRight.title = "Rotate Right";
    Event.add($rotateRight, "mousedown", Event.cancel);
    Event.add($rotateRight, "click", function() {
        config.rotate = 0.5 * Math.PI * 2;
        BG.render();
    });
    $rotateRight.src = "./media/rotate-right.png";
    div.appendChild($rotateRight);
    /// Bottom
    const $rotateBottom = new Image();
    $rotateBottom.title = "Rotate Bottom";
    Event.add($rotateBottom, "mousedown", Event.cancel);
    Event.add($rotateBottom, "click", function() {
        config.rotate = 0.75 * Math.PI * 2;
        BG.render();
    });
    $rotateBottom.src = "./media/rotate-down.png";
    div.appendChild($rotateBottom);
    cnt.appendChild(div);
    var br = document.createElement("div");
    br.style.cssText = "border-bottom: 1px solid #333; margin-top: 10px; clear: both;";
    cnt.appendChild(br);
    cnt.appendChild((0, _globalsJs.createInput)({
        style: "float: right; margin: 5px 10px 10px;",
        title: " ",
        type: "submit",
        value: "Generate CSS3",
        onclick: BG.generateCSS
    }));
    var br = document.createElement("div");
    br.style.cssText = "border-bottom: 1px solid #333; margin-top: 10px; clear: both;";
    cnt.appendChild(br);
    document.body.appendChild(canvas);
};
BG.onFormSubmit = function() {
    const hash = JSON.stringify({
        width: BG.width,
        height: BG.height,
        config: config,
        gradient: BG.getColorStops()
    });
    if (document.getElementById("url")) var query = `?${document.getElementById("url").value}`;
    else var query = "";
    history.pushState(null, null, `${query}#${hash}`);
    if (query) BG.createRemoteFrame();
};
BG.saveStream = function(data) {
    document.location.href = data.replace("png", "image/octet-stream");
};
BG.createSeamlessTexture = function(src, callback) {
    const image = new Image();
    image.onload = function() {
        const $canvas = document.createElement("canvas");
        const ctx = $canvas.getContext("2d");
        $canvas.width = image.width * 2;
        $canvas.height = image.height * 2;
        ctx.drawImage(image, 0, 0);
        // flip horizontally
        ctx.save();
        ctx.translate(image.width * 2, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(image, 0, 0);
        ctx.restore();
        // flip horizontally + vertically
        ctx.save();
        ctx.translate(image.width * 2, image.height * 2);
        ctx.scale(-1, -1);
        ctx.drawImage(image, 0, 0);
        ctx.restore();
        ctx.save();
        ctx.translate(0, image.height * 2);
        ctx.scale(1, -1);
        ctx.drawImage(image, 0, 0); // flip vertically
        ctx.restore();
        ///
        callback($canvas);
    };
    image.src = src;
};

},{"./_globals.js":"a8mct"}],"a8mct":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "removeChildNodes", ()=>removeChildNodes);
parcelHelpers.export(exports, "createHeader", ()=>createHeader);
parcelHelpers.export(exports, "createInput", ()=>createInput);
function removeChildNodes(o) {
    while(o.hasChildNodes())o.removeChild(o.firstChild);
}
function createHeader(title) {
    const div = document.createElement("div");
    div.className = "header";
    div.textContent = title;
    cnt.appendChild(div);
    return div;
}
function createInput(props) {
    const $div = document.createElement("div");
    $div.style.cssText = "padding-top: 5px;";
    var d = document.createElement("span");
    d.textContent = props.title || props.id;
    d.className = "formSpan";
    $div.appendChild(d);
    var d = document.createElement("input");
    d.setAttribute("type", "range");
    Event.add(d, "mousedown", Event.cancel);
    for(let key in props)if (key.substr(0, 2) === "on") d[key] = props[key];
    else d.setAttribute(key, props[key]);
    if (props.type === "number" && d.onchange) {
        d.onkeyup = d.onchange;
        d.onmouseup = d.onchange;
    }
    $div.appendChild(d);
    return $div;
}
window.canvas = document.createElement("canvas");
window.ctx = canvas.getContext("2d");
window.config = {
    textureEnabled: true,
    alpha: 0.75,
    scale: 1,
    seed: 11899,
    grayscale: true,
    rotate: Math.PI / 2
};
window.noise = document.createElement("canvas");
window.ctx_noise = noise.getContext("2d");
noise.width = 128;
noise.height = 128;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"kHyLD":[function(require,module,exports) {
var _globalsJs = require("./_globals.js");
window.BG || (window.BG = {});
BG.createPicker = function() {
    var o = BG.gradient.stops[BG.gradient.active];
    var rgba = {
        R: o.R,
        G: o.G,
        B: o.B,
        A: 255
    };
    BG.picker.update(rgba);
    BG.picker.drawSample();
    BG.picker.toggle(true);
};
BG.render = function(event) {
    ctx.clearRect(0, 0, BG.width, BG.height);
    var stops = BG.gradient.stops;
    var size = BG.width;
    if (BG.gradient.stops.length === 1) var g = Color.Space.RGBA_W3(stops[BG.gradient.active]);
    else {
        if (config.rotate % Math.PI) {
            var size = BG.height;
            var g = ctx.createLinearGradient(0, 0, BG.height, 0);
        } else var g = ctx.createLinearGradient(0, 0, BG.width, 0);
        for(var key in stops){
            var color = BG.gradient.stops[key];
            g.addColorStop(color.stop, Color.Space.RGBA_W3(color));
        }
    }
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = g;
    ctx.rect(0, 0, BG.width, BG.height);
    //
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.rotate(config.rotate);
    ctx.translate(-size / 2, -size / 2);
    ctx.fill();
    ctx.restore();
    if (!config.textureEnabled) return;
    var data1, data2, data;
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = config.alpha;
    ctx.scale(config.scale, config.scale);
    ctx.fillStyle = BG.texture.pattern;
    ctx.fill();
    ctx.restore();
    //
    ctx.restore();
};
BG.createColorStops = function() {
    if (!window.stopContainer) return;
    // remove children nodes
    (0, _globalsJs.removeChildNodes)(stopContainer);
    (0, _globalsJs.removeChildNodes)(stopHeader);
    // "add" for control points
    var $image = document.createElement("img");
    Event.add($image, "mousedown", Event.cancel);
    Event.add($image, "click", function() {
        var CPStop = BG.gradient.stops;
        var active = CPStop[BG.gradient.active];
        var change = 1 - 1 / CPStop.length;
        for(var key = 0, length = CPStop.length; key < length; key++)CPStop[key].stop = change * CPStop[key].stop || 0;
        BG.gradient.active = CPStop.length;
        CPStop.push(new BG.colorStop({
            R: active.R,
            G: active.G,
            B: active.B,
            stop: 1
        }));
        BG.createColorStops();
        BG.render();
        BG.createPicker();
    });
    $image.src = "./media/plus.png";
    $image.className = "colorStopControl";
    $image.style.cssText = "position: relative; left: -1px";
    stopHeader.appendChild($image);
    // "remove" for control points
    var $image = document.createElement("img");
    Event.add($image, "mousedown", Event.cancel);
    Event.add($image, "click", function() {
        var CPStop = BG.gradient.stops;
        if (CPStop.length === 1) return;
        var replace = [];
        var previous = undefined;
        var next = false;
        var idx = 0;
        for(var key in CPStop){
            if (next) {
                BG.gradient.active = idx;
                next = false;
            }
            if (key === BG.gradient.active) {
                if (typeof previous === "number") BG.gradient.active = previous;
                else next = true;
            } else {
                replace.push(CPStop[key]);
                previous = idx++;
            }
        }
        BG.gradient.stops = replace;
        BG.createColorStops();
        BG.render();
    });
    $image.src = "./media/minus.png";
    $image.className = "colorStopControl";
    $image.style.cssText = "position: relative; left: -4px";
    stopHeader.appendChild($image);
    var swatches = document.createElement("div");
    swatches.className = "swatches";
    stopContainer.appendChild(swatches);
    // color swatches
    var CPStop1 = BG.gradient.stops;
    for(var key1 in CPStop1)(function(key) {
        var $div = document.createElement("div");
        $div.id = `CP${key}`;
        Event.add($div, "mousedown", Event.cancel);
        Event.add($div, "click", function() {
            BG.gradient.active = key;
            BG.createColorStops();
            BG.createPicker();
        });
        $div.className = "colorStop";
        $div.style.background = Color.Space.RGBA_W3(CPStop1[key]);
        if (key === BG.gradient.active) $div.style.border = "1px solid #fff";
        swatches.appendChild($div);
    })(key1);
};
BG.getColorStops = function() {
    var stops = {};
    var CPStop = BG.gradient.stops;
    for(var n = 0, length = CPStop.length; n < length; n++){
        var color = CPStop[n];
        stops[color.stop] = Color.Space(color, "RGB>HEX>W3");
    }
    return stops;
};
BG.colorStop = function(props) {
    if (props.hex) {
        var color = Color.Space(props.hex, "HEX>RGB");
        this.R = color.R;
        this.G = color.G;
        this.B = color.B;
    } else {
        this.R = props.R || 0;
        this.G = props.G || 0;
        this.B = props.B || 0;
    }
    this.stop = props.stop || 0;
    return this;
};

},{"./_globals.js":"a8mct"}],"bafDL":[function(require,module,exports) {
/*
	Color Blend : 0.3 : 2012/05/16
	----------------------------------------------------------
	_: Soft Light, Tint, Red, Green, Blue
	----------------------------------------------------------
	SourceIn, SourceOver, DestinationOut
	Normal, Dissolve, Average
	Darker, Darken, Multiply, Color Burn, Color Burn Inverse, Soft Burn, Linear Burn, Darker Color
	Lighter, Lighten, Screen, Color Dodge, Color Dodge Inverse, Soft Dodge, Linear Dodge, Lighter Color
	Overlay, Soft Light, Fuzzy Light, Hard Light, Vivid Light, Linear Light, Pin Light, Hard Mix, Grain Extract, Grain Merge
	Difference, Exclusion, Negation, Invert
	Hue, Saturation, Color, Luminosity, Red, Green, Blue, Tint
	Reflect, Glow, Heat, Freeze
	Additive, Subtractive, Subtract, Stamp, Interpolation, Divide
	XOR, AND, OR
	----------------------------------------------------------
	Dissolve requires RAND()
	----------------------------------------------------------
 	var modes = [ 'Difference', 'Exclusion', 'Hue', 'Saturation', 'Color', 'Luminosity', 'Darker','Lighter','Dissolve', 'Additive', 'Subtractive', 'Multiply', 'Color Burn', 'Linear Burn', 'Screen', 'Color Dodge', 'Linear Dodge', 'Overlay', 'Soft Light', 'Hard Light', 'Vivid Light', 'Linear Light', 'Pin Light', 'Hard Mix' ];

*/ window.Color || (window.Color = {});
if (typeof Color.Blend === "undefined") Color.Blend = {};
(function(root) {
    root.modes = {
        "COMPOSITE": [
            "SourceIn",
            "SourceOver",
            "DestinationOut"
        ],
        "OPACITY": [
            "Normal",
            "Dissolve",
            "Average"
        ],
        "DARKEN": [
            "Darker",
            "Darken",
            "Multiply",
            "Color Burn",
            "Color Burn Inverse",
            "Soft Burn",
            "Linear Burn",
            "Darker Color"
        ],
        "LIGHTEN": [
            "Lighter",
            "Lighten",
            "Screen",
            "Color Dodge",
            "Color Dodge Inverse",
            "Soft Dodge",
            "Linear Dodge",
            "Lighter Color"
        ],
        "LIGHTING": [
            "Overlay",
            "Soft Light",
            "Fuzzy Light",
            "Hard Light",
            "Vivid Light",
            "Linear Light",
            "Pin Light",
            "Hard Mix",
            "Grain Extract",
            "Grain Merge"
        ],
        "INVERT": [
            "Difference",
            "Exclusion",
            "Negation",
            "Invert"
        ],
        "COLOR": [
            "Hue",
            "Saturation",
            "Color",
            "Luminosity",
            "Red",
            "Green",
            "Blue",
            "Tint"
        ],
        "THERMAL": [
            "Reflect",
            "Glow",
            "Heat",
            "Freeze"
        ],
        "MATH": [
            "Additive",
            "Subtractive",
            "Subtract",
            "Stamp",
            "Interpolation",
            "Divide"
        ],
        "LOGIC": [
            "XOR",
            "AND",
            "OR"
        ]
    };
    root.isAlphaRequired = function(data) {
        for(var i = 0, o = {}; i < data.length; i++)o[data[i].replace(" ", "")] = true;
        return o;
    }([
        "Darker",
        "Lighter",
        "SourceIn",
        "SourceOver",
        "DestinationOut",
        "Luminosity",
        "Tint",
        "DarkerColor",
        "LighterColor",
        "Hue",
        "Saturation",
        "Color",
        "Red",
        "Green",
        "Blue",
        "Cyan",
        "Magenta",
        "Yellow",
        "Dissolve"
    ]);
    root.apply = function(imageData1, imageData2, mode, preserveAlpha) {
        var blend = root[mode];
        var data1 = imageData1.data;
        var data2 = imageData2.data;
        var length = data1.length;
        if (root.isAlphaRequired[mode]) root.apply32bit(blend, data1, data2, length);
        else root.apply24bit(blend, data1, data2, length);
        return imageData2;
    };
    root.apply24bit = function(blend, data1, data2, length) {
        for(var i = 0; i < length; i += 4){
            var alpha = data1[i + 3] / 255;
            if (data1[i + 3] > 0) {
                data2[i] = blend(data1[i], data2[i]); //	Red
                data2[i + 1] = blend(data1[i + 1], data2[i + 1]); //	Blue
                data2[i + 2] = blend(data1[i + 2], data2[i + 2]); //	Green
                data2[i + 3] = data2[i + 3];
            } else {
                data2[i] = data2[i];
                data2[i + 1] = data2[i + 1];
                data2[i + 2] = data2[i + 2];
                data2[i + 3] = data2[i + 3];
            }
        }
    };
    root.apply32bit = function(blend, data1, data2, length) {
        for(var i = 0; i < length; i += 4)if (data1[i + 3] > 0) {
            var rgb = blend({
                R: data1[i + 0],
                G: data1[i + 1],
                B: data1[i + 2],
                A: data1[i + 3]
            }, {
                R: data2[i + 0],
                G: data2[i + 1],
                B: data2[i + 2],
                A: data2[i + 3]
            });
            data2[i] = rgb >>> 16 & 0xFF;
            data2[i + 1] = rgb >>> 8 & 0xFF; //	Blue
            data2[i + 2] = rgb & 0xFF; //	Green
            if (!preserveAlpha) data2[i + 3] = rgb >>> 24;
        } else {
            data2[i] = data2[i];
            data2[i + 1] = data2[i + 1];
            data2[i + 2] = data2[i + 2];
            data2[i + 3] = data2[i + 3];
        }
    };
    /*
	----------------------------------------------------------
	OPACITY
	----------------------------------------------------------
*/ root.SourceIn = function(src, dst) {
        _a = src.A * dst.A;
        _r = src.R * dst.A;
        _g = src.G * dst.A;
        _b = src.B * dst.A;
        return (_a << 24 | _r << 16 | _g << 8 | _b) >>> 0;
    };
    root.DestinationOut = function(src, dst) {
        var _a = dst.A * (1 - src.A);
        var _r = dst.R * (1 - src.A);
        var _g = dst.G * (1 - src.A);
        var _b = dst.B * (1 - src.A);
        return (_a << 24 | _r << 16 | _g << 8 | _b) >>> 0;
    };
    root.SourceOver = function(src, dst) {
        var _a = src.A + dst.A * (1 - src.A / 255);
        var _r = src.R + dst.R * (1 - src.A / 255);
        var _g = src.G + dst.G * (1 - src.A / 255);
        var _b = src.B + dst.B * (1 - src.A / 255);
        return (_a << 24 | _r << 16 | _g << 8 | _b) >>> 0;
    };
    root.Dissolve = function(src, dst) {
        if (RAND.toDouble() * 0xFF > dst.A) return (dst.A << 24 | src.R << 16 | src.G << 8 | src.B) >>> 0; // TRANSPARENCY
        else return (dst.A << 24 | dst.R << 16 | dst.G << 8 | dst.B) >>> 0; // OPAQUE
    };
    root.Average = function(A, B) {
        return A + B >> 1;
    };
    /*
	----------------------------------------------------------
	DARKEN
	----------------------------------------------------------
*/ root.Darken = function(A, B) {
        return A < B ? A : B;
    };
    root.Multiply = function(A, B) {
        return A * B / 0xFF;
    };
    root.ColorBurn = function(A, B) {
        if (B === 0x00) return 0x00;
        else {
            var C = 255 - (0xFF - A << 8) / B;
            return C < 0 ? 0 : C;
        }
    };
    root.ColorBurnInverse = function(A, B) {
        if (A === 0x00) return 0x00;
        else {
            var C = 255 - (0xFF - B << 8) / A;
            return C < 0 ? 0 : C;
        }
    };
    root.SoftBurn = function(A, B) {
        if (A + B < 256) {
            if (A === 0xFF) return 0xFF;
            else {
                var C = (B << 7) / (A ^ 0xFF);
                return C > 0xFF ? 0xFF : C;
            }
        } else {
            var C = ((A ^ 0xFF) << 7) / B ^ 0xFF;
            return C < 0x00 ? 0x00 : C;
        }
    };
    root.LinearBurn = function(A, B) {
        var C = A + B - 0xFF;
        return C < 0x00 ? 0x00 : C;
    };
    root.DarkerColor = function(src, dst) {
        var z = (src.R << 16 | src.G << 8 | src.B) > (dst.R << 16 | dst.G << 8 | dst.B) ? b : a;
        return (Math.min(src.A + dst.A, 0xFF) << 24 | z.R << 16 | z.G << 8 | z.B) >>> 0;
    };
    /*
	----------------------------------------------------------
	LIGHTEN
	----------------------------------------------------------
*/ root.Lighter = function(src, dst) {
        var a = src.A / 0xFF;
        var r = src.R;
        var g = src.G;
        var b = src.B;
        var A = dst.A / 0xFF;
        var R = dst.R;
        var G = dst.G;
        var B = dst.B;
        var a0 = A * 0xFF;
        //http://lists.w3.org/Archives/Public/public-canvas-api/2009OctDec/0021.html
        //http://lists.whatwg.org/htdig.cgi/whatwg-whatwg.org/2007-March/010609.html
        //http://skisrc.googlecode.com/svn/trunk/docs/html/class_sk_porter_duff.html
        var r0 = Math.max(R, r * a + R * A);
        var g0 = Math.max(G, g * a + G * A);
        var b0 = Math.max(B, b * a + B * A);
        if (r0 > 0xFF) r0 = 0xFF;
        if (g0 > 0xFF) g0 = 0xFF;
        if (b0 > 0xFF) b0 = 0xFF;
        return (a0 << 24 | r0 << 16 | g0 << 8 | b0) >>> 0;
    };
    root.Darker = function(src, dst) {
        var a = src.A / 255;
        var r = src.R / 255;
        var g = src.G / 255;
        var b = src.B / 255;
        var A = dst.A / 255;
        var R = dst.R / 255;
        var G = dst.G / 255;
        var B = dst.B / 255;
        //http://skisrc.googlecode.com/svn/trunk/docs/html/class_sk_porter_duff.html
        //[Sa + Da - Sa*Da, Sc*(1 - Da) + Dc*(1 - Sa) + min(Sc, Dc)]
        var a0 = a + A - a * A;
        var r0 = Math.min(0xFF, (r * (1 - A) + R * (1 - a) + Math.min(r, R)) * 0xFF);
        var g0 = Math.min(0xFF, (g * (1 - A) + G * (1 - a) + Math.min(g, G)) * 0xFF);
        var b0 = Math.min(0xFF, (b * (1 - A) + B * (1 - a) + Math.min(b, B)) * 0xFF);
        return (a0 << 24 | r0 << 16 | g0 << 8 | b0) >>> 0;
    };
    root.Lighten = function(A, B) {
        return A > B ? A : B;
    };
    root.Screen = function(A, B) {
        return 0xFF - ((0xFF - A) * (0xFF - B) >> 8);
    };
    root.ColorDodge = function(A, B) {
        if (B === 0xFF) return 0xFF;
        else {
            var C = (A << 8) / (0xFF - B);
            return C > 0xFF ? 0xFF : C;
        }
    };
    root.ColorDodgeInverse = function(A, B) {
        if (A === 0xFF) return 0xFF;
        else {
            var C = (B << 8) / (0xFF - A);
            return C > 0xFF ? 0xFF : C >> 0;
        }
    };
    root.SoftDodge = function(A, B) {
        if (A + B < 256) {
            if (B === 0xFF) return 0xFF;
            else {
                var C = (A << 7) / (B ^ 0xFF);
                return C > 0xFF ? 0xFF : C;
            }
        } else {
            var C = ((B ^ 0xFF) << 7) / A ^ 0xFF;
            return C < 0x00 ? 0x00 : C;
        }
    };
    root.LinearDodge = function(A, B) {
        var C = A + B;
        return C > 0xFF ? 0xFF : C;
    };
    root.LighterColor = function(src, dst) {
        var z = (src.R << 16 | src.G << 8 | src.B) < (dst.R << 16 | dst.G << 8 | dst.B) ? b : a;
        return (Math.min(src.A + dst.A, 0xFF) << 24 | z.R << 16 | z.G << 8 | z.B) >>> 0;
    };
    /*
	----------------------------------------------------------
	LIGHTING
	----------------------------------------------------------
*/ root.Overlay = function(A, B) {
        if (A < 128) return A * B >> 7;
        return 255 - ((255 - A) * (255 - B) >> 7);
    };
    root.SoftLight = function(A, B) {
        /*
	// soft_light (libpsd)
	#define PSD_BLEND_SOFTLIGHT(b, f, a)
	do {
	psd_int c1, c2;
	c1 = b * f >> 8;
	c2 = 255 - ((255 - b) * (255 - f) >> 8);
	f = ((255 - b) * c1 >> 8) + (b * c2 >> 8);
	b = PSD_BLEND_CHANNEL(b, f, a);
	} while(0)
	*/ return Math.pow(A / 255, 1 / (B / 170.0 + 0.5)) * 255; // gamma
        function D(x) {
            return x <= 0x40 ? ((16 * x - 3060) * x + 1020) * x : Math.sqrt(x);
        }
    };
    root.FuzzyLight = function(A, B) {
        var C = A * B / 0xFF;
        return C + A * (0xFF - (A ^ 0xFF) * (B ^ 0xFF) / 0xFF - C) / 0xFF;
    };
    root.HardLight = function(A, B) {
        if (B < 128) return B * A >> 7;
        else return 255 - ((255 - B) * (255 - A) >> 7);
    };
    root.VividLight = function(A, B) {
        if (B < 0x80) return 255 - Math.min(255, (255 - A) * 255 / (2 * B));
        else return Math.min(255, A * 255 / (2 * (255 - B)));
    };
    root.LinearLight = function(A, B) {
        return Math.min(255, Math.max(0, A + 2 * B - 255));
    //	if(A < 0x80) return (A < 0xFF - B * 2) ? 0x00 : B * 2 + A - 0xFF;
    //	else return (A < 0x200 - B * 2) ? B * 2 + A - 0xFF : 0xFF;
    };
    root.PinLight = function(A, B) {
        if (B > 0x80) return Math.max(A, 2 * (B - 0x80));
        else return Math.min(A, 2 * B);
    };
    root.HardMix = function(A, B) {
        return A < 0xFF - B ? 0 : 0xFF;
    };
    root.GrainExtract = function(A, B) {
        return Math.min(0xFF, Math.max(0, A - B + 0x80));
    };
    root.GrainMerge = function(A, B) {
        return Math.min(0xFF, Math.max(0, A + B - 0x80));
    };
    /*
	----------------------------------------------------------
	INVERT
	----------------------------------------------------------
*/ root.Difference = function(A, B) {
        var C = A - B;
        return C < 0 ? -C : C;
    };
    root.Exclusion = function(A, B) {
        //	return A + B - 2 * A * B / 0xFF;
        return A + B - (A * B >> 7);
    };
    root.Negation = function(A, B) {
        var C = 0xFF - A - B;
        return (C < 0 ? -C : C) ^ 0xFF;
    };
    root.Invert = function(A, B) {
        return A ^ 0xFF;
    };
    /*
	----------------------------------------------------------
	COLOR
	----------------------------------------------------------
*/ root.Tint = function(src, dst) {
        var lum = dst.R * 0.3 + dst.G * 0.59 + dst.B * 0.11;
        return (Math.min(src.A + dst.A, 0xFF) << 24 | Math.min(255, (src.R + lum) * 0.5 + dst.R * 0.5) << 16 | Math.min(255, (src.G + lum) * 0.5 + dst.G * 0.5) << 8 | Math.min(255, (src.B + lum) * 0.5 + dst.B * 0.5)) >>> 0;
    };
    root.Red = function(src, dst) {
        return (Math.min(src.A + dst.A, 0xFF) << 24 | dst.R << 16 | src.G << 8 | src.B) >>> 0;
    };
    root.Green = function(src, dst) {
        return (Math.min(src.A + dst.A, 0xFF) << 24 | src.R << 16 | dst.G << 8 | src.B) >>> 0;
    };
    root.Blue = function(src, dst) {
        return (Math.min(src.A + dst.A, 0xFF) << 24 | src.R << 16 | src.G << 8 | dst.B) >>> 0;
    };
    (function() {
        var NUM_to_RGB = {
            0: "R",
            1: "G",
            2: "B"
        };
        var SetSat = function(R, G, B, s) {
            var r0 = 0;
            var g0 = 1;
            var b0 = 2;
            if (R > G) {
                R ^= G;
                G ^= R;
                R ^= G;
                r0 ^= g0;
                g0 ^= r0;
                r0 ^= g0;
            }
            if (R > B) {
                R ^= B;
                B ^= R;
                R ^= B;
                r0 ^= b0;
                b0 ^= r0;
                r0 ^= b0;
            }
            if (G > B) {
                G ^= B;
                B ^= G;
                G ^= B;
                g0 ^= b0;
                b0 ^= g0;
                g0 ^= b0;
            }
            if (B > R) {
                G = (G - R) * s / (B - R);
                B = s;
            } else G = B = 0;
            R = 0;
            var ret = {};
            ret[NUM_to_RGB[r0]] = R;
            ret[NUM_to_RGB[g0]] = G;
            ret[NUM_to_RGB[b0]] = B;
            return ret;
        };
        var Lum = function(r, g, b) {
            return 0.3 * r + 0.59 * g + 0.11 * b;
        };
        var SetLum = function(r, g, b, l) {
            if (typeof r === "object") {
                l = g;
                b = r.B;
                g = r.G;
                r = r.R;
            }
            var d = l - Lum(r, g, b);
            r = r + d;
            g = g + d;
            b = b + d;
            var l = Lum(r, g, b);
            var n = Math.min(r, g, b);
            var x = Math.max(r, g, b);
            if (n < 0x00) {
                r = l + (r - l) * l / (l - n);
                g = l + (g - l) * l / (l - n);
                b = l + (b - l) * l / (l - n);
            }
            if (x > 0xFF) {
                r = l + (r - l) * (0xFF - l) / (x - l);
                g = l + (g - l) * (0xFF - l) / (x - l);
                b = l + (b - l) * (0xFF - l) / (x - l);
            }
            return r << 16 | g << 8 | b;
        };
        root.Hue = function(src, dst) {
            var sat = Math.max(src.R, src.G, src.B) - Math.min(src.R, src.G, src.B);
            var a0 = Math.min(src.A + dst.A, 0xFF);
            var color = SetLum(SetSat(dst.R, dst.G, dst.B, sat), Lum(src.R, src.G, src.B));
            return (a0 << 24 | color) >>> 0;
        };
        root.Saturation = function(src, dst) {
            var sat = Math.max(dst.R, dst.G, dst.B) - Math.min(dst.R, dst.G, dst.B);
            var a0 = Math.min(src.A + dst.A, 0xFF);
            var color = SetLum(SetSat(src.R, src.G, src.B, sat), Lum(src.R, src.G, src.B));
            return (a0 << 24 | color) >>> 0;
        };
        root.Color = function(src, dst) {
            var a0 = Math.min(src.A + dst.A, 0xFF);
            var color = SetLum(dst.R, dst.G, dst.B, Lum(src.R, src.G, src.B));
            return (a0 << 24 | color) >>> 0;
        };
        root.Luminosity = function(src, dst) {
            var a0 = Math.min(src.A + dst.A, 0xFF);
            var color = SetLum(src.R, src.G, src.B, Lum(dst.R, dst.G, dst.B));
            return (a0 << 24 | color) >>> 0;
        };
    })();
    /*
	----------------------------------------------------------
	THERMAL
	----------------------------------------------------------
*/ root.Reflect = function(A, B) {
        if (B === 0xFF) return 0xFF;
        var C = A * A / (0xFF - B);
        return C > 0xFF ? 0xFF : C;
    };
    root.Glow = function(A, B) {
        if (A === 0xFF) return 0xFF;
        var C = B * B / (0xFF - A);
        return C > 0xFF ? 0xFF : C;
    };
    root.Freeze = function(A, B) {
        if (B === 0x00) return 0x00;
        var C = 0xFF - Math.pow(A ^ 0xFF, 2) / B;
        return C < 0x00 ? 0x00 : C;
    };
    root.Heat = function(A, B) {
        if (A === 0x00) return 0x00;
        var C = 0xFF - Math.pow(B ^ 0xFF, 2) / A;
        return C < 0x00 ? 0x00 : C;
    };
    /*
	----------------------------------------------------------
	MATH
	----------------------------------------------------------
*/ root.Additive = function(A, B) {
        var C = A + B;
        return C > 0xFF ? 0xFF : C;
    };
    root.Subtractive = function(A, B) {
        var C = A + B - 256;
        return C < 0x00 ? 0x00 : C;
    };
    root.Subtract = function(A, B) {
        var C = A - B;
        return C < 0x00 ? 0x00 : C;
    };
    root.Stamp = function(A, B) {
        var C = A + 2 * B - 256;
        return C < 0x00 ? 0x00 : C > 0xFF ? 0xFF : C;
    };
    (function() {
        var r_cos = [];
        var PI = Math.PI / 0xFF;
        for(var i = 0; i < 256; i++)r_cos[i] = Math.round(64 - Math.cos(i * PI) * 64);
        root.Interpolation = function(A, B) {
            var C = r_cos[B] + r_cos[A];
            return C > 0xFF ? 0xFF : C;
        };
    })();
    root.Divide = function(A, B) {
        return Math.min(0xFF, A * 256 / (B + 1));
    };
    /*
	----------------------------------------------------------
	LOGIC
	----------------------------------------------------------
*/ root.XOR = function(A, B) {
        return A ^ B;
    };
    root.AND = function(A, B) {
        return A & B;
    };
    root.OR = function(A, B) {
        return A | B;
    };
    /*
	----------------------------------------------------------
	UTILITIES
	----------------------------------------------------------
*/ root.createKernals = function() {
        var modes = {};
        for(var key in root.modes)for(var name in root.modes[key])modes[root.modes[key][name]] = true;
        var blendmodes = [];
        for(var key in modes){
            var blend = String(root[key.split(" ").join("")]);
            var isAlphaRequired = blend.indexOf("function (A, B)") === -1;
            var text = blend.substr(blend.indexOf("{") + 1);
            text = text.substr(0, text.lastIndexOf("}"));
            text = text.replace("//+", "");
            if (isAlphaRequired) {
                var bit = text.split("src.A").join("sA");
                bit = bit.split("src.R").join("sR");
                bit = bit.split("src.G").join("sG");
                bit = bit.split("src.B").join("sB");
                bit = bit.split("dst.A").join("dA");
                bit = bit.split("dst.R").join("dR");
                bit = bit.split("dst.G").join("dG");
                bit = bit.split("dst.B").join("dB");
                bit = bit.split("return ", "var hex = ");
                blendmodes.push("Color.Blend['_" + key.split(" ").join("") + "'] = function(src, dst, preserveAlpha) {" + "	var data1 = src.data, data2 = dst.data;" + "	var length = data1.length;" + "	for (var n = 0; n < length; n += 4) {" + "		var sR = data1[n], sG = data1[n+1], sB = data1[n+2], sA = data1[n+3];" + "		var dR = data2[n], dG = data2[n+1], dB = data2[n+2], dA = data2[n+3];" + bit + "		if (sA > 0) {" + "			data2[n] = hex >>> 16 & 0xFF;" + "			data2[n + 1] = hex >>> 8 & 0xFF;" + "			data2[n + 2] = hex & 0xFF;" + "			if (!preserveAlpha) data2[n + 3] = hex >>> 24;" + "		} else {" + "			data2[n] = dR;" + "			data2[n + 1] = dG;" + "			data2[n + 2] = dB;" + "			data2[n + 3] = dA;" + "		}" + "	}" + "return dst;" + "};");
            } else {
                var rbit = text.split("B").join("dR");
                rbit = rbit.split("A").join("sR");
                rbit = rbit.split("return ").join("data2[n] = ");
                var gbit = text.split("B").join("dG");
                gbit = gbit.split("A").join("sG");
                gbit = gbit.split("return ").join("data2[n + 1] = ");
                var bbit = text.split("B").join("dB");
                bbit = bbit.split("A").join("sB");
                bbit = bbit.split("return ").join("data2[n + 2] = ");
                blendmodes.push("Color.Blend['_" + key.split(" ").join("") + "'] = function(src, dst) {" + "	var data1 = src.data, data2 = dst.data;" + "	var length = data1.length;" + "	for (var n = 0; n < length; n += 4) {" + "		var sR = data1[n], sG = data1[n+1], sB = data1[n+2], sA = data1[n+3];" + "		var dR = data2[n], dG = data2[n+1], dB = data2[n+2], dA = data2[n+3];" + "		if (sA > 0) {" + rbit + gbit + bbit + "			data2[n + 3] = sA;" + "		} else {" + "			data2[n] = dR;" + "			data2[n + 1] = dG;" + "			data2[n + 2] = dB;" + "			data2[n + 3] = dA;" + "		}" + "	}" + "return dst;" + "};");
            }
        }
        ///
        return blendmodes.join("\r");
    };
    return root;
})(Color.Blend);

},{}],"ahhvD":[function(require,module,exports) {
/*
	----------------------------------------------------
	Color Picker : 1.1.6 : 2013/04/15
	----------------------------------------------------
	https://github.com/mudcube/Color.Picker.js
	----------------------------------------------------
	Firefox 2+, Safari 3+, Opera 9+, Google Chrome, IE9+
	----------------------------------------------------
	var picker = new Color.Picker({
		display: true,
		id: "ColorPicker",
		color: "#643263", // accepts rgb(), rgba(), hsl(), hsla(), or #hex
		style: "top: 220px; right: 270px", // sets style to picker element
		callback: function(rgba, state, type) {
			document.body.style.background = Color.Space(rgba, "RGBA>W3");
		}
	});
	///
	picker.close(); // close ColorPicker
	picker.open(); // open ColorPicker
	picker.toggle(); // toggle ColorPicker
	picker.element; // this is the DOM element container
	----------------------------------------------------
	@ColorPicker #Event.js #Color/Space.js
*/ window.Color || (window.Color = {});
(function() {
    "use strict";
    Color.Picker = function(conf) {
        if (typeof arrow === "function") arrow = arrow();
        if (typeof circle === "function") circle = circle();
        if (typeof interlace === "function") interlace = interlace(8, "#FFF", "#eee");
        ///
        if (!window.zIndexGlobal) window.zIndexGlobal = 100;
        var that = this;
        var modules = conf.modules;
        if (typeof modules === "undefined") modules = {
            hue: true,
            satval: true,
            alpha: true
        };
        /// loading properties
        if (typeof conf === "undefined") conf = {};
        this.pixelRatio = 1; //window.devicePixelRatio || 1;
        this.state = "colorPicker"; // the other state is "eyeDropper"
        this.callback = conf.callback; // bind custom function
        this.color = getHSVA(conf.color);
        this.container = conf.container || document.body;
        this.margin = conf.margin || 10; // margins on colorpicker
        this.offset = this.margin / 2;
        this.strokeColor = conf.strokeColor || "rgba(255,255,255,0.15)";
        this.recordId = conf.recordId;
        this.feature = conf.feature || {};
        this.eyeDropper = this.feature.eyeDropper || {};
        this.conf = {};
        if (modules.hue) {
            var tmp = modules.hue;
            this.conf.hue = {
                column: 0,
                enable: isFinite(tmp.enable) ? tmp.enable : false,
                width: isFinite(tmp.width) ? tmp.width : 30,
                height: isFinite(tmp.height) ? tmp.height : 200
            };
        }
        if (modules.satval) {
            var tmp = modules.satval;
            this.conf.satval = {
                column: 1,
                enable: isFinite(tmp.enable) ? tmp.enable : false,
                width: isFinite(tmp.width) ? tmp.width : 30,
                height: isFinite(tmp.height) ? tmp.height : 200
            };
        }
        if (modules.alpha) {
            var tmp = modules.alpha;
            this.conf.alpha = {
                column: 2,
                enable: isFinite(tmp.enable) ? tmp.enable : false,
                width: isFinite(tmp.width) ? tmp.width : 30,
                height: isFinite(tmp.height) ? tmp.height : 200
            };
        }
        /// Useful for toggling focus when picker is over an iframe.
        this.onMouseDown = conf.onMouseDown || conf.onmousedown;
        this.onMouseUp = conf.onMouseUp || conf.onmousedown;
        /// Creating our color picker.
        var plugin = document.createElement("div");
        plugin.id = conf.id || "ColorPicker";
        if (conf.className) plugin.className = conf.className;
        ///
        this.getMetrics = function() {
            var ret = {};
            ret.width = 0;
            ret.height = 0;
            var row = -1;
            for(var key in that.conf){
                var tmp = that.conf[key];
                if (tmp.enable === false) continue;
                ret.width += tmp.width + that.margin + that.offset - 5;
                if (row !== tmp.row) {
                    ret.height += tmp.height + that.margin * 2;
                    row = tmp.row;
                }
            }
            ret.width *= that.pixelRatio;
            ret.height *= that.pixelRatio;
            return ret;
        };
        ///
        var metrics1 = this.getMetrics();
        plugin.style.cssText = conf.style;
        /// appending to element
        this.container.appendChild(plugin);
        this.element = plugin;
        if (this.feature.closeButton) {
            /// Creating the close button.
            var hexClose = document.createElement("div");
            hexClose.title = "Close";
            hexClose.className = "hexClose";
            hexClose.innerHTML = "x";
            Event.add(hexClose, "click", function(event) {
                that.close();
            });
            plugin.appendChild(hexClose);
        }
        if (this.feature.hexInput) {
            /// Current selected color as the background of this box.
            var hexBoxContainer = document.createElement("div");
            if (interlace.data) hexBoxContainer.style.backgroundImage = "url(" + interlace.data + ")";
            hexBoxContainer.className = "hexBox";
            hexBoxContainer.title = "Eyedropper";
            ///
            var hexBox = document.createElement("div");
            hexBoxContainer.appendChild(hexBox);
            plugin.appendChild(hexBoxContainer);
            ///
            if (that.eyeDropper.target) {
                hexBox.style.cursor = "pointer";
                ///
                var hexBoxImage = document.createElement("span");
                hexBoxImage.className = "icon-eyedropper";
                if (that.feature.closeButton) hexBoxImage.style.marginRight = "16px";
                plugin.appendChild(hexBoxImage);
                ///
                var mouseLayerTitle;
                var mouseLayerUpdate = function(event) {
                    Event.prevent(event);
                    var coord = Event.proxy.getCoord(event);
                    var bbox = Event.proxy.getBoundingBox(that.eyeDropper.target);
                    coord.x += bbox.scrollLeft - bbox.x1;
                    coord.y += bbox.scrollTop - bbox.y1;
                    ///
                    var ctx = that.eyeDropper.canvas.getContext("2d");
                    var data = ctx.getImageData(coord.x, coord.y, 1, 1);
                    if (data.data[3] === 0) return;
                    var color = Color.Space(data.data, "RGBA>HSVA");
                    if (!modules.alpha) color.A = 255;
                    that.update(color, "HSVA");
                };
                var mouseLayerExit = function() {
                    hexBoxContainer.className = "hexBox";
                    that.eyeDropper.target.style.cursor = "default";
                    that.eyeDropper.target.title = mouseLayerTitle;
                    Event.remove(document.body, "mouseup", mouseLayerExit);
                    Event.remove(that.eyeDropper.target, "mousemove", mouseLayerUpdate);
                    setTimeout(function() {
                        that.state = "colorPicker";
                    }, 50);
                };
                Event.add([
                    hexBoxContainer,
                    hexBoxImage
                ], "click", function(event) {
                    if (that.state === "eyeDropper") return mouseLayerExit();
                    that.state = "eyeDropper";
                    mouseLayerTitle = that.eyeDropper.target.title;
                    hexBoxContainer.className = "hexBox active";
                    that.eyeDropper.target.style.cursor = "crosshair";
                    that.eyeDropper.target.title = "Pick color";
                    Event.add(document.body, "mouseup", mouseLayerExit);
                    Event.add(that.eyeDropper.target, "mousemove", mouseLayerUpdate);
                });
            }
            /// Creating the HEX input element.
            var isHex = /[^a-f0-9]/gi;
            var hexInput = document.createElement("input");
            hexInput.title = "HEX Code";
            hexInput.className = "hexInput";
            hexInput.size = 6;
            hexInput.type = "text";
            //
            Event.add(hexInput, "mousedown", Event.stop);
            Event.add(hexInput, "keydown change", function(event) {
                Event.stop(event);
                var code = event.keyCode;
                var value = hexInput.value.replace(isHex, "").substr(0, 6);
                var hex = parseInt("0x" + value, 16);
                if (event.type === "keydown") {
                    if (code === 40) {
                        hex = Math.max(0, hex - (event.shiftKey ? 10 : 1));
                        hexInput.value = Color.Space(hex, "HEX24>W3").toUpperCase().substr(1);
                    } else if (code === 38) {
                        hex = Math.min(0xFFFFFF, hex + (event.shiftKey ? 10 : 1));
                        hexInput.value = Color.Space(hex, "HEX24>W3").toUpperCase().substr(1);
                    } else return;
                }
                if (String(hex) === "NaN") return;
                if (hex > 0xFFFFFF) hex = 0xFFFFFF;
                if (hex < 0) hex = 0;
                var update = event.type === "change" ? "" : "hex";
                that.update(Color.Space(hex, "HEX24>RGB"), "RGB");
                if (event.keyCode === 27) this.blur();
            });
            //
            plugin.appendChild(hexInput);
            plugin.appendChild(document.createElement("br"));
        }
        /// Creating colorpicker sliders.
        var canvas = document.createElement("canvas");
        var ctx1 = canvas.getContext("2d");
        this.canvas = canvas;
        plugin.appendChild(canvas);
        ///
        Event.add(canvas, "drag", function(event1, self1) {
            Event.stop(event1); // for ie
            ///
            var isPointerDown = self1.state === "down";
            var isPointerUp = self1.state === "up";
            ///
            if (isPointerDown) {
                if (typeof mouseLayerExit === "function") mouseLayerExit();
                if (that.onMouseDown) that.onMouseDown(event1);
            }
            ///
            if (isPointerUp && that.onMouseUp) that.onMouseUp(event1);
            ///
            var offset = that.margin / 2;
            var x0 = self1.x - offset;
            var y0 = self1.y - offset;
            var x3 = clamp(x0, 0, canvas.width);
            var y3 = clamp(y0, 0, canvas.height);
            ///
            if (self1.target.className === "hexInput") {
                if (isPointerDown) Event.stop(event1);
                plugin.style.cursor = "text";
                return; // allow selection of HEX
            } else if (x3 !== x0 || y3 !== y0) {
                if (that.feature.drag) {
                    plugin.style.cursor = "move";
                    plugin.title = "Move";
                    if (isPointerDown) Event.proxy.drag({
                        position: "move",
                        event: event1,
                        target: plugin,
                        listener: function(event, self) {
                            var x1 = 0;
                            var y1 = 0;
                            var x2 = window.innerWidth;
                            var y2 = window.innerHeight;
                            var width = self.target.offsetWidth;
                            var height = self.target.offsetHeight;
                            if (self.x + width > x2) self.x = x2 - width;
                            if (self.y + height > y2) self.y = y2 - height;
                            if (self.x < x1) self.x = x1;
                            if (self.y < y1) self.y = y1;
                            ///
                            plugin.style.left = self.x + "px";
                            plugin.style.top = self.y + "px";
                            if (self.state === "down") plugin.style.zIndex = window.zIndexGlobal++;
                            else if (self.state === "up") {
                                if (conf.recordWindow) conf.recordWindow({
                                    id: that.recordId || plugin.id,
                                    left: self.x / x2,
                                    top: self.y / y2,
                                    display: "block"
                                });
                            }
                            Event.prevent(event);
                        }
                    });
                } else plugin.style.cursor = "default";
            } else if (x3 <= that.conf.satval.width) {
                if (that.conf.satval.enable === false) return;
                if (isPointerDown) Event.stop(event1);
                plugin.style.cursor = "crosshair";
                plugin.title = "Saturation + Value";
                if (isPointerDown) Event.proxy.drag({
                    position: "relative",
                    event: event1,
                    target: canvas,
                    listener: function(event, self) {
                        var x = clamp(self.x - that.offset, 0, that.conf.satval.width);
                        var y = clamp(self.y - that.offset, 0, that.conf.satval.height);
                        that.color.S = x / that.conf.satval.width * 100; // scale saturation
                        that.color.V = 100 - y / that.conf.satval.height * 100; // scale value
                        that.drawSample(self.state, true);
                        Event.prevent(event);
                    }
                });
            } else if (x3 > that.conf.satval.width + that.margin && x3 <= that.conf.satval.width + that.margin + that.offset + that.conf.hue.width) {
                if (that.conf.hue.enable === false) return;
                if (isPointerDown) Event.stop(event1);
                plugin.style.cursor = "crosshair";
                plugin.title = "Hue";
                if (isPointerDown) Event.proxy.drag({
                    position: "relative",
                    event: event1,
                    target: canvas,
                    listener: function(event, self) {
                        var y = clamp(self.y - that.offset, 0, that.conf.satval.height);
                        that.color.H = 360 - Math.min(1, y / that.conf.satval.height) * 360;
                        that.drawSample(self.state, true);
                        Event.prevent(event);
                    }
                });
            } else if (that.conf.alpha && x3 > that.conf.satval.width + that.conf.alpha.width + that.margin * 2 && x3 <= that.conf.satval.width + that.margin * 2 + that.offset + that.conf.alpha.width * 2) {
                if (that.conf.alpha.enable === false) return;
                if (isPointerDown) Event.stop(event1);
                plugin.style.cursor = "crosshair";
                plugin.title = "Alpha";
                if (isPointerDown) Event.proxy.drag({
                    position: "relative",
                    event: event1,
                    target: canvas,
                    listener: function(event, self) {
                        var y = clamp(self.y - that.offset, 0, that.conf.satval.height);
                        that.color.A = (1 - Math.min(1, y / that.conf.satval.height)) * 255;
                        that.drawSample(self.state, true);
                        Event.prevent(event);
                    }
                });
            } else plugin.style.cursor = "default";
            return false; // prevent selection
        });
        /// helper functions
        this.update = function(color, alpha) {
            if (color) that.color = getHSVA(color);
            if (typeof alpha === "number") that.color.A = alpha;
            ///
            var metrics = that.getMetrics();
            ///
            if (canvas.width !== metrics.width || canvas.height !== metrics.height) {
                canvas.width = metrics.width;
                canvas.height = metrics.height;
                canvas.style.cssText = "left: " + -(that.offset - 1) + "px;";
                ///
                plugin.style.height = metrics.height + "px";
                plugin.style.width = metrics.width + "px";
            }
            ///
            that.drawSample("update", true);
        };
        this.drawSample = function(state, update) {
            // clearing canvas
            ctx1.clearRect(0, 0, canvas.width, canvas.height);
            that.drawSquare();
            that.drawHue();
            ///
            if (this.conf.alpha.enabled) that.drawAlpha();
            // retrieving hex-code
            var rgba = Color.Space(that.color, "HSVA>RGBA");
            var hex = Color.Space(rgba, "RGB>HEX24>W3");
            if (this.feature.hexInput) {
                // display hex string
                hexInput.value = hex.toUpperCase().substr(1);
                // display background color
                try {
                    hexBox.style.backgroundColor = Color.Space(rgba, "RGBA>W3");
                } catch (e) {
                    hexBox.style.backgroundColor = Color.Space(rgba, "RGB>W3");
                }
            }
            // draw controls
            ctx1.save();
            if (this.conf.alpha.enabled) {
                ctx1.globalAlpha = this.conf.alpha.enable ? 1.0 : 0;
                var left = that.conf.satval.width + that.margin * 2 + that.conf.hue.width + that.conf.alpha.width + that.offset;
                var y = (255 - that.color.A) / 255 * that.conf.satval.height - 2;
                ctx1.drawImage(arrow, left + 2, Math.round(y) + that.offset - 1);
            }
            if (this.conf.hue) {
                ctx1.globalAlpha = this.conf.hue.enable ? 1.0 : 0;
                var left = that.conf.satval.width + that.margin + that.offset + that.conf.hue.width;
                var y = (360 - that.color.H) / 362 * that.conf.satval.height - 2;
                ctx1.drawImage(arrow, left + 2, Math.round(y) + that.offset - 1);
            }
            if (this.conf.satval) {
                ctx1.globalAlpha = this.conf.satval.enable ? 1.0 : 0;
                var x = that.color.S / 100 * that.conf.satval.width;
                var y = (1 - that.color.V / 100) * that.conf.satval.height;
                x = x - circle.width / 2;
                y = y - circle.height / 2;
                ctx1.drawImage(circle, Math.round(x) + that.offset, Math.round(y) + that.offset);
            }
            ctx1.restore();
            /// run custom code
            if (that.callback && state && update) {
                var w3 = that.toString(rgba);
                that.callback(rgba, state, w3);
            }
        };
        this.toString = function(color) {
            color = color || that.color;
            if (isFinite(color.H)) color = Color.Space(color, "HSVA>RGBA");
            if (color.A === 255) return Color.Space(color, "RGB>HEX24>W3");
            else return Color.Space(color, "RGBA>W3");
        };
        this.drawSquare = function() {
            // retrieving hex-code
            var hex = Color.Space({
                H: that.color.H,
                S: 100,
                V: 100
            }, "HSV>RGB>HEX24>W3");
            var rgb = Color.Space.HEX_RGB("0x" + hex);
            var offset = that.offset;
            var width = that.conf.satval.width;
            var height = that.conf.satval.height;
            // drawing color
            ctx1.save();
            ctx1.fillStyle = interlace;
            ctx1.fillRect(offset, that.offset, that.conf.satval.width, that.conf.satval.height);
            ctx1.globalAlpha = that.color.A / 255;
            ctx1.fillStyle = grayscale(hex, "satval");
            ctx1.fillRect(offset, offset, width, height);
            // overlaying saturation
            var gradient = ctx1.createLinearGradient(offset, offset, width + offset, 0);
            gradient.addColorStop(0, grayscale("rgba(255, 255, 255, 1)", "satval"));
            gradient.addColorStop(1, grayscale("rgba(255, 255, 255, 0)", "satval"));
            ctx1.fillStyle = gradient;
            ctx1.fillRect(offset, offset, width, height);
            // overlaying value
            var gradient = ctx1.createLinearGradient(0, offset, 0, height + offset);
            gradient.addColorStop(0.0, "rgba(0, 0, 0, 0)");
            gradient.addColorStop(1.0, "rgba(0, 0, 0, 1)");
            ctx1.fillStyle = gradient;
            ctx1.fillRect(offset, offset, width, height);
            // drawing outer bounds
            ctx1.strokeStyle = grayscale(this.strokeColor, "satval");
            ctx1.strokeRect(offset + 0.5, offset + 0.5, width - 1, height - 1);
            ctx1.restore();
        };
        var grayscale = function(color, type) {
            if (that.conf[type].enable === true) return color;
            if (color.substr(0, 4) === "rgba") color = Color.Space(color, "W3>RGBA");
            else color = Color.Space(color, "W3>HEX32>RGBA");
            var L = Math.round(0.33 * color.R + 0.33 * color.G + 0.33 * color.B);
            return "rgba(" + L + "," + L + "," + L + "," + color.A / 255 * 0.42 + ")";
        };
        this.drawHue = function() {
            // drawing hue selector
            var left = that.conf.satval.width + that.margin + that.offset;
            ctx1.fillStyle = interlace;
            ctx1.fillRect(left, that.offset, that.conf.hue.width, that.conf.hue.height);
            ///
            var gradient = ctx1.createLinearGradient(0, 0, 0, that.conf.hue.height + that.offset);
            gradient.addColorStop(0, grayscale("rgba(255, 0, 0, 1)", "hue"));
            gradient.addColorStop(5 / 6, grayscale("rgba(255, 255, 0, 1)", "hue"));
            gradient.addColorStop(4 / 6, grayscale("rgba(0, 255, 0, 1)", "hue"));
            gradient.addColorStop(0.5, grayscale("rgba(0, 255, 255, 1)", "hue"));
            gradient.addColorStop(2 / 6, grayscale("rgba(0, 0, 255, 1)", "hue"));
            gradient.addColorStop(1 / 6, grayscale("rgba(255, 0, 255, 1)", "hue"));
            gradient.addColorStop(1, grayscale("rgba(255, 0, 0, 1)", "hue"));
            ctx1.save();
            ctx1.globalAlpha = that.color.A / 255;
            ctx1.fillStyle = gradient;
            ctx1.fillRect(left, that.offset, that.conf.hue.width, that.conf.hue.height);
            // drawing outer bounds
            ctx1.strokeStyle = grayscale(this.strokeColor, "hue");
            ctx1.strokeRect(left + 0.5, that.offset + 0.5, that.conf.hue.width - 1, that.conf.hue.height - 1);
            ctx1.restore();
        };
        this.drawAlpha = function() {
            // drawing hue selector
            var left = that.conf.satval.width + that.margin * 2 + that.conf.hue.width + that.offset;
            ctx1.fillStyle = interlace;
            ctx1.fillRect(left, that.offset, that.conf.alpha.width, that.conf.satval.height);
            ///
            var rgb = Color.Space.HSV_RGB({
                H: that.color.H,
                S: that.color.S,
                V: that.color.V
            });
            var gradient = ctx1.createLinearGradient(0, 0, 0, that.conf.satval.height);
            rgb.A = 255;
            gradient.addColorStop(0, grayscale(Color.Space.RGBA_W3(rgb), "alpha"));
            rgb.A = 0;
            gradient.addColorStop(1, grayscale(Color.Space.RGBA_W3(rgb), "alpha"));
            ctx1.fillStyle = gradient;
            ctx1.fillRect(left, that.offset, that.conf.alpha.width, that.conf.satval.height);
            // drawing outer bounds
            ctx1.strokeStyle = this.strokeColor;
            ctx1.strokeRect(left + 0.5, that.offset + 0.5, that.conf.alpha.width - 1, that.conf.satval.height - 1);
        };
        this.toggle = function(value) {
            if (value || (" " + plugin.className + " ").indexOf(" opened ") === -1) this.open();
            else this.close();
        };
        this.open = function() {
            var id = that.recordId || plugin.id;
            var element = document.getElementById(id);
            if (conf.recordWindow) {
                if (conf.recordWindow) conf.recordWindow({
                    id: id,
                    display: "block"
                });
            }
            ///
            if ((" " + element.className + " ").indexOf(" opened ") === -1) element.className = (element.className + " opened").trim();
            element.style.display = "block";
            element.style.zIndex = window.zIndexGlobal++;
            window.clearTimeout(element.interval);
        };
        this.close = function() {
            var id = that.recordId || plugin.id;
            var element = document.getElementById(id);
            if (conf.recordWindow) conf.recordWindow({
                id: id,
                display: "none"
            });
            ///
            element.className = (" " + element.className + " ").replace(" opened ", " ").trim();
            element.interval = window.setTimeout(function() {
                element.style.display = "none";
            }, 250);
        };
        this.destory = function() {
            document.body.removeChild(plugin);
            for(var key in that)delete that[key];
        };
        // drawing color selection
        this.drawSample("create");
        ///
        if (typeof conf.display !== "undefined") {
            if (conf.display) this.open();
            else this.close();
        }
        //
        return this;
    };
    var getHSVA = function(color) {
        if (typeof color === "string") {
            if (color.substr(0, 4) === "hsla") color = Color.Space(color, "W3>HSLA>RGBA>HSVA");
            else if (color.substr(0, 4) === "rgba") color = Color.Space(color, "W3>RGBA>HSVA");
            else if (color.substr(0, 3) === "rgb") color = Color.Space(color, "W3>RGB>HSV");
            else if (Color.WebColors[color]) color = Color.Space(Color.WebColors[color], "W3>HEX24>RGB>HSV");
            else color = Color.Space(color, "W3>HEX24>RGB>HSV");
        } else if (typeof color.R !== "undefined") color = Color.Space(color, "RGB>HSV");
        else if (typeof color.H !== "undefined") color;
        if (typeof color.A === "undefined") color.A = 255;
        return color;
    };
    /// Creating the arrows.
    var arrow = function() {
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        var size = 16;
        var width = size / 3;
        canvas.width = size;
        canvas.height = size;
        var top = -size / 4;
        var left = 0;
        for(var n = 0; n < 20; n++){
            ctx.beginPath();
            ctx.fillStyle = "#fff";
            ctx.moveTo(left, size / 2 + top);
            ctx.lineTo(left + size / 4, size / 4 + top);
            ctx.lineTo(left + size / 4, size / 4 * 3 + top);
            ctx.fill();
        }
        ctx.translate(-width, -size);
        return canvas;
    };
    /// Creating the circle indicator.
    var circle = function() {
        var canvas = document.createElement("canvas");
        canvas.width = 10;
        canvas.height = 10;
        var ctx = canvas.getContext("2d");
        ctx.lineWidth = 1;
        ctx.beginPath();
        var x = canvas.width / 2;
        var y = canvas.width / 2;
        ctx.arc(x, y, 4.5, 0, Math.PI * 2, true);
        ctx.strokeStyle = "#000";
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2, true);
        ctx.strokeStyle = "#FFF";
        ctx.stroke();
        return canvas;
    };
    /// Creating the interlacing background.
    var interlace = function(size, color1, color2) {
        var proto = document.createElement("canvas").getContext("2d");
        proto.canvas.width = size * 2;
        proto.canvas.height = size * 2;
        proto.fillStyle = color1; // top-left
        proto.fillRect(0, 0, size, size);
        proto.fillStyle = color2; // top-right
        proto.fillRect(size, 0, size, size);
        proto.fillStyle = color2; // bottom-left
        proto.fillRect(0, size, size, size);
        proto.fillStyle = color1; // bottom-right
        proto.fillRect(size, size, size, size);
        var pattern = proto.createPattern(proto.canvas, "repeat");
        try {
            pattern.data = proto.canvas.toDataURL();
        } catch (e) {}
        return pattern;
    };
    ///
    var clamp = function(n, min, max) {
        return n < min ? min : n > max ? max : n;
    };
})();

},{}],"4hGN8":[function(require,module,exports) {
/*
	----------------------------------------------------
	Color Space : 1.2.1 : 2013/10/13 : MIT License
	----------------------------------------------------
	https://github.com/mudcube/Color.Space.js
	----------------------------------------------------
	RGBA <-> HSLA  <-> W3
	RGBA <-> HSVA
	RGBA <-> CMY   <-> CMYK
	RGBA <-> HEX24 <-> W3
	RGBA <-> HEX32
	RGBA <-> W3
	----------------------------------------------------
	Examples
	----------------------------------------------------
	Color.Space(0x99ff0000, "HEX32>RGBA>HSLA>W3"); // outputs "hsla(60,100%,17%,0.6)"
	Color.Space(0xFF0000, "HEX24>RGB>HSL"); // convert hex24 to HSL object.
	----------------------------------------------------
*/ window.Color || (window.Color = {});
window.ColorSpace || (window.ColorSpace = {});
if (typeof Color.Space === "undefined") Color.Space = {};
(function() {
    "use strict";
    var useEval = false; // caches functions for quicker access.
    var functions = {
    };
    var shortcuts = {
        "HEX24>HSL": "HEX24>RGB>HSL",
        "HEX32>HSLA": "HEX32>RGBA>HSLA",
        "HEX24>CMYK": "HEX24>RGB>CMY>CMYK",
        "RGB>CMYK": "RGB>CMY>CMYK"
    };
    var root = Color.Space = function(color, route) {
        if (shortcuts[route]) route = shortcuts[route];
        var r = route.split(">");
        // check whether color is an [], if so, convert to {}
        if (typeof color === "object" && color[0] >= 0) {
            var type = r[0];
            var tmp = {};
            for(var i = 0; i < type.length; i++){
                var str = type.substr(i, 1);
                tmp[str] = color[i];
            }
            color = tmp;
        }
        if (functions[route]) return functions[route](color);
        var f = "color";
        for(var pos = 1, key = r[0]; pos < r.length; pos++){
            if (pos > 1) key = key.substr(key.indexOf("_") + 1);
            key += (pos === 0 ? "" : "_") + r[pos];
            color = root[key](color);
            if (useEval) f = "Color.Space." + key + "(" + f + ")";
        }
        if (useEval) functions[route] = eval("(function(color) { return " + f + " })");
        return color;
    };
    var spaceX = ColorSpace = Color.SpaceX = function(color1, type) {
        var that1 = this;
        /*
		----------------------------------------------------
		Color Space Conversion Routes
		------------------------------
		RGB <-> XYZ <-> xyY
				XYZ <-> Luv <-> LCHuv
				XYZ <-> Lab <-> LCHab
				XYZ <-> HLab
		RGB <-> HSL <-> W3_HSL
					<-> W3_HSLA
		RGB <-> HSV <-> RYB
		RGB <-> CMY <-> CMYK
		RGB <-> HEX <-> STRING
		RGB <-> W3_RGB
		RGB <-> W3_RGBA
		RGB <-> W3_HEX
		----------------------------------------------------
		W3 values
		----------------------------------------------------
		rgb(255,0,0)
		rgba(255,0,0,1)
		rgb(100%,0%,0%)
		rgba(100%,0%,0%,1)
		hsl(120, 100%, 50%)
		hsla(120, 100%, 50%, 1)
		#000000
		----------------------------------------------------
	*/ color1 = color1.replace(/ /g, "");
        color1 = color1.toLowerCase();
        ///
        var defs = {
            "#": function(that, color) {
                that.hex = root.W3_HEX24(color);
                that.type = "hex";
                var data = root.HEX24_RGB(that.hex);
                that.r = data.R;
                that.g = data.G;
                that.b = data.B;
                that.a = data.A;
            },
            "rgba": function(that, color) {
                var data = root.W3_RGBA(color);
                that.r = data.R;
                that.g = data.G;
                that.b = data.B;
                that.a = data.A;
                that.type = "rgba";
            },
            "rgb": function(that, color) {
                var data = root.W3_RGB(color);
                that.r = data.R;
                that.g = data.G;
                that.b = data.B;
                that.type = "rgb";
            },
            "hsla": function(that, color) {
                var data = root.W3_HSLA(color);
                that.h = data.H;
                that.s = data.S;
                that.l = data.L;
                that.a = data.A;
                that.type = "hsla";
            },
            "hsl": function(that, color) {
                var data = root.W3_HSL(color);
                that.h = data.H;
                that.s = data.S;
                that.l = data.L;
                that.type = "hsl";
            }
        };
        ///
        for(var key in defs)if (color1.indexOf(key) === 0) {
            defs[key](this, color1);
            return this;
        }
        ///
        if (Color.WebColors[color1]) defs["#"](this, Color.WebColors[color1]);
        ///
        return this;
    };
    spaceX.prototype.toRGB = function() {};
    spaceX.prototype.toRGBA = function() {};
    spaceX.prototype.toHSL = function() {
        switch(this.type){
            case "hex":
                return root.RGB_HSL(root.HEX24_RGB(this.hex));
            case "rgb":
                this.R = this.r;
                this.G = this.g;
                this.B = this.b;
                return root.RGB_HSL(this);
            case "rgba":
                this.R = this.r;
                this.G = this.g;
                this.B = this.b;
                this.A = this.a;
                return root.RGBA_HSLA(this);
            case "hsl":
            case "hsla":
                break;
        }
    };
    spaceX.prototype.toHSLA = function() {};
    spaceX.prototype.toHEX = function() {
        switch(this.type){
            case "hex":
                return root.HEX24_W3(this.hex);
            case "rgb":
            case "rgba":
                this.R = this.r;
                this.G = this.g;
                this.B = this.b;
                this.A = this.a;
                return root.HEX24_W3(root.RGB_HEX24(this));
            case "hsl":
            case "hsla":
                this.H = this.h;
                this.S = this.s;
                this.L = this.l;
                this.A = this.a;
                return root.HEX24_W3(root.RGB_HEX24(root.HSL_RGB(this)));
        }
    };
    spaceX.prototype.isW3Contrast = function(rgb1, rgb2) {
        rgb1 = rgb1 || this;
        rgb2 = rgb2 || {
            r: 0,
            g: 0,
            b: 0
        };
        var brightness = this.isW3Brightness(rgb1, rgb2) <= 125;
        var difference = this.isW3Difference(rgb1, rgb2) <= 500;
        return !(brightness && difference);
    };
    spaceX.prototype.isW3Brightness = function(a, b) {
        var aa = (a.r * 299 + a.g * 587 + a.b * 114) / 1000;
        var bb = (b.r * 299 + b.g * 587 + b.b * 114) / 1000;
        return Math.abs(aa - bb);
    };
    spaceX.prototype.isW3Difference = function(a, b) {
        var r = Math.max(a.r, b.r) - Math.min(a.r, b.r);
        var g = Math.max(a.g, b.g) - Math.min(a.g, b.g);
        var b = Math.max(a.b, b.b) - Math.min(a.b, b.b);
        return r + g + b;
    };
    ///------------------------------------------------------------------
    root.W3Brightness = function(a, b) {
        var aa = (a.R * 299 + a.G * 587 + a.B * 114) / 1000;
        var bb = (b.R * 299 + b.G * 587 + b.B * 114) / 1000;
        return Math.abs(aa - bb);
    };
    root.W3Difference = function(a, b) {
        var r = Math.max(a.R, b.R) - Math.min(a.R, b.R);
        var g = Math.max(a.G, b.G) - Math.min(a.G, b.G);
        var b = Math.max(a.B, b.B) - Math.min(a.B, b.B);
        return r + g + b;
    };
    root.isW3Contrast = function(rgb1, rgb2) {
        rgb2 = rgb2 || {
            R: 255,
            G: 255,
            B: 255
        };
        var brightness = root.W3Brightness(rgb1, rgb2) <= 125;
        var difference = root.W3Difference(rgb1, rgb2) <= 500;
        return !(brightness && difference);
    };
    // W3C - RGB + RGBA
    root.RGB_W3 = function(o) {
        return "rgb(" + (o.R >> 0) + "," + (o.G >> 0) + "," + (o.B >> 0) + ")";
    };
    root.RGBA_W3 = function(o) {
        var alpha = typeof o.A === "number" ? o.A / 255 : 1;
        return "rgba(" + (o.R >> 0) + "," + (o.G >> 0) + "," + (o.B >> 0) + "," + alpha + ")";
    };
    root.W3_RGB = function(o) {
        o = o.substr(4, o.length - 5).split(",");
        return {
            R: parseInt(o[0], 10),
            G: parseInt(o[1], 10),
            B: parseInt(o[2], 10)
        };
    };
    root.W3_RGBA = function(o) {
        o = o.substr(5, o.length - 6).split(",");
        return {
            R: parseInt(o[0], 10),
            G: parseInt(o[1], 10),
            B: parseInt(o[2], 10),
            A: parseFloat(o[3] || 1) * 255
        };
    };
    // W3C - HSL + HSLA
    root.HSL_W3 = function(o) {
        return "hsl(" + (o.H + 0.5 >> 0) + "," + (o.S + 0.5 >> 0) + "%," + (o.L + 0.5 >> 0) + "%)";
    };
    root.HSLA_W3 = function(o) {
        var alpha = typeof o.A === "number" ? o.A / 255 : 1;
        return "hsla(" + (o.H + 0.5 >> 0) + "," + (o.S + 0.5 >> 0) + "%," + (o.L + 0.5 >> 0) + "%," + alpha + ")";
    };
    root.W3_HSL = function(o) {
        var start = o.indexOf("(") + 1;
        var end = o.indexOf(")");
        o = o.substr(start, end - start).split(",");
        return {
            H: parseInt(o[0], 10),
            S: parseInt(o[1], 10),
            L: parseInt(o[2], 10)
        };
    };
    root.W3_HSLA = function(o) {
        var start = o.indexOf("(") + 1;
        var end = o.indexOf(")");
        o = o.substr(start, end - start).split(",");
        return {
            H: parseInt(o[0], 10),
            S: parseInt(o[1], 10),
            L: parseInt(o[2], 10),
            A: parseFloat(o[3], 10) * 255
        };
    };
    // W3 HEX = "FFFFFF" | "FFFFFFFF"
    root.W3_HEX = root.W3_HEX24 = function(o) {
        if (o.substr(0, 1) === "#") o = o.substr(1);
        if (o.length === 3) o = o[0] + o[0] + o[1] + o[1] + o[2] + o[2];
        return parseInt("0x" + o, 16);
    };
    root.W3_HEX32 = function(o) {
        if (o.substr(0, 1) === "#") o = o.substr(1);
        if (o.length === 3) o = o[0] + o[0] + o[1] + o[1] + o[2] + o[2];
        if (o.length === 6) return parseInt("0xFF" + o, 16);
        else return parseInt("0x" + o, 16);
    };
    // HEX = 0x000000 -> 0xFFFFFF
    root.HEX_W3 = root.HEX24_W3 = function(o, maxLength) {
        if (!maxLength) maxLength = 6;
        if (!o) o = 0;
        var n;
        var z = o.toString(16);
        // when string is lesser than maxLength
        n = z.length;
        while(n < maxLength){
            z = "0" + z;
            n++;
        }
        // when string is greater than maxLength
        n = z.length;
        while(n > maxLength){
            z = z.substr(1);
            n--;
        }
        return "#" + z;
    };
    root.HEX32_W3 = function(o) {
        return root.HEX_W3(o, 8);
    };
    root.HEX_RGB = root.HEX24_RGB = function(o) {
        return {
            R: o >> 16,
            G: o >> 8 & 0xFF,
            B: o & 0xFF
        };
    };
    // HEX32 = 0x00000000 -> 0xFFFFFFFF
    root.HEX32_RGBA = function(o) {
        return {
            R: o >>> 16 & 0xFF,
            G: o >>> 8 & 0xFF,
            B: o & 0xFF,
            A: o >>> 24
        };
    };
    // RGBA = R: Red / G: Green / B: Blue / A: Alpha
    root.RGBA_HEX32 = function(o) {
        return (o.A << 24 | o.R << 16 | o.G << 8 | o.B) >>> 0;
    };
    // RGB = R: Red / G: Green / B: Blue
    root.RGB_HEX24 = root.RGB_HEX = function(o) {
        if (o.R < 0) o.R = 0;
        if (o.G < 0) o.G = 0;
        if (o.B < 0) o.B = 0;
        if (o.R > 255) o.R = 255;
        if (o.G > 255) o.G = 255;
        if (o.B > 255) o.B = 255;
        return o.R << 16 | o.G << 8 | o.B;
    };
    root.RGB_CMY = function(o) {
        return {
            C: 1 - o.R / 255,
            M: 1 - o.G / 255,
            Y: 1 - o.B / 255
        };
    };
    root.RGBA_HSLA = root.RGB_HSL = function(o) {
        var _R = o.R / 255, _G = o.G / 255, _B = o.B / 255, min = Math.min(_R, _G, _B), max = Math.max(_R, _G, _B), D = max - min, H, S, L = (max + min) / 2;
        if (D === 0) {
            H = 0;
            S = 0;
        } else {
            if (L < 0.5) S = D / (max + min);
            else S = D / (2 - max - min);
            var DR = ((max - _R) / 6 + D / 2) / D;
            var DG = ((max - _G) / 6 + D / 2) / D;
            var DB = ((max - _B) / 6 + D / 2) / D;
            if (_R === max) H = DB - DG;
            else if (_G === max) H = 1 / 3 + DR - DB;
            else if (_B === max) H = 2 / 3 + DG - DR;
            if (H < 0) H += 1;
            if (H > 1) H -= 1;
        }
        return {
            H: H * 360,
            S: S * 100,
            L: L * 100,
            A: o.A
        };
    };
    root.RGBA_HSVA = root.RGB_HSV = function(o) {
        var _R = o.R / 255, _G = o.G / 255, _B = o.B / 255, min = Math.min(_R, _G, _B), max = Math.max(_R, _G, _B), D = max - min, H, S, V = max;
        if (D === 0) {
            H = 0;
            S = 0;
        } else {
            S = D / max;
            var DR = ((max - _R) / 6 + D / 2) / D;
            var DG = ((max - _G) / 6 + D / 2) / D;
            var DB = ((max - _B) / 6 + D / 2) / D;
            if (_R === max) H = DB - DG;
            else if (_G === max) H = 1 / 3 + DR - DB;
            else if (_B === max) H = 2 / 3 + DG - DR;
            if (H < 0) H += 1;
            if (H > 1) H -= 1;
        }
        return {
            H: H * 360,
            S: S * 100,
            V: V * 100,
            A: o.A
        };
    };
    // CMY = C: Cyan / M: Magenta / Y: Yellow
    root.CMY_RGB = function(o) {
        return {
            R: Math.max(0, (1 - o.C) * 255),
            G: Math.max(0, (1 - o.M) * 255),
            B: Math.max(0, (1 - o.Y) * 255)
        };
    };
    root.CMY_CMYK = function(o) {
        var C = o.C;
        var M = o.M;
        var Y = o.Y;
        var K = Math.min(Y, Math.min(M, Math.min(C, 1)));
        C = Math.round((C - K) / (1 - K) * 100);
        M = Math.round((M - K) / (1 - K) * 100);
        Y = Math.round((Y - K) / (1 - K) * 100);
        K = Math.round(K * 100);
        return {
            C: C,
            M: M,
            Y: Y,
            K: K
        };
    };
    // CMYK = C: Cyan / M: Magenta / Y: Yellow / K: Key (black)
    root.CMYK_CMY = function(o) {
        return {
            C: o.C * (1 - o.K) + o.K,
            M: o.M * (1 - o.K) + o.K,
            Y: o.Y * (1 - o.K) + o.K
        };
    };
    // HSL (1978) = H: Hue / S: Saturation / L: Lightess
    // en.wikipedia.org/wiki/HSL_and_HSV
    root.HSLA_RGBA = root.HSL_RGB = function(o) {
        var H = o.H / 360;
        var S = o.S / 100;
        var L = o.L / 100;
        var R, G, B;
        var temp1, temp2, temp3;
        if (S === 0) R = G = B = L;
        else {
            if (L < 0.5) temp2 = L * (1 + S);
            else temp2 = L + S - S * L;
            temp1 = 2 * L - temp2;
            // calculate red
            temp3 = H + 1 / 3;
            if (temp3 < 0) temp3 += 1;
            if (temp3 > 1) temp3 -= 1;
            if (6 * temp3 < 1) R = temp1 + (temp2 - temp1) * 6 * temp3;
            else if (2 * temp3 < 1) R = temp2;
            else if (3 * temp3 < 2) R = temp1 + (temp2 - temp1) * (2 / 3 - temp3) * 6;
            else R = temp1;
            // calculate green
            temp3 = H;
            if (temp3 < 0) temp3 += 1;
            if (temp3 > 1) temp3 -= 1;
            if (6 * temp3 < 1) G = temp1 + (temp2 - temp1) * 6 * temp3;
            else if (2 * temp3 < 1) G = temp2;
            else if (3 * temp3 < 2) G = temp1 + (temp2 - temp1) * (2 / 3 - temp3) * 6;
            else G = temp1;
            // calculate blue
            temp3 = H - 1 / 3;
            if (temp3 < 0) temp3 += 1;
            if (temp3 > 1) temp3 -= 1;
            if (6 * temp3 < 1) B = temp1 + (temp2 - temp1) * 6 * temp3;
            else if (2 * temp3 < 1) B = temp2;
            else if (3 * temp3 < 2) B = temp1 + (temp2 - temp1) * (2 / 3 - temp3) * 6;
            else B = temp1;
        }
        return {
            R: R * 255,
            G: G * 255,
            B: B * 255,
            A: o.A
        };
    };
    // HSV (1978) = H: Hue / S: Saturation / V: Value
    // en.wikipedia.org/wiki/HSL_and_HSV
    root.HSVA_RGBA = root.HSV_RGB = function(o) {
        var H = o.H / 360;
        var S = o.S / 100;
        var V = o.V / 100;
        var R, G, B, D, A, C;
        if (S === 0) R = G = B = Math.round(V * 255);
        else {
            if (H >= 1) H = 0;
            H = 6 * H;
            D = H - Math.floor(H);
            A = Math.round(255 * V * (1 - S));
            B = Math.round(255 * V * (1 - S * D));
            C = Math.round(255 * V * (1 - S * (1 - D)));
            V = Math.round(255 * V);
            switch(Math.floor(H)){
                case 0:
                    R = V;
                    G = C;
                    B = A;
                    break;
                case 1:
                    R = B;
                    G = V;
                    B = A;
                    break;
                case 2:
                    R = A;
                    G = V;
                    B = C;
                    break;
                case 3:
                    R = A;
                    G = B;
                    B = V;
                    break;
                case 4:
                    R = C;
                    G = A;
                    B = V;
                    break;
                case 5:
                    R = V;
                    G = A;
                    B;
                    break;
            }
        }
        return {
            R: R,
            G: G,
            B: B,
            A: o.A
        };
    };
    Color.WebColors = {
        "aliceblue": "f0f8ff",
        "antiquewhite": "faebd7",
        "aqua": "00ffff",
        "aquamarine": "7fffd4",
        "azure": "f0ffff",
        "beige": "f5f5dc",
        "bisque": "ffe4c4",
        "black": "000000",
        "blanchedalmond": "ffebcd",
        "blue": "0000ff",
        "blueviolet": "8a2be2",
        "brown": "a52a2a",
        "burlywood": "deb887",
        "cadetblue": "5f9ea0",
        "chartreuse": "7fff00",
        "chocolate": "d2691e",
        "coral": "ff7f50",
        "cornflowerblue": "6495ed",
        "cornsilk": "fff8dc",
        "crimson": "dc143c",
        "cyan": "00ffff",
        "darkblue": "00008b",
        "darkcyan": "008b8b",
        "darkgoldenrod": "b8860b",
        "darkgray": "a9a9a9",
        "darkgreen": "006400",
        "darkgrey": "a9a9a9",
        "darkkhaki": "bdb76b",
        "darkmagenta": "8b008b",
        "darkolivegreen": "556b2f",
        "darkorange": "ff8c00",
        "darkorchid": "9932cc",
        "darkred": "8b0000",
        "darksalmon": "e9967a",
        "darkseagreen": "8fbc8f",
        "darkslateblue": "483d8b",
        "darkslategray": "2f4f4f",
        "darkslategrey": "2f4f4f",
        "darkturquoise": "00ced1",
        "darkviolet": "9400d3",
        "deeppink": "ff1493",
        "deepskyblue": "00bfff",
        "dimgray": "696969",
        "dimgrey": "696969",
        "dodgerblue": "1e90ff",
        "firebrick": "b22222",
        "floralwhite": "fffaf0",
        "forestgreen": "228b22",
        "fuchsia": "ff00ff",
        "fuscia": "ff00ff",
        "gainsboro": "dcdcdc",
        "ghostwhite": "f8f8ff",
        "gold": "ffd700",
        "goldenrod": "daa520",
        "gray": "808080",
        "green": "008000",
        "greenyellow": "adff2f",
        "grey": "808080",
        "honeydew": "f0fff0",
        "hotpink": "ff69b4",
        "indianred": "cd5c5c",
        "indigo": "4b0082",
        "ivory": "fffff0",
        "khaki": "f0e68c",
        "lavender": "e6e6fa",
        "lavenderblush": "fff0f5",
        "lawngreen": "7cfc00",
        "lemonchiffon": "fffacd",
        "lightblue": "add8e6",
        "lightcoral": "f08080",
        "lightcyan": "e0ffff",
        "lightgoldenrodyellow": "fafad2",
        "lightgray": "d3d3d3",
        "lightgreen": "90ee90",
        "lightgrey": "d3d3d3",
        "lightpink": "ffb6c1",
        "lightsalmon": "ffa07a",
        "lightseagreen": "20b2aa",
        "lightskyblue": "87cefa",
        "lightslategray": "778899",
        "lightslategrey": "778899",
        "lightsteelblue": "b0c4de",
        "lightyellow": "ffffe0",
        "lime": "00ff00",
        "limegreen": "32cd32",
        "linen": "faf0e6",
        "magenta": "ff00ff",
        "maroon": "800000",
        "mediumaquamarine": "66cdaa",
        "mediumblue": "0000cd",
        "mediumorchid": "ba55d3",
        "mediumpurple": "9370db",
        "mediumseagreen": "3cb371",
        "mediumslateblue": "7b68ee",
        "mediumspringgreen": "00fa9a",
        "mediumturquoise": "48d1cc",
        "mediumvioletred": "c71585",
        "midnightblue": "191970",
        "mintcream": "f5fffa",
        "mistyrose": "ffe4e1",
        "moccasin": "ffe4b5",
        "navajowhite": "ffdead",
        "navy": "000080",
        "oldlace": "fdf5e6",
        "olive": "808000",
        "olivedrab": "6b8e23",
        "orange": "ffa500",
        "orangered": "ff4500",
        "orchid": "da70d6",
        "palegoldenrod": "eee8aa",
        "palegreen": "98fb98",
        "paleturquoise": "afeeee",
        "palevioletred": "db7093",
        "papayawhip": "ffefd5",
        "peachpuff": "ffdab9",
        "peru": "cd853f",
        "pink": "ffc0cb",
        "plum": "dda0dd",
        "powderblue": "b0e0e6",
        "purple": "800080",
        "red": "ff0000",
        "rosybrown": "bc8f8f",
        "royalblue": "4169e1",
        "saddlebrown": "8b4513",
        "salmon": "fa8072",
        "sandybrown": "f4a460",
        "seagreen": "2e8b57",
        "seashell": "fff5ee",
        "sienna": "a0522d",
        "silver": "c0c0c0",
        "skyblue": "87ceeb",
        "slateblue": "6a5acd",
        "slategray": "708090",
        "slategrey": "708090",
        "snow": "fffafa",
        "springgreen": "00ff7f",
        "steelblue": "4682b4",
        "tan": "d2b48c",
        "teal": "008080",
        "thistle": "d8bfd8",
        "tomato": "ff6347",
        "turquoise": "40e0d0",
        "violet": "ee82ee",
        "wheat": "f5deb3",
        "white": "ffffff",
        "whitesmoke": "f5f5f5",
        "yellow": "ffff00",
        "yellowgreen": "9acd32"
    };
})();

},{}],"cFbML":[function(require,module,exports) {
/*
	----------------------------------------------------
	Loader.js : 0.3 : 2012/04/12 : http://mudcu.be
	----------------------------------------------------
	Copyright 2010-2012 Michael Deal. All rights reserved.
	----------------------------------------------------
	var loader = new widgets.Loader({ message: "loading: New loading message..." });
	----------------------------------------------------
	var loader = new widgets.Loader({
		id: "loader",
		bars: 12,
		radius: 20,
		lineWidth: 3,
		lineHeight: 10,
		background: "rgba(0,0,0,0.5)"
	});
	loader.stop();
	----------------------------------------------------
	loader.message("loading: New loading message...", function() {
		// call function once loader has started
	});
*/ window.widgets || (window.widgets = {});
(function(root) {
    var PI = Math.PI;
    var defaultConfig = {
        id: "loader",
        bars: 12,
        radius: 0,
        lineWidth: 20,
        lineHeight: 70,
        display: true
    };
    var getWindowSize = function() {
        if (window.innerWidth && window.innerHeight) {
            var width = window.innerWidth;
            var height = window.innerHeight;
        } else if (document.compatMode === "CSS1Compat" && document.documentElement && document.documentElement.offsetWidth) {
            var width = document.documentElement.offsetWidth;
            var height = document.documentElement.offsetHeight;
        } else if (document.body && document.body.offsetWidth) {
            var width = document.body.offsetWidth;
            var height = document.body.offsetHeight;
        }
        return {
            width: width,
            height: height
        };
    };
    root.Loader = function(conf) {
        var that = this;
        if (!document.createElement("canvas").getContext) return;
        var that = this;
        if (!document.body) return;
        if (typeof conf === "string") conf = {
            message: conf
        };
        if (typeof conf === "undefined") conf = {};
        if (typeof conf === "boolean") conf = {
            display: false
        };
        for(var key in defaultConfig)if (typeof conf[key] === "undefined") conf[key] = defaultConfig[key];
        //
        var canvas = document.getElementById(conf.id);
        var timeout = 1;
        if (!canvas) {
            var div = document.createElement("div");
            div.style.cssText = "color: #fff; pointer-events: none; -webkit-transition-property: opacity; -webkit-transition-duration: " + timeout + "s; position: fixed; left: 0; top: 0; width: 100%; height: 100%; z-index: 10000; opacity: 1; display: none";
            var span = document.createElement("span");
            span.style.cssText = "font-family: monospace; font-size: 14px; opacity: 1; display: inline-block;background: rgba(0,0,0,0.65); border-radius: 10px; padding: 10px; width: 200px; text-align: center; position: absolute; z-index: 1000;";
            div.appendChild(span);
            that.span = span;
            that.div = div;
            var canvas = document.createElement("canvas");
            document.body.appendChild(canvas);
            canvas.id = conf.id;
            canvas.style.cssText = "opacity: 1; position: absolute; z-index: 1000;";
            div.appendChild(canvas);
            document.body.appendChild(div);
        } else that.span = canvas.parentNode.getElementsByTagName("span")[0];
        //
        var delay = conf.delay;
        var bars = conf.bars;
        var radius = conf.radius;
        var max = conf.lineHeight + 20;
        var size = max * 2 + conf.radius;
        var windowSize1 = getWindowSize();
        var width1 = windowSize1.width - size;
        var height1 = windowSize1.height - size;
        ///
        canvas.width = size;
        canvas.height = size;
        canvas.style.left = width1 / 2 + "px";
        canvas.style.top = height1 / 2 + "px";
        ///
        if (conf.message) {
            that.span.style.left = (width1 + size) / 2 - that.span.offsetWidth / 2 + "px";
            that.span.style.top = height1 / 2 + size - 10 + "px";
        }
        var offset = 0;
        var ctx = canvas.getContext("2d");
        ctx.globalCompositeOperation = "lighter";
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.shadowBlur = 1;
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        //
        function animate() {
            var windowSize = getWindowSize();
            var width = windowSize.width - size;
            var height = windowSize.height - size;
            //
            canvas.style.left = width / 2 + "px";
            canvas.style.top = height / 2 + "px";
            if (conf.message) {
                that.span.style.left = (width + size) / 2 - that.span.offsetWidth / 2 + "px";
                that.span.style.top = height / 2 + size - 10 + "px";
            }
            //
            ctx.save();
            ctx.clearRect(0, 0, size, size);
            ctx.translate(size / 2, size / 2);
            var hues = 360 - 360 / bars;
            for(var i = 0; i < bars; i++){
                var angle = i / bars * 2 * PI + offset;
                ctx.save();
                ctx.translate(radius * Math.sin(-angle), radius * Math.cos(-angle));
                ctx.rotate(angle);
                // round-rect properties
                var x = -conf.lineWidth / 2;
                var y = 0;
                var width = conf.lineWidth;
                var height = conf.lineHeight;
                var curve = width / 2;
                // round-rect path
                ctx.beginPath();
                ctx.moveTo(x + curve, y);
                ctx.lineTo(x + width - curve, y);
                ctx.quadraticCurveTo(x + width, y, x + width, y + curve);
                ctx.lineTo(x + width, y + height - curve);
                ctx.quadraticCurveTo(x + width, y + height, x + width - curve, y + height);
                ctx.lineTo(x + curve, y + height);
                ctx.quadraticCurveTo(x, y + height, x, y + height - curve);
                ctx.lineTo(x, y + curve);
                ctx.quadraticCurveTo(x, y, x + curve, y);
                // round-rect fill
                var hue = i / (bars - 1) * hues;
                ctx.fillStyle = "hsla(" + hue + ", 100%, 50%, 0.85)";
                ctx.fill();
                ctx.restore();
            }
            ctx.restore();
            offset += 0.07;
            //
            if (conf.messageAnimate) {
                var iteration = offset / 0.07 >> 0;
                if (iteration % 10 === 0) {
                    var length = conf.messageAnimate.length;
                    var n = iteration / 10 % length;
                    that.span.innerHTML = conf.message + conf.messageAnimate[n];
                }
            }
        }
        this.stop = function() {
            setTimeout(function() {
                window.clearInterval(that.interval);
                delete that.interval;
            }, 50);
            if (canvas && canvas.style) {
                canvas.parentNode.style.opacity = 0;
                window.setTimeout(function() {
                    canvas.parentNode.style.display = "none";
                    ctx.clearRect(0, 0, size, size);
                }, timeout * 1000);
            }
        };
        this.start = function(callback) {
            var windowSize = getWindowSize();
            var width = windowSize.width - size;
            var height = windowSize.height - size;
            canvas.parentNode.style.opacity = 1;
            canvas.parentNode.style.display = "block";
            that.span.style.display = conf.message ? "block" : "none";
            if (conf.background) that.div.style.background = conf.backgrond;
            canvas.style.left = width / 2 + "px";
            canvas.style.top = height / 2 + "px";
            if (!conf.delay) animate();
            window.clearInterval(this.interval);
            this.interval = window.setInterval(animate, 30);
            if (conf.message) compileMessage(conf.message, callback);
        };
        this.message = function(message, callback) {
            conf.message = message;
            if (!this.interval) return this.start(callback);
            compileMessage(conf.message, callback);
        };
        var compileMessage = function(message, callback) {
            if (message.substr(-3) === "...") {
                conf.message = message.substr(0, message.length - 3);
                conf.messageAnimate = [
                    ".&nbsp;&nbsp;",
                    "..&nbsp;",
                    "..."
                ].reverse();
                that.span.innerHTML = conf.message + conf.messageAnimate[0];
            } else {
                conf.messageAnimate = false;
                that.span.innerHTML = conf.message;
            }
            if (callback) setTimeout(callback, 50);
        };
        //
        if (conf.display === false) return this;
        //
        this.start();
        //
        return this;
    };
})(widgets);

},{}],"lgMZf":[function(require,module,exports) {
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
*/ window.widgets || (window.widgets = {});
(function() {
    var dataFormat = {
        "text/css": "string",
        "text/html": "string",
        "text/plain": "string"
    };
    widgets.FileSaver = function(config1) {
        if (typeof config1 === "undefined") config1 = {};
        var dir = config1.jsDir || "./js/";
        var that = this;
        //
        var Blob = window.Blob = window.Blob || window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
        ///
        this.html5 = typeof ArrayBuffer === "function";
        this.boot = function(callback) {
            return callback(that);
        };
        //
        this.download = function(config) {
            console.log();
            if (typeof Blob !== "function") return;
            if (!config.getData) return;
            var data = config.getData();
            var name = config.name;
            var mime = config.mime;
            var charset = config.charset;
            var extension = config.extension;
            var format = "";
            // handle packaging of arrays of data into .zip
            console.log(data);
            if (typeof data === "string") // figure out what type of data we're dealing with
            {
                if (data.indexOf("base64") !== -1) {
                    var split = data.substr(5).split(",");
                    data = split[1];
                    mime = split[0].split(";")[0];
                    if (!extension) extension = mime.split("/")[1];
                    if (!dataFormat[split[0]]) format = "binary";
                }
            } else if (data.toDataURL) format = "canvas";
            else {
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
            if (format === "blob") saveAs(data, name + "." + extension);
            else if (format === "canvas") data.toBlob(function(blob) {
                saveAs(blob, name + "." + extension);
            });
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
            if (that.html5 || isFake) {
                Event.add(div, "mousedown", Event.cancel);
                Event.add(div, "click", function() {
                    if (isFake) return getData();
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
            if (typeof data.length === "undefined") data = [
                data
            ];
            for(var n = 0, length = data.length; n < length; n++){
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
            return zip.generate({
                type: "blob"
            });
        };
        //
        if (config1.callback) this.boot(config1.callback);
        //
        return this;
    };
})();

},{}],"aq1kJ":[function(require,module,exports) {
/*
	---------------------------------------------------
	Widgets.Thumbnailer : 0.3 : mudcu.be : 2012/06/15
	----------------------------------------------------
	// Setup thumbnail properties.
	var thumbnailer = new widgets.Thumbnailer({
		backdrop: "#000",
		maxHeight: 250,
		maxWidth: 250,
		center: true,
		crop: "Fit", // Fit, Edge, None
		click: function(event) {
			console.log("This event is attached to all images.");
			console.log(this.src);
		}
	});
	// Generate thumbnail.
	var canvas = thumbnailer.generate({
		src: "https://www.google.com/images/srpr/logo3w.png", // or could be a <canvas> element
		title: "Google",
		callback: function() {
			console.log("Image has loaded!")
		},
		click: function(event) {
			console.log("This event overwrites that event.");
			console.log(this.src);
		}
	});
*/ window.widgets || (window.widgets = {});
widgets.Thumbnailer = function(root) {
    var defaultConfig = {
        backdrop: "#000",
        maxWidth: 300,
        maxHeight: 100,
        center: true,
        crop: "Fit",
        srcs: []
    };
    root = function(conf) {
        var that = this;
        if (!conf) conf = {};
        for(var key1 in defaultConfig)if (typeof conf[key1] === "undefined") conf[key1] = defaultConfig[key1];
        //
        this.images = {};
        this.conf = conf;
        this.maxHeight = conf.maxHeight;
        this.maxWidth = conf.maxWidth;
        this.generate = function(props) {
            var image;
            var src = props.src;
            var canvas = props.canvas;
            var title = props.title;
            var isFlashCanvas = typeof FlashCanvas !== "undefined";
            ///
            var crop = props.crop || conf.crop;
            var center = props.center || conf.center;
            var backdrop = props.backdrop || conf.backdrop;
            var maxWidth = props.maxWidth || conf.maxWidth;
            var maxHeight = props.maxHeight || conf.maxHeight;
            var callback = props.callback || conf.callback;
            /// Check to see whether requires new canvas.
            if (typeof canvas === "undefined") {
                if (!this.images[src]) {
                    canvas = document.createElement("canvas");
                    if (Event && Event.add) {
                        var events = {}; // Combine events.
                        for(var key in conf)events[key] = conf[key];
                        for(var key in props)events[key] = props[key];
                        Event.add(canvas, events);
                    }
                } else canvas = this.images[src].canvas;
            }
            ///
            var ctx = canvas.getContext("2d");
            ///
            var render = function() {
                if (maxWidth === "auto") {
                    canvas.height = maxHeight;
                    canvas.width = maxWidth = image.width / image.height * maxHeight;
                } else if (maxHeight === "auto") {
                    canvas.height = maxHeight = image.height / image.width * maxWidth;
                    canvas.width = maxWidth;
                } else {
                    canvas.height = maxHeight;
                    canvas.width = maxWidth;
                }
                //
                if (title) canvas.title = title;
                // Calculate scaling ratio.
                var ratio = 1;
                if (crop !== "None") {
                    var isWide = maxWidth / maxHeight < image.width / image.height;
                    var toEdge = crop === "Fit";
                    if (toEdge && isWide || !toEdge && !isWide) ratio = maxHeight / image.height;
                    else ratio = maxWidth / image.width;
                }
                ///
                var width = Math.round(image.width * ratio) || 1;
                var height = Math.round(image.height * ratio) || 1;
                var left = Math.round(center ? (maxWidth - width) / 2 : 0);
                var top = Math.round(center ? (maxHeight - height) / 2 : 0);
                ///
                ctx.save();
                ctx.beginPath();
                ctx.fillStyle = backdrop;
                ctx.rect(0, 0, maxWidth, maxHeight);
                ctx.fill();
                ctx.clip();
                ctx.translate(left, top);
                ctx.scale(ratio, ratio);
                ctx.drawImage(image, 0, 0);
                ctx.restore();
                // Indicate image has loaded.
                if (callback) callback(canvas);
            };
            ///
            var type = String(src);
            if (type === "[object HTMLCanvasElement]" || isFlashCanvas && type === "[object]") {
                image = src;
                render();
            } else if (!this.images[src]) {
                canvas.src = src;
                image = new Image();
                that.images[src] = image;
                that.images[src].canvas = canvas;
                if (isFlashCanvas) {
                    image.src = src;
                    ctx.loadImage(image, render);
                } else {
                    image.onload = render;
                    image.src = src;
                }
            } else {
                image = this.images[src];
                render();
            }
            ///
            return canvas;
        };
        //
        this.regenerate = function(type, that) {
            // update the srcs
            var count = 0;
            for(var key in this.images)thumb.generate({
                src: key,
                canvas: this.images[key].canvas
            });
        };
        //
        return this;
    };
    return root;
}({});

},{}],"asKRT":[function(require,module,exports) {
/*
	--------------------------------------------
	WINDOWS : 0.2.1 : 2013/08/08
	--------------------------------------------
	widget.windows.setClamp({
		element: document.querySelector("#sketchpad"),
		format: "px",
//		x: 0,
//		y: 0,
//		width: window.innerWidth,
//		height: window.innerHeight
	});
	///
	widget.windows.add({
		"sketch-tools": {
			format: "px",
			zIndexFixed: true, // prevent zIndex increment
			objectBoundingBox: true, // align from objectBoundingBox
			display: "block", // block | none | BLOCK | NONE
			position: "top left",
			left: -86,
			top: 0
		}
	});
*/ if (typeof zIndexGlobal === "undefined") var zIndexGlobal = 100;
window.widget || (window.widget = {});
widget = function(root) {
    "use strict";
    var windows = root.windows = [];
    windows.focused = []; // last focused element
    windows.idToIdx = {};
    /* Maintenance
------------------------------------- */ windows.add = function(conf, left, top, display) {
        var callback = typeof left === "function" ? left : null;
        if (typeof conf === "string") conf = {
            id: conf,
            left: left,
            top: top,
            display: display
        };
        else if (conf.id) {
            if (conf.format === "px") {
                conf.x = conf.left; // original coords
                conf.y = conf.top;
                conf.left = conf.left / window.innerWidth; // float
                conf.top = conf.top / window.innerHeight;
            }
        } else {
            for(var key in conf){
                var item = conf[key];
                item.id = key;
                windows.add(item);
            }
            windows.restore();
            if (callback) callback();
            return;
        }
        ///
        var position = (conf.position || "top left").split(" ");
        delete conf.position;
        conf.vAlign = position[0] || "top";
        conf.hAlign = position[1] || "left";
        ///
        if (isFinite(display)) display = display ? "block" : "none";
        ///
        windows.idToIdx[conf.id] = windows.length;
        windows.push(conf);
        ///
        sketch.getItem(conf.id, function(value) {
            if (!value) return;
            var json = JSON.parse(value);
            if (typeof display === "boolean" && display) json.display = "block";
            else if (display) json.display = display;
            ///
            if (conf.display === "NONE") json.display = "none";
            if (conf.display === "BLOCK") json.display = "block";
            ///
            mergeObject(json, conf);
        });
    };
    windows.setCurrentTab = function(id, className) {
        if (!id || !className) return;
        dom.setClassName({
            className: "selected",
            list: "div",
            target: document.querySelector("#" + id + " " + className)
        });
        widget.windows.record({
            id: id,
            className: className
        });
    };
    windows.getWindowById = function(id) {
        var idx = windows.idToIdx[id];
        if (typeof idx === "undefined") return false;
        else return windows[idx];
    };
    windows.record = function(conf) {
        var o = windows.getWindowById(conf.id);
        if (!o) return;
        if (typeof conf.x !== "undefined") o.x = conf.x;
        if (typeof conf.y !== "undefined") o.y = conf.y;
        if (typeof conf.left !== "undefined") o.left = conf.left;
        if (typeof conf.top !== "undefined") o.top = conf.top;
        if (typeof conf.display !== "undefined") o.display = conf.display;
        if (typeof conf.index !== "undefined") o.index = conf.index;
        if (typeof conf.className !== "undefined") o.className = conf.className;
        var str = JSON.stringify(o);
        sketch.setItem(conf.id, str);
        ///
        windows.focusElement(conf.id, o.display);
    };
    windows.restore = function() {
        var scrollTop = document.body.scrollTop;
        var scrollLeft = document.body.scrollLeft;
        var width = window.innerWidth;
        var height = window.innerHeight;
        ///
        if (CLAMP.element) windows.setContainer(CLAMP.element);
        ///
        var position = [];
        var offset = {};
        for(var n = 0; n < windows.length; n++){
            var o = windows[n];
            var vAlign = o.vAlign;
            var hAlign = o.hAlign;
            var el = document.getElementById(o.id);
            if (!el || !el.style) continue;
            el.style.display = "block"; // to measure offsets
            /// position of CLAMP element
            var metrics = Event.proxy.getBoundingBox(el);
            var clampTop = CLAMP[vAlign || "top"];
            var clampLeft = CLAMP[hAlign || "left"];
            ///
            if (o.objectBoundingBox) {
                o.x = 0.5 * width - metrics.width / 2;
                o.y = 0.5 * height - metrics.height / 2 + 20;
            }
            /// position of target element
            var targetTop = (isFinite(o.y) ? o.y : o.top * height) + clampTop;
            var targetLeft = (isFinite(o.x) ? o.x : o.left * width) + clampLeft;
            targetTop += scrollTop;
            targetLeft += scrollLeft;
            /// deviance to compensate for out of element bounds
            var offsetTop = Math.min(targetTop, height);
            var offsetLeft = Math.min(targetLeft, width);
            /// calculate offsets from edges
            offset.BOTTOM = targetTop + metrics.height - height;
            offset.TOP = offsetTop - targetTop;
            offset.RIGHT = targetLeft + metrics.width - width;
            offset.LEFT = offsetLeft - targetLeft;
            /// find maximum deviance
            offset[vAlign] = Math.max(offset[vAlign] || 0, offset[vAlign.toUpperCase()]);
            offset[hAlign] = Math.max(offset[hAlign] || 0, offset[hAlign.toUpperCase()]);
            ///
            targetTop -= Math.max(0, offset.BOTTOM);
            //		targetLeft -= Math.max(0, offset.RIGHT);
            ///
            position.push({
                top: Math.max(CLAMP.y, targetTop),
                left: Math.max(CLAMP.x, targetLeft)
            });
        }
        ///
        var minZIndex = 100;
        for(var n = 0; n < windows.length; n++){
            var o = windows[n];
            if (!o.display || o.display === true) o.display = "block";
            var el = document.getElementById(o.id);
            if (!el || !el.style) continue;
            ///
            var data = position[n];
            var top;
            if (o.vAlign === "bottom") top = data.top - offset.bottom;
            else top = data.top + offset.top;
            ///
            var left;
            if (o.hAlign === "right") left = data.left - offset.right;
            else left = data.left + offset.left;
            ///
            top = Math.ceil(top);
            left = Math.ceil(left);
            ///
            el.style.top = top + "px";
            el.style.left = left + "px";
            ///
            el.style.display = o.display || "block";
            el.style.zIndex = o.zIndexFixed || o.index || ++minZIndex;
            zIndexGlobal = Math.max(zIndexGlobal, o.index || 0);
            if (o.display === "block" && el.className.indexOf("opened") === -1) el.className += " opened";
        }
    };
    /* Display state
------------------------------------- */ windows.blink = function(id, callback) {
        var element = document.getElementById(id);
        if (!windows.isOpen(element)) windows.open(id);
        ///
        setTimeout(function() {
            element.blinking = false;
        }, 250);
        ///
        if (element.blinking) {
            if (callback) callback(true);
            return;
        }
        ///
        element.blinking = true;
        element.className = (" " + element.className + " ").split(" blink ").join(" blink-stall ").trim();
        ///
        setTimeout(function() {
            element.className = (" " + element.className + " ").split(" blink-stall ").join(" ").trim();
            if (element.className.indexOf("opened") === -1) {
                windows.open(id);
                if (callback) callback(true);
            } else {
                element.className += " blink";
                if (callback) callback(true);
            }
        }, 0);
    };
    windows.open = function(id) {
        var element = document.getElementById(id);
        if (!element) return;
        if ((" " + element.className + " ").indexOf(" opened ") === -1) element.className = (element.className + " opened").trim();
        ///
        var o = windows.getWindowById(id);
        var index = o.zIndexFixed ? o.zIndexFixed : ++zIndexGlobal;
        element.style.display = "block";
        element.style.zIndex = index;
        element.style.opacity = 1;
        clearTimeout(element.interval);
        windows.record({
            id: id,
            display: "block",
            index: index
        });
    };
    /* Focus
--------------------------------------------------- */ windows.focus = function(id) {
        var element = document.getElementById(id);
        if (!element) return;
        var o = windows.getWindowById(id);
        var index = o.zIndexFixed ? o.zIndexFixed : ++zIndexGlobal;
        element.style.zIndex = index;
        windows.record({
            id: id,
            index: index
        });
    };
    windows.clearFocus = function() {
        windows.focused = [];
    };
    windows.focusElement = function(id, display) {
        if (display === "none") return; //- remove element with this id
        var focusId = windows.focused.slice(-1)[0];
        var arr = " " + windows.focused.join(" ") + " ";
        if (focusId !== id && arr.indexOf(id) === -1) windows.focused.push(id);
    };
    windows.hasFocus = function() {
        return !!windows.idToIdx[windows.focused.slice(-1)[0]];
    };
    windows.closeFocused = function() {
        var focusId = windows.focused.pop();
        windows.close(focusId);
    };
    windows.close = function(id) {
        var element = document.getElementById(id);
        element.style.opacity = 0;
        element.className = (" " + element.className + " ").split(" opened ").join(" ").trim();
        element.interval = setTimeout(function() {
            element.style.opacity = 1;
            element.style.display = "none";
            windows.record({
                id: id,
                display: "none"
            });
        }, 250);
    };
    windows.isOpen = function(element) {
        if (typeof element === "string") {
            if (element.indexOf("#") === -1) element = "#" + element;
            element = document.querySelector(element);
        }
        if (!element) return;
        if (element.style.display === "none") return false;
        return (" " + element.className + " ").indexOf(" opened ") !== -1;
    };
    windows.isClosed = function(element) {
        return !windows.isOpen(element);
    };
    windows.toggle = function(id, callback) {
        var display;
        var element = document.getElementById(id);
        if (!element) return console.log("missing", id);
        if (windows.isOpen(element)) {
            windows.close(id);
            display = false;
        } else {
            windows.open(id);
            windows.restore();
            display = true;
        }
        ///
        if (callback) setTimeout(function() {
            callback(display);
        }, 1);
    };
    /* Clamp
------------------------------------- */ var CLAMP = {
        x: 0,
        y: 0,
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        vAlign: "top",
        hAlign: "left"
    };
    windows.setClamp = function(x, y, width, height, format) {
        if (typeof x === "object") {
            if (x.element) windows.setContainer(x.element);
            format = x.format;
            height = x.height;
            width = x.width;
            y = x.y;
            x = x.x;
        }
        ///
        CLAMP.x = x || null;
        CLAMP.y = y || null;
        CLAMP.width = width || null;
        CLAMP.height = height || null;
        CLAMP.format = format;
    };
    windows.setContainer = function(el) {
        var metrics = Event.proxy.getBoundingBox(el);
        CLAMP.element = el;
        CLAMP.metrics = metrics;
        CLAMP.left = metrics.x1;
        CLAMP.right = metrics.x2;
        CLAMP.top = metrics.y1;
        CLAMP.bottom = metrics.y2;
    };
    /* Events
------------------------------------- */ windows.drag = function(that, event1) {
        var scrollTop = document.body.scrollTop;
        var scrollLeft = document.body.scrollLeft;
        return Event.proxy.drag({
            event: event1,
            target: that,
            position: "move",
            listener: function(event, self) {
                Event.cancel(event);
                var metrics = Event.proxy.getBoundingBox(self.target);
                var borderLeft = metrics.border[0];
                var borderTop = metrics.border[2];
                self.target.state = self.state;
                self.width = metrics.width;
                self.height = metrics.height;
                clamp(self);
                ///
                that.style.left = Math.ceil(self.x - borderLeft) + "px"; // + scrollLeft 'absolute'
                that.style.top = Math.ceil(self.y - borderTop) + "px";
                ///
                var o = windows.getWindowById(that.id);
                if (self.state === "down") {
                    var index = o.zIndexFixed ? o.zIndexFixed : ++zIndexGlobal;
                    that.style.zIndex = index;
                } else if (self.state === "up") {
                    var top;
                    if (o.vAlign === "bottom") top = self.y - CLAMP.bottom;
                    else top = self.y - CLAMP.top - scrollTop;
                    ///
                    var left;
                    if (o.hAlign === "right") left = self.x - CLAMP.right;
                    else left = self.x - CLAMP.left - scrollLeft;
                    ///
                    windows.record({
                        id: that.id,
                        x: left - borderLeft,
                        y: top - borderTop,
                        left: left / window.innerWidth,
                        top: top / window.innerHeight,
                        index: zIndexGlobal
                    });
                    windows.restore();
                }
            }
        });
    };
    /* Helpers
------------------------------------- */ windows.write = function(type) {
        sketch.ui.foxybox(type);
        var element = document.querySelector("#sketch-help .content");
        if (element) Event.proxy.wheelPreventElasticBounce(element);
        windows.restore();
    };
    windows.lazyloader = function(selector) {
        var area = document.querySelectorAll(selector);
        for(var n = 0; n < area.length; n++){
            var d = area[n];
            d.src = d.getAttribute("data-src");
            d.className = (" " + d.className + " ").replace(" lazy ", " ").trim();
        }
    };
    var clamp = function(self) {
        var x1 = CLAMP.x || 0;
        var y1 = CLAMP.y || 0;
        var x2 = CLAMP.width || window.innerWidth;
        var y2 = CLAMP.height || window.innerHeight;
        if (self.x + self.width > x2) self.x = x2 - self.width;
        if (self.x < x1) self.x = x1;
        if (self.y + self.height > y2) self.y = y2 - self.height;
        if (self.y < y1) self.y = y1;
        return self;
    };
    return root;
}(widget);

},{}],"b9HL0":[function(require,module,exports) {
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
*/ window.widgets || (window.widgets = {});
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
    if (typeof conf.fakeInput === "object") {
        this.fakeInput = conf.fakeInput; // Stylized button to capture "file" input.
        this.fakeInputParent = conf.fakeInputParent || this.fakeInput.parentNode || document.body;
    } else if (typeof conf.fileInput === "object") this.fileInput = conf.fileInput;
    this.dropAreaContainer = conf.dropArea || document.body; // Element to initialize for dropping.
    this.dropAreaMessage = conf.dropAreaMessage || "Drop File(s) Anywhere";
    this.dropAreaStyle = conf.dropAreaStyle || "";
    this.files = {}; // Collection of dropped files.
    this.formats = {}; // Default native <image> formats.
    var formats = conf.formats;
    if (formats && formats.indexOf(",") === -1) this.formats[formats] = true;
    else {
        formats = (conf.formats || "jpg,jpeg,gif,png").split(",");
        while(formats.length)this.formats[formats.shift().toLowerCase()] = true;
    }
    this.createFileInput = function() {
        if (that.fileInput) var fileInput = that.fileInput;
        else {
            var fileInput = that.fileInput = document.createElement("input");
            fileInput.style.cssText = "position: absolute; top: 0; z-index: 1000; font-size: 1000px; text-align: right; width: inherit; height: inherit; cursor: pointer; right: 0px; filter: alpha(opacity: 0); opacity: 0;";
            fileInput.setAttribute("type", "file");
            // Multiple file support.
            if (that.maxFiles > 1) {
                fileInput.setAttribute("name", "files[]");
                fileInput.setAttribute("multiple", "multiple");
            } else fileInput.setAttribute("name", "file");
            // Directory support.
            if (that.directory) {
                fileInput.setAttribute("directory", "");
                fileInput.setAttribute("mozdirectory", "");
                fileInput.setAttribute("webkitdirectory", "");
            }
            // Setup clickable element.
            var fakeInput = that.fakeInput;
            var fakeInputContainer = that.fakeInputContainer = document.createElement("div");
            fakeInputContainer.style.cssText = "position: relative; overflow: hidden;";
            fakeInputContainer.className = "fakeInputContainer";
            // Resizing elements to fit the area.
            var width1 = fakeInput.width || fakeInput.offsetWidth;
            var height1 = fakeInput.height || fakeInput.offsetHeight;
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
            if (width1 !== 0 && height1 !== 0) fakeInput.onload();
        }
        // Setup listener.
        fileInput.onchange = function(event) {
            if (fileInput.files && fileInput.files.length) handleFiles(event.target.files);
            else {
                var src = fileInput.value;
                var fileName = src.replace(/\\/g, "/").replace(/.*\//, "");
                handleFiles([
                    {
                        src: src,
                        name: fileName
                    }
                ]);
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
            if (typeof event.dataTransfer === "undefined") return;
            if (typeof event.dataTransfer.files === "undefined") return;
            if (event.dataTransfer.files.length === 0) return;
            handleFiles(event.dataTransfer.files);
        };
        dropArea.ondragleave = function(event) {
            event.preventDefault();
            event.stopPropagation();
            setTimeout(function() {
                dropArea.style.display = "none";
            }, 100);
        };
        /// Append the drop area to the element.
        var element = container;
        if (element === window) element = document.body;
        if (!hasContainer) element.appendChild(dropArea);
        // Initialize the drop area on "dragenter".
        element.ondragenter = function(event) {
            if (typeof event.dataTransfer === "undefined") return;
            if (typeof event.dataTransfer.files === "undefined") return;
            setTimeout(function() {
                dropArea.style.display = "block";
            }, 10);
        };
        // Resize the drop area on "resize".
        if (element === document.body) (window.onresize = function(event) {
            if (!window.innerWidth && document.body && document.body.offsetWidth) {
                window.innerWidth = document.body.offsetWidth;
                window.innerHeight = document.body.offsetHeight;
            }
            if (window.innerWidth && window.innerHeight) {
                dropArea.style.width = window.innerWidth + "px";
                dropArea.style.height = window.innerHeight + "px";
            }
        })();
    };
    var hash = {
        length: 0
    };
    var handleFiles = function(files1) {
        var idx = 0;
        var length = files1.length;
        var getFileData = function(self, files) {
            if (typeof files.src !== "undefined") files = [
                files
            ];
            ///
            for(var key in files){
                var file1 = files[key];
                var id = file1.name + file1.size;
                var nid = hash[id];
                var file0 = that.files[nid];
                if (typeof file0 === "undefined") {
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
                fileReader.readAsText(file);
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
                    fileReader.onload = function(event) {
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
            var file = files1[idx];
            if (++idx > that.maxFiles || !file) {
                if (that.maxFiles === 1) {
                    var tmp = {};
                    var file = files1[0];
                    var key = hash[file.name + (file.size || "")];
                    tmp[key] = that.files[key];
                    if (!that.files[key]) {
                        if (that.onError) that.onError(that, "UPLOAD_ERR_FORMAT");
                        return;
                    }
                    return that.onChange(that, tmp);
                } else {
                    for(var key in that.files);
                    if (!that.files[key]) return;
                    return that.onChange(that, that.files);
                }
            }
            // Check whether file exists in queue.
            var id = file.name + (file.size || "");
            var tmp = that.files[hash[id]];
            if (tmp) {
                if (that.mode === "upload" && tmp.isUploaded) return getNextFile(); // dont upload twice
                else if (that.mode === "read" && tmp.isLoaded) return getNextFile(); // dont preview twice
            }
            // Check for extension.
            var key = hash[id] = hash.length++;
            var name = file.name;
            var extension = name.substr(name.lastIndexOf(".") + 1).toLowerCase();
            // Not acceptable format.
            if (!that.formats[extension]) return getNextFile();
            // Check whether file is empty.
            var size = file.fileSize || file.size;
            if (size === 0) return getNextFile();
            else if (size && size > that.maxFileSize) {
                if (that.onError) that.onError(that, "UPLOAD_ERR_FORM_SIZE");
                return getNextFile();
            }
            // Add file to queue.
            that.files[key] = file;
            if (that.mode === "upload") file.upload = new that.upload(file, getFileData);
            else if (that.mode === "read") getLocalFileData(file);
            else return getNextFile();
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
        "UPLOAD_ERR_FORMAT": "The uploaded file was an invalid format",
        "UPLOAD_ERR_XHTTP": "" // custom
    };
    this.upload = function(files, callback) {
        var self = this;
        self.files = String(files) === "[object Object]" ? [
            files
        ] : files;
        self.transferSpeed = 0;
        self.transferTotal = 0;
        self.transferPercent = 0;
        self.timeRemaining = 0;
        self.timeLapse = 0;
        self.bytes = 0;
        if (that.onUpload) that.onUpload(self);
        if (window.FormData) uploadFormData(self, callback);
        else uploadFrame(self, callback);
    };
    var handleObject = function(files, callback) {
        switch(Object.prototype.toString.call(files)){
            case "[object Array]":
                for(var n = 0, length = files.length; n < length; n++)callback(files[n]);
                break;
            case "[object Object]":
                for(var key in files)callback(files[key]);
                break;
            default:
                callback(files);
                break;
        }
    };
    var uploadFormData = function(self, callback) {
        // Firefox 4+, Chrome 7+, Safari 5+, Opera 12+, IE 10+
        var data = new FormData();
        // Append files to FormData.
        handleObject(self.files, function(file) {
            if (typeof file.data !== "undefined") data.append(file.name, file.data);
            else if (file.src && file.src.substr(0, 5) === "data:") {
                var content = JSON.stringify(file);
                data.append(file.name, content);
            } else {
                var content = file;
                data.append(file.name + (file.size || ""), content);
            }
        });
        // Create HTTP Request.
        var xhttp = new XMLHttpRequest();
        xhttp.upload.onprogress = function(event) {
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
        xhttp.onload = function(event) {
            // Indicate files as uploaded.
            handleObject(self.files, function(file) {
                if (typeof file.date !== "undefined") return;
                file.isUploaded = true;
            });
            // Send response.
            var response = event.target.responseText;
            if (that.confirm === "json") try {
                response = JSON.parse(response);
            } catch (e) {
                console.log(event.target.responseText);
            }
            if (that.errors[response]) {
                if (that.onError) that.onError(that, response);
            } else {
                if (that.onLoad) that.onLoad(self, response);
                if (callback) callback(self, response);
            }
        };
        xhttp.onerror = function(event) {
            if (that.onError) that.onError(that, "UPLOAD_ERR_XHTTP");
        };
        xhttp.onabort = function(event) {
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
        window.frames["upload_iframe"].name = "upload_iframe";
        ///
        iframe.onload = function() {
            iframe.onload = "";
            // Get message from the server.
            if (iframe.contentDocument) var body = iframe.contentDocument.body;
            else if (iframe.contentWindow) var body = iframe.contentWindow.document.body;
            else if (iframe.document) var body = iframe.document.body;
            // Process message.
            if (body.innerHTML) {
                // Indicate files as uploaded.
                handleObject(self.files, function(file) {
                    if (typeof file.date !== "undefined") return;
                    file.isUploaded = true;
                });
                // Send response.
                var response = body.innerHTML;
                if (that.confirm === "json") try {
                    response = JSON.parse(response);
                } catch (e) {
                    console.log(response);
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
            if (typeof file.data !== "undefined") {
                var input = document.createElement("input");
                input.type = "hidden";
                input.value = file.data;
                input.name = file.name;
                form.appendChild(input);
            } else if (file.src && file.src.substr(0, 11) === "data:image/") {
                var input = document.createElement("input");
                input.type = "hidden";
                input.value = JSON.stringify(file);
                input.name = file.name;
                form.appendChild(input);
            } else {
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
    var getSizeFormat = function(bytes) {
        if (bytes > 1048576) return Math.round(bytes * 100 / 1048576) / 100 + "MB";
        else if (bytes > 1024) return Math.round(bytes / 1024) + "KB";
        else return bytes + "B";
    };
    var getTimeFormat = function(time) {
        var hours = time / 3600 >> 0;
        var minutes = (time - hours * 3600) / 60 >> 0;
        var seconds = time - hours * 3600 - minutes * 60;
        if (hours < 10) hours = "0" + hours;
        if (minutes < 10) minutes = "0" + minutes;
        if (seconds < 10) seconds = "0" + seconds;
        return hours + ":" + minutes + ":" + seconds;
    };
    ///
    if (this.dropAreaContainer) this.createDropArea();
    if (this.fakeInput || this.fileInput) this.createFileInput();
    ///
    return this;
};

},{}],"OjfGB":[function(require,module,exports) {
/**
 * @license -------------------------------------------------------------------
 *   module: CanvasToBlob.js - A canvas.toBlob() implementation.
 *      src: https://github.com/eligrey/canvas-toBlob.js
 *   author: Eli Grey
 * -------------------------------------------------------------------
 * Copyright (c) 2011 Eli Grey <http://eligrey.com>
 * 
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */ (function(view) {
    "use strict";
    var Uint8Array = view.Uint8Array, HTMLCanvasElement = view.HTMLCanvasElement, is_base64_regex = /\s*;\s*base64\s*(?:;|$)/i, base64_ranks, decode_base64 = function(base64) {
        var len = base64.length, buffer = new Uint8Array(len / 4 * 3 | 0), i = 0, outptr = 0, last = [
            0,
            0
        ], state = 0, save = 0, rank, code, undef;
        while(len--){
            code = base64.charCodeAt(i++);
            rank = base64_ranks[code - 43];
            if (rank !== 255 && rank !== undef) {
                last[1] = last[0];
                last[0] = code;
                save = save << 6 | rank;
                state++;
                if (state === 4) {
                    buffer[outptr++] = save >>> 16;
                    if (last[1] !== 61 /* padding character */ ) buffer[outptr++] = save >>> 8;
                    if (last[0] !== 61 /* padding character */ ) buffer[outptr++] = save;
                    state = 0;
                }
            }
        }
        // 2/3 chance there's going to be some null bytes at the end, but that
        // doesn't really matter with most image formats.
        // If it somehow matters for you, truncate the buffer up outptr.
        return buffer;
    };
    if (Uint8Array) base64_ranks = new Uint8Array([
        62,
        -1,
        -1,
        -1,
        63,
        52,
        53,
        54,
        55,
        56,
        57,
        58,
        59,
        60,
        61,
        -1,
        -1,
        -1,
        0,
        -1,
        -1,
        -1,
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23,
        24,
        25,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        26,
        27,
        28,
        29,
        30,
        31,
        32,
        33,
        34,
        35,
        36,
        37,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        46,
        47,
        48,
        49,
        50,
        51
    ]);
    if (HTMLCanvasElement && !HTMLCanvasElement.prototype.toBlob) HTMLCanvasElement.toBlob = HTMLCanvasElement.prototype.toBlob = function(callback, type /*, ...args*/ ) {
        if (!type) type = "image/png";
        if (this.mozGetAsFile) {
            callback(this.mozGetAsFile("canvas", type));
            return;
        }
        var args = Array.prototype.slice.call(arguments, 1), dataURI = this.toDataURL.apply(this, args), header_end = dataURI.indexOf(","), data = dataURI.substring(header_end + 1), is_base64 = is_base64_regex.test(dataURI.substring(0, header_end)), blob;
        if (Blob.fake) {
            // no reason to decode a data: URI that's just going to become a data URI again
            blob = new Blob;
            if (is_base64) blob.encoding = "base64";
            else blob.encoding = "URI";
            blob.data = data;
            blob.size = data.length;
        } else if (Uint8Array) {
            if (is_base64) blob = new Blob([
                decode_base64(data)
            ], {
                type: type
            });
            else blob = new Blob([
                decodeURIComponent(data)
            ], {
                type: type
            });
        }
        callback(blob);
    };
    if (HTMLCanvasElement && !HTMLCanvasElement.prototype.toBlobURL) HTMLCanvasElement.prototype.toBlobURL = function(callback) {
        this.toBlob(function(blob) {
            callback(URL.createObjectURL(blob));
        });
    };
})(self);

},{}],"7k6av":[function(require,module,exports) {
/**
 * @license -------------------------------------------------------------------
 *   module: FileSaver.js - A saveAs() FileSaver implementation
 *      src: https://github.com/eligrey/FileSaver.js
 *   author: Eli Grey
 * -------------------------------------------------------------------
 * Copyright (c) 2011 Eli Grey <http://eligrey.com>
 * 
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */ if (!document.createElementNS) document.createElementNS = function(uri, name) {
    return document.createElement(name);
};
if (!(window.chrome && window.chrome.fileSystem)) var saveAs = saveAs || navigator.msSaveOrOpenBlob && navigator.msSaveOrOpenBlob.bind(navigator) || function(view) {
    "use strict";
    var doc = view.document, get_URL = function() {
        return view.URL || view.webkitURL || view;
    }, URL = view.URL || view.webkitURL || view, save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a"), can_use_save_link = !view.externalHost && "download" in save_link, click = function(node) {
        var event = doc.createEvent("MouseEvents");
        event.initMouseEvent("click", true, false, view, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        node.dispatchEvent(event);
    }, webkit_req_fs = view.webkitRequestFileSystem, req_fs = view.requestFileSystem || webkit_req_fs || view.mozRequestFileSystem, throw_outside = function(ex) {
        (view.setImmediate || view.setTimeout)(function() {
            throw ex;
        }, 0);
    }, force_saveable_type = "application/octet-stream", fs_min_size = 0, deletion_queue = [], process_deletion_queue = function() {
        var i = deletion_queue.length;
        while(i--){
            var file = deletion_queue[i];
            if (typeof file === "string") URL.revokeObjectURL(file);
            else file.remove();
        }
        deletion_queue.length = 0; // clear queue
    }, dispatch = function(filesaver, event_types, event) {
        event_types = [].concat(event_types);
        var i = event_types.length;
        while(i--){
            var listener = filesaver["on" + event_types[i]];
            if (typeof listener === "function") try {
                listener.call(filesaver, event || filesaver);
            } catch (ex) {
                throw_outside(ex);
            }
        }
    }, FileSaver = function(blob, name) {
        // First try a.download, then web filesystem, then object URLs
        var filesaver = this, type = blob.type, blob_changed = false, object_url1, target_view, get_object_url = function() {
            var object_url = get_URL().createObjectURL(blob);
            deletion_queue.push(object_url);
            return object_url;
        }, dispatch_all = function() {
            dispatch(filesaver, "writestart progress write writeend".split(" "));
        }, fs_error = function() {
            // don't create more object URLs than needed
            if (blob_changed || !object_url1) object_url1 = get_object_url(blob);
            if (target_view) target_view.location.href = object_url1;
            else window.open(object_url1, "_blank");
            filesaver.readyState = filesaver.DONE;
            dispatch_all();
        }, abortable = function(func) {
            return function() {
                if (filesaver.readyState !== filesaver.DONE) return func.apply(this, arguments);
            };
        }, create_if_not_found = {
            create: true,
            exclusive: false
        }, slice;
        filesaver.readyState = filesaver.INIT;
        if (!name) name = "download";
        if (can_use_save_link) {
            object_url1 = get_object_url(blob);
            save_link.href = object_url1;
            save_link.download = name;
            click(save_link);
            filesaver.readyState = filesaver.DONE;
            dispatch_all();
            return;
        }
        // Object and web filesystem URLs have a problem saving in Google Chrome when
        // viewed in a tab, so I force save with application/octet-stream
        // http://code.google.com/p/chromium/issues/detail?id=91158
        if (view.chrome && type && type !== force_saveable_type) {
            slice = blob.slice || blob.webkitSlice;
            blob = slice.call(blob, 0, blob.size, force_saveable_type);
            blob_changed = true;
        }
        // Since I can't be sure that the guessed media type will trigger a download
        // in WebKit, I append .download to the filename.
        // https://bugs.webkit.org/show_bug.cgi?id=65440
        if (webkit_req_fs && name !== "download") name += ".download";
        if (type === force_saveable_type || webkit_req_fs) target_view = view;
        if (!req_fs) {
            fs_error();
            return;
        }
        fs_min_size += blob.size;
        req_fs(view.TEMPORARY, fs_min_size, abortable(function(fs) {
            fs.root.getDirectory("saved", create_if_not_found, abortable(function(dir) {
                var save = function() {
                    dir.getFile(name, create_if_not_found, abortable(function(file) {
                        file.createWriter(abortable(function(writer) {
                            writer.onwriteend = function(event) {
                                target_view.location.href = file.toURL();
                                deletion_queue.push(file);
                                filesaver.readyState = filesaver.DONE;
                                dispatch(filesaver, "writeend", event);
                            };
                            writer.onerror = function() {
                                var error = writer.error;
                                if (error.code !== error.ABORT_ERR) fs_error();
                            };
                            "writestart progress write abort".split(" ").forEach(function(event) {
                                writer["on" + event] = filesaver["on" + event];
                            });
                            writer.write(blob);
                            filesaver.abort = function() {
                                writer.abort();
                                filesaver.readyState = filesaver.DONE;
                            };
                            filesaver.readyState = filesaver.WRITING;
                        }), fs_error);
                    }), fs_error);
                };
                dir.getFile(name, {
                    create: false
                }, abortable(function(file) {
                    // delete file if it already exists
                    file.remove();
                    save();
                }), abortable(function(ex) {
                    if (ex.code === ex.NOT_FOUND_ERR) save();
                    else fs_error();
                }));
            }), fs_error);
        }), fs_error);
    }, FS_proto = FileSaver.prototype, saveAs1 = function(blob, name) {
        return new FileSaver(blob, name);
    };
    FS_proto.abort = function() {
        var filesaver = this;
        filesaver.readyState = filesaver.DONE;
        dispatch(filesaver, "abort");
    };
    FS_proto.readyState = FS_proto.INIT = 0;
    FS_proto.WRITING = 1;
    FS_proto.DONE = 2;
    FS_proto.error = FS_proto.onwritestart = FS_proto.onprogress = FS_proto.onwrite = FS_proto.onabort = FS_proto.onerror = FS_proto.onwriteend = null;
    view.addEventListener("unload", process_deletion_queue, false);
    return saveAs1;
}(self);

},{}],"cHPdL":[function(require,module,exports) {
var Buffer = require("buffer").Buffer;
/**

JSZip - A Javascript class for generating and reading zip files
<http://stuartk.com/jszip>

(c) 2009-2012 Stuart Knightley <stuart [at] stuartk.com>
Dual licenced under the MIT license or GPLv3. See LICENSE.markdown.

Usage:
   zip = new JSZip();
   zip.file("hello.txt", "Hello, World!").file("tempfile", "nothing");
   zip.folder("images").file("smile.gif", base64Data, {base64: true});
   zip.file("Xmas.txt", "Ho ho ho !", {date : new Date("December 25, 2007 00:00:01")});
   zip.remove("tempfile");

   base64zip = zip.generate();

**/ // We use strict, but it should not be placed outside of a function because
// the environment is shared inside the browser.
// "use strict";
/**
 * Representation a of zip file in js
 * @constructor
 * @param {String=|ArrayBuffer=|Uint8Array=|Buffer=} data the data to load, if any (optional).
 * @param {Object=} options the options for creating this objects (optional).
 */ var JSZip = function(data, options) {
    // object containing the files :
    // {
    //   "folder/" : {...},
    //   "folder/data.txt" : {...}
    // }
    this.files = {};
    // Where we are in the hierarchy
    this.root = "";
    if (data) this.load(data, options);
};
JSZip.signature = {
    LOCAL_FILE_HEADER: "PK\x03\x04",
    CENTRAL_FILE_HEADER: "PK\x01\x02",
    CENTRAL_DIRECTORY_END: "PK\x05\x06",
    ZIP64_CENTRAL_DIRECTORY_LOCATOR: "PK\x06\x07",
    ZIP64_CENTRAL_DIRECTORY_END: "PK\x06\x06",
    DATA_DESCRIPTOR: "PK\x07\b"
};
// Default properties for a new file
JSZip.defaults = {
    base64: false,
    binary: false,
    dir: false,
    date: null,
    compression: null
};
/*
 * List features that require a modern browser, and if the current browser support them.
 */ JSZip.support = {
    // contains true if JSZip can read/generate ArrayBuffer, false otherwise.
    arraybuffer: function() {
        return typeof ArrayBuffer !== "undefined" && typeof Uint8Array !== "undefined";
    }(),
    // contains true if JSZip can read/generate nodejs Buffer, false otherwise.
    nodebuffer: function() {
        return typeof Buffer !== "undefined";
    }(),
    // contains true if JSZip can read/generate Uint8Array, false otherwise.
    uint8array: function() {
        return typeof Uint8Array !== "undefined";
    }(),
    // contains true if JSZip can read/generate Blob, false otherwise.
    blob: function() {
        // the spec started with BlobBuilder then replaced it with a construtor for Blob.
        // Result : we have browsers that :
        // * know the BlobBuilder (but with prefix)
        // * know the Blob constructor
        // * know about Blob but not about how to build them
        // About the "=== 0" test : if given the wrong type, it may be converted to a string.
        // Instead of an empty content, we will get "[object Uint8Array]" for example.
        if (typeof ArrayBuffer === "undefined") return false;
        var buffer = new ArrayBuffer(0);
        try {
            return new Blob([
                buffer
            ], {
                type: "application/zip"
            }).size === 0;
        } catch (e) {}
        try {
            var BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
            var builder = new BlobBuilder();
            builder.append(buffer);
            return builder.getBlob("application/zip").size === 0;
        } catch (e1) {}
        return false;
    }()
};
JSZip.prototype = function() {
    var textEncoder, textDecoder;
    if (JSZip.support.uint8array && typeof TextEncoder === "function" && typeof TextDecoder === "function") {
        textEncoder = new TextEncoder("utf-8");
        textDecoder = new TextDecoder("utf-8");
    }
    /**
    * Returns the raw data of a ZipObject, decompress the content if necessary.
    * @param {ZipObject} file the file to use.
    * @return {String|ArrayBuffer|Uint8Array|Buffer} the data.
    */ var getRawData = function(file) {
        if (file._data instanceof JSZip.CompressedObject) {
            file._data = file._data.getContent();
            file.options.binary = true;
            file.options.base64 = false;
            if (JSZip.utils.getTypeOf(file._data) === "uint8array") {
                var copy = file._data;
                // when reading an arraybuffer, the CompressedObject mechanism will keep it and subarray() a Uint8Array.
                // if we request a file in the same format, we might get the same Uint8Array or its ArrayBuffer (the original zip file).
                file._data = new Uint8Array(copy.length);
                // with an empty Uint8Array, Opera fails with a "Offset larger than array size"
                if (copy.length !== 0) file._data.set(copy, 0);
            }
        }
        return file._data;
    };
    /**
    * Returns the data of a ZipObject in a binary form. If the content is an unicode string, encode it.
    * @param {ZipObject} file the file to use.
    * @return {String|ArrayBuffer|Uint8Array|Buffer} the data.
    */ var getBinaryData = function(file) {
        var result = getRawData(file), type = JSZip.utils.getTypeOf(result);
        if (type === "string") {
            if (!file.options.binary) {
                // unicode text !
                // unicode string => binary string is a painful process, check if we can avoid it.
                if (textEncoder) return textEncoder.encode(result);
                if (JSZip.support.nodebuffer) return new Buffer(result, "utf-8");
            }
            return file.asBinary();
        }
        return result;
    };
    /**
    * Transform this._data into a string.
    * @param {function} filter a function String -> String, applied if not null on the result.
    * @return {String} the string representing this._data.
    */ var dataToString = function(asUTF8) {
        var result = getRawData(this);
        if (result === null || typeof result === "undefined") return "";
        // if the data is a base64 string, we decode it before checking the encoding !
        if (this.options.base64) result = JSZip.base64.decode(result);
        if (asUTF8 && this.options.binary) // JSZip.prototype.utf8decode supports arrays as input
        // skip to array => string step, utf8decode will do it.
        result = JSZip.prototype.utf8decode(result);
        else // no utf8 transformation, do the array => string step.
        result = JSZip.utils.transformTo("string", result);
        if (!asUTF8 && !this.options.binary) result = JSZip.prototype.utf8encode(result);
        return result;
    };
    /**
    * A simple object representing a file in the zip file.
    * @constructor
    * @param {string} name the name of the file
    * @param {String|ArrayBuffer|Uint8Array|Buffer} data the data
    * @param {Object} options the options of the file
    */ var ZipObject = function(name, data, options) {
        this.name = name;
        this._data = data;
        this.options = options;
    };
    ZipObject.prototype = {
        /**
       * Return the content as UTF8 string.
       * @return {string} the UTF8 string.
       */ asText: function() {
            return dataToString.call(this, true);
        },
        /**
       * Returns the binary content.
       * @return {string} the content as binary.
       */ asBinary: function() {
            return dataToString.call(this, false);
        },
        /**
       * Returns the content as a nodejs Buffer.
       * @return {Buffer} the content as a Buffer.
       */ asNodeBuffer: function() {
            var result = getBinaryData(this);
            return JSZip.utils.transformTo("nodebuffer", result);
        },
        /**
       * Returns the content as an Uint8Array.
       * @return {Uint8Array} the content as an Uint8Array.
       */ asUint8Array: function() {
            var result = getBinaryData(this);
            return JSZip.utils.transformTo("uint8array", result);
        },
        /**
       * Returns the content as an ArrayBuffer.
       * @return {ArrayBuffer} the content as an ArrayBufer.
       */ asArrayBuffer: function() {
            return this.asUint8Array().buffer;
        }
    };
    /**
    * Transform an integer into a string in hexadecimal.
    * @private
    * @param {number} dec the number to convert.
    * @param {number} bytes the number of bytes to generate.
    * @returns {string} the result.
    */ var decToHex = function(dec, bytes) {
        var hex = "", i;
        for(i = 0; i < bytes; i++){
            hex += String.fromCharCode(dec & 0xff);
            dec = dec >>> 8;
        }
        return hex;
    };
    /**
    * Merge the objects passed as parameters into a new one.
    * @private
    * @param {...Object} var_args All objects to merge.
    * @return {Object} a new object with the data of the others.
    */ var extend = function() {
        var result = {}, i, attr;
        for(i = 0; i < arguments.length; i++){
            for(attr in arguments[i])if (arguments[i].hasOwnProperty(attr) && typeof result[attr] === "undefined") result[attr] = arguments[i][attr];
        }
        return result;
    };
    /**
    * Transforms the (incomplete) options from the user into the complete
    * set of options to create a file.
    * @private
    * @param {Object} o the options from the user.
    * @return {Object} the complete set of options.
    */ var prepareFileAttrs = function(o) {
        o = o || {};
        /*jshint -W041 */ if (o.base64 === true && o.binary == null) o.binary = true;
        /*jshint +W041 */ o = extend(o, JSZip.defaults);
        o.date = o.date || new Date();
        if (o.compression !== null) o.compression = o.compression.toUpperCase();
        return o;
    };
    /**
    * Add a file in the current folder.
    * @private
    * @param {string} name the name of the file
    * @param {String|ArrayBuffer|Uint8Array|Buffer} data the data of the file
    * @param {Object} o the options of the file
    * @return {Object} the new file.
    */ var fileAdd = function(name, data, o) {
        // be sure sub folders exist
        var parent = parentFolder(name), dataType = JSZip.utils.getTypeOf(data);
        if (parent) folderAdd.call(this, parent);
        o = prepareFileAttrs(o);
        if (o.dir || data === null || typeof data === "undefined") {
            o.base64 = false;
            o.binary = false;
            data = null;
        } else if (dataType === "string") {
            if (o.binary && !o.base64) // optimizedBinaryString == true means that the file has already been filtered with a 0xFF mask
            {
                if (o.optimizedBinaryString !== true) // this is a string, not in a base64 format.
                // Be sure that this is a correct "binary string"
                data = JSZip.utils.string2binary(data);
            }
        } else {
            o.base64 = false;
            o.binary = true;
            if (!dataType && !(data instanceof JSZip.CompressedObject)) throw new Error("The data of '" + name + "' is in an unsupported format !");
            // special case : it's way easier to work with Uint8Array than with ArrayBuffer
            if (dataType === "arraybuffer") data = JSZip.utils.transformTo("uint8array", data);
        }
        var object = new ZipObject(name, data, o);
        this.files[name] = object;
        return object;
    };
    /**
    * Find the parent folder of the path.
    * @private
    * @param {string} path the path to use
    * @return {string} the parent folder, or ""
    */ var parentFolder = function(path) {
        if (path.slice(-1) == "/") path = path.substring(0, path.length - 1);
        var lastSlash = path.lastIndexOf("/");
        return lastSlash > 0 ? path.substring(0, lastSlash) : "";
    };
    /**
    * Add a (sub) folder in the current folder.
    * @private
    * @param {string} name the folder's name
    * @return {Object} the new folder.
    */ var folderAdd = function(name) {
        // Check the name ends with a /
        if (name.slice(-1) != "/") name += "/"; // IE doesn't like substr(-1)
        // Does this folder already exist?
        if (!this.files[name]) fileAdd.call(this, name, null, {
            dir: true
        });
        return this.files[name];
    };
    /**
    * Generate a JSZip.CompressedObject for a given zipOject.
    * @param {ZipObject} file the object to read.
    * @param {JSZip.compression} compression the compression to use.
    * @return {JSZip.CompressedObject} the compressed result.
    */ var generateCompressedObjectFrom = function(file, compression) {
        var result = new JSZip.CompressedObject(), content;
        // the data has not been decompressed, we might reuse things !
        if (file._data instanceof JSZip.CompressedObject) {
            result.uncompressedSize = file._data.uncompressedSize;
            result.crc32 = file._data.crc32;
            if (result.uncompressedSize === 0 || file.options.dir) {
                compression = JSZip.compressions["STORE"];
                result.compressedContent = "";
                result.crc32 = 0;
            } else if (file._data.compressionMethod === compression.magic) result.compressedContent = file._data.getCompressedContent();
            else {
                content = file._data.getContent();
                // need to decompress / recompress
                result.compressedContent = compression.compress(JSZip.utils.transformTo(compression.compressInputType, content));
            }
        } else {
            // have uncompressed data
            content = getBinaryData(file);
            if (!content || content.length === 0 || file.options.dir) {
                compression = JSZip.compressions["STORE"];
                content = "";
            }
            result.uncompressedSize = content.length;
            result.crc32 = this.crc32(content);
            result.compressedContent = compression.compress(JSZip.utils.transformTo(compression.compressInputType, content));
        }
        result.compressedSize = result.compressedContent.length;
        result.compressionMethod = compression.magic;
        return result;
    };
    /**
    * Generate the various parts used in the construction of the final zip file.
    * @param {string} name the file name.
    * @param {ZipObject} file the file content.
    * @param {JSZip.CompressedObject} compressedObject the compressed object.
    * @param {number} offset the current offset from the start of the zip file.
    * @return {object} the zip parts.
    */ var generateZipParts = function(name, file, compressedObject, offset) {
        var data = compressedObject.compressedContent, utfEncodedFileName = this.utf8encode(file.name), useUTF8 = utfEncodedFileName !== file.name, o = file.options, dosTime, dosDate;
        // date
        // @see http://www.delorie.com/djgpp/doc/rbinter/it/52/13.html
        // @see http://www.delorie.com/djgpp/doc/rbinter/it/65/16.html
        // @see http://www.delorie.com/djgpp/doc/rbinter/it/66/16.html
        dosTime = o.date.getHours();
        dosTime = dosTime << 6;
        dosTime = dosTime | o.date.getMinutes();
        dosTime = dosTime << 5;
        dosTime = dosTime | o.date.getSeconds() / 2;
        dosDate = o.date.getFullYear() - 1980;
        dosDate = dosDate << 4;
        dosDate = dosDate | o.date.getMonth() + 1;
        dosDate = dosDate << 5;
        dosDate = dosDate | o.date.getDate();
        var header = "";
        // version needed to extract
        header += "\n\0";
        // general purpose bit flag
        // set bit 11 if utf8
        header += useUTF8 ? "\0\b" : "\0\0";
        // compression method
        header += compressedObject.compressionMethod;
        // last mod file time
        header += decToHex(dosTime, 2);
        // last mod file date
        header += decToHex(dosDate, 2);
        // crc-32
        header += decToHex(compressedObject.crc32, 4);
        // compressed size
        header += decToHex(compressedObject.compressedSize, 4);
        // uncompressed size
        header += decToHex(compressedObject.uncompressedSize, 4);
        // file name length
        header += decToHex(utfEncodedFileName.length, 2);
        // extra field length
        header += "\0\0";
        var fileRecord = JSZip.signature.LOCAL_FILE_HEADER + header + utfEncodedFileName;
        var dirRecord = JSZip.signature.CENTRAL_FILE_HEADER + // version made by (00: DOS)
        "\x14\0" + // file header (common to file and central directory)
        header + // file comment length
        "\0\0" + // disk number start
        "\0\0" + // internal file attributes TODO
        "\0\0" + (file.options.dir === true ? "\x10\0\0\0" : "\0\0\0\0") + // relative offset of local header
        decToHex(offset, 4) + // file name
        utfEncodedFileName;
        return {
            fileRecord: fileRecord,
            dirRecord: dirRecord,
            compressedObject: compressedObject
        };
    };
    /**
    * An object to write any content to a string.
    * @constructor
    */ var StringWriter = function() {
        this.data = [];
    };
    StringWriter.prototype = {
        /**
       * Append any content to the current string.
       * @param {Object} input the content to add.
       */ append: function(input) {
            input = JSZip.utils.transformTo("string", input);
            this.data.push(input);
        },
        /**
       * Finalize the construction an return the result.
       * @return {string} the generated string.
       */ finalize: function() {
            return this.data.join("");
        }
    };
    /**
    * An object to write any content to an Uint8Array.
    * @constructor
    * @param {number} length The length of the array.
    */ var Uint8ArrayWriter = function(length) {
        this.data = new Uint8Array(length);
        this.index = 0;
    };
    Uint8ArrayWriter.prototype = {
        /**
       * Append any content to the current array.
       * @param {Object} input the content to add.
       */ append: function(input) {
            if (input.length !== 0) {
                // with an empty Uint8Array, Opera fails with a "Offset larger than array size"
                input = JSZip.utils.transformTo("uint8array", input);
                this.data.set(input, this.index);
                this.index += input.length;
            }
        },
        /**
       * Finalize the construction an return the result.
       * @return {Uint8Array} the generated array.
       */ finalize: function() {
            return this.data;
        }
    };
    // return the actual prototype of JSZip
    return {
        /**
       * Read an existing zip and merge the data in the current JSZip object.
       * The implementation is in jszip-load.js, don't forget to include it.
       * @param {String|ArrayBuffer|Uint8Array|Buffer} stream  The stream to load
       * @param {Object} options Options for loading the stream.
       *  options.base64 : is the stream in base64 ? default : false
       * @return {JSZip} the current JSZip object
       */ load: function(stream, options) {
            throw new Error("Load method is not defined. Is the file jszip-load.js included ?");
        },
        /**
       * Filter nested files/folders with the specified function.
       * @param {Function} search the predicate to use :
       * function (relativePath, file) {...}
       * It takes 2 arguments : the relative path and the file.
       * @return {Array} An array of matching elements.
       */ filter: function(search) {
            var result = [], filename, relativePath, file, fileClone;
            for(filename in this.files){
                if (!this.files.hasOwnProperty(filename)) continue;
                file = this.files[filename];
                // return a new object, don't let the user mess with our internal objects :)
                fileClone = new ZipObject(file.name, file._data, extend(file.options));
                relativePath = filename.slice(this.root.length, filename.length);
                if (filename.slice(0, this.root.length) === this.root && search(relativePath, fileClone)) result.push(fileClone);
            }
            return result;
        },
        /**
       * Add a file to the zip file, or search a file.
       * @param   {string|RegExp} name The name of the file to add (if data is defined),
       * the name of the file to find (if no data) or a regex to match files.
       * @param   {String|ArrayBuffer|Uint8Array|Buffer} data  The file data, either raw or base64 encoded
       * @param   {Object} o     File options
       * @return  {JSZip|Object|Array} this JSZip object (when adding a file),
       * a file (when searching by string) or an array of files (when searching by regex).
       */ file: function(name, data, o) {
            if (arguments.length === 1) {
                if (JSZip.utils.isRegExp(name)) {
                    var regexp = name;
                    return this.filter(function(relativePath, file) {
                        return !file.options.dir && regexp.test(relativePath);
                    });
                } else return this.filter(function(relativePath, file) {
                    return !file.options.dir && relativePath === name;
                })[0] || null;
            } else {
                name = this.root + name;
                fileAdd.call(this, name, data, o);
            }
            return this;
        },
        /**
       * Add a directory to the zip file, or search.
       * @param   {String|RegExp} arg The name of the directory to add, or a regex to search folders.
       * @return  {JSZip} an object with the new directory as the root, or an array containing matching folders.
       */ folder: function(arg) {
            if (!arg) return this;
            if (JSZip.utils.isRegExp(arg)) return this.filter(function(relativePath, file) {
                return file.options.dir && arg.test(relativePath);
            });
            // else, name is a new folder
            var name = this.root + arg;
            var newFolder = folderAdd.call(this, name);
            // Allow chaining by returning a new object with this folder as the root
            var ret = this.clone();
            ret.root = newFolder.name;
            return ret;
        },
        /**
       * Delete a file, or a directory and all sub-files, from the zip
       * @param {string} name the name of the file to delete
       * @return {JSZip} this JSZip object
       */ remove: function(name) {
            name = this.root + name;
            var file1 = this.files[name];
            if (!file1) {
                // Look for any folders
                if (name.slice(-1) != "/") name += "/";
                file1 = this.files[name];
            }
            if (file1) {
                if (!file1.options.dir) // file
                delete this.files[name];
                else {
                    // folder
                    var kids = this.filter(function(relativePath, file) {
                        return file.name.slice(0, name.length) === name;
                    });
                    for(var i = 0; i < kids.length; i++)delete this.files[kids[i].name];
                }
            }
            return this;
        },
        /**
       * Generate the complete zip file
       * @param {Object} options the options to generate the zip file :
       * - base64, (deprecated, use type instead) true to generate base64.
       * - compression, "STORE" by default.
       * - type, "base64" by default. Values are : string, base64, uint8array, arraybuffer, blob.
       * @return {String|Uint8Array|ArrayBuffer|Buffer|Blob} the zip file
       */ generate: function(options) {
            options = extend(options || {}, {
                base64: true,
                compression: "STORE",
                type: "base64"
            });
            JSZip.utils.checkSupport(options.type);
            var zipData = [], localDirLength = 0, centralDirLength = 0, writer, i;
            // first, generate all the zip parts.
            for(var name in this.files){
                if (!this.files.hasOwnProperty(name)) continue;
                var file = this.files[name];
                var compressionName = file.options.compression || options.compression.toUpperCase();
                var compression = JSZip.compressions[compressionName];
                if (!compression) throw new Error(compressionName + " is not a valid compression method !");
                var compressedObject = generateCompressedObjectFrom.call(this, file, compression);
                var zipPart = generateZipParts.call(this, name, file, compressedObject, localDirLength);
                localDirLength += zipPart.fileRecord.length + compressedObject.compressedSize;
                centralDirLength += zipPart.dirRecord.length;
                zipData.push(zipPart);
            }
            var dirEnd = "";
            // end of central dir signature
            dirEnd = JSZip.signature.CENTRAL_DIRECTORY_END + // number of this disk
            "\0\0" + // number of the disk with the start of the central directory
            "\0\0" + // total number of entries in the central directory on this disk
            decToHex(zipData.length, 2) + // total number of entries in the central directory
            decToHex(zipData.length, 2) + // size of the central directory   4 bytes
            decToHex(centralDirLength, 4) + // offset of start of central directory with respect to the starting disk number
            decToHex(localDirLength, 4) + // .ZIP file comment length
            "\0\0";
            // we have all the parts (and the total length)
            // time to create a writer !
            switch(options.type.toLowerCase()){
                case "uint8array":
                case "arraybuffer":
                case "blob":
                case "nodebuffer":
                    writer = new Uint8ArrayWriter(localDirLength + centralDirLength + dirEnd.length);
                    break;
                // case "base64" :
                // case "string" :
                default:
                    writer = new StringWriter(localDirLength + centralDirLength + dirEnd.length);
                    break;
            }
            for(i = 0; i < zipData.length; i++){
                writer.append(zipData[i].fileRecord);
                writer.append(zipData[i].compressedObject.compressedContent);
            }
            for(i = 0; i < zipData.length; i++)writer.append(zipData[i].dirRecord);
            writer.append(dirEnd);
            var zip = writer.finalize();
            switch(options.type.toLowerCase()){
                // case "zip is an Uint8Array"
                case "uint8array":
                case "arraybuffer":
                case "nodebuffer":
                    return JSZip.utils.transformTo(options.type.toLowerCase(), zip);
                case "blob":
                    return JSZip.utils.arrayBuffer2Blob(JSZip.utils.transformTo("arraybuffer", zip));
                // case "zip is a string"
                case "base64":
                    return options.base64 ? JSZip.base64.encode(zip) : zip;
                default:
                    return zip;
            }
        },
        /**
       *
       *  Javascript crc32
       *  http://www.webtoolkit.info/
       *
       */ crc32: function crc32(input, crc) {
            if (typeof input === "undefined" || !input.length) return 0;
            var isArray = JSZip.utils.getTypeOf(input) !== "string";
            var table = [
                0x00000000,
                0x77073096,
                0xEE0E612C,
                0x990951BA,
                0x076DC419,
                0x706AF48F,
                0xE963A535,
                0x9E6495A3,
                0x0EDB8832,
                0x79DCB8A4,
                0xE0D5E91E,
                0x97D2D988,
                0x09B64C2B,
                0x7EB17CBD,
                0xE7B82D07,
                0x90BF1D91,
                0x1DB71064,
                0x6AB020F2,
                0xF3B97148,
                0x84BE41DE,
                0x1ADAD47D,
                0x6DDDE4EB,
                0xF4D4B551,
                0x83D385C7,
                0x136C9856,
                0x646BA8C0,
                0xFD62F97A,
                0x8A65C9EC,
                0x14015C4F,
                0x63066CD9,
                0xFA0F3D63,
                0x8D080DF5,
                0x3B6E20C8,
                0x4C69105E,
                0xD56041E4,
                0xA2677172,
                0x3C03E4D1,
                0x4B04D447,
                0xD20D85FD,
                0xA50AB56B,
                0x35B5A8FA,
                0x42B2986C,
                0xDBBBC9D6,
                0xACBCF940,
                0x32D86CE3,
                0x45DF5C75,
                0xDCD60DCF,
                0xABD13D59,
                0x26D930AC,
                0x51DE003A,
                0xC8D75180,
                0xBFD06116,
                0x21B4F4B5,
                0x56B3C423,
                0xCFBA9599,
                0xB8BDA50F,
                0x2802B89E,
                0x5F058808,
                0xC60CD9B2,
                0xB10BE924,
                0x2F6F7C87,
                0x58684C11,
                0xC1611DAB,
                0xB6662D3D,
                0x76DC4190,
                0x01DB7106,
                0x98D220BC,
                0xEFD5102A,
                0x71B18589,
                0x06B6B51F,
                0x9FBFE4A5,
                0xE8B8D433,
                0x7807C9A2,
                0x0F00F934,
                0x9609A88E,
                0xE10E9818,
                0x7F6A0DBB,
                0x086D3D2D,
                0x91646C97,
                0xE6635C01,
                0x6B6B51F4,
                0x1C6C6162,
                0x856530D8,
                0xF262004E,
                0x6C0695ED,
                0x1B01A57B,
                0x8208F4C1,
                0xF50FC457,
                0x65B0D9C6,
                0x12B7E950,
                0x8BBEB8EA,
                0xFCB9887C,
                0x62DD1DDF,
                0x15DA2D49,
                0x8CD37CF3,
                0xFBD44C65,
                0x4DB26158,
                0x3AB551CE,
                0xA3BC0074,
                0xD4BB30E2,
                0x4ADFA541,
                0x3DD895D7,
                0xA4D1C46D,
                0xD3D6F4FB,
                0x4369E96A,
                0x346ED9FC,
                0xAD678846,
                0xDA60B8D0,
                0x44042D73,
                0x33031DE5,
                0xAA0A4C5F,
                0xDD0D7CC9,
                0x5005713C,
                0x270241AA,
                0xBE0B1010,
                0xC90C2086,
                0x5768B525,
                0x206F85B3,
                0xB966D409,
                0xCE61E49F,
                0x5EDEF90E,
                0x29D9C998,
                0xB0D09822,
                0xC7D7A8B4,
                0x59B33D17,
                0x2EB40D81,
                0xB7BD5C3B,
                0xC0BA6CAD,
                0xEDB88320,
                0x9ABFB3B6,
                0x03B6E20C,
                0x74B1D29A,
                0xEAD54739,
                0x9DD277AF,
                0x04DB2615,
                0x73DC1683,
                0xE3630B12,
                0x94643B84,
                0x0D6D6A3E,
                0x7A6A5AA8,
                0xE40ECF0B,
                0x9309FF9D,
                0x0A00AE27,
                0x7D079EB1,
                0xF00F9344,
                0x8708A3D2,
                0x1E01F268,
                0x6906C2FE,
                0xF762575D,
                0x806567CB,
                0x196C3671,
                0x6E6B06E7,
                0xFED41B76,
                0x89D32BE0,
                0x10DA7A5A,
                0x67DD4ACC,
                0xF9B9DF6F,
                0x8EBEEFF9,
                0x17B7BE43,
                0x60B08ED5,
                0xD6D6A3E8,
                0xA1D1937E,
                0x38D8C2C4,
                0x4FDFF252,
                0xD1BB67F1,
                0xA6BC5767,
                0x3FB506DD,
                0x48B2364B,
                0xD80D2BDA,
                0xAF0A1B4C,
                0x36034AF6,
                0x41047A60,
                0xDF60EFC3,
                0xA867DF55,
                0x316E8EEF,
                0x4669BE79,
                0xCB61B38C,
                0xBC66831A,
                0x256FD2A0,
                0x5268E236,
                0xCC0C7795,
                0xBB0B4703,
                0x220216B9,
                0x5505262F,
                0xC5BA3BBE,
                0xB2BD0B28,
                0x2BB45A92,
                0x5CB36A04,
                0xC2D7FFA7,
                0xB5D0CF31,
                0x2CD99E8B,
                0x5BDEAE1D,
                0x9B64C2B0,
                0xEC63F226,
                0x756AA39C,
                0x026D930A,
                0x9C0906A9,
                0xEB0E363F,
                0x72076785,
                0x05005713,
                0x95BF4A82,
                0xE2B87A14,
                0x7BB12BAE,
                0x0CB61B38,
                0x92D28E9B,
                0xE5D5BE0D,
                0x7CDCEFB7,
                0x0BDBDF21,
                0x86D3D2D4,
                0xF1D4E242,
                0x68DDB3F8,
                0x1FDA836E,
                0x81BE16CD,
                0xF6B9265B,
                0x6FB077E1,
                0x18B74777,
                0x88085AE6,
                0xFF0F6A70,
                0x66063BCA,
                0x11010B5C,
                0x8F659EFF,
                0xF862AE69,
                0x616BFFD3,
                0x166CCF45,
                0xA00AE278,
                0xD70DD2EE,
                0x4E048354,
                0x3903B3C2,
                0xA7672661,
                0xD06016F7,
                0x4969474D,
                0x3E6E77DB,
                0xAED16A4A,
                0xD9D65ADC,
                0x40DF0B66,
                0x37D83BF0,
                0xA9BCAE53,
                0xDEBB9EC5,
                0x47B2CF7F,
                0x30B5FFE9,
                0xBDBDF21C,
                0xCABAC28A,
                0x53B39330,
                0x24B4A3A6,
                0xBAD03605,
                0xCDD70693,
                0x54DE5729,
                0x23D967BF,
                0xB3667A2E,
                0xC4614AB8,
                0x5D681B02,
                0x2A6F2B94,
                0xB40BBE37,
                0xC30C8EA1,
                0x5A05DF1B,
                0x2D02EF8D
            ];
            if (typeof crc == "undefined") crc = 0;
            var x = 0;
            var y = 0;
            var byte = 0;
            crc = crc ^ -1;
            for(var i = 0, iTop = input.length; i < iTop; i++){
                byte = isArray ? input[i] : input.charCodeAt(i);
                y = (crc ^ byte) & 0xFF;
                x = table[y];
                crc = crc >>> 8 ^ x;
            }
            return crc ^ -1;
        },
        // Inspired by http://my.opera.com/GreyWyvern/blog/show.dml/1725165
        clone: function() {
            var newObj = new JSZip();
            for(var i in this)if (typeof this[i] !== "function") newObj[i] = this[i];
            return newObj;
        },
        /**
       * http://www.webtoolkit.info/javascript-utf8.html
       */ utf8encode: function(string) {
            // TextEncoder + Uint8Array to binary string is faster than checking every bytes on long strings.
            // http://jsperf.com/utf8encode-vs-textencoder
            // On short strings (file names for example), the TextEncoder API is (currently) slower.
            if (textEncoder) {
                var u8 = textEncoder.encode(string);
                return JSZip.utils.transformTo("string", u8);
            }
            if (JSZip.support.nodebuffer) return JSZip.utils.transformTo("string", new Buffer(string, "utf-8"));
            // array.join may be slower than string concatenation but generates less objects (less time spent garbage collecting).
            // See also http://jsperf.com/array-direct-assignment-vs-push/31
            var result = [], resIndex = 0;
            for(var n = 0; n < string.length; n++){
                var c = string.charCodeAt(n);
                if (c < 128) result[resIndex++] = String.fromCharCode(c);
                else if (c > 127 && c < 2048) {
                    result[resIndex++] = String.fromCharCode(c >> 6 | 192);
                    result[resIndex++] = String.fromCharCode(c & 63 | 128);
                } else {
                    result[resIndex++] = String.fromCharCode(c >> 12 | 224);
                    result[resIndex++] = String.fromCharCode(c >> 6 & 63 | 128);
                    result[resIndex++] = String.fromCharCode(c & 63 | 128);
                }
            }
            return result.join("");
        },
        /**
       * http://www.webtoolkit.info/javascript-utf8.html
       */ utf8decode: function(input) {
            var result = [], resIndex = 0;
            var type = JSZip.utils.getTypeOf(input);
            var isArray = type !== "string";
            var i = 0;
            var c = 0, c1 = 0, c2 = 0, c3 = 0;
            // check if we can use the TextDecoder API
            // see http://encoding.spec.whatwg.org/#api
            if (textDecoder) return textDecoder.decode(JSZip.utils.transformTo("uint8array", input));
            if (JSZip.support.nodebuffer) return JSZip.utils.transformTo("nodebuffer", input).toString("utf-8");
            while(i < input.length){
                c = isArray ? input[i] : input.charCodeAt(i);
                if (c < 128) {
                    result[resIndex++] = String.fromCharCode(c);
                    i++;
                } else if (c > 191 && c < 224) {
                    c2 = isArray ? input[i + 1] : input.charCodeAt(i + 1);
                    result[resIndex++] = String.fromCharCode((c & 31) << 6 | c2 & 63);
                    i += 2;
                } else {
                    c2 = isArray ? input[i + 1] : input.charCodeAt(i + 1);
                    c3 = isArray ? input[i + 2] : input.charCodeAt(i + 2);
                    result[resIndex++] = String.fromCharCode((c & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
                    i += 3;
                }
            }
            return result.join("");
        }
    };
}();
/*
 * Compression methods
 * This object is filled in as follow :
 * name : {
 *    magic // the 2 bytes indentifying the compression method
 *    compress // function, take the uncompressed content and return it compressed.
 *    uncompress // function, take the compressed content and return it uncompressed.
 *    compressInputType // string, the type accepted by the compress method. null to accept everything.
 *    uncompressInputType // string, the type accepted by the uncompress method. null to accept everything.
 * }
 *
 * STORE is the default compression method, so it's included in this file.
 * Other methods should go to separated files : the user wants modularity.
 */ JSZip.compressions = {
    "STORE": {
        magic: "\0\0",
        compress: function(content) {
            return content; // no compression
        },
        uncompress: function(content) {
            return content; // no compression
        },
        compressInputType: null,
        uncompressInputType: null
    }
};
(function() {
    JSZip.utils = {
        /**
       * Convert a string to a "binary string" : a string containing only char codes between 0 and 255.
       * @param {string} str the string to transform.
       * @return {String} the binary string.
       */ string2binary: function(str) {
            var result = "";
            for(var i = 0; i < str.length; i++)result += String.fromCharCode(str.charCodeAt(i) & 0xff);
            return result;
        },
        /**
       * Create a Uint8Array from the string.
       * @param {string} str the string to transform.
       * @return {Uint8Array} the typed array.
       * @throws {Error} an Error if the browser doesn't support the requested feature.
       * @deprecated : use JSZip.utils.transformTo instead.
       */ string2Uint8Array: function(str) {
            return JSZip.utils.transformTo("uint8array", str);
        },
        /**
       * Create a string from the Uint8Array.
       * @param {Uint8Array} array the array to transform.
       * @return {string} the string.
       * @throws {Error} an Error if the browser doesn't support the requested feature.
       * @deprecated : use JSZip.utils.transformTo instead.
       */ uint8Array2String: function(array) {
            return JSZip.utils.transformTo("string", array);
        },
        /**
       * Create a blob from the given ArrayBuffer.
       * @param {ArrayBuffer} buffer the buffer to transform.
       * @return {Blob} the result.
       * @throws {Error} an Error if the browser doesn't support the requested feature.
       */ arrayBuffer2Blob: function(buffer) {
            JSZip.utils.checkSupport("blob");
            try {
                // Blob constructor
                return new Blob([
                    buffer
                ], {
                    type: "application/zip"
                });
            } catch (e) {}
            try {
                // deprecated, browser only, old way
                var BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
                var builder = new BlobBuilder();
                builder.append(buffer);
                return builder.getBlob("application/zip");
            } catch (e2) {}
            // well, fuck ?!
            throw new Error("Bug : can't construct the Blob.");
        },
        /**
       * Create a blob from the given string.
       * @param {string} str the string to transform.
       * @return {Blob} the result.
       * @throws {Error} an Error if the browser doesn't support the requested feature.
       */ string2Blob: function(str) {
            var buffer = JSZip.utils.transformTo("arraybuffer", str);
            return JSZip.utils.arrayBuffer2Blob(buffer);
        }
    };
    /**
    * The identity function.
    * @param {Object} input the input.
    * @return {Object} the same input.
    */ function identity(input) {
        return input;
    }
    /**
    * Fill in an array with a string.
    * @param {String} str the string to use.
    * @param {Array|ArrayBuffer|Uint8Array|Buffer} array the array to fill in (will be mutated).
    * @return {Array|ArrayBuffer|Uint8Array|Buffer} the updated array.
    */ function stringToArrayLike(str, array) {
        for(var i = 0; i < str.length; ++i)array[i] = str.charCodeAt(i) & 0xFF;
        return array;
    }
    /**
    * Transform an array-like object to a string.
    * @param {Array|ArrayBuffer|Uint8Array|Buffer} array the array to transform.
    * @return {String} the result.
    */ function arrayLikeToString(array) {
        // Performances notes :
        // --------------------
        // String.fromCharCode.apply(null, array) is the fastest, see
        // see http://jsperf.com/converting-a-uint8array-to-a-string/2
        // but the stack is limited (and we can get huge arrays !).
        //
        // result += String.fromCharCode(array[i]); generate too many strings !
        //
        // This code is inspired by http://jsperf.com/arraybuffer-to-string-apply-performance/2
        var chunk = 65536;
        var result = [], len = array.length, type = JSZip.utils.getTypeOf(array), k = 0;
        var canUseApply = true;
        try {
            switch(type){
                case "uint8array":
                    String.fromCharCode.apply(null, new Uint8Array(0));
                    break;
                case "nodebuffer":
                    String.fromCharCode.apply(null, new Buffer(0));
                    break;
            }
        } catch (e) {
            canUseApply = false;
        }
        // no apply : slow and painful algorithm
        // default browser on android 4.*
        if (!canUseApply) {
            var resultStr = "";
            for(var i = 0; i < array.length; i++)resultStr += String.fromCharCode(array[i]);
            return resultStr;
        }
        while(k < len && chunk > 1)try {
            if (type === "array" || type === "nodebuffer") result.push(String.fromCharCode.apply(null, array.slice(k, Math.min(k + chunk, len))));
            else result.push(String.fromCharCode.apply(null, array.subarray(k, Math.min(k + chunk, len))));
            k += chunk;
        } catch (e3) {
            chunk = Math.floor(chunk / 2);
        }
        return result.join("");
    }
    /**
    * Copy the data from an array-like to an other array-like.
    * @param {Array|ArrayBuffer|Uint8Array|Buffer} arrayFrom the origin array.
    * @param {Array|ArrayBuffer|Uint8Array|Buffer} arrayTo the destination array which will be mutated.
    * @return {Array|ArrayBuffer|Uint8Array|Buffer} the updated destination array.
    */ function arrayLikeToArrayLike(arrayFrom, arrayTo) {
        for(var i = 0; i < arrayFrom.length; i++)arrayTo[i] = arrayFrom[i];
        return arrayTo;
    }
    // a matrix containing functions to transform everything into everything.
    var transform = {};
    // string to ?
    transform["string"] = {
        "string": identity,
        "array": function(input) {
            return stringToArrayLike(input, new Array(input.length));
        },
        "arraybuffer": function(input) {
            return transform["string"]["uint8array"](input).buffer;
        },
        "uint8array": function(input) {
            return stringToArrayLike(input, new Uint8Array(input.length));
        },
        "nodebuffer": function(input) {
            return stringToArrayLike(input, new Buffer(input.length));
        }
    };
    // array to ?
    transform["array"] = {
        "string": arrayLikeToString,
        "array": identity,
        "arraybuffer": function(input) {
            return new Uint8Array(input).buffer;
        },
        "uint8array": function(input) {
            return new Uint8Array(input);
        },
        "nodebuffer": function(input) {
            return new Buffer(input);
        }
    };
    // arraybuffer to ?
    transform["arraybuffer"] = {
        "string": function(input) {
            return arrayLikeToString(new Uint8Array(input));
        },
        "array": function(input) {
            return arrayLikeToArrayLike(new Uint8Array(input), new Array(input.byteLength));
        },
        "arraybuffer": identity,
        "uint8array": function(input) {
            return new Uint8Array(input);
        },
        "nodebuffer": function(input) {
            return new Buffer(new Uint8Array(input));
        }
    };
    // uint8array to ?
    transform["uint8array"] = {
        "string": arrayLikeToString,
        "array": function(input) {
            return arrayLikeToArrayLike(input, new Array(input.length));
        },
        "arraybuffer": function(input) {
            return input.buffer;
        },
        "uint8array": identity,
        "nodebuffer": function(input) {
            return new Buffer(input);
        }
    };
    // nodebuffer to ?
    transform["nodebuffer"] = {
        "string": arrayLikeToString,
        "array": function(input) {
            return arrayLikeToArrayLike(input, new Array(input.length));
        },
        "arraybuffer": function(input) {
            return transform["nodebuffer"]["uint8array"](input).buffer;
        },
        "uint8array": function(input) {
            return arrayLikeToArrayLike(input, new Uint8Array(input.length));
        },
        "nodebuffer": identity
    };
    /**
    * Transform an input into any type.
    * The supported output type are : string, array, uint8array, arraybuffer, nodebuffer.
    * If no output type is specified, the unmodified input will be returned.
    * @param {String} outputType the output type.
    * @param {String|Array|ArrayBuffer|Uint8Array|Buffer} input the input to convert.
    * @throws {Error} an Error if the browser doesn't support the requested output type.
    */ JSZip.utils.transformTo = function(outputType, input) {
        if (!input) // undefined, null, etc
        // an empty string won't harm.
        input = "";
        if (!outputType) return input;
        JSZip.utils.checkSupport(outputType);
        var inputType = JSZip.utils.getTypeOf(input);
        var result = transform[inputType][outputType](input);
        return result;
    };
    /**
    * Return the type of the input.
    * The type will be in a format valid for JSZip.utils.transformTo : string, array, uint8array, arraybuffer.
    * @param {Object} input the input to identify.
    * @return {String} the (lowercase) type of the input.
    */ JSZip.utils.getTypeOf = function(input) {
        if (typeof input === "string") return "string";
        if (Object.prototype.toString.call(input) === "[object Array]") return "array";
        if (JSZip.support.nodebuffer && Buffer.isBuffer(input)) return "nodebuffer";
        if (JSZip.support.uint8array && input instanceof Uint8Array) return "uint8array";
        if (JSZip.support.arraybuffer && input instanceof ArrayBuffer) return "arraybuffer";
    };
    /**
    * Cross-window, cross-Node-context regular expression detection
    * @param  {Object}  object Anything
    * @return {Boolean}        true if the object is a regular expression,
    * false otherwise
    */ JSZip.utils.isRegExp = function(object) {
        return Object.prototype.toString.call(object) === "[object RegExp]";
    };
    /**
    * Throw an exception if the type is not supported.
    * @param {String} type the type to check.
    * @throws {Error} an Error if the browser doesn't support the requested type.
    */ JSZip.utils.checkSupport = function(type) {
        var supported = true;
        switch(type.toLowerCase()){
            case "uint8array":
                supported = JSZip.support.uint8array;
                break;
            case "arraybuffer":
                supported = JSZip.support.arraybuffer;
                break;
            case "nodebuffer":
                supported = JSZip.support.nodebuffer;
                break;
            case "blob":
                supported = JSZip.support.blob;
                break;
        }
        if (!supported) throw new Error(type + " is not supported by this browser");
    };
})();
(function() {
    /**
    * Represents an entry in the zip.
    * The content may or may not be compressed.
    * @constructor
    */ JSZip.CompressedObject = function() {
        this.compressedSize = 0;
        this.uncompressedSize = 0;
        this.crc32 = 0;
        this.compressionMethod = null;
        this.compressedContent = null;
    };
    JSZip.CompressedObject.prototype = {
        /**
       * Return the decompressed content in an unspecified format.
       * The format will depend on the decompressor.
       * @return {Object} the decompressed content.
       */ getContent: function() {
            return null; // see implementation
        },
        /**
       * Return the compressed content in an unspecified format.
       * The format will depend on the compressed conten source.
       * @return {Object} the compressed content.
       */ getCompressedContent: function() {
            return null; // see implementation
        }
    };
})();
/**
 *
 *  Base64 encode / decode
 *  http://www.webtoolkit.info/
 *
 *  Hacked so that it doesn't utf8 en/decode everything
 **/ JSZip.base64 = function() {
    // private property
    var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    return {
        // public method for encoding
        encode: function(input, utf8) {
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;
            while(i < input.length){
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
                enc1 = chr1 >> 2;
                enc2 = (chr1 & 3) << 4 | chr2 >> 4;
                enc3 = (chr2 & 15) << 2 | chr3 >> 6;
                enc4 = chr3 & 63;
                if (isNaN(chr2)) enc3 = enc4 = 64;
                else if (isNaN(chr3)) enc4 = 64;
                output = output + _keyStr.charAt(enc1) + _keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
            }
            return output;
        },
        // public method for decoding
        decode: function(input, utf8) {
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
            while(i < input.length){
                enc1 = _keyStr.indexOf(input.charAt(i++));
                enc2 = _keyStr.indexOf(input.charAt(i++));
                enc3 = _keyStr.indexOf(input.charAt(i++));
                enc4 = _keyStr.indexOf(input.charAt(i++));
                chr1 = enc1 << 2 | enc2 >> 4;
                chr2 = (enc2 & 15) << 4 | enc3 >> 2;
                chr3 = (enc3 & 3) << 6 | enc4;
                output = output + String.fromCharCode(chr1);
                if (enc3 != 64) output = output + String.fromCharCode(chr2);
                if (enc4 != 64) output = output + String.fromCharCode(chr3);
            }
            return output;
        }
    };
}(); // enforcing Stuk's coding style
 // vim: set shiftwidth=3 softtabstop=3:

},{"buffer":"fCgem"}],"fCgem":[function(require,module,exports) {
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */ /* eslint-disable no-proto */ "use strict";
var base64 = require("base64-js");
var ieee754 = require("ieee754");
var customInspectSymbol = typeof Symbol === "function" && typeof Symbol["for"] === "function" // eslint-disable-line dot-notation
 ? Symbol["for"]("nodejs.util.inspect.custom") // eslint-disable-line dot-notation
 : null;
exports.Buffer = Buffer;
exports.SlowBuffer = SlowBuffer;
exports.INSPECT_MAX_BYTES = 50;
var K_MAX_LENGTH = 0x7fffffff;
exports.kMaxLength = K_MAX_LENGTH;
/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */ Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport();
if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== "undefined" && typeof console.error === "function") console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");
function typedArraySupport() {
    // Can typed array instances can be augmented?
    try {
        var arr = new Uint8Array(1);
        var proto = {
            foo: function() {
                return 42;
            }
        };
        Object.setPrototypeOf(proto, Uint8Array.prototype);
        Object.setPrototypeOf(arr, proto);
        return arr.foo() === 42;
    } catch (e) {
        return false;
    }
}
Object.defineProperty(Buffer.prototype, "parent", {
    enumerable: true,
    get: function() {
        if (!Buffer.isBuffer(this)) return undefined;
        return this.buffer;
    }
});
Object.defineProperty(Buffer.prototype, "offset", {
    enumerable: true,
    get: function() {
        if (!Buffer.isBuffer(this)) return undefined;
        return this.byteOffset;
    }
});
function createBuffer(length) {
    if (length > K_MAX_LENGTH) throw new RangeError('The value "' + length + '" is invalid for option "size"');
    // Return an augmented `Uint8Array` instance
    var buf = new Uint8Array(length);
    Object.setPrototypeOf(buf, Buffer.prototype);
    return buf;
}
/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */ function Buffer(arg, encodingOrOffset, length) {
    // Common case.
    if (typeof arg === "number") {
        if (typeof encodingOrOffset === "string") throw new TypeError('The "string" argument must be of type string. Received type number');
        return allocUnsafe(arg);
    }
    return from(arg, encodingOrOffset, length);
}
Buffer.poolSize = 8192 // not used by this implementation
;
function from(value, encodingOrOffset, length) {
    if (typeof value === "string") return fromString(value, encodingOrOffset);
    if (ArrayBuffer.isView(value)) return fromArrayView(value);
    if (value == null) throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value);
    if (isInstance(value, ArrayBuffer) || value && isInstance(value.buffer, ArrayBuffer)) return fromArrayBuffer(value, encodingOrOffset, length);
    if (typeof SharedArrayBuffer !== "undefined" && (isInstance(value, SharedArrayBuffer) || value && isInstance(value.buffer, SharedArrayBuffer))) return fromArrayBuffer(value, encodingOrOffset, length);
    if (typeof value === "number") throw new TypeError('The "value" argument must not be of type number. Received type number');
    var valueOf = value.valueOf && value.valueOf();
    if (valueOf != null && valueOf !== value) return Buffer.from(valueOf, encodingOrOffset, length);
    var b = fromObject(value);
    if (b) return b;
    if (typeof Symbol !== "undefined" && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === "function") return Buffer.from(value[Symbol.toPrimitive]("string"), encodingOrOffset, length);
    throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value);
}
/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/ Buffer.from = function(value, encodingOrOffset, length) {
    return from(value, encodingOrOffset, length);
};
// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Object.setPrototypeOf(Buffer.prototype, Uint8Array.prototype);
Object.setPrototypeOf(Buffer, Uint8Array);
function assertSize(size) {
    if (typeof size !== "number") throw new TypeError('"size" argument must be of type number');
    else if (size < 0) throw new RangeError('The value "' + size + '" is invalid for option "size"');
}
function alloc(size, fill, encoding) {
    assertSize(size);
    if (size <= 0) return createBuffer(size);
    if (fill !== undefined) // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpreted as a start offset.
    return typeof encoding === "string" ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
    return createBuffer(size);
}
/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/ Buffer.alloc = function(size, fill, encoding) {
    return alloc(size, fill, encoding);
};
function allocUnsafe(size) {
    assertSize(size);
    return createBuffer(size < 0 ? 0 : checked(size) | 0);
}
/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */ Buffer.allocUnsafe = function(size) {
    return allocUnsafe(size);
};
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */ Buffer.allocUnsafeSlow = function(size) {
    return allocUnsafe(size);
};
function fromString(string, encoding) {
    if (typeof encoding !== "string" || encoding === "") encoding = "utf8";
    if (!Buffer.isEncoding(encoding)) throw new TypeError("Unknown encoding: " + encoding);
    var length = byteLength(string, encoding) | 0;
    var buf = createBuffer(length);
    var actual = buf.write(string, encoding);
    if (actual !== length) // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual);
    return buf;
}
function fromArrayLike(array) {
    var length = array.length < 0 ? 0 : checked(array.length) | 0;
    var buf = createBuffer(length);
    for(var i = 0; i < length; i += 1)buf[i] = array[i] & 255;
    return buf;
}
function fromArrayView(arrayView) {
    if (isInstance(arrayView, Uint8Array)) {
        var copy = new Uint8Array(arrayView);
        return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength);
    }
    return fromArrayLike(arrayView);
}
function fromArrayBuffer(array, byteOffset, length) {
    if (byteOffset < 0 || array.byteLength < byteOffset) throw new RangeError('"offset" is outside of buffer bounds');
    if (array.byteLength < byteOffset + (length || 0)) throw new RangeError('"length" is outside of buffer bounds');
    var buf;
    if (byteOffset === undefined && length === undefined) buf = new Uint8Array(array);
    else if (length === undefined) buf = new Uint8Array(array, byteOffset);
    else buf = new Uint8Array(array, byteOffset, length);
    // Return an augmented `Uint8Array` instance
    Object.setPrototypeOf(buf, Buffer.prototype);
    return buf;
}
function fromObject(obj) {
    if (Buffer.isBuffer(obj)) {
        var len = checked(obj.length) | 0;
        var buf = createBuffer(len);
        if (buf.length === 0) return buf;
        obj.copy(buf, 0, 0, len);
        return buf;
    }
    if (obj.length !== undefined) {
        if (typeof obj.length !== "number" || numberIsNaN(obj.length)) return createBuffer(0);
        return fromArrayLike(obj);
    }
    if (obj.type === "Buffer" && Array.isArray(obj.data)) return fromArrayLike(obj.data);
}
function checked(length) {
    // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
    // length is NaN (which is otherwise coerced to zero.)
    if (length >= K_MAX_LENGTH) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + K_MAX_LENGTH.toString(16) + " bytes");
    return length | 0;
}
function SlowBuffer(length) {
    if (+length != length) length = 0;
    return Buffer.alloc(+length);
}
Buffer.isBuffer = function isBuffer(b) {
    return b != null && b._isBuffer === true && b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
    ;
};
Buffer.compare = function compare(a, b) {
    if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength);
    if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength);
    if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');
    if (a === b) return 0;
    var x = a.length;
    var y = b.length;
    for(var i = 0, len = Math.min(x, y); i < len; ++i)if (a[i] !== b[i]) {
        x = a[i];
        y = b[i];
        break;
    }
    if (x < y) return -1;
    if (y < x) return 1;
    return 0;
};
Buffer.isEncoding = function isEncoding(encoding) {
    switch(String(encoding).toLowerCase()){
        case "hex":
        case "utf8":
        case "utf-8":
        case "ascii":
        case "latin1":
        case "binary":
        case "base64":
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
            return true;
        default:
            return false;
    }
};
Buffer.concat = function concat(list, length) {
    if (!Array.isArray(list)) throw new TypeError('"list" argument must be an Array of Buffers');
    if (list.length === 0) return Buffer.alloc(0);
    var i;
    if (length === undefined) {
        length = 0;
        for(i = 0; i < list.length; ++i)length += list[i].length;
    }
    var buffer = Buffer.allocUnsafe(length);
    var pos = 0;
    for(i = 0; i < list.length; ++i){
        var buf = list[i];
        if (isInstance(buf, Uint8Array)) {
            if (pos + buf.length > buffer.length) Buffer.from(buf).copy(buffer, pos);
            else Uint8Array.prototype.set.call(buffer, buf, pos);
        } else if (!Buffer.isBuffer(buf)) throw new TypeError('"list" argument must be an Array of Buffers');
        else buf.copy(buffer, pos);
        pos += buf.length;
    }
    return buffer;
};
function byteLength(string, encoding) {
    if (Buffer.isBuffer(string)) return string.length;
    if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) return string.byteLength;
    if (typeof string !== "string") throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof string);
    var len = string.length;
    var mustMatch = arguments.length > 2 && arguments[2] === true;
    if (!mustMatch && len === 0) return 0;
    // Use a for loop to avoid recursion
    var loweredCase = false;
    for(;;)switch(encoding){
        case "ascii":
        case "latin1":
        case "binary":
            return len;
        case "utf8":
        case "utf-8":
            return utf8ToBytes(string).length;
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
            return len * 2;
        case "hex":
            return len >>> 1;
        case "base64":
            return base64ToBytes(string).length;
        default:
            if (loweredCase) return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
            ;
            encoding = ("" + encoding).toLowerCase();
            loweredCase = true;
    }
}
Buffer.byteLength = byteLength;
function slowToString(encoding, start, end) {
    var loweredCase = false;
    // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
    // property of a typed array.
    // This behaves neither like String nor Uint8Array in that we set start/end
    // to their upper/lower bounds if the value passed is out of range.
    // undefined is handled specially as per ECMA-262 6th Edition,
    // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
    if (start === undefined || start < 0) start = 0;
    // Return early if start > this.length. Done here to prevent potential uint32
    // coercion fail below.
    if (start > this.length) return "";
    if (end === undefined || end > this.length) end = this.length;
    if (end <= 0) return "";
    // Force coercion to uint32. This will also coerce falsey/NaN values to 0.
    end >>>= 0;
    start >>>= 0;
    if (end <= start) return "";
    if (!encoding) encoding = "utf8";
    while(true)switch(encoding){
        case "hex":
            return hexSlice(this, start, end);
        case "utf8":
        case "utf-8":
            return utf8Slice(this, start, end);
        case "ascii":
            return asciiSlice(this, start, end);
        case "latin1":
        case "binary":
            return latin1Slice(this, start, end);
        case "base64":
            return base64Slice(this, start, end);
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
            return utf16leSlice(this, start, end);
        default:
            if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
            encoding = (encoding + "").toLowerCase();
            loweredCase = true;
    }
}
// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true;
function swap(b, n, m) {
    var i = b[n];
    b[n] = b[m];
    b[m] = i;
}
Buffer.prototype.swap16 = function swap16() {
    var len = this.length;
    if (len % 2 !== 0) throw new RangeError("Buffer size must be a multiple of 16-bits");
    for(var i = 0; i < len; i += 2)swap(this, i, i + 1);
    return this;
};
Buffer.prototype.swap32 = function swap32() {
    var len = this.length;
    if (len % 4 !== 0) throw new RangeError("Buffer size must be a multiple of 32-bits");
    for(var i = 0; i < len; i += 4){
        swap(this, i, i + 3);
        swap(this, i + 1, i + 2);
    }
    return this;
};
Buffer.prototype.swap64 = function swap64() {
    var len = this.length;
    if (len % 8 !== 0) throw new RangeError("Buffer size must be a multiple of 64-bits");
    for(var i = 0; i < len; i += 8){
        swap(this, i, i + 7);
        swap(this, i + 1, i + 6);
        swap(this, i + 2, i + 5);
        swap(this, i + 3, i + 4);
    }
    return this;
};
Buffer.prototype.toString = function toString() {
    var length = this.length;
    if (length === 0) return "";
    if (arguments.length === 0) return utf8Slice(this, 0, length);
    return slowToString.apply(this, arguments);
};
Buffer.prototype.toLocaleString = Buffer.prototype.toString;
Buffer.prototype.equals = function equals(b) {
    if (!Buffer.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
    if (this === b) return true;
    return Buffer.compare(this, b) === 0;
};
Buffer.prototype.inspect = function inspect() {
    var str = "";
    var max = exports.INSPECT_MAX_BYTES;
    str = this.toString("hex", 0, max).replace(/(.{2})/g, "$1 ").trim();
    if (this.length > max) str += " ... ";
    return "<Buffer " + str + ">";
};
if (customInspectSymbol) Buffer.prototype[customInspectSymbol] = Buffer.prototype.inspect;
Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
    if (isInstance(target, Uint8Array)) target = Buffer.from(target, target.offset, target.byteLength);
    if (!Buffer.isBuffer(target)) throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof target);
    if (start === undefined) start = 0;
    if (end === undefined) end = target ? target.length : 0;
    if (thisStart === undefined) thisStart = 0;
    if (thisEnd === undefined) thisEnd = this.length;
    if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) throw new RangeError("out of range index");
    if (thisStart >= thisEnd && start >= end) return 0;
    if (thisStart >= thisEnd) return -1;
    if (start >= end) return 1;
    start >>>= 0;
    end >>>= 0;
    thisStart >>>= 0;
    thisEnd >>>= 0;
    if (this === target) return 0;
    var x = thisEnd - thisStart;
    var y = end - start;
    var len = Math.min(x, y);
    var thisCopy = this.slice(thisStart, thisEnd);
    var targetCopy = target.slice(start, end);
    for(var i = 0; i < len; ++i)if (thisCopy[i] !== targetCopy[i]) {
        x = thisCopy[i];
        y = targetCopy[i];
        break;
    }
    if (x < y) return -1;
    if (y < x) return 1;
    return 0;
};
// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
    // Empty buffer means no match
    if (buffer.length === 0) return -1;
    // Normalize byteOffset
    if (typeof byteOffset === "string") {
        encoding = byteOffset;
        byteOffset = 0;
    } else if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff;
    else if (byteOffset < -2147483648) byteOffset = -2147483648;
    byteOffset = +byteOffset // Coerce to Number.
    ;
    if (numberIsNaN(byteOffset)) // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : buffer.length - 1;
    // Normalize byteOffset: negative offsets start from the end of the buffer
    if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
    if (byteOffset >= buffer.length) {
        if (dir) return -1;
        else byteOffset = buffer.length - 1;
    } else if (byteOffset < 0) {
        if (dir) byteOffset = 0;
        else return -1;
    }
    // Normalize val
    if (typeof val === "string") val = Buffer.from(val, encoding);
    // Finally, search either indexOf (if dir is true) or lastIndexOf
    if (Buffer.isBuffer(val)) {
        // Special case: looking for empty string/buffer always fails
        if (val.length === 0) return -1;
        return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
    } else if (typeof val === "number") {
        val = val & 0xFF // Search for a byte value [0-255]
        ;
        if (typeof Uint8Array.prototype.indexOf === "function") {
            if (dir) return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
            else return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
        }
        return arrayIndexOf(buffer, [
            val
        ], byteOffset, encoding, dir);
    }
    throw new TypeError("val must be string, number or Buffer");
}
function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
    var indexSize = 1;
    var arrLength = arr.length;
    var valLength = val.length;
    if (encoding !== undefined) {
        encoding = String(encoding).toLowerCase();
        if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
            if (arr.length < 2 || val.length < 2) return -1;
            indexSize = 2;
            arrLength /= 2;
            valLength /= 2;
            byteOffset /= 2;
        }
    }
    function read(buf, i) {
        if (indexSize === 1) return buf[i];
        else return buf.readUInt16BE(i * indexSize);
    }
    var i1;
    if (dir) {
        var foundIndex = -1;
        for(i1 = byteOffset; i1 < arrLength; i1++)if (read(arr, i1) === read(val, foundIndex === -1 ? 0 : i1 - foundIndex)) {
            if (foundIndex === -1) foundIndex = i1;
            if (i1 - foundIndex + 1 === valLength) return foundIndex * indexSize;
        } else {
            if (foundIndex !== -1) i1 -= i1 - foundIndex;
            foundIndex = -1;
        }
    } else {
        if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
        for(i1 = byteOffset; i1 >= 0; i1--){
            var found = true;
            for(var j = 0; j < valLength; j++)if (read(arr, i1 + j) !== read(val, j)) {
                found = false;
                break;
            }
            if (found) return i1;
        }
    }
    return -1;
}
Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
    return this.indexOf(val, byteOffset, encoding) !== -1;
};
Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
    return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
};
Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
    return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
};
function hexWrite(buf, string, offset, length) {
    offset = Number(offset) || 0;
    var remaining = buf.length - offset;
    if (!length) length = remaining;
    else {
        length = Number(length);
        if (length > remaining) length = remaining;
    }
    var strLen = string.length;
    if (length > strLen / 2) length = strLen / 2;
    for(var i = 0; i < length; ++i){
        var parsed = parseInt(string.substr(i * 2, 2), 16);
        if (numberIsNaN(parsed)) return i;
        buf[offset + i] = parsed;
    }
    return i;
}
function utf8Write(buf, string, offset, length) {
    return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
}
function asciiWrite(buf, string, offset, length) {
    return blitBuffer(asciiToBytes(string), buf, offset, length);
}
function base64Write(buf, string, offset, length) {
    return blitBuffer(base64ToBytes(string), buf, offset, length);
}
function ucs2Write(buf, string, offset, length) {
    return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
}
Buffer.prototype.write = function write(string, offset, length, encoding) {
    // Buffer#write(string)
    if (offset === undefined) {
        encoding = "utf8";
        length = this.length;
        offset = 0;
    // Buffer#write(string, encoding)
    } else if (length === undefined && typeof offset === "string") {
        encoding = offset;
        length = this.length;
        offset = 0;
    // Buffer#write(string, offset[, length][, encoding])
    } else if (isFinite(offset)) {
        offset = offset >>> 0;
        if (isFinite(length)) {
            length = length >>> 0;
            if (encoding === undefined) encoding = "utf8";
        } else {
            encoding = length;
            length = undefined;
        }
    } else throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
    var remaining = this.length - offset;
    if (length === undefined || length > remaining) length = remaining;
    if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) throw new RangeError("Attempt to write outside buffer bounds");
    if (!encoding) encoding = "utf8";
    var loweredCase = false;
    for(;;)switch(encoding){
        case "hex":
            return hexWrite(this, string, offset, length);
        case "utf8":
        case "utf-8":
            return utf8Write(this, string, offset, length);
        case "ascii":
        case "latin1":
        case "binary":
            return asciiWrite(this, string, offset, length);
        case "base64":
            // Warning: maxLength not taken into account in base64Write
            return base64Write(this, string, offset, length);
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
            return ucs2Write(this, string, offset, length);
        default:
            if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
            encoding = ("" + encoding).toLowerCase();
            loweredCase = true;
    }
};
Buffer.prototype.toJSON = function toJSON() {
    return {
        type: "Buffer",
        data: Array.prototype.slice.call(this._arr || this, 0)
    };
};
function base64Slice(buf, start, end) {
    if (start === 0 && end === buf.length) return base64.fromByteArray(buf);
    else return base64.fromByteArray(buf.slice(start, end));
}
function utf8Slice(buf, start, end) {
    end = Math.min(buf.length, end);
    var res = [];
    var i = start;
    while(i < end){
        var firstByte = buf[i];
        var codePoint = null;
        var bytesPerSequence = firstByte > 0xEF ? 4 : firstByte > 0xDF ? 3 : firstByte > 0xBF ? 2 : 1;
        if (i + bytesPerSequence <= end) {
            var secondByte, thirdByte, fourthByte, tempCodePoint;
            switch(bytesPerSequence){
                case 1:
                    if (firstByte < 0x80) codePoint = firstByte;
                    break;
                case 2:
                    secondByte = buf[i + 1];
                    if ((secondByte & 0xC0) === 0x80) {
                        tempCodePoint = (firstByte & 0x1F) << 0x6 | secondByte & 0x3F;
                        if (tempCodePoint > 0x7F) codePoint = tempCodePoint;
                    }
                    break;
                case 3:
                    secondByte = buf[i + 1];
                    thirdByte = buf[i + 2];
                    if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                        tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | thirdByte & 0x3F;
                        if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) codePoint = tempCodePoint;
                    }
                    break;
                case 4:
                    secondByte = buf[i + 1];
                    thirdByte = buf[i + 2];
                    fourthByte = buf[i + 3];
                    if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                        tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | fourthByte & 0x3F;
                        if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) codePoint = tempCodePoint;
                    }
            }
        }
        if (codePoint === null) {
            // we did not generate a valid codePoint so insert a
            // replacement char (U+FFFD) and advance only 1 byte
            codePoint = 0xFFFD;
            bytesPerSequence = 1;
        } else if (codePoint > 0xFFFF) {
            // encode to utf16 (surrogate pair dance)
            codePoint -= 0x10000;
            res.push(codePoint >>> 10 & 0x3FF | 0xD800);
            codePoint = 0xDC00 | codePoint & 0x3FF;
        }
        res.push(codePoint);
        i += bytesPerSequence;
    }
    return decodeCodePointsArray(res);
}
// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000;
function decodeCodePointsArray(codePoints) {
    var len = codePoints.length;
    if (len <= MAX_ARGUMENTS_LENGTH) return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
    ;
    // Decode in chunks to avoid "call stack size exceeded".
    var res = "";
    var i = 0;
    while(i < len)res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
    return res;
}
function asciiSlice(buf, start, end) {
    var ret = "";
    end = Math.min(buf.length, end);
    for(var i = start; i < end; ++i)ret += String.fromCharCode(buf[i] & 0x7F);
    return ret;
}
function latin1Slice(buf, start, end) {
    var ret = "";
    end = Math.min(buf.length, end);
    for(var i = start; i < end; ++i)ret += String.fromCharCode(buf[i]);
    return ret;
}
function hexSlice(buf, start, end) {
    var len = buf.length;
    if (!start || start < 0) start = 0;
    if (!end || end < 0 || end > len) end = len;
    var out = "";
    for(var i = start; i < end; ++i)out += hexSliceLookupTable[buf[i]];
    return out;
}
function utf16leSlice(buf, start, end) {
    var bytes = buf.slice(start, end);
    var res = "";
    // If bytes.length is odd, the last 8 bits must be ignored (same as node.js)
    for(var i = 0; i < bytes.length - 1; i += 2)res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
    return res;
}
Buffer.prototype.slice = function slice(start, end) {
    var len = this.length;
    start = ~~start;
    end = end === undefined ? len : ~~end;
    if (start < 0) {
        start += len;
        if (start < 0) start = 0;
    } else if (start > len) start = len;
    if (end < 0) {
        end += len;
        if (end < 0) end = 0;
    } else if (end > len) end = len;
    if (end < start) end = start;
    var newBuf = this.subarray(start, end);
    // Return an augmented `Uint8Array` instance
    Object.setPrototypeOf(newBuf, Buffer.prototype);
    return newBuf;
};
/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */ function checkOffset(offset, ext, length) {
    if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
    if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
}
Buffer.prototype.readUintLE = Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength1, noAssert) {
    offset = offset >>> 0;
    byteLength1 = byteLength1 >>> 0;
    if (!noAssert) checkOffset(offset, byteLength1, this.length);
    var val = this[offset];
    var mul = 1;
    var i = 0;
    while(++i < byteLength1 && (mul *= 0x100))val += this[offset + i] * mul;
    return val;
};
Buffer.prototype.readUintBE = Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength2, noAssert) {
    offset = offset >>> 0;
    byteLength2 = byteLength2 >>> 0;
    if (!noAssert) checkOffset(offset, byteLength2, this.length);
    var val = this[offset + --byteLength2];
    var mul = 1;
    while(byteLength2 > 0 && (mul *= 0x100))val += this[offset + --byteLength2] * mul;
    return val;
};
Buffer.prototype.readUint8 = Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 1, this.length);
    return this[offset];
};
Buffer.prototype.readUint16LE = Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 2, this.length);
    return this[offset] | this[offset + 1] << 8;
};
Buffer.prototype.readUint16BE = Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 2, this.length);
    return this[offset] << 8 | this[offset + 1];
};
Buffer.prototype.readUint32LE = Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 4, this.length);
    return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 0x1000000;
};
Buffer.prototype.readUint32BE = Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 4, this.length);
    return this[offset] * 0x1000000 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
};
Buffer.prototype.readIntLE = function readIntLE(offset, byteLength3, noAssert) {
    offset = offset >>> 0;
    byteLength3 = byteLength3 >>> 0;
    if (!noAssert) checkOffset(offset, byteLength3, this.length);
    var val = this[offset];
    var mul = 1;
    var i = 0;
    while(++i < byteLength3 && (mul *= 0x100))val += this[offset + i] * mul;
    mul *= 0x80;
    if (val >= mul) val -= Math.pow(2, 8 * byteLength3);
    return val;
};
Buffer.prototype.readIntBE = function readIntBE(offset, byteLength4, noAssert) {
    offset = offset >>> 0;
    byteLength4 = byteLength4 >>> 0;
    if (!noAssert) checkOffset(offset, byteLength4, this.length);
    var i = byteLength4;
    var mul = 1;
    var val = this[offset + --i];
    while(i > 0 && (mul *= 0x100))val += this[offset + --i] * mul;
    mul *= 0x80;
    if (val >= mul) val -= Math.pow(2, 8 * byteLength4);
    return val;
};
Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 1, this.length);
    if (!(this[offset] & 0x80)) return this[offset];
    return (0xff - this[offset] + 1) * -1;
};
Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 2, this.length);
    var val = this[offset] | this[offset + 1] << 8;
    return val & 0x8000 ? val | 0xFFFF0000 : val;
};
Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 2, this.length);
    var val = this[offset + 1] | this[offset] << 8;
    return val & 0x8000 ? val | 0xFFFF0000 : val;
};
Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 4, this.length);
    return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
};
Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 4, this.length);
    return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
};
Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 4, this.length);
    return ieee754.read(this, offset, true, 23, 4);
};
Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 4, this.length);
    return ieee754.read(this, offset, false, 23, 4);
};
Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 8, this.length);
    return ieee754.read(this, offset, true, 52, 8);
};
Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 8, this.length);
    return ieee754.read(this, offset, false, 52, 8);
};
function checkInt(buf, value, offset, ext, max, min) {
    if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
    if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
    if (offset + ext > buf.length) throw new RangeError("Index out of range");
}
Buffer.prototype.writeUintLE = Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength5, noAssert) {
    value = +value;
    offset = offset >>> 0;
    byteLength5 = byteLength5 >>> 0;
    if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength5) - 1;
        checkInt(this, value, offset, byteLength5, maxBytes, 0);
    }
    var mul = 1;
    var i = 0;
    this[offset] = value & 0xFF;
    while(++i < byteLength5 && (mul *= 0x100))this[offset + i] = value / mul & 0xFF;
    return offset + byteLength5;
};
Buffer.prototype.writeUintBE = Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength6, noAssert) {
    value = +value;
    offset = offset >>> 0;
    byteLength6 = byteLength6 >>> 0;
    if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength6) - 1;
        checkInt(this, value, offset, byteLength6, maxBytes, 0);
    }
    var i = byteLength6 - 1;
    var mul = 1;
    this[offset + i] = value & 0xFF;
    while(--i >= 0 && (mul *= 0x100))this[offset + i] = value / mul & 0xFF;
    return offset + byteLength6;
};
Buffer.prototype.writeUint8 = Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
    this[offset] = value & 0xff;
    return offset + 1;
};
Buffer.prototype.writeUint16LE = Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
    this[offset] = value & 0xff;
    this[offset + 1] = value >>> 8;
    return offset + 2;
};
Buffer.prototype.writeUint16BE = Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
    this[offset] = value >>> 8;
    this[offset + 1] = value & 0xff;
    return offset + 2;
};
Buffer.prototype.writeUint32LE = Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
    this[offset + 3] = value >>> 24;
    this[offset + 2] = value >>> 16;
    this[offset + 1] = value >>> 8;
    this[offset] = value & 0xff;
    return offset + 4;
};
Buffer.prototype.writeUint32BE = Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
    this[offset] = value >>> 24;
    this[offset + 1] = value >>> 16;
    this[offset + 2] = value >>> 8;
    this[offset + 3] = value & 0xff;
    return offset + 4;
};
Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength7, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) {
        var limit = Math.pow(2, 8 * byteLength7 - 1);
        checkInt(this, value, offset, byteLength7, limit - 1, -limit);
    }
    var i = 0;
    var mul = 1;
    var sub = 0;
    this[offset] = value & 0xFF;
    while(++i < byteLength7 && (mul *= 0x100)){
        if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) sub = 1;
        this[offset + i] = (value / mul >> 0) - sub & 0xFF;
    }
    return offset + byteLength7;
};
Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength8, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) {
        var limit = Math.pow(2, 8 * byteLength8 - 1);
        checkInt(this, value, offset, byteLength8, limit - 1, -limit);
    }
    var i = byteLength8 - 1;
    var mul = 1;
    var sub = 0;
    this[offset + i] = value & 0xFF;
    while(--i >= 0 && (mul *= 0x100)){
        if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) sub = 1;
        this[offset + i] = (value / mul >> 0) - sub & 0xFF;
    }
    return offset + byteLength8;
};
Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -128);
    if (value < 0) value = 0xff + value + 1;
    this[offset] = value & 0xff;
    return offset + 1;
};
Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -32768);
    this[offset] = value & 0xff;
    this[offset + 1] = value >>> 8;
    return offset + 2;
};
Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -32768);
    this[offset] = value >>> 8;
    this[offset + 1] = value & 0xff;
    return offset + 2;
};
Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -2147483648);
    this[offset] = value & 0xff;
    this[offset + 1] = value >>> 8;
    this[offset + 2] = value >>> 16;
    this[offset + 3] = value >>> 24;
    return offset + 4;
};
Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -2147483648);
    if (value < 0) value = 0xffffffff + value + 1;
    this[offset] = value >>> 24;
    this[offset + 1] = value >>> 16;
    this[offset + 2] = value >>> 8;
    this[offset + 3] = value & 0xff;
    return offset + 4;
};
function checkIEEE754(buf, value, offset, ext, max, min) {
    if (offset + ext > buf.length) throw new RangeError("Index out of range");
    if (offset < 0) throw new RangeError("Index out of range");
}
function writeFloat(buf, value, offset, littleEndian, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -340282346638528860000000000000000000000);
    ieee754.write(buf, value, offset, littleEndian, 23, 4);
    return offset + 4;
}
Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
    return writeFloat(this, value, offset, true, noAssert);
};
Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
    return writeFloat(this, value, offset, false, noAssert);
};
function writeDouble(buf, value, offset, littleEndian, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000);
    ieee754.write(buf, value, offset, littleEndian, 52, 8);
    return offset + 8;
}
Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
    return writeDouble(this, value, offset, true, noAssert);
};
Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
    return writeDouble(this, value, offset, false, noAssert);
};
// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy(target, targetStart, start, end) {
    if (!Buffer.isBuffer(target)) throw new TypeError("argument should be a Buffer");
    if (!start) start = 0;
    if (!end && end !== 0) end = this.length;
    if (targetStart >= target.length) targetStart = target.length;
    if (!targetStart) targetStart = 0;
    if (end > 0 && end < start) end = start;
    // Copy 0 bytes; we're done
    if (end === start) return 0;
    if (target.length === 0 || this.length === 0) return 0;
    // Fatal error conditions
    if (targetStart < 0) throw new RangeError("targetStart out of bounds");
    if (start < 0 || start >= this.length) throw new RangeError("Index out of range");
    if (end < 0) throw new RangeError("sourceEnd out of bounds");
    // Are we oob?
    if (end > this.length) end = this.length;
    if (target.length - targetStart < end - start) end = target.length - targetStart + start;
    var len = end - start;
    if (this === target && typeof Uint8Array.prototype.copyWithin === "function") // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end);
    else Uint8Array.prototype.set.call(target, this.subarray(start, end), targetStart);
    return len;
};
// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill(val, start, end, encoding) {
    // Handle string cases:
    if (typeof val === "string") {
        if (typeof start === "string") {
            encoding = start;
            start = 0;
            end = this.length;
        } else if (typeof end === "string") {
            encoding = end;
            end = this.length;
        }
        if (encoding !== undefined && typeof encoding !== "string") throw new TypeError("encoding must be a string");
        if (typeof encoding === "string" && !Buffer.isEncoding(encoding)) throw new TypeError("Unknown encoding: " + encoding);
        if (val.length === 1) {
            var code = val.charCodeAt(0);
            if (encoding === "utf8" && code < 128 || encoding === "latin1") // Fast path: If `val` fits into a single byte, use that numeric value.
            val = code;
        }
    } else if (typeof val === "number") val = val & 255;
    else if (typeof val === "boolean") val = Number(val);
    // Invalid ranges are not set to a default, so can range check early.
    if (start < 0 || this.length < start || this.length < end) throw new RangeError("Out of range index");
    if (end <= start) return this;
    start = start >>> 0;
    end = end === undefined ? this.length : end >>> 0;
    if (!val) val = 0;
    var i;
    if (typeof val === "number") for(i = start; i < end; ++i)this[i] = val;
    else {
        var bytes = Buffer.isBuffer(val) ? val : Buffer.from(val, encoding);
        var len = bytes.length;
        if (len === 0) throw new TypeError('The value "' + val + '" is invalid for argument "value"');
        for(i = 0; i < end - start; ++i)this[i + start] = bytes[i % len];
    }
    return this;
};
// HELPER FUNCTIONS
// ================
var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
function base64clean(str) {
    // Node takes equal signs as end of the Base64 encoding
    str = str.split("=")[0];
    // Node strips out invalid characters like \n and \t from the string, base64-js does not
    str = str.trim().replace(INVALID_BASE64_RE, "");
    // Node converts strings with length < 2 to ''
    if (str.length < 2) return "";
    // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
    while(str.length % 4 !== 0)str = str + "=";
    return str;
}
function utf8ToBytes(string, units) {
    units = units || Infinity;
    var codePoint;
    var length = string.length;
    var leadSurrogate = null;
    var bytes = [];
    for(var i = 0; i < length; ++i){
        codePoint = string.charCodeAt(i);
        // is surrogate component
        if (codePoint > 0xD7FF && codePoint < 0xE000) {
            // last char was a lead
            if (!leadSurrogate) {
                // no lead yet
                if (codePoint > 0xDBFF) {
                    // unexpected trail
                    if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                    continue;
                } else if (i + 1 === length) {
                    // unpaired lead
                    if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                    continue;
                }
                // valid lead
                leadSurrogate = codePoint;
                continue;
            }
            // 2 leads in a row
            if (codePoint < 0xDC00) {
                if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                leadSurrogate = codePoint;
                continue;
            }
            // valid surrogate pair
            codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
        } else if (leadSurrogate) // valid bmp char, but last char was a lead
        {
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
        }
        leadSurrogate = null;
        // encode utf8
        if (codePoint < 0x80) {
            if ((units -= 1) < 0) break;
            bytes.push(codePoint);
        } else if (codePoint < 0x800) {
            if ((units -= 2) < 0) break;
            bytes.push(codePoint >> 0x6 | 0xC0, codePoint & 0x3F | 0x80);
        } else if (codePoint < 0x10000) {
            if ((units -= 3) < 0) break;
            bytes.push(codePoint >> 0xC | 0xE0, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
        } else if (codePoint < 0x110000) {
            if ((units -= 4) < 0) break;
            bytes.push(codePoint >> 0x12 | 0xF0, codePoint >> 0xC & 0x3F | 0x80, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
        } else throw new Error("Invalid code point");
    }
    return bytes;
}
function asciiToBytes(str) {
    var byteArray = [];
    for(var i = 0; i < str.length; ++i)// Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF);
    return byteArray;
}
function utf16leToBytes(str, units) {
    var c, hi, lo;
    var byteArray = [];
    for(var i = 0; i < str.length; ++i){
        if ((units -= 2) < 0) break;
        c = str.charCodeAt(i);
        hi = c >> 8;
        lo = c % 256;
        byteArray.push(lo);
        byteArray.push(hi);
    }
    return byteArray;
}
function base64ToBytes(str) {
    return base64.toByteArray(base64clean(str));
}
function blitBuffer(src, dst, offset, length) {
    for(var i = 0; i < length; ++i){
        if (i + offset >= dst.length || i >= src.length) break;
        dst[i + offset] = src[i];
    }
    return i;
}
// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance(obj, type) {
    return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
}
function numberIsNaN(obj) {
    // For IE11 support
    return obj !== obj // eslint-disable-line no-self-compare
    ;
}
// Create lookup table for `toString('hex')`
// See: https://github.com/feross/buffer/issues/219
var hexSliceLookupTable = function() {
    var alphabet = "0123456789abcdef";
    var table = new Array(256);
    for(var i = 0; i < 16; ++i){
        var i16 = i * 16;
        for(var j = 0; j < 16; ++j)table[i16 + j] = alphabet[i] + alphabet[j];
    }
    return table;
}();

},{"base64-js":"eIiSV","ieee754":"cO95r"}],"eIiSV":[function(require,module,exports) {
"use strict";
exports.byteLength = byteLength;
exports.toByteArray = toByteArray;
exports.fromByteArray = fromByteArray;
var lookup = [];
var revLookup = [];
var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
for(var i = 0, len = code.length; i < len; ++i){
    lookup[i] = code[i];
    revLookup[code.charCodeAt(i)] = i;
}
// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup["-".charCodeAt(0)] = 62;
revLookup["_".charCodeAt(0)] = 63;
function getLens(b64) {
    var len1 = b64.length;
    if (len1 % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");
    // Trim off extra bytes after placeholder bytes are found
    // See: https://github.com/beatgammit/base64-js/issues/42
    var validLen = b64.indexOf("=");
    if (validLen === -1) validLen = len1;
    var placeHoldersLen = validLen === len1 ? 0 : 4 - validLen % 4;
    return [
        validLen,
        placeHoldersLen
    ];
}
// base64 is 4/3 + up to two characters of the original data
function byteLength(b64) {
    var lens = getLens(b64);
    var validLen = lens[0];
    var placeHoldersLen = lens[1];
    return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
}
function _byteLength(b64, validLen, placeHoldersLen) {
    return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
}
function toByteArray(b64) {
    var tmp;
    var lens = getLens(b64);
    var validLen = lens[0];
    var placeHoldersLen = lens[1];
    var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
    var curByte = 0;
    // if there are placeholders, only get up to the last complete 4 chars
    var len2 = placeHoldersLen > 0 ? validLen - 4 : validLen;
    var i1;
    for(i1 = 0; i1 < len2; i1 += 4){
        tmp = revLookup[b64.charCodeAt(i1)] << 18 | revLookup[b64.charCodeAt(i1 + 1)] << 12 | revLookup[b64.charCodeAt(i1 + 2)] << 6 | revLookup[b64.charCodeAt(i1 + 3)];
        arr[curByte++] = tmp >> 16 & 0xFF;
        arr[curByte++] = tmp >> 8 & 0xFF;
        arr[curByte++] = tmp & 0xFF;
    }
    if (placeHoldersLen === 2) {
        tmp = revLookup[b64.charCodeAt(i1)] << 2 | revLookup[b64.charCodeAt(i1 + 1)] >> 4;
        arr[curByte++] = tmp & 0xFF;
    }
    if (placeHoldersLen === 1) {
        tmp = revLookup[b64.charCodeAt(i1)] << 10 | revLookup[b64.charCodeAt(i1 + 1)] << 4 | revLookup[b64.charCodeAt(i1 + 2)] >> 2;
        arr[curByte++] = tmp >> 8 & 0xFF;
        arr[curByte++] = tmp & 0xFF;
    }
    return arr;
}
function tripletToBase64(num) {
    return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
}
function encodeChunk(uint8, start, end) {
    var tmp;
    var output = [];
    for(var i2 = start; i2 < end; i2 += 3){
        tmp = (uint8[i2] << 16 & 0xFF0000) + (uint8[i2 + 1] << 8 & 0xFF00) + (uint8[i2 + 2] & 0xFF);
        output.push(tripletToBase64(tmp));
    }
    return output.join("");
}
function fromByteArray(uint8) {
    var tmp;
    var len3 = uint8.length;
    var extraBytes = len3 % 3 // if we have 1 byte left, pad 2 bytes
    ;
    var parts = [];
    var maxChunkLength = 16383 // must be multiple of 3
    ;
    // go through the array every three bytes, we'll deal with trailing stuff later
    for(var i3 = 0, len2 = len3 - extraBytes; i3 < len2; i3 += maxChunkLength)parts.push(encodeChunk(uint8, i3, i3 + maxChunkLength > len2 ? len2 : i3 + maxChunkLength));
    // pad the end with zeros, but make sure to not forget the extra bytes
    if (extraBytes === 1) {
        tmp = uint8[len3 - 1];
        parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 0x3F] + "==");
    } else if (extraBytes === 2) {
        tmp = (uint8[len3 - 2] << 8) + uint8[len3 - 1];
        parts.push(lookup[tmp >> 10] + lookup[tmp >> 4 & 0x3F] + lookup[tmp << 2 & 0x3F] + "=");
    }
    return parts.join("");
}

},{}],"cO95r":[function(require,module,exports) {
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */ exports.read = function(buffer, offset, isLE, mLen, nBytes) {
    var e, m;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var nBits = -7;
    var i = isLE ? nBytes - 1 : 0;
    var d = isLE ? -1 : 1;
    var s = buffer[offset + i];
    i += d;
    e = s & (1 << -nBits) - 1;
    s >>= -nBits;
    nBits += eLen;
    for(; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);
    m = e & (1 << -nBits) - 1;
    e >>= -nBits;
    nBits += mLen;
    for(; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);
    if (e === 0) e = 1 - eBias;
    else if (e === eMax) return m ? NaN : (s ? -1 : 1) * Infinity;
    else {
        m = m + Math.pow(2, mLen);
        e = e - eBias;
    }
    return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};
exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
    var e, m, c;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
    var i = isLE ? 0 : nBytes - 1;
    var d = isLE ? 1 : -1;
    var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
    value = Math.abs(value);
    if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0;
        e = eMax;
    } else {
        e = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c = Math.pow(2, -e)) < 1) {
            e--;
            c *= 2;
        }
        if (e + eBias >= 1) value += rt / c;
        else value += rt * Math.pow(2, 1 - eBias);
        if (value * c >= 2) {
            e++;
            c /= 2;
        }
        if (e + eBias >= eMax) {
            m = 0;
            e = eMax;
        } else if (e + eBias >= 1) {
            m = (value * c - 1) * Math.pow(2, mLen);
            e = e + eBias;
        } else {
            m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
            e = 0;
        }
    }
    for(; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);
    e = e << mLen | m;
    eLen += mLen;
    for(; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);
    buffer[offset + i - d] |= s * 128;
};

},{}]},["gWJjf","aNB2k"], "aNB2k", "parcelRequire41de")

//# sourceMappingURL=index.384ad77c.js.map

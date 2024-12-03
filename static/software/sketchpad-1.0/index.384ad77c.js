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
var _saveAsJs = require("../inc/saveAs.js");
const init = {
    "canvas": function(w, h, u) {
        gui_swatch.id = "CO";
        function z(n) {
            return Math.floor(Math.random() * n);
        }
        $("ctx_box").width = canvas.W = w;
        $("ctx_box").height = canvas.H = h;
        crop.apply({
            X: 0,
            Y: 0
        }, {
            X: w,
            Y: h
        });
        if (isNaN(vars.winW) || isNaN(vars.winH)) {
            vars.winW = parseInt(canvas.W);
            vars.winH = parseInt(canvas.H);
        }
        if (u) {
            const img = new Image();
            img.src = u;
            img.onload = function() {
                const c = $2D("ctx_box");
                co.del(c);
                c.drawImage(img, 0, 0, canvas.W, canvas.H);
            };
        } else {
            var a = {
                X: 0,
                Y: 0
            }, b = {
                X: w,
                Y: h
            }, c1 = $2D("ctx_box");
            c1.rect(0, 0, w, h);
            co.gradient(a, b, c1, vars.GD[z(vars.GD.length)], "fill", 1);
        }
    },
    "content": function() {
        //Windows
        if (vars.winMax === 1) win_size.max();
        else if (!isNaN(vars.winW)) win_size.fu({
            W: zero(vars.winW),
            H: zero(vars.winH)
        }, win_size.construct({}));
        else canvas.resize(700, 575);
        init.canvas(700, 575);
        gui.options();
        gui_tools.imageMap();
        //Interface
        gui_palette.update("stroke");
        gui_palette.update("fill");
        gui_palette.zindex(vars.id);
        crop.ratio_mk();
        gui_color.mk();
        gui_gradient.mk();
        gui_pattern.mk();
        gui_swatch.mk();
        win.feed();
        gui_tools.imageCurrent(vars.tool);
        canvas.mode_sw(vars.mode = vars.mode ? vars.mode : "paint");
        canvas.history_mk();
        init.events();
    },
    "events": function() {
        //Canvas
        var o = $("cBound");
        o.oncontextmenu = function(e) {
            if (({
                "zoom": 1,
                "path": 1,
                "shape": 1,
                "marquee": 1
            })[vars.type]) return false;
        };
        o.ondblclick = function(e) {
            if (vars.type === "text") noMove();
        };
        o.onmousemove = function(event) {
            if (stop) {
                if (({
                    "marquee": 1,
                    "text": 1,
                    "crop": 1
                })[vars.type]) mouse.cursor(event, this);
                if (vars.type === "picker") {
                    const a = XY(event);
                    a.X -= abPos(this).X;
                    a.Y -= abPos(this).Y;
                    a.X = Math.max(0, Math.min(canvas.W - 1, a.X));
                    a.Y = Math.max(0, Math.min(canvas.H - 1, a.Y));
                    picker.core(a, "", "move");
                }
            }
        };
        o.onmousedown = function(event) {
            event.preventDefault();
            event.stopPropagation();
            if (vars.type === "crop") co.core(event, crop.core);
            else if (vars.type === "fill") co.core(event, draw.fill);
            else if (vars.type === "marquee") co.core(event, marquee.core);
            else if (vars.type === "picker") {
                const a = XY(event);
                a.X -= abPos(this).X;
                a.Y -= abPos(this).Y;
                a.X = Math.max(0, Math.min(canvas.W - 1, a.X));
                a.Y = Math.max(0, Math.min(canvas.H - 1, a.Y));
                picker.core(a, a, "down", event);
            } else if (vars.type === "shape") co.core(event, draw.shape);
            else if (vars.type === "text") co.core(event, draw.text);
            else if (({
                "calligraphy": 1,
                "stamp": 1
            })[vars.type]) {
                if (stamp.loaded) co.core(event, draw[vars.type]);
                else noMove();
            } else if (vars.type === "spirograph") co.core(event, draw.spirograph);
            else if (({
                "brush": 1,
                "pencil": 1,
                "eraser": 1
            })[vars.type]) co.core(event, draw[vars.type]);
            else return noMove();
            return false;
        };
        o.onmouseout = function(e) {
            if (stop) {
                if (vars.type === "picker") {
                    const a = XY(e);
                    a.X -= abPos(this).X;
                    a.Y -= abPos(this).Y;
                    a.X = Math.max(0, Math.min(canvas.W - 1, a.X));
                    a.Y = Math.max(0, Math.min(canvas.H - 1, a.Y));
                    picker.core(a);
                }
            }
        };
        //Mouse Wheel
        var o = {
            "stamp": $C("MM", "options"),
            "hi": $C("MM", "history"),
            "CO": $C("CO", "swatch"),
            "GD": $C("GD", "swatch"),
            "PT": $C("PT", "swatch")
        };
        function addWheel(id) {
            Event.add(o[id][0], {
                el: "DOMMouseScroll",
                e: "onmousewheel"
            }, function(event) {
                gui.Y.id = id;
                gui.Y.wheel(event);
                event.preventDefault();
            });
        }
        for(var i in o)addWheel(i);
        //Window CoreXY
        var o = $C("gui", document.body);
        for(var i = 0; i < o.length; i++){
            if (o[i].onmousedown) continue;
            Event.add(o[i], {
                el: "mousedown",
                e: "onmousedown"
            }, function(event) {
                core.fu(this.id, event, {
                    fu: core.win,
                    Y1: 19,
                    z: true
                });
            });
        }
    },
    "images": function() {
        const dir = "media/gui/";
        window.op_8x8 = new Image();
        op_8x8.src = dir + "op_8x8.gif";
        window.path = {
            point: new Image(),
            node_select: new Image()
        };
        path.point.src = dir + "point.png";
        path.node_select.src = dir + "node_select.png";
    },
    "swatch": function() {
        const rand = N.rand;
        init.images();
        if (typeof ScreenMetrics == "function") $.metrics = ScreenMetrics();
        function PT(v, n) {
            var n = vars.PT.length;
            let random;
            if (vars["PT*"] === "Squidfingers") random = Math.random() > .5 ? "82" : "105";
            else random = rand(n);
            window.src = `${gui_pattern.dir + vars["PT*"]}/${gui_swatch.n[v + "PT"] = random}-live.jpg`;
            gui_pattern.o[v].src = src;
            vars[v + "PT"].src = src;
            gui_swatch.n[`${v}PT`] = n - gui_swatch.n[`${v}PT`];
        }
        function CO(v) {
            const n = vars[v].length, a = rand(n), z = rand(n);
            vars[`fill${v}`] = vars[v][a];
            gui_swatch.n[`fill${v}`] = a + 1;
            vars[`stroke${v}`] = vars[v][z];
            gui_swatch.n[`stroke${v}`] = z + 1;
        }
        vars.CO = Q.CO[vars["CO*"]];
        vars.GD = Q.GD[vars["GD*"]];
        vars.PT = Q.PT[vars["PT*"]];
        CO("CO");
        CO("GD");
        PT("fill");
        PT("stroke");
        gui_pattern.o.fill.onload = function() {
            if (gui_pattern.o.stroke.loaded) init.content();
            gui_pattern.o.fill.loaded = 1;
        };
        gui_pattern.o.stroke.onload = function() {
            if (gui_pattern.o.fill.loaded) init.content();
            gui_pattern.o.stroke.loaded = 1;
        };
    }
};
const ants = [];
const ants_n = 0;
window.onresize = win.feed;
window.currentBlob = null;
window.currentPort = null;
window.saveDrawing = function() {
    $("ctx_box").toBlob((blob)=>{
        saveAs(blob, "drawing.png");
    });
};
window.addEventListener("DOMContentLoaded", ()=>{
    dtx2D = document.createElement("canvas");
    ctx2D = dtx2D.getContext("2d");
    init.swatch();
    data2pattern(ants, [
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAMklEQVQYlYXOtw0AMAzEQO6/NN04QAlW+cdCAALmOzsftGjAHGRUX9DhDSbcNmMJuocXA4afYTYwTaEAAAAASUVORK5CYII=",
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAMklEQVQYlYXPsQ0AMAjEQO+/tFOkIALxQaI6FwDgu334YAUL3iCgQ/tNJFQr2L4hoeoBA4afYdiStBMAAAAASUVORK5CYII=",
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAMklEQVQYlWP4DwUMDAwoGC6OTxIqh1sSQwEWSYQCHJIQBXgk/2PIoruJAZ/k/////wMAA4afYVpnmEkAAAAASUVORK5CYII=",
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAALUlEQVQYlWP4jwYYGBhQMT7J////IxRgk4QrwCUJlcMtiaEAh4PxSkIU4PMqAAOGn2Gql3FAAAAAAElFTkSuQmCC"
    ]);
});
///------  PARTS OF LIBRARIES
window.Color = {};
Color.HEX_STRING = function(o) {
    let z = o.toString(16), n = z.length;
    while(n < 6){
        z = "0" + z;
        n++;
    }
    return z;
};
Color.RGB_HSV = function(o) {
    const _R = o.R / 255, _G = o.G / 255, _B = o.B / 255;
    const min = Math.min(_R, _G, _B), max = Math.max(_R, _G, _B), D = max - min;
    let H, S, V;
    V = max;
    if (D === 0) {
        H = 0;
        S = 0;
    } else {
        S = D / max;
        const DR = ((max - _R) / 6 + D / 2) / D;
        const DG = ((max - _G) / 6 + D / 2) / D;
        const DB = ((max - _B) / 6 + D / 2) / D;
        if (_R === max) H = DB - DG;
        else if (_G === max) H = 1 / 3 + DR - DB;
        else if (_B === max) H = 2 / 3 + DG - DR;
        if (H < 0) H += 1;
        if (H > 1) H -= 1;
    }
    return {
        H: H * 360,
        S: S * 100,
        V: V * 100
    };
};
Color.HSV_RGB = function(o) {
    let H = o.H / 360;
    const S = o.S / 100;
    let V = o.V / 100, R, G, B;
    if (S === 0) R = G = B = Math.round(V * 255);
    else {
        if (H >= 1) H = 0;
        H = 6 * H;
        const D = H - Math.floor(H);
        const A = Math.round(255 * V * (1 - S));
        B = Math.round(255 * V * (1 - S * D));
        const C = Math.round(255 * V * (1 - S * (1 - D)));
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
        B: B
    };
};

},{"../inc/saveAs.js":"2VnT6"}],"2VnT6":[function(require,module,exports) {
/**
 * @license -------------------------------------------------------------------
 *    module: FileSaver.js (2016-06-16)
 *       src: https://github.com/eligrey/FileSaver.js
 * copyright: (c) 2011 Eli Grey <http://eligrey.com>
 *   license: MIT
 */ var saveAs = saveAs || function(view) {
    "use strict";
    // IE <10 is explicitly unsupported
    if (typeof view === "undefined" || typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) return;
    var doc = view.document, get_URL = function() {
        return view.URL || view.webkitURL || view;
    }, save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a"), can_use_save_link = "download" in save_link, click = function(node) {
        var event = new MouseEvent("click");
        node.dispatchEvent(event);
    }, is_safari = /constructor/i.test(view.HTMLElement) || view.safari, is_chrome_ios = /CriOS\/[\d]+/.test(navigator.userAgent), throw_outside = function(ex) {
        (view.setImmediate || view.setTimeout)(function() {
            throw ex;
        }, 0);
    }, force_saveable_type = "application/octet-stream", arbitrary_revoke_timeout = 40000 // in ms
    , revoke = function(file) {
        var revoker = function() {
            if (typeof file === "string") get_URL().revokeObjectURL(file);
            else file.remove();
        };
        setTimeout(revoker, arbitrary_revoke_timeout);
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
    }, auto_bom = function(blob) {
        // prepend BOM for UTF-8 XML and text/* types (including HTML)
        // note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
        if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) return new Blob([
            String.fromCharCode(0xFEFF),
            blob
        ], {
            type: blob.type
        });
        return blob;
    }, FileSaver = function(blob, name, no_auto_bom) {
        if (!no_auto_bom) blob = auto_bom(blob);
        // First try a.download, then web filesystem, then object URLs
        var filesaver = this, type = blob.type, force = type === force_saveable_type, object_url, dispatch_all = function() {
            dispatch(filesaver, "writestart progress write writeend".split(" "));
        }, fs_error = function() {
            if ((is_chrome_ios || force && is_safari) && view.FileReader) {
                // Safari doesn't allow downloading of blob urls
                var reader = new FileReader();
                reader.onloadend = function() {
                    var url = is_chrome_ios ? reader.result : reader.result.replace(/^data:[^;]*;/, "data:attachment/file;");
                    var popup = view.open(url, "_blank");
                    if (!popup) view.location.href = url;
                    url = undefined; // release reference before dispatching
                    filesaver.readyState = filesaver.DONE;
                    dispatch_all();
                };
                reader.readAsDataURL(blob);
                filesaver.readyState = filesaver.INIT;
                return;
            }
            // don't create more object URLs than needed
            if (!object_url) object_url = get_URL().createObjectURL(blob);
            if (force) view.location.href = object_url;
            else {
                var opened = view.open(object_url, "_blank");
                if (!opened) // Apple does not allow window.open, see
                // https://developer.apple.com/library/safari/documentation/Tools/Conceptual/SafariExtensionGuide/WorkingwithWindowsandTabs/WorkingwithWindowsandTabs.html
                view.location.href = object_url;
            }
            filesaver.readyState = filesaver.DONE;
            dispatch_all();
            revoke(object_url);
        };
        filesaver.readyState = filesaver.INIT;
        if (can_use_save_link) {
            object_url = get_URL().createObjectURL(blob);
            setTimeout(function() {
                save_link.href = object_url;
                save_link.download = name;
                click(save_link);
                dispatch_all();
                revoke(object_url);
                filesaver.readyState = filesaver.DONE;
            });
            return;
        }
        fs_error();
    }, FS_proto = FileSaver.prototype, saveAs1 = function(blob, name, no_auto_bom) {
        return new FileSaver(blob, name || blob.name || "download", no_auto_bom);
    };
    // IE 10+ (native saveAs)
    if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) return function(blob, name, no_auto_bom) {
        name = name || blob.name || "download";
        if (!no_auto_bom) blob = auto_bom(blob);
        return navigator.msSaveOrOpenBlob(blob, name);
    };
    FS_proto.abort = function() {};
    FS_proto.readyState = FS_proto.INIT = 0;
    FS_proto.WRITING = 1;
    FS_proto.DONE = 2;
    FS_proto.error = FS_proto.onwritestart = FS_proto.onprogress = FS_proto.onwrite = FS_proto.onabort = FS_proto.onerror = FS_proto.onwriteend = null;
    return saveAs1;
}(typeof self !== "undefined" && self || typeof window !== "undefined" && window || this.content);
// `self` is undefined in Firefox for Android content script context
// while `this` is nsIContentFrameMessageManager
// with an attribute `content` that corresponds to the window
window.saveAs = saveAs;

},{}]},["gWJjf","aNB2k"], "aNB2k", "parcelRequire0aef")

//# sourceMappingURL=index.384ad77c.js.map

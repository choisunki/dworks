/*! dworks v1.0.0 */
var DWorks = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod3) => __copyProps(__defProp({}, "__esModule", { value: true }), mod3);

  // src/index.js
  var index_exports = {};
  __export(index_exports, {
    calcAspectPad: () => calcAspectPad,
    controlVideo: () => controlVideo,
    create: () => create,
    default: () => index_default,
    icons: () => defaultIcons,
    vdoTag: () => vdoTag,
    video: () => video_default
  });

  // src/modules/video.js
  var rootGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
  function extend(target, src) {
    target = target || {};
    src = src || {};
    for (var k in src) {
      if (Object.prototype.hasOwnProperty.call(src, k)) target[k] = src[k];
    }
    return target;
  }
  function q(sel, root) {
    try {
      return (root || document).querySelector(sel);
    } catch (e) {
      return null;
    }
  }
  function qa(sel, root) {
    try {
      return (root || document).querySelectorAll(sel);
    } catch (e) {
      return [];
    }
  }
  function isVideo(el) {
    return el && el.tagName === "VIDEO";
  }
  function reportPlayBlocked(videoEl, hooks, err) {
    hooks = hooks || {};
    try {
      var errName = err && err.name ? err.name : "Error";
      var errMsg = err && err.message ? err.message : String(err || "");
      console.warn("[DWorksVideo] \uC7AC\uC0DD \uC2E4\uD328:", errName, errMsg);
    } catch (e1) {
    }
    if (hooks.log) {
      try {
        console.info("[DWorksVideo][debug] play-blocked detail:", {
          video: videoEl,
          error: err || null
        });
      } catch (e1_1) {
      }
    }
    if (typeof hooks.onPlaybackBlocked === "function") {
      try {
        hooks.onPlaybackBlocked({
          video: videoEl,
          error: err || null,
          reason: "play_blocked"
        });
      } catch (e2) {
      }
    }
    if (typeof rootGlobal.CustomEvent === "function") {
      try {
        var evt = new CustomEvent("dworks-video:play-blocked", {
          detail: {
            video: videoEl,
            error: err || null,
            reason: "play_blocked"
          }
        });
        document.dispatchEvent(evt);
      } catch (e3) {
      }
    }
  }
  function syncVctrlA11yByVid(vid) {
    if (!vid) return;
    var el = document.getElementById(vid);
    if (!isVideo(el)) return;
    var muted = !!el.muted;
    var ctrls = qa('.ctrl[data-target="' + vid + '"]');
    if (!ctrls || !ctrls.length) return;
    for (var i = 0; i < ctrls.length; i++) {
      var ctrl = ctrls[i];
      if (ctrl.classList) {
        if (muted) ctrl.classList.add("muted");
        else ctrl.classList.remove("muted");
      }
      try {
        ctrl.setAttribute("aria-label", "\uBE44\uB514\uC624 \uBCFC\uB968 \uC81C\uC5B4");
      } catch (e1) {
      }
      var offBtn = ctrl.querySelector(".vctrl-volume-off");
      var onBtn = ctrl.querySelector(".vctrl-volume-on");
      var status = ctrl.querySelector(".vctrl-status");
      if (offBtn) {
        try {
          offBtn.setAttribute("aria-hidden", String(!muted));
          offBtn.setAttribute("tabindex", muted ? "0" : "-1");
        } catch (e2) {
        }
      }
      if (onBtn) {
        try {
          onBtn.setAttribute("aria-hidden", String(muted));
          onBtn.setAttribute("tabindex", muted ? "-1" : "0");
        } catch (e3) {
        }
      }
      if (status) status.textContent = muted ? "\uD604\uC7AC \uC74C\uC18C\uAC70 \uC0C1\uD0DC" : "\uD604\uC7AC \uBCFC\uB968 \uCF1C\uC9D0 \uC0C1\uD0DC";
    }
  }
  function setVideoVolumeByVid(vid, enableSound, hooks) {
    if (!vid) return;
    var el = document.getElementById(vid);
    if (!isVideo(el)) return;
    el.muted = !enableSound;
    if (enableSound && el.paused) controlVideo(el, true, hooks);
    syncVctrlA11yByVid(vid);
  }
  var globalCtrlDelegation = {
    bound: false,
    refs: 0,
    handler: null
  };
  function bindGlobalVideoCtrls() {
    if (globalCtrlDelegation.bound) {
      globalCtrlDelegation.refs += 1;
      return;
    }
    globalCtrlDelegation.handler = function(e) {
      var btn = e.target && e.target.closest ? e.target.closest(".ctrl .vctrl") : null;
      if (!btn) return;
      if (e.preventDefault) e.preventDefault();
      var ctrl = btn.closest ? btn.closest(".ctrl") : null;
      if (!ctrl) return;
      var vid = ctrl.getAttribute("data-target");
      var action = btn.getAttribute("data-action");
      if (!vid) return;
      setVideoVolumeByVid(vid, action === "unmute");
    };
    document.addEventListener("click", globalCtrlDelegation.handler, false);
    globalCtrlDelegation.bound = true;
    globalCtrlDelegation.refs = 1;
  }
  function unbindGlobalVideoCtrls() {
    if (!globalCtrlDelegation.bound) return;
    globalCtrlDelegation.refs -= 1;
    if (globalCtrlDelegation.refs > 0) return;
    try {
      document.removeEventListener("click", globalCtrlDelegation.handler, false);
    } catch (e) {
    }
    globalCtrlDelegation.handler = null;
    globalCtrlDelegation.bound = false;
    globalCtrlDelegation.refs = 0;
  }
  function calcAspectPad(ratio) {
    var fallback = "56.25%";
    var src = String(ratio || "16/9");
    var m = src.match(/^\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*$/);
    if (!m) return fallback;
    var w = parseFloat(m[1]);
    var h = parseFloat(m[2]);
    if (!isFinite(w) || !isFinite(h) || w <= 0 || h <= 0) return fallback;
    var pct = h / w * 100;
    if (!isFinite(pct) || pct <= 0) return fallback;
    return pct.toFixed(2) + "%";
  }
  function controlVideo(videoEl, shouldPlay, hooks) {
    if (!videoEl) return;
    if (shouldPlay) {
      if (!videoEl.paused && !videoEl.ended) return;
      try {
        var p = videoEl.play();
        if (p && typeof p.catch === "function") {
          p.catch(function(err) {
            reportPlayBlocked(videoEl, hooks, err);
          });
        }
      } catch (e) {
        reportPlayBlocked(videoEl, hooks, e);
      }
      return;
    }
    try {
      if (!videoEl.paused) videoEl.pause();
    } catch (e2) {
    }
  }
  var defaultIcons = {
    volume_on: [
      '<svg class="ico ico-volume-on" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">',
      '  <path d="M11 5L6.5 9H3v6h3.5L11 19V5z" fill="currentColor"/>',
      '  <path d="M14.5 8.5a1 1 0 0 1 1.4-.1 6 6 0 0 1 0 7.2 1 1 0 1 1-1.5-1.2 4 4 0 0 0 0-4.8 1 1 0 0 1 .1-1.1z" fill="currentColor"/>',
      '  <path d="M16.8 6.2a1 1 0 0 1 1.4-.1 9 9 0 0 1 0 11.8 1 1 0 1 1-1.5-1.2 7 7 0 0 0 0-9.2 1 1 0 0 1 .1-1.3z" fill="currentColor"/>',
      "</svg>"
    ].join(""),
    volume_off: [
      '<svg class="ico ico-volume-off" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">',
      '  <path d="M11 5L6.5 9H3v6h3.5L11 19V5z" fill="currentColor"/>',
      '  <path d="M14.2 9.2a1 1 0 0 1 1.4 0l1.8 1.8 1.8-1.8a1 1 0 1 1 1.4 1.4L18.8 12l1.8 1.8a1 1 0 1 1-1.4 1.4L17.4 13.4l-1.8 1.8a1 1 0 1 1-1.4-1.4L16 12l-1.8-1.8a1 1 0 0 1 0-1z" fill="currentColor"/>',
      "</svg>"
    ].join("")
  };
  function vdoTag(vdoPath, opts, icons) {
    var defaults = {
      vid: "",
      controls: false,
      muted: true,
      autoplay: true,
      playsinline: true,
      loop: true,
      vctrl: true,
      preload: opts && (opts.play_on_enter || opts.pause_on_leave) ? "metadata" : "auto",
      wrapClass: "vdo__wrap",
      a11yLabel: "\uBE0C\uB79C\uB4DC \uC601\uC0C1",
      ratio: "16/9",
      fit: "cover",
      // cover|contain
      poster: ""
      // URL
    };
    var o = extend(extend({}, defaults), opts || {});
    icons = icons || defaultIcons;
    var ratio = String(o.ratio || "16/9");
    var arPad = calcAspectPad(ratio);
    if (!ratio.match(/^\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*$/)) {
      ratio = "16/9";
      arPad = "56.25%";
    }
    var fit = String(o.fit || "cover").toLowerCase();
    if (fit !== "contain") fit = "cover";
    var wrapStyle = "--ar:" + ratio + ";--ar-pad:" + arPad + ";--fit:" + fit + ";";
    if (o.vctrl && !o.vid) {
      o.vid = "vdo_" + (/* @__PURE__ */ new Date()).getTime() + "_" + Math.floor(Math.random() * 1e5);
    }
    var attrs = [
      o.vid ? 'id="' + o.vid + '"' : "",
      'src="' + vdoPath + '"',
      o.preload ? 'preload="' + o.preload + '"' : "",
      o.poster ? 'poster="' + o.poster + '"' : "",
      o.controls ? "controls" : "",
      o.muted ? "muted" : "",
      o.autoplay ? "autoplay" : "",
      o.loop ? "loop" : "",
      o.playsinline ? "playsinline" : ""
    ].filter(function(v) {
      return v !== "";
    }).join(" ");
    var vctrlHtml = "";
    if (o.vctrl) {
      var mutedClass = o.muted ? " muted" : "";
      var target = o.vid;
      vctrlHtml = [
        '<div class="ctrl' + mutedClass + '" data-target="' + target + '" role="group" aria-label="\uBE44\uB514\uC624 \uBCFC\uB968 \uC81C\uC5B4">',
        '  <button type="button" class="vctrl vctrl-volume-off" data-action="unmute" aria-label="\uBCFC\uB968 \uCF1C\uAE30" aria-controls="' + target + '">',
        '    <span class="vctrl-popover" role="tooltip">\uBCFC\uB968 \uCF1C\uAE30</span>',
        icons.volume_on || "ON",
        "  </button>",
        '  <button type="button" class="vctrl vctrl-volume-on" data-action="mute" aria-label="\uBCFC\uB968 \uB044\uAE30" aria-controls="' + target + '">',
        '    <span class="vctrl-popover" role="tooltip">\uBCFC\uB968 \uB044\uAE30</span>',
        icons.volume_off || "OFF",
        "  </button>",
        '  <span class="sr-only vctrl-status" aria-live="polite" aria-atomic="true"></span>',
        "</div>"
      ].join("");
    }
    return [
      '<div class="' + o.wrapClass + '" style="' + wrapStyle + '">',
      '  <span class="vdo__spacer" aria-hidden="true"></span>',
      "  <video " + attrs + ' class="video" aria-label="' + o.a11yLabel + '"></video>',
      vctrlHtml,
      "</div>"
    ].join("");
  }
  function create(options) {
    var cfg = extend({
      vdos: [],
      icons: null,
      log: false,
      viewportChecker: null
    }, options || {});
    var state = {
      _vctrlBound: false,
      _vdoObserver: null,
      _vdoMap: null
    };
    function info() {
      if (!cfg.log) return;
      try {
        console.info.apply(console, arguments);
      } catch (e) {
      }
    }
    function debugInfo(label, detail) {
      if (!cfg.log) return;
      try {
        console.info(label, detail);
      } catch (e) {
      }
    }
    function coreError(message, detail) {
      try {
        console.error(message);
      } catch (e0) {
      }
      if (!cfg.log || typeof detail === "undefined") return;
      debugInfo("[DWorksVideo][debug] detail:", detail);
    }
    function syncVctrlA11y(vid) {
      syncVctrlA11yByVid(vid);
    }
    function vdoVolume(vid, enableSound) {
      setVideoVolumeByVid(vid, enableSound, {
        log: cfg.log,
        onPlaybackBlocked: cfg.onPlaybackBlocked
      });
    }
    function bindVideoCtrls() {
      if (state._vctrlBound) return;
      state._vctrlBound = true;
      bindGlobalVideoCtrls();
    }
    function bindVideoVisibility(list) {
      if (!list || !list.length) return;
      var hasIO = typeof rootGlobal.IntersectionObserver === "function";
      if (!hasIO) {
        var vc = cfg.viewportChecker;
        if (!vc || !vc.enabled || !vc.$) return;
        var $ = vc.$;
        var pluginName = vc.pluginName || "viewportChecker";
        for (var i = 0; i < list.length; i++) {
          var item = list[i];
          if (!item || !item.mount) continue;
          if (!item.play_on_enter && !item.pause_on_leave) continue;
          var observeSel0 = item.observe || item.mount;
          var $observe0 = $(observeSel0);
          var $mount0 = $(item.mount);
          if (!$observe0.length || !$mount0.length) continue;
          var $video0 = $mount0.find("video").first();
          if (!$video0.length) continue;
          (function(observeEl, videoEl, opt) {
            try {
              $(observeEl)[pluginName]({
                repeat: true,
                callbackFunction: function(elem, action) {
                  if (action === "add") {
                    if (opt.play_on_enter) {
                      controlVideo(videoEl, true, {
                        log: cfg.log,
                        onPlaybackBlocked: cfg.onPlaybackBlocked
                      });
                    }
                  } else {
                    if (opt.pause_on_leave) controlVideo(videoEl, false);
                  }
                }
              });
            } catch (e) {
            }
          })($observe0.get(0), $video0.get(0), item);
        }
        return;
      }
      if (state._vdoObserver) {
        try {
          state._vdoObserver.disconnect();
        } catch (e1) {
        }
        state._vdoObserver = null;
      }
      state._vdoMap = /* @__PURE__ */ new WeakMap();
      var thresholds = [0, 0.01, 0.1, 0.25, 0.35, 0.5, 0.75, 1];
      var observer = new IntersectionObserver(function(entries) {
        for (var k = 0; k < entries.length; k++) {
          var entry = entries[k];
          var meta = state._vdoMap.get(entry.target);
          if (!meta) continue;
          var videoEl = meta.videoEl;
          var opt = meta.opt || {};
          var threshold = typeof opt.view_threshold === "number" ? opt.view_threshold : 0.35;
          var isIn = entry.isIntersecting && entry.intersectionRatio >= threshold;
          if (isIn) {
            if (opt.play_on_enter) {
              controlVideo(videoEl, true, {
                log: cfg.log,
                onPlaybackBlocked: cfg.onPlaybackBlocked
              });
            }
          } else {
            if (opt.pause_on_leave) controlVideo(videoEl, false);
          }
        }
      }, { threshold: thresholds });
      state._vdoObserver = observer;
      for (var i2 = 0; i2 < list.length; i2++) {
        var item2 = list[i2];
        if (!item2 || !item2.mount) continue;
        if (!item2.play_on_enter && !item2.pause_on_leave) continue;
        var observeSel = item2.observe || item2.mount;
        var elObserve = q(observeSel);
        if (!elObserve) continue;
        var elMount = q(item2.mount);
        if (!elMount) continue;
        var video = elMount.querySelector("video");
        if (!video) continue;
        state._vdoMap.set(elObserve, { videoEl: video, opt: item2 });
        observer.observe(elObserve);
      }
    }
    function init() {
      var list = cfg.vdos || [];
      var icons = cfg.icons || defaultIcons;
      for (var i = 0; i < list.length; i++) {
        var item = list[i];
        if (!item || !item.mount) continue;
        var vdoPath = item.url;
        if (!vdoPath) {
          coreError(
            "[DWorksVideo] \uBE44\uB514\uC624 \uACBD\uB85C(url)\uAC00 \uB204\uB77D\uB418\uC5C8\uC2B5\uB2C8\uB2E4. index: " + i,
            { index: i, item }
          );
          continue;
        }
        var html = vdoTag(vdoPath, item, icons);
        if (item.vctrl !== false && !item.vid) {
          try {
            var m = String(html || "").match(/<video\s+[^>]*id=\"([^\"]+)\"/i);
            if (m && m[1]) item.vid = m[1];
          } catch (e_vid) {
          }
        }
        var mountEl = q(item.mount);
        if (mountEl) {
          mountEl.innerHTML = html;
        } else {
          coreError(
            "[DWorksVideo] \uC5D8\uB9AC\uBA3C\uD2B8\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. mount: " + item.mount,
            { index: i, mount: item.mount, item }
          );
        }
        if (item.vid) syncVctrlA11y(item.vid);
      }
      bindVideoCtrls();
      bindVideoVisibility(list);
      info("[DWorksVideo] init ok");
      return api;
    }
    function destroy() {
      if (state._vdoObserver) {
        try {
          state._vdoObserver.disconnect();
        } catch (e) {
        }
        state._vdoObserver = null;
      }
      state._vdoMap = null;
      if (state._vctrlBound) {
        unbindGlobalVideoCtrls();
      }
      state._vctrlBound = false;
      info("[DWorksVideo] destroy ok");
    }
    var api = {
      init,
      destroy,
      // direct controls
      vdoVolume,
      syncVctrlA11y,
      // exposure (optional)
      controlVideo,
      vdoTag: function(path, opts) {
        return vdoTag(path, opts, cfg.icons || defaultIcons);
      },
      icons: cfg.icons || defaultIcons
    };
    return api;
  }
  var mod = {
    create,
    // pure utils exposure (optional)
    controlVideo,
    vdoTag: function(path, opts) {
      return vdoTag(path, opts, defaultIcons);
    },
    icons: defaultIcons,
    calcAspectPad
  };
  if (typeof rootGlobal.__DWORKS_EXPORT__ === "function") {
    rootGlobal.__DWORKS_EXPORT__(mod);
  }
  if (typeof rootGlobal.window !== "undefined") {
    rootGlobal.DWorksVideo = rootGlobal.DWorksVideo || mod;
  }
  var video_default = mod;

  // src/index.js
  var mod2 = {
    video: video_default,
    createVideo: create,
    utils: {
      controlVideo,
      vdoTag,
      calcAspectPad,
      icons: defaultIcons
    }
  };
  if (typeof globalThis !== "undefined" && typeof globalThis.window !== "undefined") {
    globalThis.DWorks = globalThis.DWorks || mod2;
  }
  var index_default = mod2;
  return __toCommonJS(index_exports);
})();
/*! dworks-video.js | ES5 | exporter handshake: window.__DWORKS_EXPORT__(mod) */
//# sourceMappingURL=dworks.js.map

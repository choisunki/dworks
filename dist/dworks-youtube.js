/*!
 * @name dworks-youtube
 * @version v1.1.1
 * @author Choi Sunki <sk@daltan.net>
 * @description Operational Youtube Engine for DALTAN WORKS
 * @repository https://github.com/choisunki/dworks
 * @license MIT
 * @preserve
 */
"use strict";
var DWorksYoutube = (() => {
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
  var __toCommonJS = (mod2) => __copyProps(__defProp({}, "__esModule", { value: true }), mod2);

  // src/modules/youtube.js
  var youtube_exports = {};
  __export(youtube_exports, {
    calcAspectPad: () => calcAspectPad,
    controlVideo: () => controlVideo,
    create: () => create,
    default: () => youtube_default,
    extractYouTubeId: () => extractYouTubeId,
    icons: () => defaultIcons,
    vdoTag: () => vdoTag,
    vdoVolume: () => vdoVolume
  });
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
  function extractYouTubeId(input) {
    if (!input) return "";
    var src = String(input).trim();
    if (!src) return "";
    if (/^[a-zA-Z0-9_-]{11}$/.test(src)) return src;
    var patterns = [
      /(?:youtube\.com\/watch\?v=|youtube\.com\/shorts\/|youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /[?&]v=([a-zA-Z0-9_-]{11})/
    ];
    for (var i = 0; i < patterns.length; i++) {
      var m = src.match(patterns[i]);
      if (m && m[1]) return m[1];
    }
    return "";
  }
  function getTubeListFromGlobalConfig() {
    try {
      var tubes = rootGlobal && rootGlobal.daltan && rootGlobal.daltan.works && rootGlobal.daltan.works.config && rootGlobal.daltan.works.config.tubes;
      return Array.isArray(tubes) ? tubes : [];
    } catch (e) {
      return [];
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
  var globalYtRegistry = rootGlobal.__DWORKS_YT_REGISTRY__ || {};
  rootGlobal.__DWORKS_YT_REGISTRY__ = globalYtRegistry;
  function getPlayerById(id) {
    if (!id) return null;
    return globalYtRegistry[id] || null;
  }
  function muteOtherPlayers(activeId) {
    for (var id in globalYtRegistry) {
      if (!Object.prototype.hasOwnProperty.call(globalYtRegistry, id)) continue;
      if (id === activeId) continue;
      var player = globalYtRegistry[id];
      if (!player) continue;
      try {
        if (typeof player.mute === "function") player.mute();
      } catch (e) {
      }
      syncVctrlA11yById(id, true);
    }
  }
  function notifyMediaUnmute(kind, id) {
    if (typeof rootGlobal.CustomEvent !== "function") return;
    try {
      var evt = new CustomEvent("dworks-media:unmute", {
        detail: { kind, id: id || "" }
      });
      document.dispatchEvent(evt);
    } catch (e) {
    }
  }
  function reportPlaybackWarn(playerOrId, hooks, err) {
    hooks = hooks || {};
    try {
      console.warn("[DWorksYoutube] \uC7AC\uC0DD \uC2E4\uD328:", err || "play_blocked");
    } catch (e1) {
    }
    if (hooks.log) {
      try {
        console.info("[DWorksYoutube][debug] play-blocked detail:", {
          id: playerOrId,
          error: err || null
        });
      } catch (e2) {
      }
    }
    if (typeof hooks.onPlaybackBlocked === "function") {
      try {
        hooks.onPlaybackBlocked({
          player: playerOrId,
          error: err || null,
          reason: "play_blocked"
        });
      } catch (e3) {
      }
    }
  }
  function isMuted(player) {
    if (!player || typeof player.isMuted !== "function") return true;
    try {
      return !!player.isMuted();
    } catch (e) {
      return true;
    }
  }
  function syncVctrlA11yById(id, forcedMuted) {
    if (!id) return;
    var player = getPlayerById(id);
    if (!player) return;
    var muted = typeof forcedMuted === "boolean" ? forcedMuted : isMuted(player);
    var ctrls = qa('.ctrl[data-target="' + id + '"]');
    if (!ctrls || !ctrls.length) return;
    for (var i = 0; i < ctrls.length; i++) {
      var ctrl = ctrls[i];
      if (ctrl.classList) {
        if (muted) ctrl.classList.add("muted");
        else ctrl.classList.remove("muted");
      }
      try {
        ctrl.setAttribute("aria-label", "\uC720\uD29C\uBE0C \uBCFC\uB968 \uC81C\uC5B4");
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
  function controlVideo(idOrPlayer, shouldPlay, hooks) {
    var player = idOrPlayer;
    if (typeof idOrPlayer === "string") player = getPlayerById(idOrPlayer);
    if (!player) return;
    if (shouldPlay) {
      try {
        if (typeof player.playVideo === "function") player.playVideo();
      } catch (e1) {
        reportPlaybackWarn(idOrPlayer, hooks, e1);
      }
      return;
    }
    try {
      if (typeof player.pauseVideo === "function") player.pauseVideo();
    } catch (e2) {
    }
  }
  function setYoutubeVolumeById(id, enableSound, hooks) {
    var player = getPlayerById(id);
    if (!player) return;
    var intendedMuted = !enableSound;
    var shouldExclusiveAudio = !hooks || hooks.exclusiveAudio !== false;
    try {
      if (enableSound) {
        if (shouldExclusiveAudio) muteOtherPlayers(id);
        if (shouldExclusiveAudio) notifyMediaUnmute("youtube", id);
        if (typeof player.unMute === "function") player.unMute();
        controlVideo(player, true, hooks);
      } else {
        if (typeof player.mute === "function") player.mute();
      }
    } catch (e) {
    }
    syncVctrlA11yById(id, intendedMuted);
    setTimeout(function() {
      syncVctrlA11yById(id);
    }, 80);
  }
  var globalCtrlDelegation = {
    bound: false,
    refs: 0,
    handler: null
  };
  var globalMediaCoordination = {
    bound: false,
    refs: 0,
    handler: null
  };
  function bindGlobalCtrls() {
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
      var id = ctrl.getAttribute("data-target");
      var action = btn.getAttribute("data-action");
      if (!id) return;
      setYoutubeVolumeById(id, action === "unmute");
    };
    document.addEventListener("click", globalCtrlDelegation.handler, false);
    globalCtrlDelegation.bound = true;
    globalCtrlDelegation.refs = 1;
  }
  function unbindGlobalCtrls() {
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
  function bindGlobalMediaCoordination() {
    if (globalMediaCoordination.bound) {
      globalMediaCoordination.refs += 1;
      return;
    }
    globalMediaCoordination.handler = function(e) {
      var detail = e && e.detail ? e.detail : {};
      var kind = detail.kind || "";
      var id = detail.id || "";
      if (kind === "youtube") {
        muteOtherPlayers(id);
        return;
      }
      if (kind === "video") {
        muteOtherPlayers("");
      }
    };
    document.addEventListener("dworks-media:unmute", globalMediaCoordination.handler, false);
    globalMediaCoordination.bound = true;
    globalMediaCoordination.refs = 1;
  }
  function unbindGlobalMediaCoordination() {
    if (!globalMediaCoordination.bound) return;
    globalMediaCoordination.refs -= 1;
    if (globalMediaCoordination.refs > 0) return;
    try {
      document.removeEventListener("dworks-media:unmute", globalMediaCoordination.handler, false);
    } catch (e) {
    }
    globalMediaCoordination.handler = null;
    globalMediaCoordination.bound = false;
    globalMediaCoordination.refs = 0;
  }
  var ytApiState = rootGlobal.__DWORKS_YT_API_STATE__ || {
    loading: false,
    ready: false,
    callbacks: [],
    prevReady: null
  };
  rootGlobal.__DWORKS_YT_API_STATE__ = ytApiState;
  function ensureYouTubeApi(onReady) {
    if (typeof onReady === "function") ytApiState.callbacks.push(onReady);
    if (rootGlobal.YT && rootGlobal.YT.Player) {
      ytApiState.ready = true;
      while (ytApiState.callbacks.length) {
        try {
          ytApiState.callbacks.shift()();
        } catch (e0) {
        }
      }
      return;
    }
    if (ytApiState.loading) return;
    ytApiState.loading = true;
    ytApiState.prevReady = typeof rootGlobal.onYouTubeIframeAPIReady === "function" ? rootGlobal.onYouTubeIframeAPIReady : null;
    rootGlobal.onYouTubeIframeAPIReady = function() {
      ytApiState.ready = true;
      ytApiState.loading = false;
      if (typeof ytApiState.prevReady === "function") {
        try {
          ytApiState.prevReady();
        } catch (e1) {
        }
      }
      while (ytApiState.callbacks.length) {
        try {
          ytApiState.callbacks.shift()();
        } catch (e2) {
        }
      }
    };
    var script = document.getElementById("dworks-youtube-iframe-api");
    if (!script) {
      script = document.createElement("script");
      script.id = "dworks-youtube-iframe-api";
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      var firstScript = document.getElementsByTagName("script")[0];
      if (firstScript && firstScript.parentNode) firstScript.parentNode.insertBefore(script, firstScript);
      else document.head.appendChild(script);
    }
  }
  function vdoTag(opts, icons) {
    var defaults = {
      vid: "",
      ytId: "",
      url: "",
      ratio: "16/9",
      autoplay: true,
      mute: true,
      loop: true,
      controls: false,
      playsinline: true,
      rel: 0,
      modestbranding: 1,
      iv_load_policy: 3,
      cc_load_policy: 0,
      disablekb: 0,
      fs: 1,
      start: 0,
      end: 0,
      vctrl: true,
      ctrlPosition: "bottom",
      wrapClass: "vdo__wrap",
      a11yLabel: "\uBE0C\uB79C\uB4DC \uC720\uD29C\uBE0C \uC601\uC0C1"
    };
    var o = extend(extend({}, defaults), opts || {});
    icons = icons || defaultIcons;
    var ytId = o.ytId || extractYouTubeId(o.url);
    if (!ytId) return null;
    if (!o.vid) o.vid = "yt_" + (/* @__PURE__ */ new Date()).getTime() + "_" + Math.floor(Math.random() * 1e5);
    var playerElId = o.vid + "__yt";
    var ratio = String(o.ratio || "16/9");
    var arPad = calcAspectPad(ratio);
    if (!ratio.match(/^\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*$/)) {
      ratio = "16/9";
      arPad = "56.25%";
    }
    var wrapStyle = "--ar:" + ratio + ";--ar-pad:" + arPad + ";--fit:cover;";
    var mutedClass = o.mute ? " muted" : "";
    var isTopCtrl = String(o.ctrlPosition || "bottom").toLowerCase() === "top";
    var ctrlPosClass = isTopCtrl ? " ctrl--top" : " ctrl--bottom";
    var ctrlPosStyle = isTopCtrl ? ' style="top:0;bottom:auto;"' : "";
    var ctrlHtml = "";
    if (o.vctrl) {
      ctrlHtml = [
        '<div class="ctrl' + mutedClass + ctrlPosClass + '"' + ctrlPosStyle + ' data-target="' + o.vid + '" role="group" aria-label="\uC720\uD29C\uBE0C \uBCFC\uB968 \uC81C\uC5B4">',
        '  <button type="button" class="vctrl vctrl-volume-off" data-action="unmute" aria-label="\uBCFC\uB968 \uCF1C\uAE30" aria-controls="' + playerElId + '">',
        '    <span class="vctrl-popover" role="tooltip">\uBCFC\uB968 \uCF1C\uAE30</span>',
        icons.volume_on || "ON",
        "  </button>",
        '  <button type="button" class="vctrl vctrl-volume-on" data-action="mute" aria-label="\uBCFC\uB968 \uB044\uAE30" aria-controls="' + playerElId + '">',
        '    <span class="vctrl-popover" role="tooltip">\uBCFC\uB968 \uB044\uAE30</span>',
        icons.volume_off || "OFF",
        "  </button>",
        '  <span class="sr-only vctrl-status" aria-live="polite" aria-atomic="true"></span>',
        "</div>"
      ].join("");
    }
    return {
      html: [
        '<div class="' + o.wrapClass + '" style="' + wrapStyle + '">',
        '  <span class="vdo__spacer" aria-hidden="true"></span>',
        '  <div id="' + playerElId + '" class="video yt-player" aria-label="' + o.a11yLabel + '"></div>',
        ctrlHtml,
        "</div>"
      ].join(""),
      vid: o.vid,
      ytId,
      playerElId
    };
  }
  function create(options) {
    var cfg = extend({
      tubes: null,
      icons: null,
      log: false,
      exclusiveAudio: true,
      onPlaybackBlocked: null,
      viewportChecker: null
    }, options || {});
    var state = {
      _vctrlBound: false,
      _mediaBusBound: false,
      _vdoObserver: null,
      _vdoMap: null,
      _ytMap: {}
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
      debugInfo("[DWorksYoutube][debug] detail:", detail);
    }
    function syncVctrlA11y(id) {
      syncVctrlA11yById(id);
    }
    function vdoVolume2(id, enableSound) {
      setYoutubeVolumeById(id, enableSound, {
        log: cfg.log,
        exclusiveAudio: cfg.exclusiveAudio,
        onPlaybackBlocked: cfg.onPlaybackBlocked
      });
    }
    function bindVideoCtrls() {
      if (state._vctrlBound) return;
      state._vctrlBound = true;
      bindGlobalCtrls();
    }
    function createPlayers(list) {
      if (!rootGlobal.YT || !rootGlobal.YT.Player) {
        coreError("[DWorksYoutube] YouTube Iframe API\uAC00 \uC900\uBE44\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.");
        return;
      }
      for (var i = 0; i < list.length; i++) {
        var item = list[i];
        if (!item || !item._playerElId || !item._ytId || !item.vid) continue;
        var shouldAutoplay = !!item.autoplay;
        var shouldMute = shouldAutoplay ? true : item.mute !== false;
        var playerVars = {
          autoplay: shouldAutoplay ? 1 : 0,
          controls: item.controls ? 1 : 0,
          disablekb: item.disablekb ? 1 : 0,
          fs: item.fs === 0 ? 0 : 1,
          iv_load_policy: typeof item.iv_load_policy === "number" ? item.iv_load_policy : 3,
          cc_load_policy: typeof item.cc_load_policy === "number" ? item.cc_load_policy : 0,
          playsinline: item.playsinline === false ? 0 : 1,
          rel: typeof item.rel === "number" ? item.rel : 0,
          modestbranding: typeof item.modestbranding === "number" ? item.modestbranding : 1,
          mute: shouldMute ? 1 : 0,
          start: typeof item.start === "number" && item.start > 0 ? item.start : 0
        };
        if (typeof item.end === "number" && item.end > 0) playerVars.end = item.end;
        if (item.loop) {
          playerVars.loop = 1;
          playerVars.playlist = item._ytId;
        }
        var player = new rootGlobal.YT.Player(item._playerElId, {
          videoId: item._ytId,
          playerVars,
          events: {
            onReady: /* @__PURE__ */ (function(opt) {
              return function() {
                syncVctrlA11yById(opt.vid);
                if (opt.autoplay) {
                  try {
                    controlVideo(opt.vid, true, { log: cfg.log, onPlaybackBlocked: cfg.onPlaybackBlocked });
                  } catch (e1) {
                  }
                }
              };
            })(item),
            onStateChange: /* @__PURE__ */ (function(opt2) {
              return function() {
                syncVctrlA11yById(opt2.vid);
              };
            })(item),
            onError: /* @__PURE__ */ (function(opt3) {
              return function(ev) {
                reportPlaybackWarn(opt3.vid, {
                  log: cfg.log,
                  onPlaybackBlocked: cfg.onPlaybackBlocked
                }, ev && typeof ev.data !== "undefined" ? "YT_ERROR_" + ev.data : "YT_ERROR");
              };
            })(item)
          }
        });
        state._ytMap[item.vid] = player;
        globalYtRegistry[item.vid] = player;
      }
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
          if (!$observe0.length) continue;
          (function(observeEl, opt) {
            try {
              $(observeEl)[pluginName]({
                repeat: true,
                callbackFunction: function(elem, action) {
                  if (action === "add") {
                    if (opt.play_on_enter) controlVideo(opt.vid, true, { log: cfg.log, onPlaybackBlocked: cfg.onPlaybackBlocked });
                  } else {
                    if (opt.pause_on_leave) controlVideo(opt.vid, false);
                  }
                }
              });
            } catch (e) {
            }
          })($observe0.get(0), item);
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
          var opt = meta.opt || {};
          var threshold = typeof opt.view_threshold === "number" ? opt.view_threshold : 0.35;
          var isIn = entry.isIntersecting && entry.intersectionRatio >= threshold;
          if (isIn) {
            if (opt.play_on_enter) controlVideo(meta.id, true, { log: cfg.log, onPlaybackBlocked: cfg.onPlaybackBlocked });
          } else {
            if (opt.pause_on_leave) controlVideo(meta.id, false);
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
        state._vdoMap.set(elObserve, { id: item2.vid, opt: item2 });
        observer.observe(elObserve);
      }
    }
    function init() {
      var list = Array.isArray(cfg.tubes) ? cfg.tubes : getTubeListFromGlobalConfig();
      var icons = cfg.icons || defaultIcons;
      var normalized = [];
      for (var i = 0; i < list.length; i++) {
        var item = list[i];
        if (!item || !item.mount) continue;
        var tagData = vdoTag(item, icons);
        if (!tagData || !tagData.ytId) {
          coreError(
            "[DWorksYoutube] \uBE44\uB514\uC624 \uACBD\uB85C(url) \uB610\uB294 ytId\uAC00 \uB204\uB77D\uB418\uC5C8\uC2B5\uB2C8\uB2E4. index: " + i,
            { index: i, item }
          );
          continue;
        }
        var mountEl = q(item.mount);
        if (!mountEl) {
          coreError(
            "[DWorksYoutube] \uC5D8\uB9AC\uBA3C\uD2B8\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. mount: " + item.mount,
            { index: i, mount: item.mount, item }
          );
          continue;
        }
        mountEl.innerHTML = tagData.html;
        item.vid = tagData.vid;
        item._ytId = tagData.ytId;
        item._playerElId = tagData.playerElId;
        normalized.push(item);
      }
      bindVideoCtrls();
      if (!state._mediaBusBound) {
        bindGlobalMediaCoordination();
        state._mediaBusBound = true;
      }
      ensureYouTubeApi(function() {
        createPlayers(normalized);
        bindVideoVisibility(normalized);
        for (var i2 = 0; i2 < normalized.length; i2++) syncVctrlA11yById(normalized[i2].vid);
        info("[DWorksYoutube] init ok");
      });
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
      for (var id in state._ytMap) {
        if (!Object.prototype.hasOwnProperty.call(state._ytMap, id)) continue;
        try {
          if (state._ytMap[id] && typeof state._ytMap[id].destroy === "function") {
            state._ytMap[id].destroy();
          }
        } catch (e2) {
        }
        delete globalYtRegistry[id];
      }
      state._ytMap = {};
      if (state._vctrlBound) unbindGlobalCtrls();
      state._vctrlBound = false;
      if (state._mediaBusBound) unbindGlobalMediaCoordination();
      state._mediaBusBound = false;
      info("[DWorksYoutube] destroy ok");
    }
    var api = {
      init,
      destroy,
      vdoVolume: vdoVolume2,
      syncVctrlA11y,
      controlVideo: function(id, shouldPlay) {
        return controlVideo(id, shouldPlay, {
          log: cfg.log,
          exclusiveAudio: cfg.exclusiveAudio,
          onPlaybackBlocked: cfg.onPlaybackBlocked
        });
      },
      vdoTag: function(opts) {
        return vdoTag(opts, cfg.icons || defaultIcons);
      },
      extractYouTubeId,
      icons: cfg.icons || defaultIcons
    };
    return api;
  }
  function vdoVolume(id, enableSound) {
    setYoutubeVolumeById(id, enableSound, {
      exclusiveAudio: true
    });
  }
  var mod = {
    create,
    vdoVolume,
    controlVideo,
    vdoTag: function(opts) {
      return vdoTag(opts, defaultIcons);
    },
    extractYouTubeId,
    icons: defaultIcons,
    calcAspectPad
  };
  if (typeof rootGlobal.__DWORKS_EXPORT__ === "function") {
    rootGlobal.__DWORKS_EXPORT__(mod);
  }
  if (typeof rootGlobal.window !== "undefined") {
    rootGlobal.DWorksYoutube = rootGlobal.DWorksYoutube || mod;
  }
  var youtube_default = mod;
  return __toCommonJS(youtube_exports);
})();
/*! dworks-youtube.js | ES5 | exporter handshake: window.__DWORKS_EXPORT__(mod) */
//# sourceMappingURL=dworks-youtube.js.map

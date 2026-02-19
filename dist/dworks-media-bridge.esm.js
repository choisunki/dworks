/*!
 * DWorks Media Bridge v1.1.0
 */

// src/modules/media-bridge.js
(function(window2) {
  var root = window2.daltan = window2.daltan || {};
  var works = root.works = root.works || {};
  works.ensure = works.ensure || function(path, base) {
    var target = base || works;
    return String(path || "").split(".").filter(Boolean).reduce(function(acc, key) {
      acc[key] = acc[key] || {};
      return acc[key];
    }, target);
  };
  var state = works.ensure("state");
  var api = works.ensure("api");
  var utils = works.ensure("utils");
  var DWorksMediaBridge = {
    init: function(config) {
      if (state._mediaBridgeInited) return;
      this.config = config || works.config || {};
      this.setupState();
      this.setupUtils();
      this.setupMediaRuntime();
      this.setupBridge();
      this.setupFallback();
      state._mediaBridgeInited = true;
    },
    getConfig: function() {
      return works.config || this.config || {};
    },
    setupState: function() {
      if (typeof state._vctrlDocBound === "undefined") state._vctrlDocBound = false;
      if (typeof state._videoInstInited === "undefined") state._videoInstInited = false;
      if (typeof state._youtubeInstInited === "undefined") state._youtubeInstInited = false;
      if (typeof state._vdoIdSeq !== "number") state._vdoIdSeq = 0;
      state._vdoUsedIds = state._vdoUsedIds || {};
      if (typeof state._vdoRetryTimer === "undefined") state._vdoRetryTimer = null;
      if (typeof state._vdoMountObserver === "undefined") state._vdoMountObserver = null;
      if (typeof state._vdoMountObserverTimer === "undefined") state._vdoMountObserverTimer = null;
      state.modules = state.modules || {};
    },
    setupUtils: function() {
      var self = this;
      utils.reserveVideoId = utils.reserveVideoId || function(vid) {
        if (!vid) return;
        state._vdoUsedIds[String(vid)] = true;
      };
      utils.nextVideoId = utils.nextVideoId || function(prefix) {
        var base = prefix || "daltan_vdo";
        var id = "";
        var guard = 0;
        do {
          state._vdoIdSeq += 1;
          id = base + "_" + state._vdoIdSeq;
          guard += 1;
          if (guard > 1e5) {
            id = base + "_" + (/* @__PURE__ */ new Date()).getTime() + "_" + guard;
            break;
          }
        } while (state._vdoUsedIds[id] || document.getElementById(id));
        state._vdoUsedIds[id] = true;
        return id;
      };
      utils.markAutoplayBlocked = utils.markAutoplayBlocked || function(videoEl, err) {
        if (!videoEl) return;
        var wrap = null;
        var cfg = self.getConfig();
        try {
          wrap = videoEl.closest ? videoEl.closest(".vdo__wrap") : null;
        } catch (e0) {
          wrap = null;
        }
        try {
          videoEl.setAttribute("data-autoplay-blocked", "true");
        } catch (e1) {
        }
        if (wrap) {
          try {
            wrap.setAttribute("data-autoplay-blocked", "true");
          } catch (e2) {
          }
          try {
            if (wrap.classList) wrap.classList.add("is-autoplay-blocked");
          } catch (e3) {
          }
        }
        if (cfg && cfg.debug) {
          try {
            console.warn("[daltan] autoplay blocked", videoEl.id || "(no-id)", err);
          } catch (e4) {
          }
        }
        try {
          var detail = { vid: videoEl.id || "", errorName: err && err.name ? err.name : "" };
          var ev;
          if (typeof window2.CustomEvent === "function") {
            ev = new CustomEvent("daltan:autoplay-blocked", { detail });
          } else {
            ev = document.createEvent("CustomEvent");
            ev.initCustomEvent("daltan:autoplay-blocked", true, true, detail);
          }
          document.dispatchEvent(ev);
        } catch (e5) {
        }
        try {
          if (cfg && typeof cfg.onPlayFailed === "function") {
            cfg.onPlayFailed({
              vid: videoEl.id || "",
              errorName: err && err.name ? err.name : "",
              error: err || null,
              videoEl
            });
          }
        } catch (e_cb) {
        }
      };
      utils.clearAutoplayBlocked = utils.clearAutoplayBlocked || function(videoEl) {
        if (!videoEl) return;
        var wrap = null;
        try {
          wrap = videoEl.closest ? videoEl.closest(".vdo__wrap") : null;
        } catch (e0) {
          wrap = null;
        }
        try {
          videoEl.removeAttribute("data-autoplay-blocked");
        } catch (e1) {
        }
        if (wrap) {
          try {
            wrap.removeAttribute("data-autoplay-blocked");
          } catch (e2) {
          }
          try {
            if (wrap.classList) wrap.classList.remove("is-autoplay-blocked");
          } catch (e3) {
          }
        }
      };
      utils.installPlayGuard = utils.installPlayGuard || function(videoEl) {
        if (!videoEl || videoEl.__daltanPlayGuarded) return;
        if (typeof videoEl.play !== "function") return;
        var rawPlay = videoEl.play;
        videoEl.__daltanRawPlay = rawPlay;
        videoEl.play = function() {
          var ret;
          try {
            ret = rawPlay.call(videoEl);
          } catch (e0) {
            utils.markAutoplayBlocked(videoEl, e0);
            throw e0;
          }
          if (ret && typeof ret.then === "function") {
            return ret.then(function(v) {
              utils.clearAutoplayBlocked(videoEl);
              return v;
            }).catch(function(err) {
              utils.markAutoplayBlocked(videoEl, err);
              throw err;
            });
          }
          return ret;
        };
        videoEl.__daltanPlayGuarded = true;
      };
    },
    setupMediaRuntime: function() {
      api.hasConfigList = api.hasConfigList || function(key) {
        var conf = works.config || {};
        var list = conf[key];
        return !!(list && list.length);
      };
      api.normalizeVdos = api.normalizeVdos || function(list) {
        if (!list || !list.length) return [];
        for (var i = 0; i < list.length; i++) {
          var it = list[i];
          if (!it) continue;
          if (!it.url && it.code) it.url = it.code;
          if (!it.code && it.url) it.code = it.url;
        }
        return list;
      };
      api.getVdoList = api.getVdoList || function() {
        var cfg0 = works.config || {};
        var list0 = cfg0.vdos;
        if (!list0 || !list0.length) return [];
        return api.normalizeVdos(list0);
      };
      api.resolveVideos = api.resolveVideos || function(getListFn) {
        var list = [];
        try {
          list = typeof getListFn === "function" ? getListFn() || [] : [];
        } catch (e) {
          list = [];
        }
        if (!list || !list.length) return null;
        return list;
      };
      api.installPlayGuards = api.installPlayGuards || function(rootEl) {
        var scope = rootEl || document;
        var videos = null;
        try {
          videos = scope.querySelectorAll("video");
        } catch (e0) {
          videos = null;
        }
        if (!videos || !videos.length) return;
        for (var i = 0; i < videos.length; i++) utils.installPlayGuard(videos[i]);
      };
      api.retryPendingVideos = api.retryPendingVideos || function(pendingItems, attempt) {
        var cfg = works.config || {};
        if (!pendingItems || !pendingItems.length) return;
        var maxAttempt = 20;
        var nextAttempt = typeof attempt === "number" ? attempt + 1 : 1;
        if (nextAttempt > maxAttempt) {
          if (cfg && cfg.debug) {
            try {
              console.warn("[daltan] mount not found after retries", pendingItems);
            } catch (e_retry_log) {
            }
          }
          return;
        }
        if (state._vdoRetryTimer) {
          try {
            clearTimeout(state._vdoRetryTimer);
          } catch (e_clear) {
          }
          state._vdoRetryTimer = null;
        }
        state._vdoRetryTimer = setTimeout(function() {
          state._vdoRetryTimer = null;
          var list = [];
          for (var i = 0; i < pendingItems.length; i++) {
            var item = pendingItems[i];
            if (!item || !item.mount) continue;
            if (!document.querySelector(item.mount)) list.push(item);
          }
          if (typeof api.manageVideos === "function") api.manageVideos();
          if (list.length) api.retryPendingVideos(list, nextAttempt);
        }, 150);
      };
      api.observePendingMounts = api.observePendingMounts || function(pendingItems) {
        if (!pendingItems || !pendingItems.length) return;
        if (typeof window2.MutationObserver !== "function") {
          api.retryPendingVideos(pendingItems, 0);
          return;
        }
        if (state._vdoMountObserver) {
          try {
            state._vdoMountObserver.disconnect();
          } catch (e0) {
          }
          state._vdoMountObserver = null;
        }
        if (state._vdoMountObserverTimer) {
          try {
            clearTimeout(state._vdoMountObserverTimer);
          } catch (e1) {
          }
          state._vdoMountObserverTimer = null;
        }
        var observer = new MutationObserver(function() {
          var remain = [];
          for (var i = 0; i < pendingItems.length; i++) {
            var item = pendingItems[i];
            if (!item || !item.mount) continue;
            if (!document.querySelector(item.mount)) remain.push(item);
          }
          if (remain.length !== pendingItems.length) {
            if (typeof api.manageVideos === "function") api.manageVideos();
          }
          if (!remain.length) {
            try {
              observer.disconnect();
            } catch (e2) {
            }
            state._vdoMountObserver = null;
            if (state._vdoMountObserverTimer) {
              try {
                clearTimeout(state._vdoMountObserverTimer);
              } catch (e3) {
              }
              state._vdoMountObserverTimer = null;
            }
            return;
          }
          pendingItems = remain;
        });
        try {
          observer.observe(document.documentElement || document.body, { childList: true, subtree: true });
          state._vdoMountObserver = observer;
        } catch (e4) {
          state._vdoMountObserver = null;
          api.retryPendingVideos(pendingItems, 0);
          return;
        }
        state._vdoMountObserverTimer = setTimeout(function() {
          if (state._vdoMountObserver) {
            try {
              state._vdoMountObserver.disconnect();
            } catch (e5) {
            }
            state._vdoMountObserver = null;
          }
          state._vdoMountObserverTimer = null;
          api.retryPendingVideos(pendingItems, 0);
        }, 5e3);
      };
      api.manageVideos = api.manageVideos || function() {
        if (state.modules && state.modules.videoInst && typeof state.modules.videoInst.init === "function") {
          if (!state._videoInstInited) {
            try {
              state.modules.videoInst.init();
              state._videoInstInited = true;
              api.installPlayGuards(document);
            } catch (e_mod_init) {
              console.warn("[daltan] videoInst.init failed", e_mod_init);
            }
          }
          return;
        }
        var list = api.resolveVideos(api.getVdoList);
        if (!list) return;
        if (typeof utils.vdoTag !== "function") return;
        var pendingMounts = [];
        for (var i = 0; i < list.length; i++) {
          var item = list[i];
          if (!item || !item.code || !item.mount) continue;
          if (item._mountedDone) continue;
          if (!document.querySelector(item.mount)) {
            pendingMounts.push(item);
            continue;
          }
          if (item.vctrl !== false && !item.vid) item.vid = utils.nextVideoId("daltan_vdo");
          else if (item.vid) utils.reserveVideoId(item.vid);
          var html = utils.vdoTag(item.code, item);
          if (item.vctrl !== false) {
            try {
              var m = String(html || "").match(/<video\s+[^>]*id=\"([^\"]+)\"/i);
              if (m && m[1]) {
                item.vid = m[1];
                utils.reserveVideoId(item.vid);
              }
            } catch (e_vid) {
            }
          }
          if (window2.jQuery) window2.jQuery(item.mount).html(html);
          else {
            var mountEl = document.querySelector(item.mount);
            if (mountEl) mountEl.innerHTML = html;
          }
          try {
            var elMount = document.querySelector(item.mount);
            if (elMount) api.installPlayGuards(elMount);
          } catch (e_guard) {
          }
          item._mountedDone = true;
          if (item.vid && typeof api.syncVctrlA11y === "function") api.syncVctrlA11y(item.vid);
        }
        if (!state._vctrlDocBound && typeof api.bindVideoCtrls === "function") {
          api.bindVideoCtrls();
          state._vctrlDocBound = true;
        }
        if (typeof api.bindVideoVisibility === "function") api.bindVideoVisibility(list);
        if (pendingMounts.length) api.observePendingMounts(pendingMounts);
      };
      api.manageTubes = api.manageTubes || function() {
        if (state.modules && state.modules.youtubeInst && typeof state.modules.youtubeInst.init === "function") {
          if (!state._youtubeInstInited) {
            try {
              state.modules.youtubeInst.init();
              state._youtubeInstInited = true;
            } catch (e_tube_init) {
              console.warn("[daltan] youtubeInst.init failed", e_tube_init);
            }
          }
        }
      };
      api.isVideoReady = api.isVideoReady || function() {
        var hasInstInit = !!(state.modules && state.modules.videoInst && typeof state.modules.videoInst.init === "function");
        return typeof utils.vdoTag === "function" || hasInstInit;
      };
      api.isYoutubeReady = api.isYoutubeReady || function() {
        return !!(state.modules && state.modules.youtubeInst && typeof state.modules.youtubeInst.init === "function");
      };
      api.initVideos = api.initVideos || function() {
        if (!api.hasConfigList("vdos")) return;
        if (api.isVideoReady && api.isVideoReady()) {
          if (typeof api.manageVideos === "function") api.manageVideos();
        } else {
          console.warn("[daltan] video module not ready");
        }
      };
      api.initTubes = api.initTubes || function() {
        if (!api.hasConfigList("tubes")) return;
        if (api.isYoutubeReady && api.isYoutubeReady()) {
          if (typeof api.manageTubes === "function") api.manageTubes();
        } else {
          console.warn("[daltan] youtube module not ready");
        }
      };
      api.init = api.init || function() {
        api.initVideos();
        api.initTubes();
      };
    },
    createModuleInstance: function(type, mod) {
      if (!mod || typeof mod.create !== "function") return null;
      var isYT = type === "youtube";
      var conf = this.getConfig();
      try {
        var createOptions = {
          icons: utils.icons || mod.icons || null,
          log: !!conf.debug,
          viewportChecker: { enabled: true, $: window2.jQuery, pluginName: "viewportChecker" }
        };
        if (isYT) {
          createOptions.tubes = conf.tubes || [];
          createOptions.onPlaybackBlocked = function(p) {
            if (typeof conf.onPlayFailed === "function") conf.onPlayFailed(p || {});
          };
        } else {
          createOptions.vdos = api.normalizeVdos ? api.normalizeVdos(conf.vdos || []) : conf.vdos || [];
        }
        return mod.create(createOptions);
      } catch (e) {
        console.error("[daltan] " + type + " instance creation failed", e);
        return null;
      }
    },
    setupBridge: function() {
      var self = this;
      var prevExport = window2.__DWORKS_EXPORT__;
      window2.__DWORKS_EXPORT__ = function(mod) {
        try {
          var isYT = !!(mod && mod.extractYouTubeId);
          if (isYT) works.assignYoutubeModule(mod);
          else works.assignVideoModule(mod);
        } finally {
          if (typeof prevExport === "function") prevExport(mod);
        }
      };
      var prevYoutubeExport = window2.__DWORKS_EXPORT_YOUTUBE__;
      window2.__DWORKS_EXPORT_YOUTUBE__ = function(mod) {
        try {
          works.assignYoutubeModule(mod);
        } finally {
          if (typeof prevYoutubeExport === "function") prevYoutubeExport(mod);
        }
      };
      works.assignVideoModule = function(mod) {
        if (!mod) return;
        state.modules.video = mod;
        var inst = self.createModuleInstance("video", mod);
        var src = inst || mod;
        utils.icons = src.icons || mod.icons || utils.icons;
        utils.controlVideo = src.controlVideo || mod.controlVideo || utils.controlVideo;
        utils.vdoTag = src.vdoTag || mod.vdoTag || utils.vdoTag;
        api.vdoVolume = src.vdoVolume || mod.vdoVolume || api.vdoVolume;
        api.syncVctrlA11y = src.syncVctrlA11y || mod.syncVctrlA11y || api.syncVctrlA11y;
        api.bindVideoCtrls = src.bindVideoCtrls || mod.bindVideoCtrls || api.bindVideoCtrls;
        api.bindVideoVisibility = src.bindVideoVisibility || mod.bindVideoVisibility || api.bindVideoVisibility;
        var nextDestroy = src.destroy || mod.destroy || null;
        if (typeof nextDestroy === "function") {
          api._rawDestroy = nextDestroy;
          api.destroy = function() {
            try {
              api._rawDestroy();
            } catch (e_destroy) {
            }
            state._vctrlDocBound = false;
            state._videoInstInited = false;
            if (state._vdoRetryTimer) {
              try {
                clearTimeout(state._vdoRetryTimer);
              } catch (e_retry_clear) {
              }
              state._vdoRetryTimer = null;
            }
            if (state._vdoMountObserver) {
              try {
                state._vdoMountObserver.disconnect();
              } catch (e_obs_dis) {
              }
              state._vdoMountObserver = null;
            }
            if (state._vdoMountObserverTimer) {
              try {
                clearTimeout(state._vdoMountObserverTimer);
              } catch (e_obs_timer) {
              }
              state._vdoMountObserverTimer = null;
            }
          };
        }
        if (inst) {
          state.modules.videoInst = inst;
          state._videoInstInited = false;
          if (typeof api.bindVideoCtrls !== "function") api.bindVideoCtrls = function() {
          };
          if (typeof api.bindVideoVisibility !== "function") api.bindVideoVisibility = function() {
          };
        }
      };
      works.assignYoutubeModule = function(mod) {
        if (!mod) return;
        state.modules.youtube = mod;
        var inst = self.createModuleInstance("youtube", mod);
        if (inst) {
          state.modules.youtubeInst = inst;
          state._youtubeInstInited = false;
        }
      };
    },
    setupFallback: function() {
      var prevFallback = api.assignFallbackModules || function() {
      };
      api.assignFallbackModules = function() {
        prevFallback.call(api);
        var gVideo = window2.DWorksVideo || window2.DWORKS_VIDEO || window2.dworksVideo || window2.dworks_video || null;
        var gTube = window2.DWorksYoutube || window2.DWORKS_YOUTUBE || window2.dworksYoutube || window2.dworks_youtube || null;
        if (!gVideo && window2.dworks && window2.dworks.video) gVideo = window2.dworks.video;
        if (!gTube && window2.dworks && window2.dworks.youtube) gTube = window2.dworks.youtube;
        if (gVideo && !state.modules.video) works.assignVideoModule(gVideo);
        if (gTube && !state.modules.youtube) works.assignYoutubeModule(gTube);
      };
    }
  };
  window2.DWorksMediaBridge = DWorksMediaBridge;
})(window);
//# sourceMappingURL=dworks-media-bridge.esm.js.map

/*!
 * @name dworks-image-load
 * @version v1.1.1
 * @author Choi Sunki <sk@daltan.net>
 * @description DWorks image load utility
 * @repository https://github.com/choisunki/dworks
 * @license MIT
 * @preserve
 */
var DWorksImageLoad = (() => {
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

  // src/modules/image-load.js
  var image_load_exports = {};
  __export(image_load_exports, {
    default: () => image_load_default,
    dload: () => dload
  });
  function dload(target, opts = {}) {
    const options = Object.assign({
      cmessage: false,
      lazyAttrs: ["data-src", "data-lazy", "data-original"],
      cbMode: "section",
      // 'section' | 'all'
      timeoutMs: 0
    }, opts);
    const hasNodeList = typeof NodeList !== "undefined";
    const sections = hasNodeList && target instanceof NodeList || Array.isArray(target) ? target : [target];
    const isAllMode = options.cbMode === "all";
    let pendingSections = sections.length;
    const callCb = () => {
      if (typeof options.cb === "function") options.cb();
    };
    const completeSection = () => {
      if (!isAllMode) {
        callCb();
        return;
      }
      pendingSections -= 1;
      if (pendingSections <= 0) callCb();
    };
    if (sections.length === 0) {
      callCb();
      return;
    }
    sections.forEach((section) => {
      if (!section || !section.querySelectorAll) {
        completeSection();
        return;
      }
      const imgs = section.querySelectorAll("img");
      const total = imgs.length;
      let loadedCount = 0;
      if (total === 0) {
        if (options.cmessage) {
          console.log("%c Load Complete 0ea", "background: green; color: #111; border-radius: 2px; padding: 5px 10px;");
        }
        completeSection();
        return;
      }
      const handleLoaded = () => {
        loadedCount += 1;
        if (options.cmessage) {
          console.log(`%c => Loading ${loadedCount}ea`, "background: #111; color: green; border-radius: 2px;");
        }
        if (loadedCount === total) {
          if (options.cmessage) {
            console.log(`%c Load Complete ${loadedCount}ea`, "background: green; color: #111; border-radius: 2px; padding: 5px 10px;");
          }
          completeSection();
        }
      };
      imgs.forEach((imgEl) => {
        const img = new Image();
        let fired = false;
        let timer = null;
        const once = () => {
          if (fired) return;
          fired = true;
          if (timer) {
            clearTimeout(timer);
            timer = null;
          }
          handleLoaded();
        };
        img.onload = once;
        img.onerror = once;
        const lazyAttrs = Array.isArray(options.lazyAttrs) ? options.lazyAttrs : [];
        let resolvedSrc = "";
        if (imgEl.currentSrc) resolvedSrc = imgEl.currentSrc;
        if (!resolvedSrc && imgEl.src) resolvedSrc = imgEl.src;
        if (!resolvedSrc) resolvedSrc = imgEl.getAttribute("src") || "";
        if (!resolvedSrc) {
          for (let i = 0; i < lazyAttrs.length; i += 1) {
            const attrVal = imgEl.getAttribute(lazyAttrs[i]);
            if (attrVal) {
              resolvedSrc = attrVal;
              break;
            }
          }
        }
        if (!resolvedSrc) {
          once();
          return;
        }
        const timeoutMs = Number(options.timeoutMs) || 0;
        if (timeoutMs > 0) {
          timer = setTimeout(() => {
            once();
          }, timeoutMs);
        }
        img.src = resolvedSrc;
        if (img.complete) {
          if (img.naturalWidth > 0) once();
          else img.onerror && img.onerror();
        }
      });
    });
  }
  var mod = { dload };
  if (typeof globalThis !== "undefined" && typeof globalThis.window !== "undefined") {
    globalThis.DWorksImageLoad = globalThis.DWorksImageLoad || mod;
  }
  var image_load_default = mod;
  return __toCommonJS(image_load_exports);
})();
//# sourceMappingURL=dworks-image-load.js.map

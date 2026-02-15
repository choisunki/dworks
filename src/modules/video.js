/*! dworks-video.js | ES5 | exporter handshake: window.__DWORKS_EXPORT__(mod) */
'use strict';

var rootGlobal = typeof globalThis !== 'undefined'
  ? globalThis
  : (typeof window !== 'undefined' ? window : {});

  // -----------------------------
  // Small utils (ES5)
  // -----------------------------
  function extend(target, src) {
    target = target || {};
    src = src || {};
    for (var k in src) {
      if (Object.prototype.hasOwnProperty.call(src, k)) target[k] = src[k];
    }
    return target;
  }

  function q(sel, root) {
    try { return (root || document).querySelector(sel); } catch (e) { return null; }
  }

  function qa(sel, root) {
    try { return (root || document).querySelectorAll(sel); } catch (e) { return []; }
  }

  function isVideo(el) {
    return el && el.tagName === 'VIDEO';
  }

  // ratio: '16/9' -> '56.25%'
  function calcAspectPad(ratio) {
    var fallback = '56.25%';
    var src = String(ratio || '16/9');
    var m = src.match(/^\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*$/);
    if (!m) return fallback;

    var w = parseFloat(m[1]);
    var h = parseFloat(m[2]);
    if (!isFinite(w) || !isFinite(h) || w <= 0 || h <= 0) return fallback;

    var pct = (h / w) * 100;
    if (!isFinite(pct) || pct <= 0) return fallback;

    return pct.toFixed(2) + '%';
  }

  /**
   * 비디오 재생/정지를 안전하게 제어한다.
   * - play()는 Promise를 반환하므로 빠른 스크롤에서 pause()와 경합할 수 있다.
   * - autoplay 정책/인터럽트 에러는 무시한다.
   * @param {HTMLVideoElement} videoEl
   * @param {Boolean} shouldPlay
   */
  function controlVideo(videoEl, shouldPlay) {
    if (!videoEl) return;

    if (shouldPlay) {
      // 이미 재생 중이면 무시
      if (!videoEl.paused && !videoEl.ended) return;

      try {
        var p = videoEl.play();
        if (p && typeof p.catch === 'function') p.catch(function () {});
      } catch (e) {}
      return;
    }

    try { if (!videoEl.paused) videoEl.pause(); } catch (e2) {}
  }

  // -----------------------------
  // Default icons (SVG)
  // -----------------------------
  var defaultIcons = {
    volume_on: [
      '<svg class="ico ico-volume-on" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">',
      '  <path d="M11 5L6.5 9H3v6h3.5L11 19V5z" fill="currentColor"/>',
      '  <path d="M14.5 8.5a1 1 0 0 1 1.4-.1 6 6 0 0 1 0 7.2 1 1 0 1 1-1.5-1.2 4 4 0 0 0 0-4.8 1 1 0 0 1 .1-1.1z" fill="currentColor"/>',
      '  <path d="M16.8 6.2a1 1 0 0 1 1.4-.1 9 9 0 0 1 0 11.8 1 1 0 1 1-1.5-1.2 7 7 0 0 0 0-9.2 1 1 0 0 1 .1-1.3z" fill="currentColor"/>',
      '</svg>'
    ].join(''),
    volume_off: [
      '<svg class="ico ico-volume-off" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">',
      '  <path d="M11 5L6.5 9H3v6h3.5L11 19V5z" fill="currentColor"/>',
      '  <path d="M14.2 9.2a1 1 0 0 1 1.4 0l1.8 1.8 1.8-1.8a1 1 0 1 1 1.4 1.4L18.8 12l1.8 1.8a1 1 0 1 1-1.4 1.4L17.4 13.4l-1.8 1.8a1 1 0 1 1-1.4-1.4L16 12l-1.8-1.8a1 1 0 0 1 0-1z" fill="currentColor"/>',
      '</svg>'
    ].join('')
  };

  // -----------------------------
  // Markup builder (join 유지)
  // -----------------------------
  /**
   * mp4 비디오 HTML 마크업을 생성한다.
   * - ratio/fit/poster를 받아 CLS(레이아웃 흔들림) 방지를 돕는다.
   * - aspect-ratio 지원 브라우저: .vdo__wrap에 aspect-ratio 적용
   * - 미지원 브라우저: .vdo__spacer(padding-top) 폴백 사용 (CSS @supports에서 제어)
   *
   * @param {String} vdoPath - mp4 URL
   * @param {Object} [opts]
   * @param {Object} [icons]
   * @returns {String} HTML 문자열
   */
  function vdoTag(vdoPath, opts, icons) {
    var defaults = {
      vid: '',
      controls: false,
      muted: true,
      autoplay: true,
      playsinline: true,
      loop: true,
      vctrl: true,
      preload: (opts && (opts.play_on_enter || opts.pause_on_leave)) ? 'metadata' : 'auto',
      wrapClass: 'vdo__wrap',
      a11yLabel: '브랜드 영상',
      ratio: '16/9',
      fit: 'cover',     // cover|contain
      poster: ''        // URL
    };

    var o = extend(extend({}, defaults), opts || {});
    icons = icons || defaultIcons;

    // ratio/fallback
    var ratio = String(o.ratio || '16/9');
    var arPad = calcAspectPad(ratio);
    if (!ratio.match(/^\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*$/)) {
      ratio = '16/9';
      arPad = '56.25%';
    }

    // fit
    var fit = String(o.fit || 'cover').toLowerCase();
    if (fit !== 'contain') fit = 'cover';

    var wrapStyle = '--ar:' + ratio + ';--ar-pad:' + arPad + ';--fit:' + fit + ';';

    // vctrl=true면 vid 필요. 없으면 생성.
    if (o.vctrl && !o.vid) {
      o.vid = 'vdo_' + (new Date().getTime()) + '_' + Math.floor(Math.random() * 100000);
    }

    // attrs
    var attrs = [
      o.vid ? 'id="' + o.vid + '"' : '',
      'src="' + vdoPath + '"',
      o.preload ? 'preload="' + o.preload + '"' : '',
      o.poster ? 'poster="' + o.poster + '"' : '',
      o.controls ? 'controls' : '',
      o.muted ? 'muted' : '',
      o.autoplay ? 'autoplay' : '',
      o.loop ? 'loop' : '',
      o.playsinline ? 'playsinline' : ''
    ].filter(function (v) { return v !== ''; }).join(' ');

    // vctrl
    var vctrlHtml = '';
    if (o.vctrl) {
      var mutedClass = o.muted ? ' muted' : '';
      var target = o.vid;

      vctrlHtml = [
        '<div class="ctrl' + mutedClass + '" data-target="' + target + '" role="group" aria-label="비디오 볼륨 제어">',
        '  <button type="button" class="vctrl vctrl-volume-off" data-action="unmute" aria-label="볼륨 켜기" aria-controls="' + target + '">',
        '    <span class="vctrl-popover" role="tooltip">볼륨 켜기</span>',
        (icons.volume_on || 'ON'),
        '  </button>',
        '  <button type="button" class="vctrl vctrl-volume-on" data-action="mute" aria-label="볼륨 끄기" aria-controls="' + target + '">',
        '    <span class="vctrl-popover" role="tooltip">볼륨 끄기</span>',
        (icons.volume_off || 'OFF'),
        '  </button>',
        '  <span class="sr-only vctrl-status" aria-live="polite" aria-atomic="true"></span>',
        '</div>'
      ].join('');
    }

    return [
      '<div class="' + o.wrapClass + '" style="' + wrapStyle + '">',
      '  <span class="vdo__spacer" aria-hidden="true"></span>',
      '  <video ' + attrs + ' class="video" aria-label="' + o.a11yLabel + '"></video>',
      vctrlHtml,
      '</div>'
    ].join('');
  }

  // -----------------------------
  // Module factory: create()
  // -----------------------------
  /**
   * 비디오 모듈 인스턴스를 생성한다.
   *
   * options:
   * - vdos: [{ code, mount, observe, play_on_enter, pause_on_leave, view_threshold, vctrl, vid, ratio, fit, poster, ... }]
   * - icons: { volume_on, volume_off } (선택)
   * - log: Boolean (선택)
   * - viewportChecker: (선택) IO 미지원 시 폴백으로 jQuery viewportChecker를 사용할 경우:
   *   { enabled:true, $: window.jQuery, pluginName:'viewportChecker' }
   */
  function create(options) {
    var cfg = extend({
      vdos: [],
      icons: null,
      log: false,
      viewportChecker: null
    }, options || {});

    var state = {
      _vctrlBound: false,
      _vctrlHandler: null,
      _vdoObserver: null,
      _vdoMap: null
    };

    function log() {
      if (!cfg.log) return;
      try { console.log.apply(console, arguments); } catch (e) {}
    }

    /**
     * 비디오 음소거 상태와 커스텀 컨트롤의 접근성 상태를 동기화한다.
     * @param {String} vid
     */
    function syncVctrlA11y(vid) {
      if (!vid) return;

      var el = document.getElementById(vid);
      if (!isVideo(el)) return;

      var muted = !!el.muted;

      var ctrls = qa('.ctrl[data-target="' + vid + '"]');
      if (!ctrls || !ctrls.length) return;

      for (var i = 0; i < ctrls.length; i++) {
        var ctrl = ctrls[i];

        if (ctrl.classList) {
          if (muted) ctrl.classList.add('muted');
          else ctrl.classList.remove('muted');
        }

        try { ctrl.setAttribute('aria-label', '비디오 볼륨 제어'); } catch (e1) {}

        var offBtn = ctrl.querySelector('.vctrl-volume-off');
        var onBtn  = ctrl.querySelector('.vctrl-volume-on');
        var status = ctrl.querySelector('.vctrl-status');

        // muted=true: "볼륨 켜기" 버튼만 접근 가능
        if (offBtn) {
          try {
            offBtn.setAttribute('aria-hidden', String(!muted));
            offBtn.setAttribute('tabindex', muted ? '0' : '-1');
          } catch (e2) {}
        }

        // muted=false: "볼륨 끄기" 버튼만 접근 가능
        if (onBtn) {
          try {
            onBtn.setAttribute('aria-hidden', String(muted));
            onBtn.setAttribute('tabindex', muted ? '-1' : '0');
          } catch (e3) {}
        }

        if (status) status.textContent = muted ? '현재 음소거 상태' : '현재 볼륨 켜짐 상태';
      }
    }

    /**
     * mp4 비디오의 음소거/음성 재생 상태를 제어한다.
     * @param {String} vid - 제어할 video id
     * @param {Boolean} enableSound - true: 소리 켜기 / false: 소리 끄기(음소거)
     */
    function vdoVolume(vid, enableSound) {
      if (!vid) return;

      var el = document.getElementById(vid);
      if (!isVideo(el)) return;

      el.muted = !enableSound;

      try {
        if (enableSound && el.paused) el.play();
      } catch (e) {}

      syncVctrlA11y(vid);
    }

    /**
     * 커스텀 비디오 컨트롤 클릭 이벤트 바인딩
     * - document 레벨 이벤트 위임(1회)
     */
    function bindVideoCtrls() {
      if (state._vctrlBound) return;
      state._vctrlBound = true;

      state._vctrlHandler = function (e) {
        var btn = e.target && e.target.closest ? e.target.closest('.ctrl .vctrl') : null;
        if (!btn) return;

        if (e.preventDefault) e.preventDefault();

        var ctrl = btn.closest ? btn.closest('.ctrl') : null;
        if (!ctrl) return;

        var vid = ctrl.getAttribute('data-target');
        var action = btn.getAttribute('data-action'); // mute|unmute
        if (!vid) return;

        vdoVolume(vid, action === 'unmute');
      };

      document.addEventListener('click', state._vctrlHandler, false);
    }

    /**
     * 특정 영역(observe 또는 mount)이 화면에 들어오면 비디오 재생, 벗어나면 일시정지
     * - IntersectionObserver 사용
     * - IO 미지원 시 (선택) jQuery viewportChecker 폴백 사용 가능
     * @param {Array} list
     */
    function bindVideoVisibility(list) {
      if (!list || !list.length) return;

      var hasIO = typeof rootGlobal.IntersectionObserver === 'function';

      // (선택) jQuery viewportChecker 폴백
      if (!hasIO) {
        var vc = cfg.viewportChecker;
        if (!vc || !vc.enabled || !vc.$) return;

        var $ = vc.$;
        var pluginName = vc.pluginName || 'viewportChecker';

        for (var i = 0; i < list.length; i++) {
          var item = list[i];
          if (!item || !item.mount) continue;
          if (!item.play_on_enter && !item.pause_on_leave) continue;

          var observeSel0 = item.observe || item.mount;
          var $observe0 = $(observeSel0);
          var $mount0 = $(item.mount);
          if (!$observe0.length || !$mount0.length) continue;

          var $video0 = $mount0.find('video').first();
          if (!$video0.length) continue;

          (function (observeEl, videoEl, opt) {
            try {
              $(observeEl)[pluginName]({
                repeat: true,
                callbackFunction: function (elem, action) {
                  if (action === 'add') {
                    if (opt.play_on_enter) controlVideo(videoEl, true);
                  } else {
                    if (opt.pause_on_leave) controlVideo(videoEl, false);
                  }
                }
              });
            } catch (e) {}
          })($observe0.get(0), $video0.get(0), item);
        }

        return;
      }

      // reset old observer
      if (state._vdoObserver) {
        try { state._vdoObserver.disconnect(); } catch (e1) {}
        state._vdoObserver = null;
      }

      state._vdoMap = new WeakMap();

      // callback 빈도를 너무 높이지 않으면서, ratio 판단은 intersectionRatio로 한다
      var thresholds = [0, 0.01, 0.1, 0.25, 0.35, 0.5, 0.75, 1];

      var observer = new IntersectionObserver(function (entries) {
        for (var k = 0; k < entries.length; k++) {
          var entry = entries[k];
          var meta = state._vdoMap.get(entry.target);
          if (!meta) continue;

          var videoEl = meta.videoEl;
          var opt = meta.opt || {};
          var threshold = (typeof opt.view_threshold === 'number') ? opt.view_threshold : 0.35;

          var isIn = entry.isIntersecting && entry.intersectionRatio >= threshold;

          if (isIn) {
            if (opt.play_on_enter) controlVideo(videoEl, true);
          } else {
            if (opt.pause_on_leave) controlVideo(videoEl, false);
          }
        }
      }, { threshold: thresholds });

      state._vdoObserver = observer;

      // observe 등록
      for (var i2 = 0; i2 < list.length; i2++) {
        var item2 = list[i2];
        if (!item2 || !item2.mount) continue;
        if (!item2.play_on_enter && !item2.pause_on_leave) continue;

        var observeSel = item2.observe || item2.mount;
        var elObserve = q(observeSel);
        if (!elObserve) continue;

        var elMount = q(item2.mount);
        if (!elMount) continue;

        var video = elMount.querySelector('video');
        if (!video) continue;

        state._vdoMap.set(elObserve, { videoEl: video, opt: item2 });
        observer.observe(elObserve);
      }
    }

    /**
     * 초기화: vdos 순회 → 마크업 생성 → mount 주입 → 컨트롤/a11y/visibility 바인딩
     */
    function init() {
      var list = cfg.vdos || [];
      var icons = cfg.icons || defaultIcons;

      for (var i = 0; i < list.length; i++) {
        var item = list[i];
        if (!item || !item.code || !item.mount) continue;

        var html = vdoTag(item.code, item, icons);

        // vdoTag가 vid 자동 생성했으면 item에 반영
        if (item.vctrl !== false && !item.vid) {
          try {
            var m = String(html || '').match(/<video\s+[^>]*id=\"([^\"]+)\"/i);
            if (m && m[1]) item.vid = m[1];
          } catch (e_vid) {}
        }

        var mountEl = q(item.mount);
        if (mountEl) mountEl.innerHTML = html;

        if (item.vid) syncVctrlA11y(item.vid);
      }

      bindVideoCtrls();
      bindVideoVisibility(list);

      log('[dworks-video] init ok');
      return api;
    }

    /**
     * 해제: IntersectionObserver disconnect + 이벤트 제거
     */
    function destroy() {
      if (state._vdoObserver) {
        try { state._vdoObserver.disconnect(); } catch (e) {}
        state._vdoObserver = null;
      }
      state._vdoMap = null;

      if (state._vctrlHandler) {
        try { document.removeEventListener('click', state._vctrlHandler, false); } catch (e2) {}
        state._vctrlHandler = null;
      }
      state._vctrlBound = false;

      log('[dworks-video] destroy ok');
    }

    // public instance api
    var api = {
      init: init,
      destroy: destroy,

      // direct controls
      vdoVolume: vdoVolume,
      syncVctrlA11y: syncVctrlA11y,

      // exposure (optional)
      controlVideo: controlVideo,
      vdoTag: function (path, opts) { return vdoTag(path, opts, cfg.icons || defaultIcons); },
      icons: (cfg.icons || defaultIcons)
    };

    return api;
  }

  // -----------------------------
  // Public module (export)
  // -----------------------------
  var mod = {
    create: create,
    // pure utils exposure (optional)
    controlVideo: controlVideo,
    vdoTag: function (path, opts) { return vdoTag(path, opts, defaultIcons); },
    icons: defaultIcons,
    calcAspectPad: calcAspectPad
  };

  // exporter handshake first (preferred)
  if (typeof rootGlobal.__DWORKS_EXPORT__ === 'function') {
    rootGlobal.__DWORKS_EXPORT__(mod);
  }

  // fallback: minimal global (optional)
  if (typeof rootGlobal.window !== 'undefined') {
    rootGlobal.DWorksVideo = rootGlobal.DWorksVideo || mod;
  }

export { create, controlVideo, vdoTag, defaultIcons as icons, calcAspectPad };
export default mod;

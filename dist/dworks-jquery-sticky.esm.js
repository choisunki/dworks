/*!
 * @name dworks-jquery-sticky
 * @version v1.2.0
 * @author Choi Sunki <sk@daltan.net>
 * @description DWorks jQuery sticky plugin
 * @repository https://github.com/choisunki/dworks
 * @license MIT
 * @preserve
 */

// src/modules/jquery.sticky.js
(function($) {
  "use strict";
  if (!$) return;
  var PLUGIN_NAME = "stickyTab";
  function StickyTab($root, options) {
    this.$root = $root;
    this.options = $.extend(true, {}, $.fn[PLUGIN_NAME].defaults, options || {});
    this.$links = $();
    this.$header = $();
    this.$end = $();
    this.$additional = $();
    this.$placeholder = $();
    this.state = {
      headerHeight: 0,
      tabHeight: 0,
      additionalHeight: 0,
      safeAreaTop: 0,
      rootTop: 0
    };
    this._bound = false;
    this._scrollTimer = null;
    this._resizeTimer = null;
    this._resizeObserver = null;
    this._ns = "." + PLUGIN_NAME + "." + this._getInstanceId();
    this.init();
  }
  StickyTab.prototype._getInstanceId = function() {
    var id = this.$root.data("stickyTabId");
    if (!id) {
      id = "st" + (/* @__PURE__ */ new Date()).getTime() + Math.floor(Math.random() * 1e3);
      this.$root.data("stickyTabId", id);
    }
    return id;
  };
  StickyTab.prototype.init = function() {
    this.cacheElements();
    if (!this.$root.length || !this.$links.length) {
      return;
    }
    this.updateHeights();
    this.applyRootCssVars();
    this.bindEvents();
    this.bindResizeObserver();
    this.update();
    if (typeof this.options.onInit === "function") {
      this.options.onInit.call(this, this);
    }
  };
  StickyTab.prototype.cacheElements = function() {
    this.$links = this.$root.find(this.options.linkSelector);
    this.$header = this.options.headerSelector ? $(this.options.headerSelector).eq(0) : $();
    this.$end = this.options.endSelector ? $(this.options.endSelector).eq(0) : $();
    if (this.options.additionalSelectors && this.options.additionalSelectors.length) {
      this.$additional = $(this.options.additionalSelectors.join(","));
    } else {
      this.$additional = $();
    }
    if (this.options.usePlaceholder) {
      var ph = this.$root.next("." + this.options.placeholderClass);
      if (!ph.length) {
        ph = $("<div/>").addClass(this.options.placeholderClass).insertAfter(this.$root);
      }
      this.$placeholder = ph;
    } else {
      this.$placeholder = $();
    }
  };
  StickyTab.prototype.getElementHeight = function($el) {
    if (!$el || !$el.length) return 0;
    return $el.outerHeight() || 0;
  };
  StickyTab.prototype.getSafeAreaTop = function() {
    if (!this.options.useSafeArea) return 0;
    var value = $.trim(
      window.getComputedStyle(document.documentElement).getPropertyValue(this.options.safeAreaVar || "--sat")
    );
    if (!value) return 0;
    value = value.replace("px", "");
    var num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };
  StickyTab.prototype.getOffsetTop = function($el) {
    if (!$el || !$el.length) return 0;
    return $el.offset().top;
  };
  StickyTab.prototype.getAdditionalHeight = function() {
    var total = 0;
    this.$additional.each(function() {
      total += $(this).outerHeight() || 0;
    });
    return total;
  };
  StickyTab.prototype.updateHeights = function() {
    this.state.headerHeight = this.getElementHeight(this.$header);
    this.state.tabHeight = this.getElementHeight(this.$root);
    this.state.additionalHeight = this.getAdditionalHeight();
    this.state.safeAreaTop = this.getSafeAreaTop();
  };
  StickyTab.prototype.updateRootTop = function() {
    if (!this.$root || !this.$root.length) return;
    if (!this.$root.hasClass(this.options.fixedClass)) {
      this.state.rootTop = this.getOffsetTop(this.$root);
    }
  };
  StickyTab.prototype.applyRootCssVars = function() {
    this.$root.css({
      "--header-height": this.state.headerHeight + "px",
      "--tab-height": this.state.tabHeight + "px",
      "--additional-height": this.state.additionalHeight + "px",
      "--safe-area-top": this.state.safeAreaTop + "px"
    });
    if (this.$placeholder && this.$placeholder.length) {
      this.$placeholder.css("height", this.state.tabHeight + "px");
    }
  };
  StickyTab.prototype.getTotalOffset = function() {
    return this.state.headerHeight + this.state.tabHeight + this.state.additionalHeight + this.state.safeAreaTop;
  };
  StickyTab.prototype.getActiveOffset = function() {
    var activeOffset = this.options.activeOffset;
    if (this.options.activeOffsetMobile != null) {
      var mq = this.options.activeMediaQuery || "(max-width: 1024px)";
      if (window.matchMedia && window.matchMedia(mq).matches) {
        activeOffset = this.options.activeOffsetMobile;
      }
    }
    activeOffset = activeOffset || 0;
    var offset = this.getTotalOffset() - activeOffset;
    if (this.options.excludeTabHeightInActive) {
      offset -= this.state.tabHeight;
    }
    return offset;
  };
  StickyTab.prototype.normalizeTarget = function(value) {
    if (!value) return "";
    return String(value).replace(/^#/, "");
  };
  StickyTab.prototype.getLinkTargetId = function($link) {
    var target = $link.attr("data-target") || $link.attr("href") || "";
    return this.normalizeTarget(target);
  };
  StickyTab.prototype.getTargetElement = function($link) {
    var id = this.getLinkTargetId($link);
    if (!id) return $();
    return $("#" + id).eq(0);
  };
  StickyTab.prototype.updateFixedState = function() {
    var scrollTop = $(window).scrollTop();
    var rootTop = this.state.rootTop || this.getOffsetTop(this.$root);
    var threshold = rootTop - this.state.headerHeight - this.state.safeAreaTop;
    var isFixed = scrollTop > threshold;
    var wasFixed = this.$root.hasClass(this.options.fixedClass);
    this.$root.toggleClass(this.options.fixedClass, isFixed);
    if (this.$placeholder && this.$placeholder.length) {
      this.$placeholder.toggle(isFixed);
    }
    if (wasFixed && !isFixed) {
      this.state.rootTop = this.getOffsetTop(this.$root);
    }
    if (this.$end.length) {
      var endTop = this.getOffsetTop(this.$end);
      var isHidden = scrollTop + this.getTotalOffset() > endTop;
      this.$root.toggleClass(this.options.hiddenClass, isHidden);
    } else {
      this.$root.removeClass(this.options.hiddenClass);
    }
    if (this.options.syncLeftOnFixed) {
      this.syncLeft();
    }
  };
  StickyTab.prototype.updateActiveState = function() {
    var self = this;
    var scrollTop = $(window).scrollTop();
    var offset = this.getActiveOffset();
    var activeIndex = -1;
    var $reversedLinks = $.makeArray(this.$links).reverse();
    $($reversedLinks).each(function() {
      var $link = $(this);
      var $target = self.getTargetElement($link);
      if (!$target.length) return true;
      var targetTop = self.getOffsetTop($target);
      if (activeIndex === -1 && scrollTop >= targetTop - offset - 2) {
        activeIndex = self.$links.index($link);
      }
    });
    this.$links.each(function(idx) {
      $(this).parent().toggleClass(self.options.activeClass, idx === activeIndex);
    });
  };
  StickyTab.prototype.update = function() {
    this.updateHeights();
    this.updateRootTop();
    this.applyRootCssVars();
    this.updateFixedState();
    this.updateActiveState();
    if (typeof this.options.onUpdate === "function") {
      this.options.onUpdate.call(this, this);
    }
  };
  StickyTab.prototype.scrollToTarget = function($target) {
    var self = this;
    if (!$target || !$target.length) return;
    var top = this.getOffsetTop($target) - this.getActiveOffset() + (this.options.scrollAdjust || 0);
    window.scrollTo({
      top,
      behavior: this.options.speed === 0 ? "auto" : "smooth"
    });
    if (this.options.speed > 0 && typeof this.options.onScrollEnd === "function") {
      clearTimeout(this._scrollTimer);
      this._scrollTimer = setTimeout(function() {
        self.options.onScrollEnd.call(self, self);
      }, this.options.speed);
    }
  };
  StickyTab.prototype.scrollTo = function(index) {
    index = parseInt(index, 10);
    if (isNaN(index) || index < 0) return;
    var $link = this.$links.eq(index);
    if (!$link.length) return;
    var $target = this.getTargetElement($link);
    this.scrollToTarget($target);
  };
  StickyTab.prototype.syncLeft = function() {
    var left = this.$root.offset() ? this.$root.offset().left : 0;
    this.$root.css("--sticky-left", left + "px");
  };
  StickyTab.prototype.bindEvents = function() {
    var self = this;
    if (this._bound) return;
    $(window).on("scroll" + this._ns, function() {
      if (self.options.useDebounce) {
        clearTimeout(self._scrollDebounceTimer);
        self._scrollDebounceTimer = setTimeout(function() {
          self.update();
        }, self.options.debounceDelay);
      } else {
        self.update();
      }
    });
    $(window).on("resize" + this._ns + " orientationchange" + this._ns, function() {
      clearTimeout(self._resizeTimer);
      self._resizeTimer = setTimeout(function() {
        self.update();
      }, self.options.resizeDelay);
    });
    this.$links.on("click" + this._ns, function(e) {
      var $link = $(this);
      var $target = self.getTargetElement($link);
      if (!$target.length) return;
      e.preventDefault();
      self.$links.each(function(idx) {
        $(this).parent().toggleClass(self.options.activeClass, this === $link[0]);
      });
      self.scrollToTarget($target);
    });
    this._bound = true;
  };
  StickyTab.prototype.bindResizeObserver = function() {
    var self = this;
    if (!this.options.useResizeObserver) return;
    if (typeof window.ResizeObserver !== "function") return;
    if (this._resizeObserver) return;
    this._resizeObserver = new ResizeObserver(function() {
      self.update();
    });
    var list = [];
    if (this.$root && this.$root.length) list.push(this.$root[0]);
    if (this.$header && this.$header.length) list.push(this.$header[0]);
    if (this.$additional && this.$additional.length) {
      this.$additional.each(function() {
        list.push(this);
      });
    }
    list.forEach(function(el) {
      try {
        self._resizeObserver.observe(el);
      } catch (e) {
      }
    });
  };
  StickyTab.prototype.destroy = function() {
    clearTimeout(this._scrollTimer);
    clearTimeout(this._resizeTimer);
    clearTimeout(this._scrollDebounceTimer);
    if (this._resizeObserver) {
      try {
        this._resizeObserver.disconnect();
      } catch (e) {
      }
      this._resizeObserver = null;
    }
    $(window).off(this._ns);
    this.$links.off(this._ns);
    this.$root.removeClass(
      this.options.fixedClass + " " + this.options.activeClass + " " + this.options.hiddenClass
    );
    this.$links.parent().removeClass(this.options.activeClass);
    this.$root.removeData(PLUGIN_NAME);
    if (this.$placeholder && this.$placeholder.length) {
      this.$placeholder.remove();
    }
    this._bound = false;
  };
  $.fn[PLUGIN_NAME] = function(methodOrOptions) {
    var args = Array.prototype.slice.call(arguments, 1);
    return this.each(function() {
      var $this = $(this);
      var instance = $this.data(PLUGIN_NAME);
      if (!instance) {
        if (typeof methodOrOptions === "string") {
          return;
        }
        instance = new StickyTab($this, methodOrOptions);
        $this.data(PLUGIN_NAME, instance);
        return;
      }
      if (typeof methodOrOptions === "string") {
        if (methodOrOptions === "destroy") {
          instance.destroy();
          return;
        }
        if (typeof instance[methodOrOptions] === "function") {
          instance[methodOrOptions].apply(instance, args);
        }
        return;
      }
      instance.destroy();
      instance = new StickyTab($this, methodOrOptions);
      $this.data(PLUGIN_NAME, instance);
    });
  };
  $.fn[PLUGIN_NAME].defaults = {
    linkSelector: ".sticky-tab__link",
    headerSelector: null,
    endSelector: null,
    additionalSelectors: [],
    fixedClass: "is-fixed",
    activeClass: "is-active",
    hiddenClass: "is-hidden",
    speed: 600,
    activeOffset: 1,
    activeOffsetMobile: null,
    activeMediaQuery: "(max-width: 1024px)",
    scrollAdjust: 0,
    excludeTabHeightInActive: false,
    useSafeArea: true,
    safeAreaVar: "--sat",
    syncLeftOnFixed: false,
    useDebounce: true,
    debounceDelay: 10,
    resizeDelay: 80,
    useResizeObserver: true,
    usePlaceholder: true,
    placeholderClass: "sticky-tab__placeholder",
    onInit: null,
    onUpdate: null,
    onScrollEnd: null
  };
})(window.jQuery);
//# sourceMappingURL=dworks-jquery-sticky.esm.js.map

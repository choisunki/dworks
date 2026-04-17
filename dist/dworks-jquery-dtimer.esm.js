/*!
 * @name dworks-jquery-dtimer
 * @version v1.2.2
 * @author Choi Sunki <sk@daltan.net>
 * @description DWorks jQuery dtimer plugin
 * @repository https://github.com/choisunki/dworks
 * @license MIT
 * @preserve
 */

// src/modules/jquery.dtimer.js
(function($) {
  if (!$) return;
  function DTimer(element, options) {
    this.$el = $(element);
    this.settings = $.extend(true, {
      displayUnits: { days: true, hours: true, minutes: true, seconds: true },
      itemClassName: "countdown__item",
      baseTime: window.Echotoday || /* @__PURE__ */ new Date(),
      // 시작 전 대기 상태 처리 여부 (추가)
      showWaiting: true,
      waitingHtml: '<div class="timer-waiting">\uC774\uBCA4\uD2B8 \uC900\uBE44 \uC911</div>',
      onEnd: function() {
        console.log("Timer Finished");
      }
    }, options);
    this.state = { remainingTime: 0, timerId: null };
    this.init();
  }
  DTimer.prototype._parseDate = function(str) {
    if (!str) return null;
    var p = str.match(/\d+/g).map(Number);
    return new Date(p[0], p[1] - 1, p[2], p[3], p[4], p[5]);
  };
  DTimer.prototype.init = function() {
    var self = this;
    var startTimeStr = this.$el.attr("data-start");
    var endTimeStr = this.$el.attr("data-end");
    var end = this._parseDate(endTimeStr);
    if (!end) return;
    var now = this.settings.baseTime.getTime();
    if (startTimeStr && this.settings.showWaiting) {
      var start = this._parseDate(startTimeStr).getTime();
      if (now < start) {
        this.$el.html(this.settings.waitingHtml);
        return;
      }
    }
    this.state.remainingTime = end.getTime() - now;
    if (this.state.remainingTime > 0) {
      this.run();
    } else {
      this.settings.onEnd.call(this.$el);
    }
  };
  DTimer.prototype.run = function() {
    var self = this;
    this.render();
    this.state.timerId = setInterval(function() {
      self.state.remainingTime -= 1e3;
      if (self.state.remainingTime <= 0) {
        clearInterval(self.state.timerId);
        self.settings.onEnd.call(self.$el);
        return;
      }
      self.render();
    }, 1e3);
  };
  DTimer.prototype.render = function() {
    var t = this.state.remainingTime;
    var units = {
      days: Math.max(Math.floor(t / 864e5), 0),
      hours: Math.max(Math.floor(t % 864e5 / 36e5), 0),
      minutes: Math.max(Math.floor(t % 36e5 / 6e4), 0),
      seconds: Math.max(Math.ceil(t % 6e4 / 1e3), 0)
    };
    var html = [];
    var self = this;
    $.each(this.settings.displayUnits, function(unit, show) {
      if (show) {
        var val = String(units[unit]).padStart(2, "0");
        html.push('<div class="' + self.settings.itemClassName + " " + unit + '"><span>' + val + "</span></div>");
      }
    });
    this.$el.html(html.join(""));
  };
  $.fn.dtimer = function(options) {
    return this.each(function() {
      if (!$.data(this, "dtimer")) {
        $.data(this, "dtimer", new DTimer(this, options));
      }
    });
  };
})(window.jQuery);
//# sourceMappingURL=dworks-jquery-dtimer.esm.js.map

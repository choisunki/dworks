var DWorksJqueryDtimer = (() => {
  (function ($) {
    if (!$) return;

    function DTimer(element, options) {
      this.$el = $(element);
      this.settings = $.extend(true, {
        displayUnits: {
          days: true,
          hours: true,
          minutes: true,
          seconds: true
        },
        itemClassName: 'countdown__item',

        // 현재 시간 지정 가능
        // - null : new Date()
        // - Date 객체
        // - timestamp(ms)
        // - function() { return Date | timestamp; }
        now: null,

        // 시작 전 대기 상태 처리 여부
        showWaiting: true,
        waitingHtml: '<div class="timer-waiting">이벤트 준비 중</div>',

        onEnd: function () {
          console.log('Timer Finished');
        }
      }, options);

      this.state = {
        remainingTime: 0,
        timerId: null
      };

      this.startTime = null;
      this.endTime = null;

      this.init();
    }

    DTimer.prototype._parseDate = function (str) {
      if (!str) return null;

      var matched = str.match(/\d+/g);
      if (!matched) return null;

      var p = matched.map(Number);

      return new Date(
        p[0],
        (p[1] || 1) - 1,
        p[2] || 1,
        p[3] || 0,
        p[4] || 0,
        p[5] || 0
      );
    };

    DTimer.prototype._getNow = function () {
      var now = this.settings.now;

      if (typeof now === 'function') {
        now = now.call(this.$el[0], this.$el);
      }

      if (now instanceof Date) {
        return now.getTime();
      }

      if (typeof now === 'number' && !isNaN(now)) {
        return now;
      }

      return new Date().getTime();
    };

    DTimer.prototype.init = function () {
      var startTimeStr = this.$el.attr('data-start');
      var endTimeStr = this.$el.attr('data-end');
      var start = this._parseDate(startTimeStr);
      var end = this._parseDate(endTimeStr);
      var now = this._getNow();

      if (!end) return;

      this.startTime = start ? start.getTime() : null;
      this.endTime = end.getTime();

      if (this.startTime && this.settings.showWaiting && now < this.startTime) {
        this.$el.html(this.settings.waitingHtml);
        return;
      }

      this.state.remainingTime = this.endTime - now;

      if (this.state.remainingTime > 0) {
        this.run();
      } else {
        this.settings.onEnd.call(this.$el);
      }
    };

    DTimer.prototype.run = function () {
      var self = this;

      this.render();

      this.state.timerId = setInterval(function () {
        var now = self._getNow();

        self.state.remainingTime = self.endTime - now;

        if (self.state.remainingTime <= 0) {
          clearInterval(self.state.timerId);
          self.state.timerId = null;
          self.state.remainingTime = 0;
          self.render();
          self.settings.onEnd.call(self.$el);
          return;
        }

        self.render();
      }, 1000);
    };

    DTimer.prototype.render = function () {
      var t = this.state.remainingTime;
      var units = {
        days: Math.max(Math.floor(t / 86400000), 0),
        hours: Math.max(Math.floor((t % 86400000) / 3600000), 0),
        minutes: Math.max(Math.floor((t % 3600000) / 60000), 0),
        seconds: Math.max(Math.floor((t % 60000) / 1000), 0)
      };
      var html = [];
      var self = this;

      $.each(this.settings.displayUnits, function (unit, show) {
        if (show) {
          var val = String(units[unit]).padStart(2, '0');
          html.push(
            '<div class="' + self.settings.itemClassName + ' ' + unit + '">' +
              '<span>' + val + '</span>' +
            '</div>'
          );
        }
      });

      this.$el.html(html.join(''));
    };

    DTimer.prototype.destroy = function () {
      if (this.state.timerId) {
        clearInterval(this.state.timerId);
        this.state.timerId = null;
      }
      this.$el.removeData('dtimer');
    };

    $.fn.dtimer = function (options) {
      return this.each(function () {
        var instance = $.data(this, 'dtimer');

        if (!instance) {
          $.data(this, 'dtimer', new DTimer(this, options));
        }
      });
    };
  })(window.jQuery);
})();
/* DALTAN TIMER ($.fn.dtimer) - v1.1 */
;(function ($) {
    if (!$) return;

    function DTimer(element, options) {
        this.$el = $(element);
        this.settings = $.extend(true, {
            displayUnits: { days: true, hours: true, minutes: true, seconds: true },
            itemClassName: "countdown__item",
            baseTime: window.Echotoday || new Date(),
            // 시작 전 대기 상태 처리 여부 (추가)
            showWaiting: true, 
            waitingHtml: '<div class="timer-waiting">이벤트 준비 중</div>',
            onEnd: function() { console.log('Timer Finished'); }
        }, options);

        this.state = { remainingTime: 0, timerId: null };
        this.init();
    }

    DTimer.prototype._parseDate = function (str) {
        if (!str) return null;
            
            // 숫자만 골라내서 배열로 만듭니다 (하이픈, 공백, 콜론 모두 무시)
            var p = str.match(/\d+/g).map(Number);
            
            // 연, 월, 일, 시, 분, 초 순서대로 세팅
            // 월(Month)은 0부터 시작하므로 -1 해주는 게 핵심입니다 
            return new Date(p[0], p[1] - 1, p[2], p[3], p[4], p[5]);
    };

    DTimer.prototype.init = function () {
        var self = this;
        var startTimeStr = this.$el.attr('data-start'); 
        var endTimeStr = this.$el.attr('data-end'); 
        var end = this._parseDate(endTimeStr);
        if (!end) return;

        var now = this.settings.baseTime.getTime();
        
        // 1. 시작 시간 체크 (옵션에 따라 처리)
        if (startTimeStr && this.settings.showWaiting) {
            var start = this._parseDate(startTimeStr).getTime();
            if (now < start) {
                // 시작 전이라면 대기 문구 출력 후 종료 
                this.$el.html(this.settings.waitingHtml);
                return;
            }
        }

        // 2. 남은 시간 계산 및 실행
        this.state.remainingTime = end.getTime() - now;
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
            self.state.remainingTime -= 1000; // 1초씩 차감 [cite: 337]
            if (self.state.remainingTime <= 0) {
                clearInterval(self.state.timerId);
                self.settings.onEnd.call(self.$el);
                return;
            }
            self.render();
        }, 1000);
    };

    DTimer.prototype.render = function () {
        var t = this.state.remainingTime;
        // 시간 단위 계산 [cite: 331, 337]
        var units = {
            days: Math.max(Math.floor(t / 864e5), 0),
            hours: Math.max(Math.floor((t % 864e5) / 36e5), 0),
            minutes: Math.max(Math.floor((t % 36e5) / 6e4), 0),
            seconds: Math.max(Math.ceil((t % 6e4) / 1e3), 0)
        };

        var html = [];
        var self = this;

        $.each(this.settings.displayUnits, function (unit, show) {
            if (show) {
                var val = String(units[unit]).padStart(2, "0"); // 2자리 포맷팅 [cite: 331, 337]
                html.push('<div class="' + self.settings.itemClassName + ' ' + unit + '"><span>' + val + '</span></div>');
            }
        });

        this.$el.html(html.join(""));
    };

    $.fn.dtimer = function (options) {
        return this.each(function () {
            if (!$.data(this, "dtimer")) {
                $.data(this, "dtimer", new DTimer(this, options));
            }
        });
    };
})(window.jQuery);
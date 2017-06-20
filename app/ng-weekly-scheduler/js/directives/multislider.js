angular.module('weeklyScheduler')

  .filter('byIndex', [function () {
    return function (input, index) {
      var ret = [];
      angular.forEach(input, function (el) {
        if (el.index === index) {
          ret.push(el);
        }
      });
      return ret;
    };
  }])

  .directive('multiSlider', ['weeklySchedulerTimeService', function (timeService) {
    return {
      restrict: 'E',
      require: '^weeklyScheduler',
      templateUrl: 'ng-weekly-scheduler/views/multi-slider.html',
      link: function (scope, element, attrs, schedulerCtrl) {
        var conf = schedulerCtrl.config;

        var nbHours = conf.nbDays*4;
        // The default scheduler block size when adding a new item
        var defaultNewScheduleSize = Math.floor(1 / conf.nbDays * 1E8) / 1E6 / 4;

        // var valToPixel = function (val) {
        //   var percent = val / (conf.nbDays);
        //   return Math.floor(percent * element[0].clientWidth + 0.5);
        // };

        var pixelToVal = function (pixel) {
          var percent = pixel / element[0].clientWidth;
          return Math.floor(percent * nbHours);
        };

        var addSlot = function (start, end) {
          start = start >= 0 ? start : 0;
          end = end <= nbHours ? end : nbHours;

          var startDate = timeService.addHour(conf.minDate, start*6);
          var endDate = timeService.addHour(conf.minDate, end*6);

          scope.$apply(function () {
            var item = scope.item;
            if (!item.schedules) {
              item.schedules = [];
            }
            item.schedules.push({start: startDate.toDate(), end: endDate.toDate()});
          });
        };

        var hoverElement = angular.element(element.find('div')[0]);
        var hoverElementWidth = defaultNewScheduleSize;

        hoverElement.css({
          width: hoverElementWidth + '%'
        });

        element.on('mousemove', function (e) {
          var elOffX = element[0].getBoundingClientRect().left;

          hoverElement.css({
            left: e.pageX - elOffX - hoverElementWidth / 2 + 'px'
          });
        });

        hoverElement.on('click', function (event) {
          if (!element.attr('no-add')) {
            var elOffX = element[0].getBoundingClientRect().left;
            var pixelOnClick = event.pageX - elOffX;
            var valOnClick = pixelToVal(pixelOnClick);

            var start = Math.round(valOnClick - defaultNewScheduleSize / 2);
            var end = start + 1;
            console.log('elOffX', elOffX);
            console.log('pixelOnClick', pixelOnClick);
            console.log('valOnClick', valOnClick);
            console.log('start', start);
            console.log('end', end);

            addSlot(start, end);
          }
        });
      }
    };
  }]);
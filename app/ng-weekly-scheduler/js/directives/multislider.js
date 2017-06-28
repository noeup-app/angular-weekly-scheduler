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

        var scheduleName = attrs.schedulename
        scope.schedulesLenght = Object.keys(scope.item.schedules);
        scope.scheduleName = scheduleName;
        var nbHours = conf.nbDays * 4;
        // The default scheduler block size when adding a new item
        var defaultNewScheduleSize = Math.floor(1 / conf.nbDays * 1E8) / 1E6 / 4;

        // var valToPixel = function (val) {
        //   var percent = val / (conf.nbDays);
        //   return Math.floor(percent * element[0].clientWidth + 0.5);
        // };

        var percentToPixel = function (percent) {
          return (percent / 100) * element[0].clientWidth;
        };

        var pixelToVal = function (pixel) {
          var percent = pixel / element[0].clientWidth;
          return Math.floor(percent * nbHours);
        };

        var addSlot = function (start, end, slotMeta) {
          start = start >= 0 ? start : 0;
          end = end <= nbHours ? end : nbHours;

          var indexDay = Math.floor(start / 4);
          var indexHour = start % 4;

          var translate = {
            0: 8,
            1: 10,
            2: 14,
            3: 16
          };

          var startingHour = translate[indexHour];

          var startDate = timeService.addDay(conf.minDate, indexDay).set('hour', startingHour);
          var endDate = timeService.addDay(conf.minDate, indexDay).set('hour', startingHour + 2);

          scope.$apply(function () {
            var item = scope.item;
            if (!item.schedules[scheduleName]) {
              item.schedules[scheduleName] = [];
            }
            var schedule = { start: startDate.toDate(), end: endDate.toDate(), meta: slotMeta }
            var slotIndex = item.schedules[scheduleName].push(schedule) - 1;
          });
        };

        var hoverElement = angular.element(element.find('div')[0]);
        var hoverElementWidth = defaultNewScheduleSize;

        hoverElement.css({
          width: hoverElementWidth + '%'
        });

        element.on('mousemove', function (e) {
          var elOffX = element[0].getBoundingClientRect().left;
          var pixelBarWidth = percentToPixel(hoverElementWidth)

          var left = e.pageX - elOffX - pixelBarWidth / 2
          var stickyLeft = Math.round(left / pixelBarWidth) * pixelBarWidth

          hoverElement.css({
            left: stickyLeft + 'px'
          });
        });

        hoverElement.on('click', function (event) {
          if (!element.attr('no-add')) {
            var elOffX = element[0].getBoundingClientRect().left;
            var pixelOnClick = event.pageX - elOffX;
            var valOnClick = pixelToVal(pixelOnClick);

            // var start = Math.round(valOnClick - defaultNewScheduleSize / 2);
            var start = valOnClick;
            var end = start + 1;

            conf.onSlotAdded(function(slotMeta){
              console.log("slotMeta", slotMeta)

              addSlot(start, end, slotMeta);
            });
          }
        });
      }
    };
  }]);
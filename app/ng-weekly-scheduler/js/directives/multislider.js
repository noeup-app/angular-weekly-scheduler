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

        var slots= 32;
        var slotSizeInHour = 2;

        var rowIndex = attrs.rowIndex;

        var scheduleName = attrs.schedulename;
        scope.schedulesLenght = Object.keys(scope.item.schedules);
        scope.scheduleName = scheduleName;
        var scheduleIndex = attrs.index;
        var nbHours = conf.nbDays * slots;
        // The default scheduler block size when adding a new item
        var defaultNewScheduleSize = Math.floor((slotSizeInHour * slots/8) / conf.nbDays * 1E8) / 1E6 / slots;

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

          //slotMeta.idxStart = start;
          //slotMeta.idxEnd = end;

          var indexDay = Math.floor(start / slots);
          var indexHour = start % slots;

          var translate = {
            0: 8,//8,
            1: 8,//8.25,
            2: 8,//8.5,
            3: 8,//8.75,
            4: 8,//9,
            5: 8,//9.25,
            6: 8,//9.5,
            7: 8,//9.75,
            8: 10,//10,
            9: 10,//10.25,
            10:10,//10.5,
            11:10,//10.75,
            12:10,//11,
            13:10,//11.25,
            14:10,//11.5,
            15:10,//11.75,
            16:10,//12,
            17:14,//14.25,
            18:14,//14.5,
            19:14,//14.75,
            20:14,//15,
            21:14,//15.25,
            22:14,//15.5,
            23:14,//15.75,
            24:16,//16,
            25:16,//16.25,
            26:16,//16.5,
            27:16,//16.75,
            28:16,//17,
            29:16,//17.25,
            30:16,//17.5,
            31:16//17.75
          };

          var startingHour = translate[indexHour];
          var endingHour = startingHour + 2;

          var startDate = timeService.addDayAndWeekEnd(conf.minDate, indexDay).set('hour', startingHour);
          //console.log('startingHour', startingHour, timeService.addDayAndWeekEnd(conf.minDate, indexDay), indexDay)
          //console.log('startDate', startDate)

          var endDate = startDate.clone().set('hour', endingHour);


          var item = scope.item;
          if (!item.schedules[scheduleName]) {
            item.schedules[scheduleName] = [];
          }
          var schedule = {
            start: startDate.toDate(),
            end: endDate.toDate(),
            duration: (endingHour - startingHour) * 4, //calculate nb of 15mins
            meta: slotMeta
          };
          item.schedules[scheduleName].push(schedule);

          schedulerCtrl.on.change(scheduleIndex, scheduleName, schedule, rowIndex);

          if (!scope.$$phase) scope.$apply();
        };

        var hoverElement = angular.element(element.find('div')[0]);
        var hoverElementWidth = defaultNewScheduleSize;

        hoverElement.css({
          width: hoverElementWidth + '%'
        });

        element.on('mousemove', function (e) {
          var elOffX = element[0].getBoundingClientRect().left;
          var pixelBarWidth = percentToPixel(hoverElementWidth);

          var left = e.pageX - elOffX - pixelBarWidth / 2;
          var stickyLeft = Math.round(left / pixelBarWidth) * pixelBarWidth;

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
            var end = start + (slots/8) * slotSizeInHour;

            conf.onSlotAdded(function(slotMeta){
              //console.log("slotMeta", slotMeta, start, end)

              addSlot(start, end, slotMeta);
            }, rowIndex, scheduleName);
          }
        });
      }
    };
  }]);
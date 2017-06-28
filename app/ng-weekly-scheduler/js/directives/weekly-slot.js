angular.module('weeklyScheduler')

  .directive('weeklySlot', ['weeklySchedulerTimeService', function (timeService) {
    return {
      restrict: 'E',
      require: ['^weeklyScheduler', 'ngModel'],
      templateUrl: 'ng-weekly-scheduler/views/weekly-slot.html',
      link: function (scope, element, attrs, ctrls) {
        var schedulerCtrl = ctrls[0], ngModelCtrl = ctrls[1];
        var conf = schedulerCtrl.config;
        var index = scope.$parent.$index;
        var containerEl = element.parent();
        var resizeDirectionIsStart = true;
        var valuesOnDragStart = { start: scope.schedule.start, end: scope.schedule.end };
        var nbHours = conf.nbDays * 4;
        var multiSliderName = scope.$parent.scheduleName;

        // console.log("scope", scope.schedule)
        scope.slotText = conf.getSlotText && conf.getSlotText(scope.schedule) || scope.schedule.start + ' - ' + scope.schedule.end;

        var pixelToVal = function (pixel) {
          var percent = pixel / element[0].parentElement.clientWidth;
          return Math.floor(percent * nbHours);
        };

        var mergeOverlaps = function () {
          var schedule = scope.schedule;
          var schedules = scope.item.schedules[multiSliderName];
          schedules.forEach(function (el) {
            if (el !== schedule) {
              // model is inside another slot
              if (el.end >= schedule.end && el.start <= schedule.start) {
                schedules.splice(schedules.indexOf(el), 1);
                schedule.end = el.end;
                schedule.start = el.start;
              }
              // model completely covers another slot
              else if (schedule.end >= el.end && schedule.start <= el.start) {
                schedules.splice(schedules.indexOf(el), 1);
              }
              // another slot's end is inside current model
              else if (el.end >= schedule.start && el.end <= schedule.end) {
                schedules.splice(schedules.indexOf(el), 1);
                schedule.start = el.start;
              }
              // another slot's start is inside current model
              else if (el.start >= schedule.start && el.start <= schedule.end) {
                schedules.splice(schedules.indexOf(el), 1);
                schedule.end = el.end;
              }
            }
          });
        };

        /**
         * Delete on right click on slot
         */
        var deleteSelf = function () {
          containerEl.removeClass('dragging');
          containerEl.removeClass('slot-hover');
          
          scope.item.schedules[multiSliderName].splice(scope.item.schedules[multiSliderName].indexOf(scope.schedule), 1);
          containerEl.find('weekly-slot').remove();
          scope.$apply();
        };

        element.find('span').on('click', function (e) {
          e.preventDefault();
          deleteSelf();
        });

        element.on('mouseover', function () {
          containerEl.addClass('slot-hover');
        });

        element.on('mouseleave', function () {
          containerEl.removeClass('slot-hover');
        });


        if (scope.item.editable !== false) {
          scope.startResizeStart = function () {
            resizeDirectionIsStart = true;
            scope.startDrag();
          };

          scope.startResizeEnd = function () {
            resizeDirectionIsStart = false;
            scope.startDrag();
          };

          scope.startDrag = function () {
            element.addClass('active');

            containerEl.addClass('dragging');
            containerEl.attr('no-add', true);

            valuesOnDragStart = {start: ngModelCtrl.$viewValue.start, end: ngModelCtrl.$viewValue.end};
          };

          scope.endDrag = function () {

            // this prevents user from accidentally
            // adding new slot after resizing or dragging
            setTimeout(function () {
              containerEl.removeAttr('no-add');
            }, 500);

            element.removeClass('active');
            containerEl.removeClass('dragging');

            mergeOverlaps();
            scope.$apply();
          };

          scope.resize = function (d) {
            var ui = ngModelCtrl.$viewValue;
            var delta = pixelToVal(d);

            if (resizeDirectionIsStart) {
              var newStart = valuesOnDragStart.start + (delta / 4);

              if (ui.start !== newStart && newStart <= ui.end - (1/4) && newStart >= 0) {
                ngModelCtrl.$setViewValue({
                  start: newStart,
                  end: ui.end
                });
                ngModelCtrl.$render();
              }
            } else {
              var newEnd = valuesOnDragStart.end + ((delta + 1) / 4);

              if (ui.end !== newEnd && newEnd >= ui.start + (1/4) && newEnd <= nbHours) {
                ngModelCtrl.$setViewValue({
                  start: ui.start,
                  end: newEnd
                });
                ngModelCtrl.$render();
              }
            }
          };

          scope.drag = function (d) {
            var ui = ngModelCtrl.$viewValue;
            var delta = pixelToVal(d);
            var duration = valuesOnDragStart.end - valuesOnDragStart.start;

            var newStart = valuesOnDragStart.start + (delta / 4);
            var newEnd = newStart + duration;

            if (ui.start !== newStart && newStart >= 0 && newEnd <= nbHours) {
              ngModelCtrl.$setViewValue({
                start: newStart,
                end: newEnd
              });
              ngModelCtrl.$render();
            }
          };
        }

        // on init, merge overlaps
        mergeOverlaps(true);

        //// UI -> model ////////////////////////////////////
        ngModelCtrl.$parsers.push(function onUIChange(ui) {
          ngModelCtrl.$modelValue.start = timeService.addWeek(conf.minDate, ui.start).toDate();
          ngModelCtrl.$modelValue.end = timeService.addWeek(conf.minDate, ui.end).toDate();
          //$log.debug('PARSER :', ngModelCtrl.$modelValue.$$hashKey, index, scope.$index, ngModelCtrl.$modelValue);
          schedulerCtrl.on.change(index, scope.$index, ngModelCtrl.$modelValue);
          return ngModelCtrl.$modelValue;
        });

        //// model -> UI ////////////////////////////////////
        ngModelCtrl.$formatters.push(function onModelChange(model) {

          var translate = {
            8: 0,
            10: 6,
            12: 12,
            14: 12,
            16: 18,
            18: 24
          };

          // console.log("")
          // console.log("model -> UI - RAW", moment(model.start).format("LLLL"), moment(model.end).format("LLLL"))

          var startHour = moment(model.start).get('hour');
          var endHour = moment(model.end).get('hour');

          // console.log(startHour, endHour)

          var startHourTranslateTo = translate[startHour];
          var endHourTranslateTo = translate[endHour];

          // console.log(startHourTranslateTo, endHourTranslateTo)

          if (startHourTranslateTo !== undefined && endHourTranslateTo !== undefined) {
            var start = moment(model.start).clone().set('hour', startHourTranslateTo)
            var end = moment(model.end).clone().set('hour', endHourTranslateTo)
            console.log("model -> UI", start.format("LLLL"), end.format("LLLL"))
            var ui = {
              start: timeService.dayPreciseDiff(conf.minDate, moment(start), true),
              end: timeService.dayPreciseDiff(conf.minDate, moment(end), true)
            };
            // console.log("ui model -> UI", ui)
            //$log.debug('FORMATTER :', index, scope.$index, ui);
            return ui;
          }
          // console.log("ERROR while converting model to UI - startHour : " + startHour, "endHour : ", endHour)
          return { start: -100, end: -100 };
        });

        ngModelCtrl.$render = function () {
          var ui = ngModelCtrl.$viewValue;
          var css = {
            left: ui.start / conf.nbDays * 100 + '%',
            width: (ui.end - ui.start) / conf.nbDays * 100 + '%'
          };

          //$log.debug('RENDER :', index, scope.$index, css);
          element.css(css);
        };

        scope.$on('weeklySchedulerLocaleChanged', function () {
          // Simple change object reference so that ngModel triggers formatting & rendering
          scope.schedule = angular.copy(scope.schedule);
        });
      }
    };
  }]);
angular.module('weeklyScheduler')

  .directive('hourlySlot', ['weeklySchedulerTimeService', function (timeService) {
    return {
      restrict: 'E',
      require: ['^weeklyScheduler', 'ngModel'],
      templateUrl: 'ng-weekly-scheduler/views/hourly-slot.html',
      link: function (scope, element, attrs, ctrls) {
        var schedulerCtrl = ctrls[0], ngModelCtrl = ctrls[1];
        var conf = schedulerCtrl.config;
        var index = scope.$parent.$index;
        var containerEl = element.parent();
        var resizeDirectionIsStart = true;
        var valuesOnDragStart = {start: scope.schedule.start, end: scope.schedule.end};
        var nbHours = conf.nbDays * 4;
        var multiSliderName = scope.$parent.scheduleName;
        var hours = timeService.hourDistribution(schedulerCtrl.config.minDate, schedulerCtrl.config.maxDate);

        scope.slotText = conf.getSlotText && conf.getSlotText(scope.schedule) || scope.schedule.start + ' - ' + scope.schedule.end;

        var pixelToVal = function (pixel) {
          var percent = pixel / element[0].parentElement.clientWidth;
          return Math.floor(percent * nbHours);
        };

        var mergeOverlaps = function () {
          var schedule = scope.schedule;
          var schedules = scope.item.schedules[multiSliderName];

          // two edge cases : 
          //  - 1) other is the last slot of the previous day and current is the first of this day
          //  - 2) other is the second of the day and current is the third
          var isTheOtherSlotEndInsideCurrentModel = function (other, current) {
            var otherEnd = moment(other.end);
            var currentStart = moment(current.start);

            var dayDiff =
              moment(current.start).startOf('day')
                .diff(moment(other.end).startOf('day'), 'day');

            var othersEndHour = otherEnd.get('hour');
            var currentsStartHour = currentStart.get('hour');

            // basic case
            if (other.end >= current.start) {
              return true;
            }

            // edge case 2)
            if (dayDiff == 0 && othersEndHour == 12 && currentsStartHour == 14) {
              return true;
            }


            // edge case 1)
            if (dayDiff == 1 && othersEndHour == 18 && currentsStartHour == 8) {
              return true;
            }
            return false;
          }

          // two edge cases : 
          //  - 1) other is the first slot of the next day and current is the last of this day
          //  - 2) other is the second of the day and current is the third
          var isTheOtherSlotStartInsideCurrentModel = function (other, current) {
            var otherStart = moment(other.start);
            var currentEnd = moment(current.end);

            var dayDiff =
              moment(other.start).startOf('day')
                .diff(moment(current.end).startOf('day'), 'day');

            var othersStartHour = otherStart.get('hour');
            var currentsEndHour = currentEnd.get('hour');

            // basic case
            if (other.start <= current.end) {
              return true;
            }

            // edge case 2)
            if (dayDiff == 0 && othersStartHour == 14 && currentsEndHour == 12) {
              return true;
            }

            console.log("dayDiff:::", dayDiff)
            // edge case 1)
            if (dayDiff == 1 && othersStartHour == 8 && currentsEndHour == 18) {
              return true;
            }
            return false;
          }

          schedules.forEach(function (el) {
            if (el !== schedule) {

              if (!conf.shouldMergeTwoSlots(el, schedule)) {
                return;
              }

              // model is inside another slot
              if (el.end >= schedule.end && el.start <= schedule.start) {
                console.log("model is inside another slot, merging...")
                schedules.splice(schedules.indexOf(el), 1);
                schedule.end = el.end;
                schedule.start = el.start;
              }
              // model completely covers another slot
              else if (schedule.end >= el.end && schedule.start <= el.start) {
                console.log("model completely covers another slot, merging...")
                schedules.splice(schedules.indexOf(el), 1);
              }
              // another slot's end is inside current model
              else if (isTheOtherSlotEndInsideCurrentModel(el, schedule) && el.end <= schedule.end) {
                console.log("another slot's end is inside current model, merging...")
                schedules.splice(schedules.indexOf(el), 1);
                schedule.start = el.start;
              }
              // another slot's start is inside current model
              else if (el.start >= schedule.start && isTheOtherSlotStartInsideCurrentModel(el, schedule)) {
                console.log("another slot's start is inside current model, merging...")
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
          containerEl.find('hourly-slot').remove();
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

              if (ui.start !== newStart && newStart <= ui.end - (1 / 4) && newStart >= 0) {
                ngModelCtrl.$setViewValue({
                  start: newStart,
                  end: ui.end
                });
                ngModelCtrl.$render();
              }
            } else {
              var newEnd = valuesOnDragStart.end + ((delta + 1) / 4);

              if (ui.end !== newEnd && newEnd >= ui.start + (1 / 4) && newEnd <= nbHours) {
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

          var translate = {
            end: {
              0: 18,
              0.75: 14,
              0.50: 12,
              0.25: 10
            }
          };

          var endOfSlot = ((ui.end + 1) % 4) - Math.floor((ui.end + 1) % 4);
          var endToTranslate = translate.end[endOfSlot];

          ngModelCtrl.$modelValue.start = hours[ui.start * 4].start;
          ngModelCtrl.$modelValue.end = (endToTranslate === 18 || endToTranslate === 12) ? hours[(ui.end * 4) - 1].end : hours[ui.end * 4].start;

          ngModelCtrl.$modelValue.start = ngModelCtrl.$modelValue.start.toDate(); //Equivalent to moment(ngModelCtrl.$modelValue.start).utc().format();
          ngModelCtrl.$modelValue.end = ngModelCtrl.$modelValue.end.toDate(); // Equivalent to moment(ngModelCtrl.$modelValue.end).utc().format();

          schedulerCtrl.on.change(index, scope.$index, ngModelCtrl.$modelValue);

          return ngModelCtrl.$modelValue;
        });

        //// model -> UI ////////////////////////////////////
        ngModelCtrl.$formatters.push(function onModelChange(model) {

          var startHour = moment(model.start).get('hour');
          var endHour = moment(model.end).get('hour');

          if (startHour !== undefined && endHour !== undefined) {

            var idxStart = -1;
            var idxEnd = -1;

            hours.forEach(function (hour) {
              if (hour.start.format() === moment(ngModelCtrl.$modelValue.start).format())
                idxStart = hours.indexOf(hour);
              if (hour.end.format() === moment(ngModelCtrl.$modelValue.end).format())
                idxEnd = hours.indexOf(hour) + 1;
            });

            return {
              start: idxStart / 4,
              end: idxEnd / 4
            };
          }
          return {start: -100, end: -100};
        });

        ngModelCtrl.$render = function () {
          var ui = ngModelCtrl.$viewValue;
          var css = {
            left: ui.start / conf.nbDays * 100 + '%',
            width: (ui.end - ui.start) / conf.nbDays * 100 + '%'
          };

          element.css(css);
        };

        scope.$on('weeklySchedulerLocaleChanged', function () {
          // Simple change object reference so that ngModel triggers formatting & rendering
          console.log("Schedule changed ___ ", scope.schedule);
          scope.schedule = angular.copy(scope.schedule);
        });
      }
    };
  }]);
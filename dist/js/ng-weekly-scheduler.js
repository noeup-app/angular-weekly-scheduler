;(function( window, undefined ){ 
 'use strict';

angular.module('weeklyScheduler', ['ngWeeklySchedulerTemplates']);

/* jshint -W098 */
var GRID_TEMPLATE = angular.element('<div class="grid-item"></div>');
var CLICK_ON_A_CELL = 'clickOnACell';

var isCtrl;

function ctrlCheck(e) {
  if (e.which === 17) {
    isCtrl = e.type === 'keydown';
  }
}

function mouseScroll(el, delta) {

  window.addEventListener('keydown', ctrlCheck);
  window.addEventListener('keyup', ctrlCheck);

  el.addEventListener('mousewheel', function (e) {
    e.preventDefault();
    e.stopPropagation();

    if (isCtrl) {
      var style = el.firstChild.style, currentWidth = parseInt(style.width);
      if ((e.wheelDelta || e.detail) > 0) {
        style.width = (currentWidth + 2 * delta) + '%';
      } else {
        var width = currentWidth - 2 * delta;
        style.width = (width > 100 ? width : 100) + '%';
      }
    } else {
      if ((e.wheelDelta || e.detail) > 0) {
        el.scrollLeft -= delta;
      } else {
        el.scrollLeft += delta;
      }
    }
    return false;
  });
}

function zoomInACell(el, event, data) {

  var nbElements = data.nbElements;
  var idx = data.idx;
  // percentWidthFromBeginning is used when the first element of the grid is not full
  // For instance, in the example below `feb 17` is not full
  // feb 17          march 17
  //       |                          |
  var percentWidthFromBeginning = data.percentWidthFromBeginning;

  var containerWidth = el.offsetWidth;

  // leave (1/3) each side
  // 1/3 |    3/3   | 1/3
  var boxWidth = containerWidth / (5 / 3);
  var gutterSize = boxWidth / 3;

  var scheduleAreaWidthPx = nbElements * boxWidth;
  var scheduleAreaWidthPercent = (scheduleAreaWidthPx / containerWidth) * 100;

  el.firstChild.style.width = scheduleAreaWidthPercent + '%';

  if (percentWidthFromBeginning === undefined) {
    // All cells of a line have the same size
    el.scrollLeft = idx * boxWidth - gutterSize;
  } else {
    // Sizes of cells in a line could different (especially the first one)
    el.scrollLeft = scheduleAreaWidthPx * (percentWidthFromBeginning / 100) - gutterSize;
  }
}
/* jshint +W098 */

/*global GRID_TEMPLATE */
angular.module('weeklyScheduler')
  .directive('dailyGrid', ['weeklySchedulerTimeService', function (timeService) {

    function handleClickEvent(child, nbDays, idx, scope) {
      child.bind('click', function () {
        scope.$broadcast(CLICK_ON_A_CELL, {
          nbElements: nbDays,
          idx: idx
        });
      });
    }


    function doGrid(scope, element, attrs, model) {
      // Clean element
      element.empty();

      // Calculation day distribution
      var days = timeService.dayDistribution(model.minDate, model.maxDate);
      // console.log('var days', days);

      // Deploy the grid system on element
      days.forEach(function (day, idx) {

        if (timeService.isWeekEnd(day.start)) {
          return;
        }

        var child = GRID_TEMPLATE.clone().css({width: day.width + '%'});
        child.addClass('day');
        if (angular.isUndefined(attrs.noText)) {
          //console.log("timeService",timeService, day.start, day.start.toDate())

          child.text(timeService.dF(day.start.toDate().toLocaleDateString("fr"), 'LLL EEEE dd'));
          handleClickEvent(child, days.length, idx, scope);
        }
        element.append(child);
      });
    }


    return {
      restrict: 'E',
      require: '^weeklyScheduler',
      link: function (scope, element, attrs, schedulerCtrl) {
        if (schedulerCtrl.config) {
          doGrid(scope, element, attrs, schedulerCtrl.config);
        }
        schedulerCtrl.$modelChangeListeners.push(function (newModel) {
          doGrid(scope, element, attrs, newModel);
        });
      }
    };
  }]);
/*global GRID_TEMPLATE */
angular.module('weeklyScheduler')
    .directive('hourGrid', ['weeklySchedulerTimeService', function (timeService) {

        function doGrid(element, attrs, model) {
            // Clean element
            element.empty();

            // Calculation hour distribution
            var hours = timeService.hourDistribution(model.minDate, model.maxDate);

            // Deploy the grid system on element
          //console.log("%c hours[] : %o" , "background: yellow", hours);
          hours.forEach(function (hour) {
                var child = GRID_TEMPLATE.clone().css({width: hour.width + '%'});
                element.append(child);
            });
        }



        return {
            restrict: 'E',
            require: '^weeklyScheduler',
            link: function (scope, element, attrs, schedulerCtrl) {
                if (schedulerCtrl.config) {
                    doGrid(element, attrs, schedulerCtrl.config);
                }
                schedulerCtrl.$modelChangeListeners.push(function (newModel) {
                    doGrid(element, attrs, newModel);
                });
            }
        };
    }]);


/* global GRID_TEMPLATE, CLICK_ON_A_CELL */
angular.module('weeklyScheduler')
  .directive('monthlyGrid', ['weeklySchedulerTimeService', function (timeService) {

    function handleClickEvent(child, totalWidth, nbMonths, idx, scope) {
      child.bind('click', function () {
        scope.$broadcast(CLICK_ON_A_CELL, {
          nbElements: nbMonths,
          idx: idx,
          percentWidthFromBeginning: totalWidth
        });
      });
    }

    function doGrid(scope, element, attrs, model) {
      // Clean element
      element.empty();

      // Calculation month distribution
      var months = timeService.monthDistribution(model.minDate, model.maxDate);

      var totalWidth = 0;
      // Deploy the grid system on element
      months.forEach(function (month, idx) {
        var child = GRID_TEMPLATE.clone().css({ width: month.width + '%' });
        if (angular.isUndefined(attrs.noText)) {
          handleClickEvent(child, totalWidth, months.length, idx, scope);
          child.text(timeService.dF(month.start.toDate(), 'MMM yyyy'));
        }
        totalWidth += month.width;
        element.append(child);
      });
    }

    return {
      restrict: 'E',
      require: '^weeklyScheduler',
      link: function (scope, element, attrs, schedulerCtrl) {
        schedulerCtrl.$modelChangeListeners.push(function (newModel) {
          doGrid(scope, element, attrs, newModel);
        });
      }
    };
  }]);
/* global GRID_TEMPLATE, CLICK_ON_A_CELL */
angular.module('weeklyScheduler')
  .directive('weeklyGrid', ['weeklySchedulerTimeService', function (timeService) {


    function handleClickEvent(child, nbWeeks, idx, scope) {
      child.bind('click', function () {
        scope.$broadcast(CLICK_ON_A_CELL, {
          nbElements: nbWeeks,
          idx: idx
        });
      });
    }


    function doGrid(scope, element, attrs, model) {
      // Clean element
      element.empty();


      // Calculation week distribution
      var weeks = timeService.weekDistribution(model.minDate, model.maxDate);

      // Deploy the grid system on element
      weeks.forEach(function (week, i) {
        var child = GRID_TEMPLATE.clone().css({width: week.width + '%'});
        if (angular.isUndefined(attrs.noText)) {
          handleClickEvent(child, weeks.length, i, scope);
          child.text(timeService.dF(week.start.toDate(), 'ww'));

        }
        element.append(child);
      });
    }


    return {
      restrict: 'E',
      require: '^weeklyScheduler',
      link: function (scope, element, attrs, schedulerCtrl) {
        if (schedulerCtrl.config) {
          doGrid(scope, element, attrs, schedulerCtrl.config);
        }
        schedulerCtrl.$modelChangeListeners.push(function (newModel) {
          doGrid(scope, element, attrs, newModel);
        });
      }
    };
  }]);

angular.module('weeklyScheduler')
  .directive('handle', ['$document', function ($document) {
    return {
      restrict: 'A',
      scope: {
        ondrag: '=',
        ondragstop: '=',
        ondragstart: '='
      },
      link: function (scope, element) {

        var x = 0;

        element.on('mousedown', function (event) {
          // Prevent default dragging of selected content
          event.preventDefault();

          x = event.pageX;

          $document.on('mousemove', mousemove);
          $document.on('mouseup', mouseup);

          if (scope.ondragstart) {
            scope.ondragstart();
          }
        });

        function mousemove(event) {
          var delta = event.pageX - x;
          if (scope.ondrag) {
            scope.ondrag(delta);
          }
        }

        function mouseup() {
          $document.unbind('mousemove', mousemove);
          $document.unbind('mouseup', mouseup);

          if (scope.ondragstop) {
            scope.ondragstop();
          }
        }
      }
    };
  }]);
angular.module('weeklyScheduler')
  .directive('inject', [function () {

    return {
      link: function ($scope, $element, $attrs, controller, $transclude) {

        // TODO : refactor 
        // Sigle responsability
        function resize(el){
          //console.log(el[0].children[0])
          var height = el[0].children[0].offsetHeight;
          var nbLines = Object.keys($scope.item.schedules).length;

          el[0].children[0].style.height = height * nbLines + 'px';
          el[0].children[0].style['line-height'] = height * nbLines + 'px';
        }

        if (!$transclude) {
          throw 'Illegal use of ngTransclude directive in the template! No parent directive that requires a transclusion found.';
        }
        var innerScope = $scope.$new();
        $transclude(innerScope, function (clone) {
          $element.empty();
          $element.append(clone);
          resize($element)
          $element.on('$destroy', function () {
            innerScope.$destroy();
          });
        });
      }
    };
  }]);
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
/* global mouseScroll, CLICK_ON_A_CELL, zoomInACell */
angular.module('weeklyScheduler')

  .directive('weeklyScheduler', ['$parse', 'weeklySchedulerTimeService', '$log', function ($parse, timeService, $log) {

    var defaultOptions = {
      monoSchedule: false,
      selector: '.schedule-area-container'
    };

    /**
     * Configure the scheduler.
     * @param schedules
     * @param options
     * @returns {{minDate: *, maxDate: *, nbWeeks: *}}
     */
    function config(schedules, options, getSlotText, onSlotAdded, shouldMergeTwoSlots, onSlotDeleted) {
      var now = moment();

      // Calculate min date of all scheduled events
      var minDate = (options.startDate) ? moment(options.startDate).utc() : moment().add(- 1, 'month').startOf('week').add(1, 'day');

      // Calculate max date of all scheduled events
      var maxDate = (options.endDate) ? moment(options.endDate).utc() : moment().add(1, 'month').endOf('week').subtract(1, 'day');

      // Calculate nb of weeks covered by minDate => maxDate
      var nbWeeks = timeService.weekDiff(minDate, maxDate);

      // Calculate nb of days covered by minDate => maxDate
      var nbDays = timeService.dayDiff(minDate, maxDate);


      var result = angular.extend(options, { 
        minDate: minDate,
        maxDate: maxDate,
        startDate: options.startDate,
        endDate: options.endDate,
        nbWeeks: nbWeeks,
        nbDays: nbDays,
        getSlotText: getSlotText,
        onSlotAdded: onSlotAdded,
        onSlotDeleted: onSlotDeleted,
        shouldMergeTwoSlots: shouldMergeTwoSlots 
      });
      // Log configuration
      $log.debug('Weekly Scheduler configuration:', result);

      return result;
    }

    return {
      restrict: 'E',
      require: 'weeklyScheduler',
      transclude: true,
      templateUrl: 'ng-weekly-scheduler/views/weekly-scheduler.html',
      controller: ['$injector', function ($injector) {
        // Try to get the i18n service
        var name = 'weeklySchedulerLocaleService';
        if ($injector.has(name)) {
          $log.info('The I18N service has successfully been initialized!');
          var localeService = $injector.get(name);
          defaultOptions.labels = localeService.getLang();
        } else {
          $log.info('No I18N found for this module, check the ng module [weeklySchedulerI18N] if you need i18n.');
        }

        // Will hang our model change listeners
        this.$modelChangeListeners = [];
      }],
      controllerAs: 'schedulerCtrl',
      link: function (scope, element, attrs, schedulerCtrl) {
        var optionsFn = $parse(attrs.options);
        var options = angular.extend(defaultOptions, optionsFn(scope) || {});

        var getSlotText = $parse(attrs.getSlotText)(scope);
        var onSlotAdded = $parse(attrs.onSlotAdded)(scope);
        var onSlotDeleted = $parse(attrs.onSlotDeleted)(scope);
        var shouldMergeTwoSlots = $parse(attrs.shouldMergeTwoSlots)(scope);

        // Get the schedule container element
        var el = element[0].querySelector(defaultOptions.selector);

        function onModelChange(items) {
          // Check items are present
          if (items) {

            // Check items are in an Array
            if (!angular.isArray(items)) {
              throw 'You should use weekly-scheduler directive with an Array of items';
            }

            // Keep track of our model (use it in template)
            schedulerCtrl.items = items;

            // First calculate configuration
            schedulerCtrl.config = config(items.reduce(function (result, item) {
              var schedules = item.schedules;

              return result.concat(schedules && Object.keys(schedules).length ?
                // If in multiSlider mode, ensure a schedule array is present on each item
                // Else only use first element of schedule array
                (options.monoSchedule ? item.schedules = [schedules[0]] : schedules) :
                item.schedules = []
              );
            }, []), options, getSlotText, onSlotAdded, shouldMergeTwoSlots, onSlotDeleted);

            // Finally, run the sub directives listeners
            schedulerCtrl.$modelChangeListeners.forEach(function (listener) {
              listener(schedulerCtrl.config);
            });
          }
        }

        if (el) {
          // Install mouse scrolling event listener for H scrolling
          mouseScroll(el, 20);

          // Set the init width 
          el.firstChild.style.width = '100%';

          scope.$on(CLICK_ON_A_CELL, function (e, data) {
            zoomInACell(el, e, data);
          });

          schedulerCtrl.on = {
            change: function (itemIndex, scheduleIndex, scheduleValue, rowIndex) {
              var onChangeFunction = $parse(attrs.onChange)(scope);
              if (angular.isFunction(onChangeFunction)) {
                return onChangeFunction(itemIndex, scheduleIndex, scheduleValue, rowIndex);
              }
            }
          };

          /**
           * Watch the model items
           */
          scope.$watchCollection(attrs.items, onModelChange);

          /**
           * Listen to $locale change (brought by external module weeklySchedulerI18N)
           */
          scope.$on('weeklySchedulerLocaleChanged', function (e, labels) {
            if (schedulerCtrl.config) {
              schedulerCtrl.config.labels = labels;
            }
            onModelChange(angular.copy($parse(attrs.items)(scope), []));
          });
        }
      }
    };
  }]);
angular.module('weeklyScheduler')

  .directive('weeklySlot', ['weeklySchedulerTimeService', function (timeService) {
    return {
      restrict: 'E',
      require: ['^weeklyScheduler', 'ngModel'],
      templateUrl: 'ng-weekly-scheduler/views/weekly-slot.html',
      link: function (scope, element, attrs, ctrls) {
        var slots = 32;
        var schedulerCtrl = ctrls[0], ngModelCtrl = ctrls[1];
        var conf = schedulerCtrl.config;
        var index = scope.$parent.$index;
        var containerEl = element.parent();
        var resizeDirectionIsStart = true;
        var valuesOnDragStart = {start: scope.schedule.start, end: scope.schedule.end};
        var nbHours = conf.nbDays * slots;
        var multiSliderName = scope.$parent.scheduleName;
        var hours = timeService.hourDistribution(schedulerCtrl.config.minDate, schedulerCtrl.config.maxDate);

        var translate = {
          end: {
            //0: 18,
            //0.75: 14,
            //0.50: 12,
            //0.25: 10
            0: 8,
            0.03125: 8,
            0.0625: 8,
            0.09375: 8,
            0.125: 8,//9,
            0.15625: 8,//9.25,
            0.1875: 8,//9.5,
            0.21875: 8,//9.75,
            0.25: 10,//10,
            0.28125: 10,//10.25,
            0.3125: 10,//10.5,
            0.34375: 10,//10.75,
            0.375: 10,//11,
            0.40625: 10,//11.25,
            0.4375: 10,//11.5,
            0.46875: 10,//11.75,
            0.5: 14,//14,
            0.53125: 14,//14.25,
            0.5625: 14,//14.5,
            0.59375: 14,//14.75,
            0.625: 14,//15,
            0.65625: 14,//15.25,
            0.6875: 14,//15.5,
            0.71875: 14,//15.75,
            0.75: 16,//16,
            0.78125: 16,//16.25,
            0.8125: 16,//16.5,
            0.84375: 16,//16.75,
            0.875: 16,//17,
            0.90625: 16,//17.25,
            0.9375: 16,//17.5,
            0.96875: 16//17.75
          }
        };

        var ghostReference = containerEl.find('ghost');

       //scope.ngModelCtrl = ngModelCtrl;
       //scope.$watch('ngModelCtrl', function (o, n) {
       //  console.log('modelCtrl ------ ', o)
       //})


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

            //console.log("dayDiff:::", dayDiff)
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

          var rowSchedule = scope.item.schedules[multiSliderName];
          var indexSlot = rowSchedule.indexOf(scope.schedule);

          conf.onSlotDeleted(rowSchedule[indexSlot], scope.$index, ngModelCtrl.$modelValue, scope.$parent.$parent.$index); // Delete event function and send slot info

          //console.log('containerEl', containerEl)
          //console.log('containerEl slot ', containerEl.find('weekly-slot'))
          //console.log('element row  ', element, indexSlot)
          //console.log('Child selected', containerEl.children().eq(scope.$index))


          containerEl.removeClass('dragging');
          containerEl.removeClass('slot-hover');
          rowSchedule.splice(indexSlot, 1);

          //containerEl.children().eq().detach();
          element.detach();
          //containerEl.find('weekly-slot').detach();

          //containerEl.find('weekly-slot').remove();
          //element.remove();
          scope.$apply();

        };


        element.find('span').on('click', function (e) {
          deleteSelf();
          e.preventDefault();
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
              var newStart = valuesOnDragStart.start + (delta / slots);

              if (ui.start !== newStart && newStart <= ui.end - (1 / slots) && newStart >= 0) {
                ngModelCtrl.$setViewValue({
                  start: newStart,
                  end: ui.end
                });
                ngModelCtrl.$render();
              }
            } else {
              var newEnd = valuesOnDragStart.end + ((delta + 1) / slots);

              if (ui.end !== newEnd && newEnd >= ui.start + (1 / slots) && newEnd <= nbHours) {
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

            var newStart = valuesOnDragStart.start + (delta / slots);
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

          console.log("before - ngModelCtrl.$modelValue ", ngModelCtrl.$modelValue)


          var endOfSlot = ((ui.end + 1) % slots) - Math.floor((ui.end + 1) % slots);
          var endToTranslate = translate.end[endOfSlot];

          ngModelCtrl.$modelValue.start = hours[ui.start * slots].start;
          ngModelCtrl.$modelValue.end = (endToTranslate === 18 || endToTranslate === 12) ? hours[(ui.end * slots) - 1].end : hours[ui.end * slots].start;

          ngModelCtrl.$modelValue.start = ngModelCtrl.$modelValue.start.toDate(); //Equivalent to moment(ngModelCtrl.$modelValue.start).utc().format();
          ngModelCtrl.$modelValue.end = ngModelCtrl.$modelValue.end.toDate(); // Equivalent to moment(ngModelCtrl.$modelValue.end).utc().format();

          ngModelCtrl.$modelValue.duration = (ui.end * slots) - (ui.start * slots);

          schedulerCtrl.on.change(index, scope.$index, ngModelCtrl.$modelValue, scope.$parent.$parent.$index);

          console.log("after - ngModelCtrl.$modelValue ", ngModelCtrl.$modelValue)

          return ngModelCtrl.$modelValue;
        });

        //// model -> UI ////////////////////////////////////
        ngModelCtrl.$formatters.push(function onModelChange(model) {

          //console.log("onModelChange ", model)


          var startHour = moment(model.start).get('hour');
          var endHour = moment(model.end).get('hour');

          if (startHour !== undefined && endHour !== undefined) {

            var idxStart //= model.meta.idxStart;
            var idxEnd //= model.meta.idxEnd;


            //console.log('Model value', ngModelCtrl.$modelValue, hours)

            hours.forEach(function (hour) {
              if (hour.start.format() === moment(ngModelCtrl.$modelValue.start).format())
                idxStart = hours.indexOf(hour);
              if (hour.end.format() === moment(ngModelCtrl.$modelValue.end).format())
                idxEnd = hours.indexOf(hour) + 1;
            });

            //console.log('Start', idxStart / slots)

            //console.log('--- Set modelValue ---')
            //console.log('Slots', slots, 'idxStart ', idxStart, 'idxEnd ', idxEnd)
            //console.log('Ui -> start', idxStart / slots)
            //console.log('Ui -> end', idxEnd / slots)
            //console.log('______________________')
            //console.log('EndOfSlot', endOfSlot)
            //console.log('ui.start', ui.start)
            //console.log('hours[ui.start * slots].start', hours[ui.start * slots].start)
            //console.log('hours[ui.start * slots]', hours[ui.start * slots])
            //console.log('translate.end[ui.start]', translate.end[ui.start])
            //console.log('translate.end[hours[ui.start * slots]]', translate.end[hours[ui.start * slots]])
            //console.log('______________________')


            return { //Update $modelValue
              start: idxStart / slots,
              end: idxEnd / slots
            };
          }
          return {start: -100, end: -100};
        });

        ngModelCtrl.$render = function () {


          var ui = ngModelCtrl.$viewValue;

          //console.log('ui render', ui)
          var css = {
            left: (ui.start / conf.nbDays) * 100 + '%',
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
angular.module('weeklySchedulerI18N', ['tmh.dynamicLocale']);

angular.module('weeklySchedulerI18N')
  .provider('weeklySchedulerLocaleService', ['tmhDynamicLocaleProvider', function (tmhDynamicLocaleProvider) {

    var defaultConfig = {
      doys: {'de-de': 4, 'en-gb': 4, 'en-us': 6, 'fr-fr': 4},
      lang: {
        'de-de': {month: 'Monat', weekNb: 'Wochenummer', addNew: 'Hinzufügen'},
        'en-gb': {month: 'Month', weekNb: 'Week #', addNew: 'Add'},
        'en-us': {month: 'Month', weekNb: 'Week #', addNew: 'Add'},
        'fr-fr': {month: 'Mois', weekNb: 'N° de semaine', addNew: 'Ajouter'}
      }
    };

    this.configure = function (config) {

      if (config && angular.isObject(config)) {
        angular.merge(defaultConfig, config);

        if (defaultConfig.localeLocationPattern) {
          tmhDynamicLocaleProvider.localeLocationPattern(defaultConfig.localeLocationPattern);
        }
      }
    };

    this.$get = ['$rootScope', '$locale', 'tmhDynamicLocale', function ($rootScope, $locale, tmhDynamicLocale) {

      var momentLocaleCache = {};

      function getLang() {
        var key = $locale.id;
        if (!momentLocaleCache[key]) {
          momentLocaleCache[key] = getMomentLocale(key);
          moment.locale(momentLocaleCache[key].id, momentLocaleCache[key].locale);
        } else {
          moment.locale(momentLocaleCache[key].id);
        }
        return defaultConfig.lang[key];
      }

      // We just need few moment local information
      function getMomentLocale(key) {
        return {
          id: key,
          locale: {
            week: {
              // Angular monday = 0 whereas Moment monday = 1
              dow: ($locale.DATETIME_FORMATS.FIRSTDAYOFWEEK + 1) % 7,
              doy: defaultConfig.doys[key]
            }
          }
        };
      }

      $rootScope.$on('$localeChangeSuccess', function () {
        $rootScope.$broadcast('weeklySchedulerLocaleChanged', getLang());
      });

      return {
        $locale: $locale,
        getLang: getLang,
        set: function (key) {
          return tmhDynamicLocale.set(key);
        }
      };
    }];
  }]);
angular.module('weeklyScheduler')
  .service('weeklySchedulerTimeService', ['$filter', function ($filter) {

    var MONTH = 'month';
    var WEEK = 'week';
    var DAY = 'day';
    var HOUR = 'hour';

    return {
      const: {
        MONTH: MONTH,
        WEEK: WEEK,
        FORMAT: 'YYYY-MM-DD'
      },
      dF: $filter('date'),
      compare: function (date, method, lastMin) {
        if (date) {
          var dateAsMoment;
          if (angular.isDate(date)) {
            dateAsMoment = moment(date);
          } else if (date._isAMomentObject) {
            dateAsMoment = date;
          } else {
            throw 'Could not parse date [' + date + ']';
          }
          return dateAsMoment[method](lastMin) ? dateAsMoment : lastMin;
        }
      },
      addWeek: function (moment, nbWeek) {
        return moment.clone().add(nbWeek, WEEK);
      },
      addDay: function (moment, nbDay) {
        return moment.clone().add(nbDay, DAY);
      },
      addHour: function (moment, nbHours) {
        return moment.clone().add(nbHours, HOUR);
      },

      // addHour: function (moment, nbWeek) {
      //   return moment.clone().add(nbWeek, HOUR);
      // },
      weekPreciseDiff: function (start, end) {
        return end.clone().diff(start.clone(), WEEK, true);
      },
      dayPreciseDiff: function (start, end) {
        return end.clone().diff(start.clone(), DAY, true);
      },
      dayPreciseDiffWithoutWeekend: function (start, end) {
        var nbDayWeekEnd = this.nbWeedEndDays(start, end);
        return end.clone().diff(start.clone(), DAY, true) - nbDayWeekEnd;
      },
      isWeekEnd: function (date) {
        return date.isoWeekday() === 6 || date.isoWeekday() === 7;
      },
      dayDiff: function (start, end) {
        var date = start.clone().startOf(DAY);
        var nbDay = 0;
        while (end.clone().endOf(DAY) > date) {
          if (!this.isWeekEnd(date)) {
            nbDay++;
          }
          date = date.add(1, DAY);
        }
        return nbDay;
      },
      nbWeedEndDays: function(from, to){
        var startWeek = from.clone().startOf(WEEK).add(1, DAY); //Start on monday
        var nbDayStartWeek =
          to.clone().startOf(DAY)
            .diff(startWeek.clone().startOf(DAY), DAY);

        // 5 day in a working week + 2 days in the we
        return Math.floor(Math.abs(nbDayStartWeek) / 5) * 2;
      },
      addDayAndWeekEnd: function (moment, nbDay) {
        var dateInit = moment.clone().add(nbDay, DAY);
        var nbDayWeekEnd = this.nbWeedEndDays(moment, dateInit)
        return dateInit.clone().add(nbDayWeekEnd, DAY)
      },
      weekDiff: function (start, end) {
        return end.clone().endOf(WEEK).diff(start.clone().startOf(WEEK), WEEK) + 1;
      },
      monthDiff: function (start, end) {
        return end.clone().endOf(MONTH).diff(start.clone().startOf(MONTH), MONTH) + 1;
      },
      monthDistribution: function (minDate, maxDate) {
        var i, result = [];
        var startDate = minDate.clone();
        var endDate = maxDate.clone().endOf(DAY);
        var monthDiff = this.monthDiff(startDate, endDate);
        var dayDiff = this.dayDiff(startDate, endDate);

        //var total = 0, totalDays = 0;
        // console.log(startDate.toDate(), endDate.toDate(), monthDiff, dayDiff);
        for (i = 0; i < monthDiff; i++) {
          var startOfMonth = i === 0 ? startDate : startDate.add(1, MONTH).startOf(MONTH);
          var endOfMonth = i === monthDiff - 1 ? endDate : startDate.clone().endOf(MONTH);
          var dayInMonth = this.dayDiff(startOfMonth.startOf(DAY), endOfMonth);
          var width = Math.floor(dayInMonth / dayDiff * 1E8) / 1E6;

          result.push({start: startOfMonth.clone(), end: endOfMonth.clone(), width: width});

          // totalDays += dayInMonth; total += width;
          // console.log(startOfMonth, endOfMonth, dayInMonth, dayDiff, width, total, totalDays);
        }
        return result;
      },
      weekDistribution: function (minDate, maxDate) {
        var i, result = [];
        var startDate = minDate.clone();
        var endDate = maxDate.clone();
        var monthDiff = this.monthDiff(startDate, endDate);
        var dayDiff = this.dayDiff(startDate, endDate);
        var NB_DAY_IN_A_WEEK = 5;
        //var total = 0, totalDays = 0;
        // console.log(startDate.toDate(), endDate.toDate(), monthDiff, dayDiff);
        for (i = 0; i < dayDiff / NB_DAY_IN_A_WEEK; i++) {
          var startOfWeek = i === 0 ? startDate : startDate.add(1, WEEK).startOf(WEEK);
          var endOfWeek = i === monthDiff - 1 ? endDate : startDate.clone().endOf(WEEK);
          var width = Math.floor(NB_DAY_IN_A_WEEK / dayDiff * 1E8) / 1E6;

          result.push({start: startOfWeek.clone(), end: endOfWeek.clone(), width: width});

          // totalDays += dayInMonth; total += width;
          // console.log(startOfMonth, endOfMonth, dayInMonth, dayDiff, width, total, totalDays);
        }
        return result;
      },
      /**
       * Return a table of day with the associated witdh
       * @param minDate
       * @param maxDate
       * @returns {Array}
       */
      dayDistribution: function (minDate, maxDate) {
        var i, result = [];
        var startDate = minDate.clone();
        var endDate = maxDate.clone();
        var dayDiff = this.dayDiff(startDate, endDate);
        var monthDiff = this.monthDiff(startDate, endDate);
        // console.log('DAY DIFF', dayDiff);
        // console.log('MONTH DIFF', monthDiff);

        for (i = 0; i < dayDiff; i++) {
          var startOfDay = i === 0 ? startDate : startDate.add(1, DAY).startOf(DAY);
          while (this.isWeekEnd(startDate)) {
            startDate = startDate.add(1, DAY).startOf(DAY);
          }
          var endOfDay = i === monthDiff - 1 ? endDate : startDate.clone().endOf(DAY);
          var width = Math.floor(1 / dayDiff * 1E8) / 1E6;

          result.push({start: startOfDay.clone(), end: endOfDay.clone(), width: width});
        }
        return result;
      },
      hourDistribution: function(minDate, maxDate) {
        var i, result = [];
        var startDate = minDate.clone();
        var endDate = maxDate.clone();
        var dayDiff = this.dayDiff(startDate, endDate);
        var currentDay = startDate.add(8, HOUR).startOf(HOUR);
        var translate = {
          0: {0.96875: 18,0.03125: 8},
          0.03125: {0: 8.25,0.0625: 8.25},
          0.0625: {0.03125: 8.5,0.09375: 8.5},
          0.09375: {0.0625: 8.75,0.125: 8.75},
          0.125: {0.09375: 9,0.15625: 9},
          0.15625: {0.125: 9.25,0.1875: 9.25},
          0.1875: {0.15625: 9.5,0.21875: 9.5},
          0.21875: {0.1875: 9.75,0.25: 9.75},
          0.25: {0.21875: 10,0.28125: 10},
          0.28125: {0.25: 10.25,0.3125: 10.25},
          0.3125: {0.28125: 10.5,0.34375: 10.5},
          0.34375: {0.3125: 10.75,0.375: 10.75},
          0.375: {0.34375: 11,0.40625: 11},
          0.40625: {0.375: 11.25,0.4375: 11.25},
          0.4375: {0.40625: 11.5,0.46875: 11.5},
          0.46875: {0.4375: 11.75,0.5: 11.75},
          0.5: {0.46875: 12,0.53125: 14},
          0.53125: {0.5: 14.25,0.5625: 14.25},
          0.5625: {0.53125: 14.5,0.59375: 14.5},
          0.59375: {0.5625: 14.75,0.625: 14.75},
          0.625: {0.59375: 15,0.65625: 15},
          0.65625: {0.625: 15.25,0.6875: 15.25},
          0.6875: {0.65625: 15.5,0.71875: 15.5},
          0.71875: {0.6875: 15.75,0.75: 15.75},
          0.75: {0.71875: 16,0.78125: 16},
          0.78125: {0.75: 16.25,0.8125: 16.25},
          0.8125: {0.78125: 16.5,0.84375: 16.5},
          0.84375: {0.8125: 16.75,0.875: 16.75},
          0.875: {0.84375: 17,0.90625: 17},
          0.90625: {0.875: 17.25,0.9375: 17.25},
          0.9375: {0.90625: 17.5,0.96875: 17.5},
          0.96875: {0.9375: 17.75,0: 17.75}

        };

        var translateQuarter = { //minutes converter
          0: 0,
          0.25: 15,
          0.5: 30,
          0.75: 45
        };

        var slots = 32;
        for (i = 0; i < (dayDiff * slots); i++) {
          var width = Math.floor(1 / dayDiff * 1E8) / 1E6 / slots;
          var rangeStart = (i / slots) - Math.floor(i / slots);
          var rangeEnd = ((i + 1) / slots) - Math.floor((i + 1) / slots);
          //console.log("rangeStart ", rangeStart)
          //console.log("rangeEnd", rangeEnd)

          var timeSetter = function (rangeA, rangeB) {

            var translated = translate[rangeA][rangeB];
            var h = Math.floor(translated);
            var m = translated % h;

              return {
                  'hours': h,
                  'minutes': translateQuarter[m]
              };
          };


          // var startOfHour = currentDay = currentDay.clone().set('hour', 2).set('minute', 15)
          var startOfHour = currentDay = currentDay.clone().set(timeSetter(rangeStart, rangeEnd));
          var endOfHour = currentDay = currentDay.clone().set(timeSetter(rangeEnd, rangeStart));
          var addDays = (i !== 0 && (i+1) % (slots * 5) === 0) ? 3 : (rangeStart === 0.96875)? 1 : 0; //Go to the next day or next monday's week

          result.push({start: startOfHour.clone(), end: endOfHour.clone(), width: width});
          currentDay = (addDays !== 0) ? currentDay.add(addDays, DAY).startOf(DAY).add(8, HOUR).startOf(HOUR) : currentDay;
        }
        return result;
      }
    };
  }]);
angular.module('ngWeeklySchedulerTemplates', ['ng-weekly-scheduler/views/multi-slider.html', 'ng-weekly-scheduler/views/weekly-scheduler.html', 'ng-weekly-scheduler/views/weekly-slot.html']);

angular.module('ng-weekly-scheduler/views/multi-slider.html', []).run(['$templateCache', function ($templateCache) {
  $templateCache.put('ng-weekly-scheduler/views/multi-slider.html',
    '<div class="slot ghost" ng-show="item.editable !== false && (!schedulerCtrl.config.monoSchedule || !schedulesLenght)">{{schedulerCtrl.config.labels.addNew || \'Add New\'}}</div><weekly-slot class=slot ng-class="{disable: item.editable === false}" ng-repeat="schedule in item.schedules[scheduleName] track by $index" ng-model=schedule ng-model-options="{ updateOn: \'default blur\', debounce: { \'default\': 500, \'blur\': 0 } }" index=$index></weekly-slot>');
}]);

angular.module('ng-weekly-scheduler/views/weekly-scheduler.html', []).run(['$templateCache', function ($templateCache) {
  $templateCache.put('ng-weekly-scheduler/views/weekly-scheduler.html',
    '<div class=labels><div class="srow text-right">{{schedulerCtrl.config.labels.month || \'Month\'}}</div><div class="srow text-right">{{schedulerCtrl.config.labels.weekNb || \'Week number\'}}</div><div class="srow text-right">{{schedulerCtrl.config.labels.dayNb || \'Day\'}}</div><div class="srow text-right">{{schedulerCtrl.config.labels.Hour || \'Hour\'}}</div><div class=schedule-animate ng-repeat="item in schedulerCtrl.items" inject></div></div><div class=schedule-area-container><div class=schedule-area><div class="srow timestamps"><monthly-grid class=grid-container></monthly-grid></div><div class="srow timestamps"><weekly-grid class=grid-container></weekly-grid></div><div class="srow timestamps"><daily-grid class=grid-container></daily-grid></div><div class="srow timestamps"><hour-grid class=grid-container></hour-grid></div><div class=schedule-animate ng-repeat="item in schedulerCtrl.items track by $index" ng-init="rowIndex = $index"><div class=srow ng-repeat="(scheduleName, schedule) in item.schedules track by $index" ng-init="firstIndex = scheduleIndex"><hour-grid class="grid-container striped" no-text></hour-grid><multi-slider index={{scheduleIndex}} row-index={{rowIndex}} schedulename={{scheduleName}}></multi-slider></div></div></div></div>');
}]);

angular.module('ng-weekly-scheduler/views/weekly-slot.html', []).run(['$templateCache', function ($templateCache) {
  $templateCache.put('ng-weekly-scheduler/views/weekly-slot.html',
    '<div ng-style="{\'background-color\': (schedule.meta.color) ? schedule.meta.color:\'#4eb8d5\'}" title="{{schedule.start | date}} - {{schedule.end | date}}"><div class="handle left" ondrag=resize ondragstart=startResizeStart ondragstop=endDrag handle></div><div class=slot-text ondrag=drag ondragstart=startDrag ondragstop=endDrag handle>{{slotText}}</div><div class="handle right" ondrag=resize ondragstart=startResizeEnd ondragstop=endDrag handle></div><div class=remove><span class="glyphicon glyphicon-remove"></span></div></div>');
}]);
}( window ));
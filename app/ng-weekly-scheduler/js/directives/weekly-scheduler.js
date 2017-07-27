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
    function config(schedules, options, getSlotText, onSlotAdded, shouldMergeTwoSlots) {
      var now = moment();

      // Calculate min date of all scheduled events
      var minDate = moment().add(- 1, 'month').startOf('week').add(1, 'day');

      // Calculate max date of all scheduled events
      var maxDate = moment().add(1, 'month').endOf('week').subtract(1, 'day');

      // Calculate nb of weeks covered by minDate => maxDate
      var nbWeeks = timeService.weekDiff(minDate, maxDate);

      // Calculate nb of days covered by minDate => maxDate
      var nbDays = timeService.dayDiff(minDate, maxDate);

      var result = angular.extend(options, { 
        minDate: minDate,
        maxDate: maxDate,
        nbWeeks: nbWeeks,
        nbDays: nbDays,
        getSlotText: getSlotText,
        onSlotAdded: onSlotAdded,
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
        var optionsFn = $parse(attrs.options),
          options = angular.extend(defaultOptions, optionsFn(scope) || {});

        var getSlotText = $parse(attrs.getSlotText)(scope);
        var onSlotAdded = $parse(attrs.onSlotAdded)(scope);
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
            }, []), options, getSlotText, onSlotAdded, shouldMergeTwoSlots);

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
            change: function (itemIndex, scheduleIndex, scheduleValue) {
              var onChangeFunction = $parse(attrs.onChange)(scope);
              if (angular.isFunction(onChangeFunction)) {
                return onChangeFunction(itemIndex, scheduleIndex, scheduleValue);
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
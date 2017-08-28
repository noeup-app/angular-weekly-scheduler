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
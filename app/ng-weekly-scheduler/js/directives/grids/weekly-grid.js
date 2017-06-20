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

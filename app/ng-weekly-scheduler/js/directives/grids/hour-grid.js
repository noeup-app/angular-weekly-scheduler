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


/*global GRID_TEMPLATE */
angular.module('weeklyScheduler')
    .directive('dailyGrid', ['weeklySchedulerTimeService', function (timeService) {

        function doGrid(element, attrs, model) {
            // Clean element
            element.empty();

            // Calculation day distribution
            var days = timeService.dayDistribution(model.minDate, model.maxDate);
            // console.log('var days', days);

            // Deploy the grid system on element
            days.forEach(function (day) {
                var child = GRID_TEMPLATE.clone().css({width: day.width + '%'});
                child.addClass('day');
                if (angular.isUndefined(attrs.noText)) {
                    //console.log("timeService",timeService, day.start, day.start.toDate())
                    child.text(timeService.dF(day.start.toDate(), 'EEEE dd'));
                    console.log('child text', timeService.dF(day.start.toDate()));
                }
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
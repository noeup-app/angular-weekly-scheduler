angular.module('demoApp', ['ngAnimate', 'weeklyScheduler', 'weeklySchedulerI18N'])

  .config(['weeklySchedulerLocaleServiceProvider', function (localeServiceProvider) {
    localeServiceProvider.configure({
      doys: {'es-es': 4},
      lang: {'es-es': {month: 'Mes', weekNb: 'número de la semana', addNew: 'Añadir'}},
      localeLocationPattern: '/vendor/angular-i18n/angular-locale_{{locale}}.js'
    });
  }])

  .controller('DemoController', ['$scope', '$timeout', 'weeklySchedulerLocaleService', '$log',
    function ($scope, $timeout, localeService, $log) {

      $scope.model = {
        locale: localeService.$locale.id,
        options: {/*monoSchedule: true*/},
        items: [{
          "label": "Item 1",
          "editable": true,
          "schedules": [
            {
              "start": "2017-06-20T8:00:00.000Z",
              "end": "2017-06-20T10:00:00.000Z"
            }
          ]
        },
          {
            "label": "Item 2",
            "schedules": [
              {
                "start": "2017-06-21T14:00:00.000Z",
                "end": "2017-06-21T18:00:00.000Z"
              }
            ]
          }
      ]};




      this.doSomething = function (itemIndex, scheduleIndex, scheduleValue) {
        $log.debug('The model has changed!', itemIndex, scheduleIndex, scheduleValue);
      };

      this.onLocaleChange = function () {
        $log.debug('The locale is changing to', $scope.model.locale);
        localeService.set($scope.model.locale).then(function ($locale) {
          $log.debug('The locale changed to', $locale.id);
        });
      };
    }]);
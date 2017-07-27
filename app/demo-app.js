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

      $scope.lastSlotMeta = false;
      $scope.projectCmpt = 0;
      $scope.clientCmpt = 0;

      $scope.model = {
        "locale": localeService.$locale.id,
        "options": {},
        "items": [
          {
            "label": "Item 1",
            "editable": true,
            "schedules": {
              "predicted": [
                {
                  "start": "2017-06-26T12:00:00.000Z",
                  "end": "2017-06-27T10:00:00.000Z"
                },
                {
                  "start": "2017-06-29T06:00:00.000Z",
                  "end": "2017-06-30T08:00:00.000Z"
                }
              ],
              "realised": [
                {
                  "start": "2017-06-26T12:00:00.000Z",
                  "end": "2017-06-28T08:00:00.000Z"
                }
              ]
            }
          },
          {
            "label": "Item 2",
            "editable": true,
            "schedules": {
              "predicted": [
                {
                  "start": "2017-06-26T06:00:00.000Z",
                  "end": "2017-06-30T16:00:00.000Z"
                }
              ],
              "realised": [
                {
                  "start": "2017-06-26T06:00:00.000Z",
                  "end": "2017-07-04T14:00:00.000Z"
                }
              ]
            }
          }
        ]
      };


      this.getSlotText = function(schedule){
        console.log("schedule",schedule)
        return schedule.meta.project + ' (' + schedule.meta.client + ')';
      }

      this.onSlotAdded = function(cb) {
        console.log("onSlotAdded");
        if($scope.lastSlotMeta) {
          cb($scope.lastSlotMeta);
          return;
        }

        $scope.projectCmpt += 1;
        $scope.clientCmpt += 1;
        $scope.lastSlotMeta = {
          project: "project n°" + $scope.projectCmpt,
          client: "client n°" + $scope.clientCmpt
        };

      };

      this.doSomething = function (schedulesIndex, scheduleIndex, scheduleValue) {
        //schedulesIndex with 0 => 'predicted' || 1 => 'realised'
        // var which = {
        //   0: 'predicted',
        //   1: 'realised'
        // };
        //
        // $log.debug('The model has changed!', $scope.model.items, schedulesIndex, $scope.model.items[schedulesIndex].schedules, which[schedulesIndex], "|||||| ", scheduleIndex, scheduleValue);
        // $log.debug('scope.model from demo : ', $scope.model.items[schedulesIndex].schedules[which[schedulesIndex]][schedulesIndex], scheduleIndex, "tt", scheduleValue );
        //
        // $scope.model.items[1].schedules[which[schedulesIndex]][schedulesIndex] = JSON.parse(JSON.stringify(scheduleValue));

        // $scope.model.items[itemIndex] = scheduleValue;
      };

      this.onLocaleChange = function () {
        $log.debug('The locale is changing to', $scope.model.locale);
        localeService.set($scope.model.locale).then(function ($locale) {
          $log.debug('The locale changed to', $locale.id);
        });
      };

      this.shouldMergeTwoSlots = function(slot1, slot2) {
        // console.log("Slot1", slot1);
        // console.log("Slot2", slot2);
        // console.log('hours diff', moment(slot1.end).diff(moment(slot2.start), 'days'))
        return false;
        // return slot1.meta.project === slot2.meta.project && slot1.meta.client === slot2.meta.client
      };


    }]);
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
        console.log("Calculate hourDistribution");
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
          var addDays = (i !== 0 && (i+1) % 20 === 0) ? 3 : (rangeStart === 0.75)? 1 : 0; //Go to the next day or next monday's week

          result.push({start: startOfHour.clone(), end: endOfHour.clone(), width: width});
          currentDay = (addDays !== 0) ? currentDay.add(addDays, DAY).startOf(DAY).add(8, HOUR).startOf(HOUR) : currentDay;
        }
        return result;
      }
    };
  }]);
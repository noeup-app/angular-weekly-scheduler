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
      isWeekEnd: function (date) {
        return date.isoWeekday() === 6 || date.isoWeekday() === 7;
      },
      dayDiff: function (start, end) {
        console.log("dayDiff", start.format('LLLL'), end.format('LLLL'))
        var date = start.clone().startOf(DAY);
        var nbDay = 0
        while (end.clone().endOf(DAY) > date) {
          if (!this.isWeekEnd(date)) {
            nbDay++;
          }
          date = date.add(1, DAY);
        }
        return nbDay;
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
        var endDate = maxDate.clone();
        var monthDiff = this.monthDiff(startDate, endDate);
        var dayDiff = endDate.diff(startDate, DAY);

        //var total = 0, totalDays = 0;
        // console.log(startDate.toDate(), endDate.toDate(), monthDiff, dayDiff);
        for (i = 0; i < monthDiff; i++) {
          var startOfMonth = i === 0 ? startDate : startDate.add(1, MONTH).startOf(MONTH);
          var endOfMonth = i === monthDiff - 1 ? endDate : startDate.clone().endOf(MONTH);
          var dayInMonth = endOfMonth.diff(startOfMonth, DAY) + (i !== monthDiff - 1 && 1);
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
        var dayDiff = endDate.diff(startDate, DAY);

        //var total = 0, totalDays = 0;
        // console.log(startDate.toDate(), endDate.toDate(), monthDiff, dayDiff);
        for (i = 0; i < dayDiff/7; i++) {
          var startOfWeek = i === 0 ? startDate : startDate.add(1, WEEK).startOf(WEEK);
          var endOfWeek = i === monthDiff - 1 ? endDate : startDate.clone().endOf(WEEK);
          var width = Math.floor(7/ dayDiff * 1E8) / 1E6;

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
        var dayDiff = endDate.diff(startDate, DAY);
        var monthDiff = this.monthDiff(startDate, endDate);
        // console.log('DAY DIFF', dayDiff);
        // console.log('MONTH DIFF', monthDiff);

        for (i = 0; i < dayDiff; i++) {
          var startOfDay = i === 0 ? startDate : startDate.add(1, DAY).startOf(DAY);
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
        var dayDiff = endDate.diff(startDate, DAY);
        var monthDiff = this.monthDiff(startDate, endDate);

        for (i = 0; i < (dayDiff*4); i++) {

          var startOfHour = i === 0 ? startDate : startDate.add(1, MONTH).startOf(MONTH);
          var endOfHour = i === monthDiff - 1 ? endDate : startDate.clone().endOf(MONTH);
          var width = Math.floor(1 / dayDiff * 1E8) / 1E6 / 4;

          result.push({start: startOfHour.clone(), end: endOfHour.clone(), width: width});
        }
        return result;
      }
    };
  }]);
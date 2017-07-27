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
        var startWeek = from.clone().startOf(WEEK);
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
          0: {
            0.25: 8,
            0.75: 18
          },
          0.25: {
            0.50: 10,
            0: 10
          },
          0.50: {
            0.75: 14,
            0.25: 12
          },
          0.75: {
            0: 16,
            0.50: 16
          }
        };

        for (i = 0; i < (dayDiff * 4); i++) {
          var width = Math.floor(1 / dayDiff * 1E8) / 1E6 / 4;
          var rangeStart = (i / 4) - Math.floor(i / 4);
          var rangeEnd = ((i + 1) / 4) - Math.floor((i + 1) / 4);
          var startOfHour = currentDay = currentDay.clone().set({hours: parseInt(translate[rangeStart][rangeEnd], 10)}).startOf(HOUR);
          var endOfHour = currentDay = currentDay.clone().set({hours: parseInt(translate[rangeEnd][rangeStart], 10)}).startOf(HOUR);
          var addDays = (i !== 0 && (i+1) % 20 === 0) ? 3 : (rangeStart === 0.75)? 1 : 0; //Go to the next day or next monday's week

          result.push({start: startOfHour.clone(), end: endOfHour.clone(), width: width});
          currentDay = (addDays !== 0) ? currentDay.add(addDays, DAY).startOf(DAY).add(8, HOUR).startOf(HOUR) : currentDay;
        }
        return result;
      }
    };
  }]);
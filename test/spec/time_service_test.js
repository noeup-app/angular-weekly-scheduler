describe('time service test', function () {
  'use strict';

  var timeService

  // beforeEach(inject(function ($provide) {
  //   $provide.value('timeService', DependencyMock);
  //   timeService = weeklySchedulerTimeService;
  // }));
  beforeEach(module('weeklyScheduler'))

  beforeEach(inject(function (_weeklySchedulerTimeService_) {
    timeService = _weeklySchedulerTimeService_;
  }));

  function nbDayMount(date) {
    var date = moment(date);
    var start = date.clone().startOf('month')
    var end = start.clone().endOf('month')
    return timeService.dayDiff(start, end)
  }

  function testOneMonth(date, expectedNbMonth) {
    expect(nbDayMount(date)).toEqual(expectedNbMonth);
  }

  describe('nb days', function () {

    it('In jan 2017', function () {
      testOneMonth("2017-01-01", 22);
    });

    it('In feb 2017', function () {
      testOneMonth("2017-02-01", 20);
    });

    it('In mar 2017', function () {
      testOneMonth("2017-03-01", 23);
    });

    it('In avr 2017', function () {
      testOneMonth("2017-04-01", 20);
    });

    it('In may 2017', function () {
      testOneMonth("2017-05-01", 23);
    });

    it('In jun 2017', function () {
      testOneMonth("2017-06-01", 22);
    });

    it('In jul 2017', function () {
      testOneMonth("2017-07-01", 21);
    });

    it('In aug 2017', function () {
      testOneMonth("2017-08-01", 23);
    });

    it('In sep 2017', function () {
      testOneMonth("2017-09-01", 21);
    });

    it('In oct 2017', function () {
      testOneMonth("2017-10-01", 22);
    });

    it('In nov 2017', function () {
      testOneMonth("2017-11-01", 22);
    });

    it('In dev 2017', function () {
      testOneMonth("2017-12-01", 21);
    });

    it('In year 2017', function () {
      var nbDayInYearExpected =
        nbDayMount("2017-01-01") +
        nbDayMount("2017-02-01") +
        nbDayMount("2017-03-01") +
        nbDayMount("2017-04-01") +
        nbDayMount("2017-05-01") +
        nbDayMount("2017-06-01") +
        nbDayMount("2017-07-01") +
        nbDayMount("2017-08-01") +
        nbDayMount("2017-09-01") +
        nbDayMount("2017-10-01") +
        nbDayMount("2017-11-01") +
        nbDayMount("2017-12-01");

      var date = moment("2017-01-01");
      var start = date.clone().startOf('year')
      var end = start.clone().endOf('year')
      var nbDayInYear = timeService.dayDiff(start, end)

      console.log("nbDayInYear", nbDayInYear)

      expect(nbDayInYear).toEqual(nbDayInYearExpected);
    });
  });

  describe('addDayAndWeekEnd', function(){

    function addDayAndWeekEndTest(startDate, nbDaysToAdd, expectedDate){
      var res = timeService.addDayAndWeekEnd(moment(startDate), nbDaysToAdd)
      var expected = moment(expectedDate)
      var r = res.isSame(expected, 'day')
      if(! r){
        console.log("Error : ", res.format('LLLL'), " different than ", expectedDate)
      }
      expect(r).toEqual(true);
    }

    it('should work when you start on monday and add 0 day', function () {
      addDayAndWeekEndTest("2017-06-05", 0, "2017-06-05")
    });

    it('should work when you start on monday and add 1 day', function () {
      addDayAndWeekEndTest("2017-06-05", 1, "2017-06-06")
    });

    it('should work when you start on monday and add 4 day', function () {
      addDayAndWeekEndTest("2017-06-05", 4, "2017-06-09")
    });

    it('should work when you start on monday and add 5 day', function () {
      addDayAndWeekEndTest("2017-06-05", 5, "2017-06-12")
    });

    it('should work when you start on monday and add 10 day', function () {
      addDayAndWeekEndTest("2017-06-05", 10, "2017-06-19")
    });

    it('should work when you start on wednesday and add 10 day', function () {
      addDayAndWeekEndTest("2017-06-07", 10, "2017-06-21")
    });

    it('should work when you start on friday and add 1 day', function () {
      addDayAndWeekEndTest("2017-06-09", 1, "2017-06-12")
    });

    it('should work when you start on thursday and add 1 day', function () {
      addDayAndWeekEndTest("2017-06-06", 1, "2017-06-07")
    });
  })

  describe('weekDistribution', function(){

    it('should have 12 weeks', function () {
      var weeks = timeService.weekDistribution(moment("2017-05-02"), moment("2017-07-19"))
      expect(weeks.length).toEqual(12)
    });

  })
});
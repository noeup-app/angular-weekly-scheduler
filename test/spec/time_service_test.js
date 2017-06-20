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
});
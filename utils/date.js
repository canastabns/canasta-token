const moment = require('moment');

const currentDateToUnixTime = () =>  moment().unix();

const addDaysToUnixTime = (date, days = 1) =>
  moment.unix(date).add(days, 'days').unix();

const addMinutesToUnixTime = (date, value = 1) =>
  moment.unix(date).add(value, 'minutes').unix();

const subtractDaysToUnixTime = (date, days = 1) =>
  moment.unix(date).subtract(days, 'days').unix();

module.exports = {
  currentDateToUnixTime,
  addDaysToUnixTime,
  subtractDaysToUnixTime,
  addMinutesToUnixTime
}

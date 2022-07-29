const db = require('../models');
let { Op } = db.Sequelize;
let moment = require('moment');
const LOGGER = console.log;
const { ASSETID_SYMBOL } = require('../utils/ticker_symbol');
let timenow = moment().startOf('minute');
let now_unix = moment().startOf('minute').unix();

const { calculate_dividendrate } = require('../schedule/calculateDividendRate');

module.exports = (io, socket) => {
  socket.on('dividendrate', async (data) => {
    let timenow_unix = moment().add(1, 'minutes').set('second', 0).unix();
    console.log('timenow_unix', timenow_unix);
    if (Array.isArray(data)) {
      let dividendrate = await calculate_dividendrate(
        data,
        'LIVE',
        timenow_unix
      );

      socket.emit('dividendrate', dividendrate);
    }
  });
};

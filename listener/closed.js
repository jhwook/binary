const db = require('../models');
let { Op } = db.Sequelize;
let moment = require('moment');
const LOGGER = console.log;
const { ASSETID_SYMBOL } = require('../utils/ticker_symbol');
let timenow = moment().startOf('minute');
let now_unix = moment().startOf('minute').unix();

const { calculate_dividendrate } = require('../schedule/calculateDividendRate');

const sendAlarm = (io, socket, data) => {
  socket.to(socket.id).emit();
};

// module.exports = (io,socket) => {
//   sendAlarm,
// };

module.exports = async (io, socket) => {
  // sendAlarm(io,socket)
};

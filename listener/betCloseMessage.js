const db = require('../models');
let { Op } = db.Sequelize;
let moment = require('moment');
const LOGGER = console.log;
const { ASSETID_SYMBOL } = require('../utils/ticker_symbol');
const cliredisa = require('async-redis').createClient();
const cron = require('node-cron');

module.exports = async (io, socket) => {
  const findCloseBets = async () => {
    let timenow = moment().startOf('minute');
    let now_unix = moment().startOf('minute').unix();
    let socketList = await cliredisa.hgetall('USERNAME2SOCKID');
    if (socketList) {
      socketList = Object.entries(socketList);
    } else {
      return;
    }

    // console.log('socketList', socketList);
    for (let i = 0; i < socketList.length; i++) {
      let [userId, userSocketId] = socketList[i];
      await db['betlogs']
        .findAll({
          where: { expiry: now_unix, uid: userId },
          raw: true,
        })
        .then((betlogs) => {
          if (betlogs.length === 0) return;
          console.log('======================', userId, userSocketId, betlogs);
          betlogs.map(async (betlog) => {
            let { status, diffRate, amount, assetName, uid } = betlog;
            // let usersocketid = await cliredisa.hget('USERNAME2SOCKID', uid);

            let profit = 0;
            if (status === 1) {
              if (diffRate === 0) {
                profit = amount / 10 ** 6;
              } else {
                profit = (((amount / 10 ** 6) * diffRate) / 100).toFixed(2);
              }
            }
            if (status === 0) {
              profit = (-1 * amount) / 10 ** 6;
            }
            let socketData = {
              name: assetName,
              profit: profit,
              data: betlog,
            };

            // console.log('bet_closed', socketData, usersocketid);
            socket.to(userSocketId).emit('bet_closed', socketData);
          });
        });
    }
  };
  cron.schedule('1 * * * * *', () => {
    let now_unix = moment().startOf('minute').unix();
    console.log('@betCloseMessage', now_unix);
    findCloseBets();
  });
};

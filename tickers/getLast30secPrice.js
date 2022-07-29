const cron = require('node-cron');
const axios = require('axios');
const db = require('../models');
const cliredisa = require('async-redis').createClient();
const moment = require('moment');
let temp = {};
let sec = 0;
const get30secPrice = async () => {
  await db['assets']
    .findAll({
      where: { active: 1 },
      raw: true,
    })
    .then((resp) => {
      resp.map(async (asset) => {
        let { name, socketAPISymbol } = asset;
        let currentPrice = await cliredisa.hget(
          'STREAM_ASSET_PRICE',
          socketAPISymbol
        );
        if (!temp[name]) {
          temp[name] = [currentPrice];
        } else {
          temp[name].push(currentPrice);
        }
      });
    });
};

cron.schedule('30-59 * * * * *', async () => {
  let now = moment().format('HH:mm:ss');
  sec++;
  // console.log('now', now, temp, '/', sec);
  get30secPrice();

  if (sec === 30) {
    await db['assets']
      .findAll({
        where: { active: 1 },
        raw: true,
      })
      .then((resp) => {
        let now_unix = moment().add(1, 'second').unix();
        resp.forEach((el) => {
          let { name, dispSymbol, id } = el;
          let periodPrice = JSON.stringify(temp[name]);
          db['tickers'].create({
            assetId: id,
            name,
            symbol: dispSymbol,
            periodPrice,
            expiryTime: now_unix,
          });
        });
        temp = {};
        sec = 0;
      });
  }
  // setInterval(async () => {
  //   await db['assets']
  //     .findAll({
  //       where: { active: 1 },
  //       raw: true,
  //     })
  //     .then((resp) => {
  //       let now_unix = moment().unix();
  //       resp.forEach((el) => {
  //         let { name, dispSymbol, id } = el;
  //         let periodPrice = JSON.stringify(temp[name]);
  //         db['tickers'].create({
  //           assetId: id,
  //           name,
  //           symbol: dispSymbol,
  //           periodPrice,
  //           expiryTime: now_unix,
  //         });
  //       });
  //       temp = {};
  //     });
  // }, 30000);
});

module.exports = { get30secPrice };

// CREATE TABLE `tickers` (
//   `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
//   `createdat` datetime DEFAULT current_timestamp(),
//   `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp(),
//   `assetId` int(11) DEFAULT NULL,
//   `name` varchar(40) DEFAULT NULL,
//   `symbol` varchar(20) DEFAULT NULL,
//   `periodPrice` varchar(300) DEFAULT NULL,
//   `expiryTime` varchar(20) DEFAULT NULL,
//   PRIMARY KEY (`id`)
// );

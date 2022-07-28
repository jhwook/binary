var express = require('express');
const jwt = require('jsonwebtoken');
const { auth } = require('../utils/authMiddleware');
const db = require('../models');
var moment = require('moment');
const LOGGER = console.log;
const cron = require('node-cron');
let { Op } = db.Sequelize;
const timenow = moment().startOf('minute');
const cliredisa = require('async-redis').createClient();

const calculate_dividendrate = async (assetList, type, expiry) => {
  let result = [];
  console.log('expiry', expiry);
  // let [date0, date1] = round;
  for (let i = 0; i < assetList.length; i++) {
    // timenow_unix = moment().add(1, 'minutes').set('second', 0).unix();

    await db['bets']
      .findAll({
        where: {
          assetId: assetList[i],
          expiry,
          // expiry: {
          //   [Op.gte]: moment(date0).unix(),
          //   [Op.lte]: moment(date1).unix(),
          // },
          type,
        },
        raw: true,
      })
      .then(async (resp) => {
        // console.log('resp.length', resp.assetId, resp.length, expiry);

        if (resp.length === 0) {
          let expiry_date = moment.unix(expiry).format('MM/DD HH:mm:ss');
          result.push({
            assetId: assetList[i],
            round: expiry_date,
            low_side_amount: 0,
            high_side_amount: 0,
            dividendrate: {
              low_side_dividendrate: 0,
              high_side_dividendrate: 0,
            },
            bet_count: 0,
          });
          // await db['bets'].update(
          //   { diffRate: 0 },
          //   {
          //     where: {
          //       assetId: assetList[i],
          //       expiry,
          //       side: 'HIGH',
          //       type,
          //     },
          //   }
          // );
          // await db['bets'].update(
          //   { diffRate: 0 },
          //   {
          //     where: { assetId: assetList[i], expiry, side: 'LOW', type },
          //   }
          // );
        }
        let sorted_bets = {};
        let promises = resp.map(async (bet) => {
          let { expiry, startingPrice, side } = bet;
          let socketAPISymbol;
          let winlose;
          let expiry_date = moment.unix(expiry).format('YYYY-MM-DD HH:mm:ss');
          await db['assets']
            .findOne({
              where: { id: assetList[i] },
              raw: true,
            })
            .then((resp) => {
              socketAPISymbol = resp.socketAPISymbol;
            });
          let currentPrice = await cliredisa.hget(
            'STREAM_ASSET_PRICE',
            socketAPISymbol
          );
          if (startingPrice < currentPrice) {
            if (side === 'HIGH') {
              winlose = 'win';
            } else {
              winlose = 'lose';
            }
          } else if (startingPrice > currentPrice) {
            if (side === 'HIGH') {
              winlose = 'lose';
            } else {
              winlose = 'win';
            }
          }

          if (!sorted_bets[winlose]) {
            sorted_bets[winlose] = [bet];
          } else {
            sorted_bets[winlose].push(bet);
          }
        });
        await Promise.all(promises);

        if (Object.keys(sorted_bets).length === 0) {
          // LOGGER(v, '@no bets');
        } else {
          result.push(calculatebets(assetList[i], sorted_bets, type));
        }
      });
  }

  return result;
};

const calculatebets = (i, sorted_bets, type) => {
  let bet_count = 0;
  let low_side_amount = 0;
  let high_side_amount = 0;
  let low_side_dividendrate;
  let high_side_dividendrate;
  let result;
  let winlose = Object.keys(sorted_bets);
  let start_price;

  console.log('sorted_bets', sorted_bets);
  console.log('winlose', winlose);
  const calculate_sorted_bet = (index, winlose, bets) => {
    let expiry_;
    bets.map((bet, i) => {
      let { side, amount, expiry, startingPrice } = bet;
      start_price = startingPrice;
      amount = amount / 10 ** 6;
      expiry_ = expiry;
      if (winlose === 'win') {
        bet_count++;
        high_side_amount += amount;
      } else if (side === 'lose') {
        bet_count++;
        low_side_amount += amount;
      }
    });

    low_side_dividendrate = (
      (high_side_amount / low_side_amount) *
      100
    ).toFixed(2);
    high_side_dividendrate = (
      (low_side_amount / high_side_amount) *
      100
    ).toFixed(2);
    if (low_side_amount !== 0 || high_side_amount !== 0) {
      if (low_side_amount === 0) {
        low_side_dividendrate = high_side_amount;
      }
      if (high_side_amount === 0) {
        high_side_dividendrate = low_side_amount;
      }
    }

    if (low_side_amount === 0 && high_side_amount === 0) {
      high_side_dividendrate = 0;
      low_side_dividendrate = 0;
    }

    // db['logrounds'].create({
    //   assetId: index,
    //   totalLowAmount: low_side_amount,
    //   totalHighAmount: high_side_amount,
    //   expiry: expiry_,
    //   type,
    //   lowDiffRate: low_side_dividendrate,
    //   highDiffRate: high_side_dividendrate,
    //   startingPrice:start_price,

    // });
    result = {
      assetId: index,
      low_side_amount,
      high_side_amount,
      dividendrate: { low_side_dividendrate, high_side_dividendrate },
      bet_count,
      expiry,
    };
    console.log('result', result);
    db['bets'].update(
      { diffRate: high_side_dividendrate },
      { where: { assetId: index, expiry: expiry_, side: 'HIGH', type } }
    );
    db['bets'].update(
      { diffRate: low_side_dividendrate },
      { where: { assetId: index, expiry: expiry_, side: 'LOW', type } }
    );
  };

  winlose.map((winlose) => {
    calculate_sorted_bet(i, winlose, sorted_bets[winlose]);
  });

  return result;
};

const calculate_dividendrate_sec = async (assetList, type) => {
  let result = [];

  for (let i = 0; i < assetList.length; i++) {
    await db['bets']
      .findAll({
        where: {
          assetId: assetList[i],
          type,
        },
        raw: true,
      })
      .then(async (resp) => {
        let sorted_bets = {};
        resp.map((bet) => {
          let { expiry } = bet;

          let expiry_date = moment.unix(expiry).format('YYYY-MM-DD HH:mm:ss');
          if (!sorted_bets[expiry_date]) {
            sorted_bets[expiry_date] = [bet];
          } else {
            sorted_bets[expiry_date].push(bet);
          }
        });

        if (Object.keys(sorted_bets).length === 0) {
          // LOGGER(v, '@no bets');
        } else {
          result.push(calculatebets(assetList[i], sorted_bets, type));
        }
      });
  }

  return result;
};

// cron.schedule('* * * * * *', async () => {
//   LOGGER('@Calculate dividendrates', moment().format('HH:mm:ss', '@binopt'));
//   let expiry = moment().startOf('minute').unix();
//   let assetList = await db['assets']
//     .findAll({
//       where: {
//         active: 1,
//       },
//       attributes: ['id'],
//       raw: true,
//     })
//     .then((resp) => {
//       let result = [];
//       resp.map((el) => {
//         result.push(el.id);
//       });
//       return result;
//     });
//   // console.log('assetList', assetList);
//   calculate_dividendrate(assetList, 'LIVE', expiry);
//   // calculate_dividendrate(assetList, 'DEMO', expiry);
//   // calculate_dividendrate_sec(assetList, 'LIVE');
//   // calculate_dividendrate_sec(assetList, 'DEMO');
// });
let expiry = moment().startOf('minute').add(1, 'minute').unix();
calculate_dividendrate([1, 2], 'LIVE', expiry);
module.exports = { calculate_dividendrate };

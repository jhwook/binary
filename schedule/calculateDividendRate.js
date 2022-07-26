var express = require('express');
const jwt = require('jsonwebtoken');
const { auth } = require('../utils/authMiddleware');
const db = require('../models');
var moment = require('moment');
const LOGGER = console.log;
const cron = require('node-cron');
let { Op } = db.Sequelize;
const timenow = moment().startOf('minute');
const { ASSETID_SYMBOL } = require('../utils/ticker_symbol');

const calculate_dividendrate = async (assetList, type, expiry) => {
  let result = [];

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
        // if (resp.length === 0) {
        //   let expiry_date = moment.unix(expiry).format('MM/DD HH:mm:ss');
        //   result.push({
        //     assetId: assetList[i],
        //     round: expiry_date,
        //     low_side_amount: 0,
        //     high_side_amount: 0,
        //     dividendrate: {
        //       low_side_dividendrate: 0,
        //       high_side_dividendrate: 0,
        //     },
        //   });
        //   await db['bets'].update(
        //     { diffRate: 0 },
        //     {
        //       where: {
        //         assetId: assetList[i],
        //         expiry,
        //         side: 'HIGH',
        //         type,
        //       },
        //     }
        //   );
        //   await db['bets'].update(
        //     { diffRate: 0 },
        //     {
        //       where: { assetId: assetList[i], expiry, side: 'LOW', type },
        //     }
        //   );
        // }
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

const calculatebets = (i, sorted_bets, type) => {
  let bet_count = 0;
  let low_side_amount = 0;
  let high_side_amount = 0;
  let low_side_dividendrate;
  let high_side_dividendrate;
  let result;
  let rounds = Object.keys(sorted_bets);
  let start_price;

  const calculate_sorted_bet = (index, round, bets) => {
    let expiry_;
    bets.map((bet, i) => {
      let { side, amount, expiry, startingPrice } = bet;
      start_price = startingPrice;
      amount = amount / 10 ** 6;
      expiry_ = expiry;
      if (side === 'HIGH') {
        bet_count++;
        high_side_amount += amount;
      } else if (side === 'LOW') {
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
      round,
      low_side_amount,
      high_side_amount,
      dividendrate: { low_side_dividendrate, high_side_dividendrate },
      bet_count,
    };
    db['bets'].update(
      { diffRate: high_side_dividendrate },
      { where: { assetId: index, expiry: expiry_, side: 'HIGH', type } }
    );
    db['bets'].update(
      { diffRate: low_side_dividendrate },
      { where: { assetId: index, expiry: expiry_, side: 'LOW', type } }
    );
  };

  rounds.map((round) => {
    calculate_sorted_bet(i, round, sorted_bets[round]);
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

cron.schedule('* * * * * *', async () => {
  // LOGGER('@Calculate dividendrates', moment().format('HH:mm:ss', '@binopt'));
  let assetList = await db['assets']
    .findAll({
      where: {
        active: 1,
      },
      attributes: ['id'],
      raw: true,
    })
    .then((resp) => {
      let result = [];
      resp.map((el) => {
        result.push(el.id);
      });
      return result;
    });
  // console.log('assetList', assetList);
  // calculate_dividendrate(assetList, 'LIVE', expiry);
  // calculate_dividendrate(assetList, 'DEMO', expiry);
  calculate_dividendrate_sec(assetList, 'LIVE');
  calculate_dividendrate_sec(assetList, 'DEMO');
});

module.exports = { calculate_dividendrate };

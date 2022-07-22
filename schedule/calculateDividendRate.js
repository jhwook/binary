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

const calculate_dividendrate = async (assetList, type) => {
  let result = [];
  for (let i = 0; i < assetList.length; i++) {
    // timenow_unix = moment().add(1, 'minutes').set('second', 0).unix();
    let expiry = moment().startOf('minute').unix();

    let resp = await db['bets'].findAll({
      where: {
        assetId: assetList[i],
        // expiry: timenow.unix(),
        expiry,
        type,
      },
      raw: true,
    });

    if (resp.length === 0) {
      let expiry_date = moment.unix(expiry).format('MM/DD HH:mm:ss');
      result.push({
        assetId: assetList[i],
        round: expiry_date,
        low_side_amount: 0,
        high_side_amount: 0,
        dividendrate: { low_side_dividendrate: 0, high_side_dividendrate: 0 },
      });
      db['bets'].update(
        { diffRate: 0 },
        {
          where: {
            assetId: assetList[i],
            expiry,
            side: 'HIGH',
          },
        }
      );
      db['bets'].update(
        { diffRate: 0 },
        {
          where: { assetId: assetList[i], expiry, side: 'LOW' },
        }
      );
    }
    let sorted_bets = {};
    resp.map((bet) => {
      let { expiry } = bet;

      let expiry_date = moment.unix(expiry).format('MM/DD HH:mm:ss');
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
  }

  return result;
};

const calculatebets = (i, sorted_bets, type) => {
  let low_side_amount = 0;
  let high_side_amount = 0;
  let low_side_dividendrate;
  let high_side_dividendrate;
  let result;
  let rounds = Object.keys(sorted_bets);

  const calculate_sorted_bet = (index, round, bets) => {
    let expiry_;
    bets.map((bet, i) => {
      let { side, amount, expiry } = bet;
      expiry_ = expiry;
      if (side === 'HIGH') {
        high_side_amount += amount;
      } else if (side === 'LOW') {
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
    db['logrounds'].create({
      assetId: index,
      totalLowAmount: low_side_amount,
      totalHighAmount: high_side_amount,
      expiry: expiry_,
      type,
      lowDiffRate: low_side_dividendrate,
      highDiffRate: high_side_dividendrate,
    });
    result = {
      assetId: index,
      round,
      low_side_amount,
      high_side_amount,
      dividendrate: { low_side_dividendrate, high_side_dividendrate },
    };
    db['bets'].update(
      { diffRate: high_side_dividendrate },
      { where: { assetId: index, expiry: expiry_, side: 'HIGH' } }
    );
    db['bets'].update(
      { diffRate: low_side_dividendrate },
      { where: { assetId: index, expiry: expiry_, side: 'LOW' } }
    );
  };

  rounds.map((round) => {
    calculate_sorted_bet(i, round, sorted_bets[round]);
  });

  return result;
};

cron.schedule('0 * * * * *', async () => {
  LOGGER('@Calculate dividendrates', moment().format('HH:mm:ss', '@binopt'));
  await calculate_dividendrate([1, 2, 3, 4, 5, 6, 7, 8], 'LIVE');
  await calculate_dividendrate([1, 2, 3, 4, 5, 6, 7, 8], 'DEMO');
});

module.exports = { calculate_dividendrate };

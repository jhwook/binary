var express = require('express');
const jwt = require('jsonwebtoken');
const { auth } = require('../utils/authMiddleware');
const db = require('../models');
var moment = require('moment');
const LOGGER = console.log;
const cron = require('node-cron');
let { Op } = db.Sequelize;
const timenow = moment().startOf('minute');
const ASSETID_SYMBOL = [
  '___SKIPPER___',
  'BTC-USD',
  'ETH-USD',
  'XRP-USD',
  'EURUSD=X',
  'JPY=X',
  'GBPUSD=X',
  'CAD=X',
  'CHF=X',
  '9988.HK',
  '601398.SS',
  '601288.SS',
  '0700.HK',
  '600519.SS',
];

const calculate_dividendrate = async () => {
  let result;
  for (let i = 1; i < ASSETID_SYMBOL.length; i++) {
    let resp = await db['bets'].findAll({
      where: {
        assetId: i,
        // expiry: timenow.unix(),
        // expiry: 1657887360,
        type: 'LIVE',
      },
      raw: true,
    });
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
      result = calculatebets(i, sorted_bets);
    }
  }
  return result;
};

const calculatebets = (i, sorted_bets) => {
  let low_side_amount = 0;
  let high_side_amount = 0;
  let result = [];
  let rounds = Object.keys(sorted_bets);

  const calculate_sorted_bet = (index, round, bets) => {
    bets.map((bet, i) => {
      let { side, amount } = bet;
      if (side === 'HIGH') {
        high_side_amount += amount;
      } else if (side === 'LOW') {
        low_side_amount += amount;
      }
    });

    let low_side_dividendrate = (
      (high_side_amount / low_side_amount) *
      100
    ).toFixed(2);
    let high_side_dividendrate = (
      (low_side_amount / high_side_amount) *
      100
    ).toFixed(2);

    result.push({
      assetId: index,
      round,
      low_side_amount,
      high_side_amount,
      dividendrate: { low_side_dividendrate, high_side_dividendrate },
    });
  };

  rounds.map((round) => {
    calculate_sorted_bet(i, round, sorted_bets[round]);
  });

  return result;
};

cron.schedule('0 * * * * *', async () => {
  LOGGER('@Calculate dividendrates', moment().format('HH:mm:ss', '@binopt'));
  calculate_dividendrate();
});

module.exports = { calculate_dividendrate };

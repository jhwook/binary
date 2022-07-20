const db = require('../models');
let { Op } = db.Sequelize;
let moment = require('moment');
const LOGGER = console.log;
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
let timenow = moment().startOf('minute');
let now_unix = moment().startOf('minute').unix();
let timenow_unix = moment().add(1, 'minutes').set('second', 0).unix();

module.exports = (io, socket) => {
  socket.on('dividendrate', async (data) => {
    // console.log('timenow_unix', timenow_unix);

    // console.log('data', socket.handshake.query.list);
    // data = socket.handshake.query.list;
    console.log('data', data);
    if (Array.isArray(data)) {
      let dividendrate = await calculate_dividendrate(data, timenow_unix);
      socket.emit('dividendrate', dividendrate);
    }
  });

  const calculate_dividendrate = async (assetList, expiry) => {
    console.log('expiry', expiry);
    let result = [];
    for (let i = 0; i < assetList.length; i++) {
      let resp = await db['bets'].findAll({
        where: {
          assetId: assetList[i],
          // expiry: timenow.unix(),
          expiry,
          type: 'LIVE',
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
        result.push(calculatebets(assetList[i], sorted_bets));
      }
    }

    return result;
  };

  const calculatebets = (i, sorted_bets) => {
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
};

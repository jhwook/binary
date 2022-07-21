var express = require('express');
const requestIp = require('request-ip');
let { respok, resperr } = require('../utils/rest');
const { getobjtype } = require('../utils/common');
const jwt = require('jsonwebtoken');
const { auth } = require('../utils/authMiddleware');
const db = require('../models');
const { lookup } = require('geoip-lite');
var moment = require('moment');
const e = require('express');
const LOGGER = console.log;
const cliredisa = require('async-redis').createClient();
const { ASSETID_REDIS_SYMBOL } = require('../utils/ticker_symbol');
// const ASSETID_REDIS_SYMBOL = [
//   '__SKIPPER__',
//   'btcusdt',
//   'ethusdt',
//   'xrpusdt',
//   'EUR/USD',
//   'USD/JPY',
//   'GBP/USD',
//   'USD/CAD',
//   'USD/CHF',
// ];
var router = express.Router();

router.post(
  '/join/:type/:assetId/:amount/:dur/:side',
  auth,
  async (req, res) => {
    //side가 0일 경우 LOW, 1일 경우 HIGH로 취급한다.

    let { assetId, amount, dur, side, type } = req.params;
    let { id } = req.decoded;
    let currentPrice = await cliredisa.hget(
      'STREAM_ASSET_PRICE_PER_MIN',
      ASSETID_REDIS_SYMBOL[assetId]
    );

    if (!assetId || !amount || !type) {
      resperr(res, 'INVALID-DATA');
      return;
    }
    let balance = await db['balances'].findOne({
      where: { uid: id, typestr: type },
      raw: true,
    });
    console.log('BIDDED', type, `${id}, ${balance.avail}, ${amount}`);
    if (Number(balance.avail) < Number(amount)) {
      resperr(res, 'INSUFICIENT-BALANCE');
      return;
    }
    let starting = moment().add(1, 'minutes').set('second', 0);
    let expiry = moment()
      .add(Number(dur) + 1, 'minutes')
      .set('second', 0);
    let t = await db.sequelize.transaction();
    try {
      let bets = await db['bets'].create(
        {
          uid: id,
          assetId: assetId,
          amount: amount,
          starting: starting.unix(),
          expiry: expiry.unix(),
          side: side,
          type: type,
          startingPrice: currentPrice,
        },
        {
          transaction: t,
        }
      );
      await db['balances'].increment(
        'avail',
        { by: -1 * amount, where: { typestr: type, uid: id } },
        {
          transaction: t,
        }
      );
      await db['balances'].increment(
        'locked',
        { by: amount, where: { typestr: type, uid: id } },
        {
          transaction: t,
        }
      );

      await t.commit();

      respok(res, 'BIDDED', null, {
        expiry: expiry,
        starting: starting,
        betId: bets.id,
      });

      return;
    } catch (error) {
      await t.rollback();
      resperr(res, 'UNABLE-TO-BID', null, { error });
      return;
    }
  }
);

router.post('/demobet/:assetId/:amount/:dur/:side', auth, async (req, res) => {
  //side가 0일 경우 LOW, 1일 경우 HIGH로 취급한다.
  console.log(req.decoded);
  let { assetId, amount, dur, side } = req.params;
  let { demo_uuid } = req.decoded;

  if (!assetId || !amount) {
    resperr(res, 'INVALID-DATA');
    return;
  }
  let balance = await db['balances'].findOne({
    where: { uuid: demo_uuid, typestr: 'DEMO' },
    raw: true,
  });
  console.log('BIDDED', 'DEMO', `${demo_uuid}, ${balance.avail}, ${amount}`);
  if (Number(balance.avail) < Number(amount)) {
    resperr(res, 'INSUFICIENT-BALANCE');
    return;
  }
  let starting = moment().add(1, 'minutes').set('second', 0);
  let expiry = moment()
    .add(Number(dur) + 1, 'minutes')
    .set('second', 0);
  let t = await db.sequelize.transaction();
  try {
    let bets = await db['bets'].create(
      {
        uuid: demo_uuid,
        assetId: assetId,
        amount: amount,
        starting: starting.unix(),
        expiry: expiry.unix(),
        side: side,
        type: 'DEMO',
      },
      {
        transaction: t,
      }
    );
    await db['balances'].increment(
      'avail',
      {
        by: -1 * amount,
        where: { typestr: 'DEMO', uuid: demo_uuid, uid: null },
      },
      {
        transaction: t,
      }
    );
    await db['balances'].increment(
      'locked',
      { by: amount, where: { typestr: 'DEMO', uuid: demo_uuid } },
      {
        transaction: t,
      }
    );

    await t.commit();

    respok(res, 'BIDDED', null, {
      expiry: expiry,
      starting: starting,
      betId: bets.id,
    });

    return;
  } catch (error) {
    await t.rollback();
    resperr(res, 'UNABLE-TO-BID', null, { error });
    return;
  }
});

Number.prototype.zeroPad = function (length) {
  length = length || 2;
  return (new Array(length).join('0') + this).slice(length * -1);
};

router.get('/my/:type', auth, async (req, res) => {
  let { id } = req.decoded;
  let { type } = req.params;
  if (type == 'now') {
    let respdata = await db['bets'].findAll({
      where: {
        uid: id,
      },
      include: [
        {
          model: db['assets'],
        },
      ],
    });
    respok(res, null, null, { respdata });
    return;
  } else if (type == 'history') {
    let respdata = await db['betlogs']
      .findAll({
        where: {
          uid: id,
        },
        attributes: [
          [
            db.Sequelize.fn('day', db.Sequelize.col('betlogs.createdat')),
            'day',
          ],
          [
            db.Sequelize.fn('year', db.Sequelize.col('betlogs.createdat')),
            'year',
          ],
          [
            db.Sequelize.fn('month', db.Sequelize.col('betlogs.createdat')),
            'month',
          ],
          'uid',
          'assetId',
          'amount',
          'starting',
          'expiry',
          'startingPrice',
          'endingPrice',
          'side',
          'type',
          'status',
          'diffRate',
        ],
        include: [
          {
            model: db['assets'],
          },
        ],
        raw: true,
        nest: true,
      })
      .then(async (respdata) => {
        let result = respdata.reduce(function (r, a) {
          //console.log(a)
          let ynm = a.year + '-' + a.month.zeroPad() + '-' + a.day.zeroPad();
          r[ynm] = r[ynm] || [];
          delete a.year;
          delete a.month;
          delete a.day;
          r[ynm].push(a);
          return r;
        }, Object.create(null));
        let final = [];
        Object.keys(result).forEach((v) => {
          console.log(v);
          final.push({
            time: v,
            value: result[v].sort((a, b) => {
              return b.createdat - a.createdat;
            }),
          });
        });
        respok(res, null, null, { respdata: final });
      });
    //respok(res, null, null, {respdata});
    return;
  } else {
    resperr(res, 'INVALID-VALUE');
    return;
  }
});

module.exports = router;

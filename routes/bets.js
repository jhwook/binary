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
let { Op } = db.Sequelize;
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
const { create_uuid_via_namespace } = require('../utils/common');
const STRINGER = JSON.stringify;

const sha256 = require('js-sha256');
const getsig_from_betinfo = (jbetinfo) => {
  let { amount, assetId, dur, side, type, uid } = jbetinfo;
  return sha256(STRINGER(jbetinfo));
};
// let j_uidassetid_betsig_time={}
const set_betsig = (sig, timeunix) => {
  cliredisa.hset('BETSIGS', sig, timeunix ? timeunix : moment().unix());
};
const query_betsig = async (sig) => {
  let resp = await cliredisa.hget('BETSIGS', sig);
  return resp;
};
const ensure_enforce_refuse_fast_bids = async (jbetinfo) => {
  let resp = await db['settings'].findOne({
    raw: true,
    where: { name: 'REFUSE_FAST_BIDS_INTERVAL' },
  });
  if (resp) {
  } else {
    return { status: true };
  }
  let { value: timeclearance } = resp;
  if (+timeclearance > 0) {
  } else {
    return { status: true };
  }
  timeclearance = +timeclearance;
  let betsig = getsig_from_betinfo(jbetinfo);
  let respbetsig = await cliredisa.hget('BETSIGS', betsig);
  if (respbetsig) {
  } else {
    return { status: true };
  }
  let time_lastbet_unix = +respbetsig;
  let timenowunix = moment().unix();
  let deltatimeunix;
  if ((deltatimeunix = timenowunix - time_lastbet_unix) > timeclearance) {
    return { status: true };
  } else {
    return { status: false, sig: betsig, deltatimeunix, timenowunix };
  } // timenowunix
};
router.post(
  '/join/:type/:assetId/:amount/:dur/:side',
  auth,
  async (req, res) => {
    //side가 0일 경우 LOW, 1일 경우 HIGH로 취급한다.
    // console.log('req.decoded', req.decoded);
    let { amount, assetId, dur, side, type } = req.params;
    if (!assetId || !amount || !type) {
      resperr(res, 'INVALID-DATA');
      return;
    }
    let id;
    let currentPrice;
    await db['assets']
      .findOne({ where: { active: 1, id: assetId }, raw: true })
      .then(async (resp) => {
        let { APISymbol } = resp;
        currentPrice = await cliredisa.hget(
          'STREAM_ASSET_PRICE_PER_MIN',
          APISymbol
        );
      });
    ///////////////////////////////////////////////////////////
    if (req.decoded.id) {
      id = req.decoded.id;
      let balance = await db['balances'].findOne({
        where: { uid: id, typestr: type },
        raw: true,
      });
      console.log('BIDDED', type, `${id}, ${balance.avail}, ${amount}`);
      if (Number(balance.avail) < Number(amount)) {
        resperr(res, 'INSUFICIENT-BALANCE');
        return;
      }

      if (false) {
        let jbetsigdata = {
          amount,
          assetId,
          dur,
          side,
          type,
          uid: id,
        };
        let jdeltatime = ensure_enforce_refuse_fast_bids(jbetsigdata);
        if (jdeltatime.status) {
        } else {
          resperr(
            res,
            `PLEASE-WAIT-AND-ALLOW-${jdeltatime.deltatimeunix}SEC-TO-SUBSEQUENT-BIDS`
          );
          return;
        }
      }
      let starting = moment().add(1, 'minutes').set('second', 0);
      let expiry = moment()
        .add(Number(dur) + 1, 'minutes')
        .set('second', 0);
      let betdata = {
        uid: id,
        assetId: assetId,
        amount: amount,
        starting: starting.unix(),
        expiry: expiry.unix(),
        side: side,
        type: type,
        startingPrice: currentPrice,
      };
      // let uuid = create_uuid_via_namespace(STRINGER(betdata));
      // betdata['uuid'] = uuid;
      // let t = await db.sequelize.transaction();

      let bets = await db['bets'].create(betdata);
      await db['balances'].increment('avail', {
        by: -1 * amount,
        where: { typestr: type, uid: id },
      });
      await db['balances'].increment('locked', {
        by: amount,
        where: { typestr: type, uid: id },
      });

      respok(res, 'BIDDED', null, {
        expiry: expiry,
        starting: starting,
        betId: bets.id,
      }); //				set_betsig ( jdeltatime.sig , jdeltatime.timenowunix )
      false && set_betsig(getsig_from_betinfo(jbetsigdata), moment().unix());
      return;
    }
    ///////////////////////////////////////////////////////////
    // if (req.decoded.demo_uuid)
    else {
      let demo_uuid = req.decoded.demo_uuid;
      if (!assetId || !amount) {
        resperr(res, 'INVALID-DATA');
        return;
      }
      let balance = await db['balances'].findOne({
        where: { uuid: demo_uuid, typestr: 'DEMO' },
        raw: true,
      });
      console.log(
        'BIDDED',
        'DEMO',
        `${demo_uuid}, ${balance.avail}, ${amount}`
      );
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
            startingPrice: currentPrice,
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
    }
  }
);

Number.prototype.zeroPad = function (length) {
  length = length || 2;
  return (new Array(length).join('0') + this).slice(length * -1);
};

router.get('/my/:type', auth, async (req, res) => {
  let id;
  let { type } = req.params;

  if (req.decoded.id) {
    id = req.decoded.id;
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
          limit: 10,
          order: [['id', 'DESC']],
          raw: true,
          nest: true,
        })
        .then(async (respdata) => {
          let promises = respdata.map(async (el) => {
            let { assetId, amount, diffRate, status, starting, expiry } = el;
            if (status === 0) {
              amount = amount / 10 ** 6;
              let profit_amount = amount.toFixed(2);
              el['profit_amount'] = -1 * profit_amount;
              el['profit_percent'] = (
                -1 *
                (profit_amount / amount) *
                100
              ).toFixed(0);
            }
            if (status === 1) {
              amount = amount / 10 ** 6;
              let profit_amount = ((amount * diffRate) / 100).toFixed(2);
              el['profit_amount'] = profit_amount;
              el['profit_percent'] = ((profit_amount / amount) * 100).toFixed(
                0
              );
            }
            if (status === 2) {
              amount = amount / 10 ** 6;
              let profit_amount = amount.toFixed(2);
              el['profit_amount'] = profit_amount;
              el['profit_percent'] = ((profit_amount / amount) * 100).toFixed(
                0
              );
            }
            await db['tickers']
              .findOne({
                where: {
                  assetId,
                  expiryTime: { [Op.gte]: expiry, [Op.lte]: expiry },
                  startingTime: { [Op.gte]: starting, [Op.lte]: starting },
                },
                raw: true,
              })
              .then((resp) => {
                if (resp) {
                  el['periodData'] = resp.periodPrice;
                }
              });
          });
          await Promise.all(promises);
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
  } else {
    let demo_uuid = req.decoded.demo_uuid;
    if (type == 'now') {
      let respdata = await db['bets'].findAll({
        where: {
          uuid: demo_uuid,
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
            uuid: demo_uuid,
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
          // offset: 0,
          limit: 10,
          order: [['id', 'DESC']],
          raw: true,
          nest: true,
        })
        .then(async (respdata) => {
          let promises = respdata.map(async (el) => {
            let { assetId, amount, diffRate, status, starting, expiry } = el;
            if (status === 0) {
              amount = amount / 10 ** 6;
              let profit_amount = amount.toFixed(2);
              el['profit_amount'] = -1 * profit_amount;
              el['profit_percent'] = (
                -1 *
                (profit_amount / amount) *
                100
              ).toFixed(0);
            }
            if (status === 1) {
              amount = amount / 10 ** 6;
              let profit_amount = ((amount * diffRate) / 100).toFixed(2);
              el['profit_amount'] = profit_amount;
              el['profit_percent'] = ((profit_amount / amount) * 100).toFixed(
                0
              );
            }
            await db['tickers']
              .findOne({
                where: {
                  assetId,
                  expiryTime: { [Op.gte]: expiry, [Op.lte]: expiry },
                  startingTime: { [Op.gte]: starting, [Op.lte]: starting },
                },
                raw: true,
              })
              .then((resp) => {
                if (resp) {
                  el['periodData'] = resp.periodPrice;
                }
              });
          });
          await Promise.all(promises);
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
  }

  // if (req.decoded.demo_uuid) {
  //   let demo_uuid = req.decoded.demo_uuid;
  //   if (type == 'now') {
  //     let respdata = await db['bets'].findAll({
  //       where: {
  //         uuid: demo_uuid,
  //       },
  //       include: [
  //         {
  //           model: db['assets'],
  //         },
  //       ],
  //     });
  //     respok(res, null, null, { respdata });
  //     return;
  //   } else if (type == 'history') {
  //     let respdata = await db['betlogs']
  //       .findAll({
  //         where: {
  //           uid: id,
  //         },
  //         attributes: [
  //           [
  //             db.Sequelize.fn('day', db.Sequelize.col('betlogs.createdat')),
  //             'day',
  //           ],
  //           [
  //             db.Sequelize.fn('year', db.Sequelize.col('betlogs.createdat')),
  //             'year',
  //           ],
  //           [
  //             db.Sequelize.fn('month', db.Sequelize.col('betlogs.createdat')),
  //             'month',
  //           ],
  //           'uid',
  //           'assetId',
  //           'amount',
  //           'starting',
  //           'expiry',
  //           'startingPrice',
  //           'endingPrice',
  //           'side',
  //           'type',
  //           'status',
  //           'diffRate',
  //         ],
  //         include: [
  //           {
  //             model: db['assets'],
  //           },
  //         ],
  //         order: [['id', 'DESC']],
  //         raw: true,
  //         nest: true,
  //       })
  //       .then(async (respdata) => {
  //         let promises = respdata.map(async (el) => {
  //           let { assetId, amount, diffRate, status, expiry } = el;
  //           if (status === 0) {
  //             amount = amount / 10 ** 6;
  //             let profit_amount = amount.toFixed(2);
  //             el['profit_amount'] = -1 * profit_amount;
  //             el['profit_percent'] = (
  //               -1 *
  //               (profit_amount / amount) *
  //               100
  //             ).toFixed(0);
  //           }
  //           if (status === 1) {
  //             amount = amount / 10 ** 6;
  //             let profit_amount = ((amount * diffRate) / 100).toFixed(2);
  //             el['profit_amount'] = profit_amount;
  //             el['profit_percent'] = ((profit_amount / amount) * 100).toFixed(
  //               0
  //             );
  //           }
  //           await db['tickers']
  //             .findOne({
  //               where: {
  //                 assetId,
  //                 expiryTime: { [Op.gte]: expiry - 2, [Op.lte]: expiry + 62 },
  //               },
  //               raw: true,
  //             })
  //             .then((resp) => {
  //               if (resp) {
  //                 el['periodData'] = resp.periodPrice;
  //               }
  //             });
  //         });
  //         await Promise.all(promises);
  //         let result = respdata.reduce(function (r, a) {
  //           //console.log(a)
  //           let ynm = a.year + '-' + a.month.zeroPad() + '-' + a.day.zeroPad();
  //           r[ynm] = r[ynm] || [];
  //           delete a.year;
  //           delete a.month;
  //           delete a.day;
  //           r[ynm].push(a);
  //           return r;
  //         }, Object.create(null));
  //         let final = [];
  //         Object.keys(result).forEach((v) => {
  //           final.push({
  //             time: v,
  //             value: result[v].sort((a, b) => {
  //               return b.createdat - a.createdat;
  //             }),
  //           });
  //         });
  //         respok(res, null, null, { respdata: final });
  //       });
  //     //respok(res, null, null, {respdata});
  //     return;
  //   } else {
  //     resperr(res, 'INVALID-VALUE');
  //     return;
  //   }
  // }
});

router.get('/end', async (req, res) => {
  // let { id } = req.decoded;
  let id = 114;
  let now_unix = moment().set('second', 0).unix();
  await db['betlogs']
    .findAll({
      where: { uid: id, expiry: now_unix },
      raw: true,
    })
    .then((resp) => {
      resp.map((bet) => {
        let { amount, status, diffRate } = bet;
        let profit = 0;
        amount = amount / 10 ** 6;
        if (status === 1) {
          if (diffRate === 0) {
            profit = amount;
          } else {
            profit = ((amount * diffRate) / 100).toFixed(2);
          }
        } else if (status === 0) {
          profit = -1 * amount;
        } else if (status === 2) {
          profit = amount;
        }
        bet['profit'] = profit;
      });
      respok(res, null, null, { resp });
    });
});

router.get('/log/list/:offset/:limit', async (req, res) => {
  let { offset, limit } = req.params;
  offset = +offset;
  limit = +limit;
  await db['betlogs']
    .findAll({
      raw: true,
      offset,
      limit,
      order: [['id', 'desc']],
    })
    .then((resp) => {
      respok(res, null, null, { resp });
    });
});

router.get('/log/:id', async (req, res) => {
  let { id } = req.params;
  await db['betlogs']
    .findOne({
      where: { id: id },
      raw: true,
    })
    .then((resp) => {
      respok(res, null, null, { resp });
    });
});

router.get('/count/:type', async (req, res) => {
  let now = moment().startOf('minute').unix();
  let { type } = req.params;

  if (type === 'all') {
    await db['bets']
      .count({
        where: { expiry: now },
      })
      .then((resp) => {
        console.log(now);
        console.log(resp);
        respok(res, null, null, { count: resp });
      });
  }
});

router.post(
  '/bot/join/:type/:assetId/:amount/:dur/:side/:id',
  async (req, res) => {
    //side가 0일 경우 LOW, 1일 경우 HIGH로 취급한다.
    // console.log('req.decoded', req.decoded);
    let { amount, assetId, dur, side, type, id } = req.params;
    if (!assetId || !amount || !type) {
      resperr(res, 'INVALID-DATA');
      return;
    }
    let currentPrice;
    await db['assets']
      .findOne({ where: { active: 1, id: assetId }, raw: true })
      .then(async (resp) => {
        let { APISymbol } = resp;
        currentPrice = await cliredisa.hget(
          'STREAM_ASSET_PRICE_PER_MIN',
          APISymbol
        );
      });
    ///////////////////////////////////////////////////////////

    let balance = await db['balances'].findOne({
      where: { uid: id, typestr: type },
      raw: true,
    });
    console.log('BIDDED', type, `${id}, ${balance.avail}, ${amount}`);
    if (Number(balance.avail) < Number(amount)) {
      resperr(res, 'INSUFICIENT-BALANCE');
      return;
    }

    if (false) {
      let jbetsigdata = {
        amount,
        assetId,
        dur,
        side,
        type,
        uid: id,
      };
      let jdeltatime = ensure_enforce_refuse_fast_bids(jbetsigdata);
      if (jdeltatime.status) {
      } else {
        resperr(
          res,
          `PLEASE-WAIT-AND-ALLOW-${jdeltatime.deltatimeunix}SEC-TO-SUBSEQUENT-BIDS`
        );
        return;
      }
    }
    let starting = moment().add(1, 'minutes').set('second', 0);
    let expiry = moment()
      .add(Number(dur) + 1, 'minutes')
      .set('second', 0);
    let betdata = {
      uid: id,
      assetId: assetId,
      amount: amount,
      starting: starting.unix(),
      expiry: expiry.unix(),
      side: side,
      type: type,
      startingPrice: currentPrice,
    };
    // let uuid = create_uuid_via_namespace(STRINGER(betdata));
    // betdata['uuid'] = uuid;
    // let t = await db.sequelize.transaction();

    let bets = await db['bets'].create(betdata);
    await db['balances'].increment('avail', {
      by: -1 * amount,
      where: { typestr: type, uid: id },
    });
    await db['balances'].increment('locked', {
      by: amount,
      where: { typestr: type, uid: id },
    });

    respok(res, 'BIDDED', null, {
      expiry: expiry,
      starting: starting,
      betId: bets.id,
    }); //				set_betsig ( jdeltatime.sig , jdeltatime.timenowunix )
    false && set_betsig(getsig_from_betinfo(jbetsigdata), moment().unix());
    return;
  }
);

module.exports = router;

const ensure_enforce_refuse_fast_bids_stale_ver = async (jbetinfo) => {
  let resp = await db['settings'].findOne({
    raw: true,
    where: { name: 'REFUSE_FAST_BIDS_INTERVAL' },
  });
  if (resp) {
  } else {
    return true;
  }
  let { value: timeclearance } = resp;
  if (+timeclearance > 0) {
  } else {
    return true;
  }
  timeclearance = +timeclearance;
  let betsig = getsig_from_betinfo(jbetinfo);
  let respbetsig = await cliredisa.hget('BETSIGS', betsig);
  if (respbetsig) {
  } else {
    return true;
  }
  let time_lastbet_unix = +respbetsig;
  let timenowunix = moment().unix();
  if (timenowunix - time_lastbet_unix > timeclearance) {
    return true;
  } else {
    return false;
  }
};

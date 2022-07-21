var express = require('express');
const jwt = require('jsonwebtoken');
const { auth } = require('../utils/authMiddleware');
const db = require('../models');
var moment = require('moment');
const LOGGER = console.log;
const cron = require('node-cron');
const axios = require('axios');
let { Op } = db.Sequelize;
let { I_LEVEL } = require('../configs/userlevel');
const {
  ASSETID_SYMBOL,
  ASSETID_API_SYMBOL,
  ASSETID_MARKET,
} = require('../utils/ticker_symbol');
// const ASSETID_SYMBOL = [
//   '___SKIPPER___',
//   'BTC-USD',
//   'ETH-USD',
//   'XRP-USD',
//   'EURUSD=X',
//   'JPY=X',
//   'GBPUSD=X',
//   'CAD=X',
//   'CHF=X',
//   '9988.HK',
//   '601398.SS',
//   '601288.SS',
//   '0700.HK',
//   '600519.SS',
// ];
// const ASSETID_API_SYMBOL = [
//   '__SKIPPER__',
//   'BTCUSDT',
//   'ETHUSDT',
//   'XRPUSDT',
//   'EUR/USD',
//   'USD/JPY',
//   'GBP/USD',
//   'USD/CAD',
//   'USD/CHF',
// ];
// const ASSETID_MARKET = [
//   '__SKIPPER__',
//   'BINANCE',
//   'BINANCE',
//   'BINANCE',
//   'FXCM',
//   'FXCM',
//   'FXCM',
//   'FXCM',
//   'FXCM',
//   'FXCM',
// ];
cron.schedule('10 * * * * *', async () => {
  console.log('@Round Checkings', moment().format('HH:mm:ss'), '@binopt');
  const timenow = moment().startOf('minute');
  console.log(timenow.unix());
  let FEE_TO_BRANCH = await db['feesettings']
    .findOne({
      where: { key_: 'FEE_TO_BRANCH' },
      raw: true,
    })
    .then((resp) => {
      let { value_ } = resp;
      return value_;
    });
  let FEE_TO_ADMIN = await db['feesettings']
    .findOne({
      where: { key_: 'FEE_TO_ADMIN' },
      raw: true,
    })
    .then((resp) => {
      let { value_ } = resp;
      return value_;
    });

  ASSETID_SYMBOL.map(async (v, i) => {
    if (i == 0) {
      return;
    }
    let exists = new Promise(async (resolve, reject) => {
      await db['bets']
        .findAll({
          where: {
            assetId: i,
            [Op.or]: [{ starting: timenow.unix() }, { expiry: timenow.unix() }],
          },
          raw: true,
        })
        .then(async (result) => {
          if (!result) return;
          let { data } = await axios.get(
            `https://finnhub.io/api/v1/crypto/candle?symbol=${
              ASSETID_MARKET[i]
            }:${
              ASSETID_API_SYMBOL[i]
            }&resolution=1&from=${timenow.unix()}&to=${timenow.unix()}&token=c9se572ad3i4aps1soq0`
          );
          let price;
          if (data && ASSETID_API_SYMBOL[i]) {
            console.log('data.c[0]', data.c[0]);
            if (data.c[0]) price = data.c[0];
            else price = Math.random().toFixed(10);
            console.log(`${ASSETID_API_SYMBOL[i]}`, price);
          } else if (!ASSETID_API_SYMBOL[i]) {
            price = Math.random().toFixed(10);
          }

          //let {data} = await axios.get(`https://yfapi.net/v7/finance/opti(ons/${v}?date=${timenow.unix()}`, {headers:{'X-API-KEY': 'r9e2WqrJWDbMMeoQQMbd8bp09FGkLFXaMKDZRR3f'}})
          //data.optionChain.result[0].quote.regularMarketPrice;
          let status;
          let sumBetAmount_lose_win = [0, 0];
          result.map(async (v) => {
            if (v.starting == timenow.unix()) {
              //await db['assets'].update({currentPrice: price}, {where:{id: i}})
              await db['bets'].update(
                { startingPrice: price },
                { where: { id: v.id } }
              );
            }
            if (v.expiry == timenow.unix()) {
              if (v.startingPrice == price) {
                status = 2;
              } else if (v.startingPrice > price) {
                //가격이 떨어짐
                if (v.side.toUpperCase() == 'HIGH') {
                  status = 0;
                  sumBetAmount_lose_win[0] += v.amount;
                } else {
                  status = 1;
                  sumBetAmount_lose_win[1] += v.amount;
                }
              } else if (v.startingPrice < price) {
                if (v.side.toUpperCase() == 'HIGH') {
                  status = 1;
                  sumBetAmount_lose_win[1] += v.amount;
                } else {
                  status = 0;
                  sumBetAmount_lose_win[0] += v.amount;
                }
              } else {
                status = 3;
              }
              await db['betlogs']
                .create({
                  uid: v.uid,
                  assetId: v.assetId,
                  amount: v.amount,
                  starting: v.starting,
                  expiry: v.expiry,
                  startingPrice: v.startingPrice,
                  side: v.side,
                  type: v.type,
                  endingPrice: price,
                  status: status,
                  diffRate: v.diffRate,
                })
                .then((_) => {
                  db['bets'].destroy({ where: { id: v.id } });
                });
            }
          });
          resolve({
            i: i,
            now: timenow.unix(),
            sumBetAmount_lose_win: sumBetAmount_lose_win,
            status,
          });
        });
    });
    exists.then((value) => {
      let { i, now, sumBetAmount_lose_win, status } = value;
      settlebets(
        i,
        now,
        sumBetAmount_lose_win,
        FEE_TO_BRANCH,
        FEE_TO_ADMIN,
        'LIVE',
        status
      );
      settlebets(
        i,
        now,
        sumBetAmount_lose_win,
        FEE_TO_BRANCH,
        FEE_TO_ADMIN,
        'DEMO',
        status
      );
    });
    // const result = await Promise.all(exists);
    // console.log(result);
    if (exists) {
    } else {
    }
  });
});
/*
    Status
    0-> 짐
    1-> 이김
    2-> 비김
    3-> 짐
*/

const settlebets = async (
  assetId,
  expiry,
  sumBetAmount_lose_win,
  FEE_TO_BRANCH,
  FEE_TO_ADMIN,
  type,
  status
) => {
  let winnerTotalAmount = sumBetAmount_lose_win[1];
  let loserTotalAmount = sumBetAmount_lose_win[0];

  if (status === 2) {
    await db['betlogs']
      .findAll({
        where: {
          assetId,
          expiry,
          type,
          status: 2,
        },
        raw: true,
      })
      .then(async (drawusers) => {
        if (drawusers.length < 1) {
          return;
        }
        drawusers.map(async (v) => {
          // console.log(v);
          await db['balances'].increment('locked', {
            by: -1 * v.amount,
            where: { uid: v.uid, typestr: v.type },
          });
          await db['balances'].increment('avail', {
            by: v.amount,
            where: { uid: v.uid, typestr: v.type },
          });
        });
      });
  } else if (status !== 2 && type === 'LIVE') {
    if (winnerTotalAmount === 0 || loserTotalAmount === 0) {
    } else if (winnerTotalAmount !== 0 && loserTotalAmount !== 0) {
      console.log(type, assetId, sumBetAmount_lose_win, status);
      // const t = await db.sequelize.transaction();
      try {
        await db['betlogs']
          .findAll({
            where: {
              assetId,
              expiry,
              type,
              status: 0,
            },
            raw: true,
          })
          .then(async (losers) => {
            losers.map(async (v) => {
              await db['balances'].increment(
                ['total', 'locked'],
                { by: -1 * v.amount, where: { uid: v.uid, typestr: v.type } }
                // {
                //   transaction: t,
                // }
              );
            });
          });

        await db['betlogs']
          .findAll({
            where: {
              assetId,
              expiry,
              type,
              status: 1,
            },
            raw: true,
          })
          .then(async (winners) => {
            winners.map(async (v) => {
              let { uid } = v;
              let earned =
                Math.ceil((loserTotalAmount * v.amount) / winnerTotalAmount) ||
                0;

              let fee_to_referer;
              let fee_to_admin = (earned * FEE_TO_ADMIN) / 10000;
              let fee_to_branch = (earned * FEE_TO_BRANCH) / 10000;
              let earned_after_fee = earned - fee_to_admin - fee_to_branch;

              await db['referrals']
                .findOne(
                  { where: { referral_uid: uid }, raw: true }
                  // { transaction: t }
                )
                .then(async (resp) => {
                  if (resp) {
                    let winner_referer_uid = resp.referer_uid;
                    await db['users']
                      .findOne({ where: { id: winner_referer_uid }, raw: true })
                      .then(async (resp) => {
                        let referer_level = resp.level;
                        let referer_fee_type = `FEE_TO_REFERER_${I_LEVEL[referer_level]}`;
                        let FEE_TO_REFERER = await db['feesettings']
                          .findOne(
                            {
                              where: { key_: referer_fee_type },
                              raw: true,
                            }
                            // {
                            //   transaction: t,
                            // }
                          )
                          .then((resp) => {
                            let { value_ } = resp;
                            return value_;
                          });
                        fee_to_referer = (earned * FEE_TO_REFERER) / 10000;
                        earned_after_fee =
                          earned -
                          fee_to_admin -
                          fee_to_branch -
                          fee_to_referer;
                        await db['logfees'].create(
                          {
                            payer_uid: uid,
                            recipient_uid: winner_referer_uid,
                            feeamount: fee_to_referer,
                            typestr: 'FEE_TO_REFERER',
                            betamount: v.amount,
                          }
                          // {
                          //   transaction: t,
                          // }
                        );
                        await db['balances'].increment(
                          'avail',
                          {
                            by: fee_to_referer,
                            where: { uid: winner_referer_uid, typestr: v.type },
                          }
                          // {
                          //   transaction: t,
                          // }
                        );
                      });
                  }
                });

              // console.log('earned_after_fee', earned_after_fee);

              let total = Number(earned_after_fee) + Number(v.amount);

              const admin = await db['users'].findOne(
                {
                  where: { isadmin: 1 },
                }
                // {
                //   transaction: t,
                // }
              );

              const branch = await db['users'].findOne(
                {
                  where: { isbranch: 1 },
                }
                // {
                //   transaction: t,
                // }
              );
              // Fee to admin and update admin's balance
              await db['logfees'].create(
                {
                  payer_uid: uid,
                  recipient_uid: admin.id,
                  feeamount: fee_to_admin,
                  typestr: 'FEE_TO_ADMIN',
                  betamount: v.amount,
                }
                // { transaction: t }
              );
              await db['balances'].increment(
                'avail',
                {
                  by: fee_to_admin,
                  where: { uid: admin.id, typestr: v.type },
                }
                // {
                //   transaction: t,
                // }
              );

              // Fee to branch and update branch's balance
              await db['logfees'].create(
                {
                  payer_uid: uid,
                  recipient_uid: branch.id,
                  feeamount: fee_to_branch,
                  typestr: 'FEE_TO_BRANCH',
                  betamount: v.amount,
                }
                // { transaction: t }
              );
              await db['balances'].increment(
                'avail',
                {
                  by: fee_to_branch,
                  where: { uid: branch.id, typestr: v.type },
                }
                // {
                //   transaction: t,
                // }
              );

              // update winner's balance
              await db['balances'].increment(
                'locked',
                { by: -1 * v.amount, where: { uid: v.uid, typestr: v.type } }
                // {
                //   transaction: t,
                // }
              );
              await db['balances'].increment(
                'avail',
                { by: total, where: { uid: v.uid, typestr: v.type } }
                // {
                //   transaction: t,
                // }
              );
              await db['balances'].increment(
                'total',
                {
                  by: +earned_after_fee,
                  where: { uid: v.uid, typestr: v.type },
                }
                // {
                //   transaction: t,
                // }
              );
            });
          });
        // await t.commit();
        // console.log('@transaction commit');
      } catch (error) {
        console.log(error);
        // await t.rollback();
      }
    }
  } else if (status !== 2 && type === 'DEMO') {
    if (winnerTotalAmount === 0 || loserTotalAmount === 0) {
    } else if (winnerTotalAmount !== 0 && loserTotalAmount !== 0) {
      // const t = await db.sequelize.transaction();
      try {
        await db['betlogs']
          .findAll({
            where: {
              assetId,
              expiry,
              type,
              status: 0,
            },
            raw: true,
          })
          .then(async (losers) => {
            losers.map(async (v) => {
              await db['balances'].increment(
                ['total', 'locked'],
                { by: -1 * v.amount, where: { uid: v.uid, typestr: v.type } }
                // {
                //   transaction: t,
                // }
              );
            });
          });

        await db['betlogs']
          .findAll({
            where: {
              assetId,
              expiry,
              type,
              status: 1,
            },
            raw: true,
          })
          .then(async (winners) => {
            winners.map(async (v) => {
              let { uid } = v;
              let earned =
                Math.ceil((loserTotalAmount * v.amount) / winnerTotalAmount) ||
                0;

              // update winner's balance
              await db['balances'].increment(
                'locked',
                { by: -1 * v.amount, where: { uid: v.uid, typestr: v.type } }
                // {
                //   transaction: t,
                // }
              );
              await db['balances'].increment(
                'avail',
                { by: v.amount, where: { uid: v.uid, typestr: v.type } }
                // {
                //   transaction: t,
                // }
              );
              await db['balances'].increment(
                'total',
                {
                  by: v.amount,
                  where: { uid: v.uid, typestr: v.type },
                }
                // {
                //   transaction: t,
                // }
              );
            });
          });
        // await t.commit();
        // console.log('@DEMO transaction commit');
      } catch (error) {
        console.log(error);
        // await t.rollback();
      }
    }
  }
};

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
  ASSETID_API_SYMBOL,
  ASSETID_MARKET,
  ASSETID_REDIS_SYMBOL,
} = require('../utils/ticker_symbol');
const cliredisa = require('async-redis').createClient();
const { calculate_dividendrate } = require('./calculateDividendRate');

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

  let assetList = await db['assets']
    .findAll({
      where: { active: 1 },
      raw: true,
    })
    .then((resp) => {
      for (let type = 0; type < 2; type++) {
        if (type === 0) {
          type = 'LIVE';
        } else if (type === 1) {
          type = 'DEMO';
        }
        resp.map(async (v, i) => {
          let { id, APISymbol } = v;

          let exists = new Promise(async (resolve, reject) => {
            await db['bets']
              .findAll({
                where: {
                  assetId: id,
                  type,
                  expiry: timenow.unix(),
                },
                raw: true,
              })
              .then(async (bets) => {
                if (!bets) return;
                let currentPrice = await cliredisa.hget(
                  'STREAM_ASSET_PRICE_PER_MIN',
                  APISymbol
                );

                let status;
                let sumBetAmount_lose_win = [0, 0];
                let dividendrate_high;
                let dividendrate_low;
                let startPrice;

                bets.map(async (v) => {
                  startPrice = v.startingPrice;
                  if (v.expiry == timenow.unix()) {
                    if (v.startingPrice == currentPrice) {
                      status = 2;
                    } else if (v.startingPrice > currentPrice) {
                      //가격이 떨어짐
                      if (v.side.toUpperCase() == 'HIGH') {
                        dividendrate_high = v.diffRate;
                        status = 0;
                        sumBetAmount_lose_win[0] += v.amount;
                      } else {
                        dividendrate_low = v.diffRate;
                        status = 1;
                        sumBetAmount_lose_win[1] += v.amount;
                      }
                    } else if (v.startingPrice < currentPrice) {
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
                        endingPrice: currentPrice,
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
                  dividendrate_high,
                  dividendrate_low,
                  currentPrice,
                  startPrice,
                });
              });
          });
          exists.then((value) => {
            let {
              i,
              now,
              sumBetAmount_lose_win,
              status,
              dividendrate_high,
              dividendrate_low,
              currentPrice,
              startPrice,
            } = value;
            movelogrounds(
              i,
              now,
              sumBetAmount_lose_win,
              dividendrate_high,
              dividendrate_low,
              currentPrice,
              startPrice,
              type
            );
            settlebets(
              i,
              now,
              sumBetAmount_lose_win,
              FEE_TO_BRANCH,
              FEE_TO_ADMIN,
              type,
              status
            );
            // settlebets(
            //   i,
            //   now,
            //   sumBetAmount_lose_win,
            //   FEE_TO_BRANCH,
            //   FEE_TO_ADMIN,
            //   'DEMO',
            //   status
            // );
          });
          // const result = await Promise.all(exists);
          // console.log(result);
          if (exists) {
          } else {
          }
        });
      }
    });
});

const movelogrounds = async (
  i,
  expiry,
  sumBetAmount_lose_win,
  dividendrate_high,
  dividendrate_low,
  currentPrice,
  startPrice,
  type
) => {
  await db['logrounds'].create({
    assetId: i + 1,
    totalLowAmount: sumBetAmount_lose_win[0],
    totalHighAmount: sumBetAmount_lose_win[1],
    expiry,
    type,
    lowDiffRate: dividendrate_low,
    highDiffRate: dividendrate_high,
    startingPrice: startPrice,
    endPrice: currentPrice,
  });
};

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
                          ['total', 'avail'],
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

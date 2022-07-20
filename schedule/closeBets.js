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
const ASSETID_API_SYMBOL = [
  '__SKIPPER__',
  'BTCUSDT',
  'ETHUSDT',
  'XRPUSDT',
  'EUR/USD',
  'USD/JPY',
  'GBP/USD',
  'USD/CAD',
  'USD/CHF',
];
const ASSETID_MARKET = [
  '__SKIPPER__',
  'BINANCE',
  'BINANCE',
  'BINANCE',
  'FXCM',
  'FXCM',
  'FXCM',
  'FXCM',
  'FXCM',
  'FXCM',
];
cron.schedule('10 * * * * *', async () => {
  console.log('@Round Checkings', moment().format('HH:mm:ss'), '@binopt');
  const timenow = moment().startOf('minute');
  console.log(timenow.unix());
  ASSETID_SYMBOL.map(async (v, i) => {
    if (i == 0) {
      return;
    }
    let exists = await db['bets']
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
        if (ASSETID_API_SYMBOL[i]) {
          price = data.c[0];
          console.log(`${ASSETID_API_SYMBOL[i]}`, price);
        } else if (!ASSETID_API_SYMBOL[i]) {
          price = Math.random().toFixed(10);
        }

        //let {data} = await axios.get(`https://yfapi.net/v7/finance/opti(ons/${v}?date=${timenow.unix()}`, {headers:{'X-API-KEY': 'r9e2WqrJWDbMMeoQQMbd8bp09FGkLFXaMKDZRR3f'}})
        //data.optionChain.result[0].quote.regularMarketPrice;
        let status;
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
              } else {
                status = 1;
              }
            } else if (v.startingPrice < price) {
              if (v.side.toUpperCase() == 'HIGH') {
                status = 1;
              } else {
                status = 0;
              }
            } else {
              status = 3;
            }
            db['betlogs']
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
      });
    if (exists) {
      await settlebets(i, timenow.unix(), 'LIVE');
      await settlebets(i, timenow.unix(), 'DEMO');
    } else {
      //console.log(exists)
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

const settlebets = async (assetId, expiry, type) => {
  const t = db.sequelize.transaction();
  try {
    let [{ winnerTotalAmount }] = await db['betlogs'].findAll(
      {
        where: {
          assetId,
          expiry,
          type,
          status: 1,
        },
        attributes: [
          'id',
          [
            db.Sequelize.fn('sum', db.Sequelize.col('amount')),
            'winnerTotalAmount',
          ],
        ],
        raw: true,
      },
      {
        transaction: t,
      }
    );

    let [{ loserTotalAmount }] = await db['betlogs'].findAll(
      {
        where: {
          assetId,
          expiry,
          type,
          status: 0,
        },
        attributes: [
          'id',
          [
            db.Sequelize.fn('sum', db.Sequelize.col('amount')),
            'loserTotalAmount',
          ],
        ],
        raw: true,
      },
      {
        transaction: t,
      }
    );

    await db['betlogs']
      .findAll(
        {
          where: {
            assetId,
            expiry,
            type,
            status: 2,
          },
          raw: true,
        },
        {
          transaction: t,
        }
      )
      .then(async (drawusers) => {
        if (drawusers.length < 1) {
          return;
        }
        drawusers.map(async (v) => {
          // console.log(v);
          await db['balances'].increment(
            'locked',
            { by: -1 * v.amount, where: { uid: v.uid, typestr: v.type } },
            {
              transaction: t,
            }
          );
          await db['balances'].increment(
            'avail',
            { by: v.amount, where: { uid: v.uid, typestr: v.type } },
            {
              transaction: t,
            }
          );
        });
      });

    await db['betlogs']
      .findAll(
        {
          where: {
            assetId,
            expiry,
            type,
            status: 0,
          },
          raw: true,
        },
        {
          transaction: t,
        }
      )
      .then(async (losers) => {
        if (losers.length < 1) {
          return;
        }
        losers.map(async (v) => {
          await db['balances'].increment(
            ['avail', 'total', 'locked'],
            { by: -1 * v.amount, where: { uid: v.uid, typestr: v.type } },
            {
              transaction: t,
            }
          );
        });
      });

    await db['betlogs']
      .findAll(
        {
          where: {
            assetId,
            expiry,
            type,
            status: 1,
          },
          raw: true,
        },
        {
          transaction: t,
        }
      )
      .then(async (winners) => {
        if (winners.length < 1) {
          return;
        }

        if (type === 'DEMO') {
          return;
        }

        let FEE_TO_BRANCH = await db['feesettings']
          .findOne({
            where: { key_: FEE_TO_BRANCH },
          })
          .then((resp) => {
            let { value_ } = resp.dataValues;
            return value_;
          });
        let FEE_TO_ADMIN = await db['feesettings']
          .findOne({
            where: { key_: FEE_TO_ADMIN },
          })
          .then((resp) => {
            let { value_ } = resp.dataValues;
            return value_;
          });

        winners.map(async (v) => {
          let { uid } = v;
          let earned =
            Math.ceil((loserTotalAmount * v.amount) / winnerTotalAmount) || 0;

          let winner_referer_uid = await db['referrals']
            .findOne({ where: { referral_uid: uid } })
            .then((resp) => {
              let { referer_uid } = resp.dataValues;
              return referer_uid;
            });
          let referer_level = await db['users']
            .findOne({ where: { id: winner_referer_uid } })
            .then((resp) => {
              let { level } = resp.dataValues;
              return level;
            });
          let referer_fee_type = `FEE_TO_${I_LEVEL[referer_level]}`;
          let FEE_TO_REFERER = await db['feesettings']
            .findOne({
              where: { key_: referer_fee_type },
            })
            .then((resp) => {
              let { value_ } = resp.dataValues;
              return value_;
            });
          let fee_to_admin = (earned * FEE_TO_ADMIN) / 10000;
          let fee_to_branch = (earned * FEE_TO_BRANCH) / 10000;
          let fee_to_referer = (earned * FEE_TO_REFERER) / 10000;

          let earned_after_fee = earned - fee_to_admin - fee_to_branch;

          if (winner_referer_uid) {
            earned_after_fee =
              earned - fee_to_admin - fee_to_branch - fee_to_referer;
            await db['logfees'].create(
              {
                payer_uid: uid,
                recipient_uid: winner_referer_uid,
                feeamount: fee_to_referer,
                typestr: FEE_TO_REFERER,
                betamount: v.amount,
              },
              {
                transaction: t,
              }
            );
            await db['balances'].increment(
              'avail',
              {
                by: fee_to_referer,
                where: { uid: winner_referer_uid, typestr: v.type },
              },
              {
                transaction: t,
              }
            );
          }

          let total = Number(earned_after_fee) + Number(v.amount);

          const admin = await db['users'].findOne({ where: { isadmin: 1 } });

          const branch = await db['users'].findOne({ where: { isbranch: 1 } });
          // Fee to admin and update admin's balance
          await db['logfees'].create({
            payer_uid: uid,
            recipient_uid: admin.id,
            feeamount: fee_to_admin,
            typestr: FEE_TO_ADMIN,
          });
          await db['balances'].increment(
            'avail',
            {
              by: fee_to_admin,
              where: { uid: admin.id, typestr: v.type },
            },
            {
              transaction: t,
            }
          );

          // Fee to branch and update branch's balance
          await db['logfees'].create({
            payer_uid: uid,
            recipient_uid: branch.id,
            feeamount: fee_to_branch,
            typestr: FEE_TO_BRANCH,
          });
          await db['balances'].increment(
            'avail',
            {
              by: fee_to_branch,
              where: { uid: branch.id, typestr: v.type },
            },
            {
              transaction: t,
            }
          );

          // update winner's balance
          await db['balances'].increment(
            'locked',
            { by: -1 * v.amount, where: { uid: v.uid, typestr: v.type } },
            {
              transaction: t,
            }
          );
          await db['balances'].increment(
            'avail',
            { by: total, where: { uid: v.uid, typestr: v.type } },
            {
              transaction: t,
            }
          );
          await db['balances'].increment(
            'total',
            { by: +earned_after_fee, where: { uid: v.uid, typestr: v.type } },
            {
              transaction: t,
            }
          );
        });
      });
    await t.commit();
  } catch (err) {
    await t.rollback();
    console.log(err);
  }
};

var express = require('express');
let { respok, resperr } = require('../utils/rest');
const jwt = require('jsonwebtoken');
const { softauth, auth } = require('../utils/authMiddleware');
const db = require('../models');
var crypto = require('crypto');
const LOGGER = console.log;
const { withdraw } = require('../services/withdrawal');
const { closeTx } = require('../services/closeTx');
const { watchTransfers } = require('../services/trackTx');
let { Op } = db.Sequelize;
const moment = require('moment');
var router = express.Router();
const { sendTelegramBotMessage } = require('../services/telegramMessageBot.js')

router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post('/v1/:type', (req, res) => {});

router.patch('/demo/fund/:amount', auth, async (req, res) => {
  let { id } = req.decoded;
  let { amount } = req.params;

  db['balances']
    .findOne({
      where: {
        uid: id,
        typestr: 'DEMO',
      },
    })
    .then((result) => {
      console.log(+result.total + amount);
      // if (+result.total + amount > 1000000000000000) {

      //   resperr(res, 'TOO-MUCH-DEMO-BALANCE');
      // } else {
      result.increment(['avail', 'total'], { by: amount }).then((_) => {
        respok(res, null, null, { total: result.total });
      });
      // }
    });
});

router.post('/listen/:type', auth, async (req, res) => {
  let { type } = req.params;
  let { id, wallet } = req.decoded;
  if (!id) {
    resperr(res, 'USER-NOT-FOUND');
    return;
  }
  let resp = await watchTransfers(wallet, type, id, res);
});

router.patch('/live/:type/:amount', auth, async (req, res) => {
  console.log('@@@@@@@@@@@@@@@@@@patch live');
  let { type, amount } = req.params;
  let {
    rxaddr,
    txhash,
    tokentype,
    senderaddr,
    name,
    card,
    bankCode,
    bankName,
  } = req.body;
  let { id, isadmin, isbranch } = req.decoded;
  console.log('HELLO');
  console.log('BODY', req.body);
  // amount *= 1000000;
  // if (type.toUpperCase() === 'WITHDRAW') {
  //   amount *= 1000000;
  // } else if (type.toUpperCase() === 'DEPOSIT') {
  //   amount *= 1000000;
  // }
  amount = amount * 10 ** 6;
  if (!id) {
    resperr(res, 'NOT-LOGGED-IN');
    return;
  }
  let balance = await db['balances'].findOne({
    where: {
      typestr: 'LIVE',
      uid: id,
    },
    raw: true,
  });
  switch (type.toUpperCase()) {
    case 'WITHDRAW':
      console.log(amount);
      console.log(balance);

      if (+amount > +balance.avail) {
        console.log('NOT-ENOUGH-BALANCE');
        resperr(res, 'NOT-ENOUGH-BALANCE');
        return;
        break;
      }
      /************/
      let feeamount;
      if (false) {
        let respfee = await db['feesettings'].findOne({
          raw: true,
          where: { key_: 'FEE_CURRENCY_WITHDRAW_IN_BP' },
        });
        if (respfee) {
          let { value_ } = respfee;
          let feerate = +value_;
          if (feerate > 0) {
            feeamount = (amount * feerate) / 10000;
            if (amount + feeamount > +balance.avail) {
            } else {
              resperr(res, 'NOT-ENOUGH-BALANCE');
              return;
              break;
            }
          } else {
          }
        } else {
        }
      }
      /************/
      console.log('WITHDRAW ON GOING');
     
      let { value: ADMINADDR } = await db['settings'].findOne({
        where: { name: 'ADMINADDR' },
      });
      let { value: ADMINPK } = await db['settings'].findOne({
        where: { name: 'ADMINPK' },
      });

      let messageBody = `[WITHDRAW ON GOING]
        user id: ${id}
        amount: ${amount / 10 ** 6}
        token: ${tokentype}
        from: ${ADMINADDR}
        to: ${rxaddr}
      `
      sendTelegramBotMessage(messageBody) 

      let resp = await withdraw({
        tokentype: tokentype,
        userid: id,
        amount,
        rxaddr,
        adminaddr: ADMINADDR,
        adminpk: ADMINPK,
        feeamount,
      });
      respok(res, null, null, { payload: { resp } });

      break;
    case 'DEPOSIT':
      if (
        tokentype == 'USDC' ||
        tokentype == 'USDT' ||
        tokentype == 'USDT_BINOPT'
      ) {
        if (!txhash) {
          resperr(res, 'TXHASH-ISSUE');
          return;
        }
        await db['transactions'].create({
          uid: id,
          amount: amount,
          unit: tokentype,
          status: 0,
          typestr: 'DEPOSIT',
          type: 1,
          txhash: txhash,
          senderaddr,
        });
        respok(res, 'SUBMITED');
        let messageBody = `[DEPOSIT ON GOING]
          user id: ${id}
          amount: ${amount / 10 ** 6}
          token: ${tokentype}
          sender address: ${senderaddr}
          txhash: ${txhash}
        `
        sendTelegramBotMessage(messageBody)

        closeTx({
          txhash,
          type: 'DEPOSIT',
          tokentype: tokentype,
          userid: id,
          senderaddr,
          amount,
        });
      } else {
        // 총판
        let referer = await db['referrals'].findOne({
          where: {
            referral_uid: id,
            isRefererBranch: 1,
          },
          raw: true,
        });
        if (!referer) {
          resperr(res, 'REFERER-NOT-FOUND');
          return;
        }
        await db['transactions']
          .create({
            uid: id,
            type: 2,
            typestr: 'DEPOSIT',
            status: 0,
            target_uid: referer.referer_uid,
            localeAmount: amount,
            localeUnit: tokentype,
            name: name,
            cardNum: card,
            bankCode: bankCode,
            bankName: bankName,
            unit: 'USD',
          })
          .then((_) => {
            respok(res, 'SUBMITED');
          });
      }

      break;
    // case 'OTHER_EXCHANGES':
    //   if (!txhash) {
    //     resperr(res, 'TXHASH-ISSUE');
    //     return;
    //   }
    //   await db['transactions'].create({
    //     uid: id,
    //     amount: amount,
    //     unit: tokentype,
    //     status: 0,
    //     typestr: 'DEPOSIT_FROM_OTHER_EXCHANGES',
    //     type: 1,
    //     txhash: txhash,
    //     senderaddr,
    //     rxaddr,
    //   });
    //   respok(res, 'SUBMITED');

    //   closeTx({
    //     txhash,
    //     type: 'DEPOSIT',
    //     tokentype: tokentype,
    //     userid: id,
    //     senderaddr,
    //     amount,
    //   });
    //   break;
    case 'VERIFY':
      if (!isadmin && !isbranch) {
        resperr(res, 'NOT-AN-ADMIN');
        return;
      }

      respok(res, 'ADMIN-VERIFIED');
      return;
      break;
    default:
      break;
  }
});

router.get('/user/wallet/address/:uid', auth, async (req, res) => {
  let { uid } = req.params;
  await db['userwalletaddress']
    .findOne({
      where: { id: uid },
      raw: true,
    })
    .then((resp) => {
      respok(res, null, null, { resp });
    });
});

router.post('/deposit/:type/:amount', auth, async (req, res) => {
  let { type, amount } = req.params;
  let {
    rxaddr,
    txhash,
    tokentype,
    senderaddr,
    name,
    card,
    bankCode,
    bankName,
  } = req.body;
  let { id, isadmin, isbranch } = req.decoded;
});

router.get('/branch/list/:off/:lim', auth, async (req, res) => {
  let { off, lim } = req.params;
  let { startDate, endDate } = req.query;
  let { id } = req.decoded;
  let jfilter = {};
  if (startDate) {
    jfilter = {
      ...jfilter,
      createdat: { [Op.gte]: moment(startDate).format('YYYY-MM-DD HH:mm:ss') },
    };
  }
  if (endDate) {
    jfilter = {
      ...jfilter,
      createdat: { [Op.lte]: moment(endDate).format('YYYY-MM-DD HH:mm:ss') },
    };
  }
  if (startDate && endDate) {
    jfilter = {
      ...jfilter,
      createdat: {
        [Op.gte]: moment(startDate).format('YYYY-MM-DD HH:mm:ss'),
        [Op.lte]: moment(endDate).format('YYYY-MM-DD HH:mm:ss'),
      },
    };
  }
  console.log(id);
  console.log('jfilter', jfilter);
  // offset = +offset;
  // limit = +limit;
  // db['transactions']
  //   .findAll({
  //     where: {
  //       target_uid: id,
  //       typestr: 'DEPOSIT',
  //     },
  //     include: [
  //       {
  //         //required: false,
  //         model: db['users'],
  //         attributes: ['id', 'email', 'phone', 'level'],
  //         include: [
  //           {
  //             //     //required: false,
  //             model: db['transactions'],
  //             attributes: [
  //               'uid',
  //               [
  //                 db.Sequelize.fn(
  //                   'sum',
  //                   db.Sequelize.col('transactions.localeAmount')
  //                 ),
  //                 'cumulAmount',
  //               ],
  //             ],
  //           },
  //         ],
  //       },
  //     ],
  //     offset: +off,
  //     limit: +lim,
  //     order: [['id', 'DESC']],
  //     // group: ['id'],
  //   })
  db['transactions']
    .findAndCountAll({
      where: {
        ...jfilter,
        type: 2,
        typestr: 'DEPOSIT',
      },
      offset: +off,
      limit: +lim,
      order: [['id', 'DESC']],
      raw: true,
    })
    .then(async (respdata) => {
      let promises = respdata.rows.map(async (el) => {
        let { uid, id, amount, localeAmount } = el;
        // localeAmount = localeAmount / 10 ** 6;
        // el['localeAmount'] = localeAmount;
        el['user'] = await db['users'].findOne({
          where: { id: uid },
          raw: true,
        });
        await db['transactions']
          .findAll({
            where: { uid, typestr: 'DEPOSIT', status: 1, id: { [Op.lte]: id } },
            raw: true,
            order: [['id', 'ASC']],
            attributes: [
              [db.Sequelize.fn('SUM', db.Sequelize.col('amount')), 'sum'],
            ],
          })
          .then((resp) => {
            let [{ sum }] = resp;
            console.log(resp);
            el['cumulAmount'] = sum / 10 ** 6;
          });
        return el;
      });
      await Promise.all(promises);
      respok(res, null, null, { respdata });
    });
});

/*



*/
router.patch('/branch/transfer', auth, async (req, res) => {
  let { id, isadmin } = req.decoded;
  let { txhash, tokentype, txId, amount } = req.body;
  /*
    txId: transaction의 id값. txhash를 받으면 저장한다. 검증 완료되면 status 를 1로 변경한다.
    */
  console.log('==================', amount, '====================');
  amount = amount / 10 ** 6;
  if (!txId || !amount || !tokentype) {
    resperr(res, 'INVALID-DATA');
    return;
  }
  if (isadmin == 1) {
    if (txhash) {
      await db['transactions'].update(
        { txhash, verifier: id },
        { where: { id: txId } }
      );
      let tx = await db['transactions'].findOne({ where: { txhash } });
      tx.update({
        status: 1,
        amount: amount,
      });
      await db['balances'].increment(['avail', 'total'], {
        by: amount,
        where: { uid: tx.uid, typestr: 'LIVE' },
      });

      respok(res, 'SUBMITTED');
      //closeTx({ txhash, type: 'TRANSFER', tokentype: tokentype, txId, amount: amount*(10**6) });
    } else {
    }
  } else {
    resperr(res, 'NOT-PRIVILEGED');
  }
});
module.exports = router;

// insert into networktoken (name, decimal, contractaddress,networkidnumber, nettype) values ();

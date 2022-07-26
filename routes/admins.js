var express = require('express');
let { respok, resperr } = require('../utils/rest');
const jwt = require('jsonwebtoken');
const { softauth, auth, adminauth } = require('../utils/authMiddleware');
const db = require('../models');
var crypto = require('crypto');
const LOGGER = console.log;
let { Op } = db.Sequelize;
const moment = require('moment');

var router = express.Router();

router.post('/add/branch', (req, res) => {
  let { id } = req.body;
  db['users'].update({ isbranch: 1 }, { where: { id } }).then((resp) => {
    respok(res, 'successfully added');
  });
});

router.get('/sum/rows/:tablename/:fieldname', adminauth, async (req, res) => {
  let startDate = moment().startOf('days').format('YYYY-MM-DD HH:mm:ss');
  let endDate = moment()
    .startOf('days')
    .add(1, 'days')
    .format('YYYY-MM-DD HH:mm:ss');

  let { tablename, fieldname } = req.params;
  let { itemdetail, userdetail, filterkey, filterval, nettype, date0, date1 } =
    req.query;
  let { searchkey } = req.query;
  let jfilter = {};
  // jfilter[fieldname] = fieldval;

  console.log('req.query', req.query);

  if (date0) {
    startDate = moment(date0).format('YYYY-MM-DD HH:mm:ss');
  }
  if (date1) {
    endDate = moment(date1).format('YYYY-MM-DD HH:mm:ss');
  }

  db[tablename]
    .findAndCountAll({
      where: {
        ...jfilter,
        createdat: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
      },
      attributes: [
        [db.Sequelize.fn('SUM', db.Sequelize.col(fieldname)), 'sum'],
      ],
      raw: true,
    })
    .then((resp) => {
      // console.log(resp); //[ { sum: '176555000000' } ]
      respok(res, null, null, { data: resp });
    });
});

router.get(
  '/list/users/:offset/:limit/:orderkey/:orderval',
  async (req, res) => {
    let { offset, limit, orderkey, orderval } = req.params;
    let { date0, date1, filterkey, filterval, searchkey } = req.query;
    offset = +offset;
    limit = +limit;
    let jfilter = {};
    if (filterkey && filterval) {
      jfilter[filterkey] = filterval;
    }

    if (date0) {
      jfilter = {
        ...jfilter,
        createdat: {
          [Op.gte]: moment(date0).format('YYYY-MM-DD HH:mm:ss'),
        },
      };
    }
    if (date1) {
      jfilter = {
        ...jfilter,
        createdat: {
          [Op.lte]: moment(date1).format('YYYY-MM-DD HH:mm:ss'),
        },
      };
    }
    if (date0 && date1) {
      jfilter = {
        ...jfilter,
        createdat: {
          [Op.gte]: moment(date0).format('YYYY-MM-DD HH:mm:ss'),
          [Op.lte]: moment(date1).format('YYYY-MM-DD HH:mm:ss'),
        },
      };
    }
    if (searchkey) {
      jfilter = {
        ...jfilter,
        email: {
          [Op.like]: `%${searchkey}%`,
        },
      };
    }
    console.log('jfilter', jfilter);
    db['users']
      .findAndCountAll({
        where: {
          ...jfilter,
        },
        order: [[orderkey, orderval]],
        offset,
        limit,
        raw: true,
      })
      .then(async (resp) => {
        let promises = resp.rows.map(async (el) => {
          let { id } = el;
          await db['referrals']
            .findOne({ where: { referral_uid: id }, raw: true })
            .then(async (resp) => {
              if (resp) {
                let referer_user = await db['users'].findOne({
                  where: { id: resp.referer_uid },
                  raw: true,
                });
                el['referer_user'] = referer_user;
              }
            });
          let [{ sum_deposit }] = await db['transactions'].findAll({
            where: { uid: id, typestr: 'DEPOSIT' },
            raw: true,
            attributes: [
              [
                db.Sequelize.fn('SUM', db.Sequelize.col('amount')),
                'sum_deposit',
              ],
            ],
          });
          el['sum_deposit'] = sum_deposit;
          let [{ sum_withdraw }] = await db['transactions'].findAll({
            where: { uid: id, typestr: 'WITHDRAW' },
            raw: true,
            attributes: [
              [
                db.Sequelize.fn('SUM', db.Sequelize.col('amount')),
                'sum_withdraw',
              ],
            ],
          });
          el['sum_withdraw'] = sum_withdraw;
          el['usd_amount'] = await db['balances']
            .findOne({ where: { uid: id, typestr: 'LIVE' }, raw: true })
            .then((resp) => {
              return resp.total / 10 ** 6;
            });
          await db['userwallets']
            .findOne({
              where: { uid: id },
              raw: true,
            })
            .then((resp) => {
              if (resp) {
                el['user_wallet_address'] = resp.walletaddress;
              }
            });

          return el;
        });
        await Promise.all(promises);
        respok(res, null, null, { data: resp });
      });
  }
);

router.get(
  '/betrounds/list/:asset/:offset/:limit/:orderkey/:orderval',
  async (req, res) => {
    let { asset, offset, limit, orderkey, orderval } = req.params;
    let { assetId, date0, date1 } = req.query;
    // asset = crypto / forex / stock
    let assetList;
    let list = [];
    offset = +offset;
    limit = +limit;
    let jfilter = {};

    if (date0) {
      jfilter = {
        ...jfilter,
        createdat: {
          [Op.gte]: moment(date0).format('YYYY-MM-DD HH:mm:ss'),
        },
      };
    }
    if (date1) {
      jfilter = {
        ...jfilter,
        createdat: {
          [Op.lte]: moment(date1).format('YYYY-MM-DD HH:mm:ss'),
        },
      };
    }
    if (date0 && date1) {
      jfilter = {
        ...jfilter,
        createdat: {
          [Op.gte]: moment(date0).format('YYYY-MM-DD HH:mm:ss'),
          [Op.lte]: moment(date1).format('YYYY-MM-DD HH:mm:ss'),
        },
      };
    }
    if (assetId) {
      jfilter['assetId'] = assetId;
    } else {
      assetList = await db['assets'].findAll({
        where: { groupstr: asset },
        raw: true,
      });
      assetList.map((v) => {
        list.push(v.id);
      });
      jfilter = { ...jfilter, assetId: { [Op.in]: list } };
    }
    console.log('jfilter', jfilter);
    await db['logrounds']
      .findAndCountAll({
        where: {
          // assetId: {
          //   [Op.in]: list,
          // },
          ...jfilter,
        },
        raw: true,
        offset,
        limit,
        order: [[orderkey, orderval]],
      })
      .then(async (resp) => {
        // console.log(resp);
        respok(res, null, null, { data: resp });
      });
  }
);

router.get('/asset/list/:offset/:limit', async (req, res) => {
  let { offset, limit } = req.params;
  offset = +offset;
  limit = +limit;
  await db['users']
    .findAndCountAll({
      offset,
      limit,
      raw: true,
    })
    .then((resp) => {
      console.log(resp);
      let promises = resp.map(async (el) => {
        let { id } = el;
        let [{ sum_balance }] = await db['balances'].findAll({
          where: { uid: id, typestr: 'LIVE' },
          raw: true,
          attributes: [
            [db.Sequelize.fn('SUM', db.Sequelize.col('amount')), 'sum_balance'],
          ],
        });
        el['sum_balance'] = sum_balance;
        let [{ sum_deposit }] = await db['transactions'].findAll({
          where: { uid: id, typestr: 'DEPOSIT' },
          raw: true,
          attributes: [
            [db.Sequelize.fn('SUM', db.Sequelize.col('amount')), 'sum_deposit'],
          ],
        });
        el['sum_deposit'] = sum_deposit;
        let user_wallet_address = await db['userwallets'].findOne({
          where: { uid: id },
          raw: true,
        });
        el['user_wallet_address'] = user_wallet_address;
      });
    });
});

router.get('/count/visit', adminauth, (req, res) => {
  let { date0, date1 } = req.query;
  let jfilter = {};

  db['loginhistories']
    .count({
      where: {
        createdat: {
          [Op.gte]: moment(date0).format('YYYY-MM-DD HH:mm:ss'),
          [Op.lte]: moment(date1).format('YYYY-MM-DD HH:mm:ss'),
        },
      },
      raw: true,
      // attributes: [
      //   [db.Sequelize.fn('COUNT', db.Sequelize.col('uid')), 'visit_count'],
      // ],
      distinct: true,
      col: 'uid',
    })
    .then((resp) => {
      respok(res, null, null, { count: resp });
    });
});

router.get('/branch/:offset/:limit/:orderkey/:orderval', async (req, res) => {
  let { offset, limit, orderkey, orderval } = req.params;
  let { date0, date1, filterkey, filterval, searchkey } = req.query;
  offset = +offset;
  limit = +limit;
  let jfilter = {};
  if (filterkey && filterval) {
    jfilter[filterkey] = filterval;
  }
  if (date0) {
    jfilter = {
      ...jfilter,
      createdat: {
        [Op.gte]: moment(date0).format('YYYY-MM-DD HH:mm:ss'),
      },
    };
  }
  if (date1) {
    jfilter = {
      ...jfilter,
      createdat: {
        [Op.lte]: moment(date1).format('YYYY-MM-DD HH:mm:ss'),
      },
    };
  }
  if (date0 && date1) {
    jfilter = {
      ...jfilter,
      createdat: {
        [Op.gte]: moment(date0).format('YYYY-MM-DD HH:mm:ss'),
        [Op.lte]: moment(date1).format('YYYY-MM-DD HH:mm:ss'),
      },
    };
  }
  if (searchkey) {
    jfilter = {
      ...jfilter,
      email: {
        [Op.like]: `%${searchkey}%`,
      },
    };
  }
  console.log('jfilter', jfilter);

  db['users']
    .findAndCountAll({
      where: {
        ...jfilter,
      },
      order: [[orderkey, orderval]],
      raw: true,
    })
    .then((resp) => {});
});

// let { offset, limit, orderkey, orderval } = req.params;
//   let { date0, date1, filterkey, filterval, searchkey } = req.query;
//   offset = +offset;
//   limit = +limit;
//   let jfilter = {};
//   if (filterkey && filterval) {
//     jfilter[filterkey] = filterval;
//   }
//   if (date0) {
//     jfilter = {
//       ...jfilter,
//       createdat: {
//         [Op.gte]: moment(date0).format('YYYY-MM-DD HH:mm:ss'),
//       },
//     };
//   }
//   if (date1) {
//     jfilter = {
//       ...jfilter,
//       createdat: {
//         [Op.lte]: moment(date1).format('YYYY-MM-DD HH:mm:ss'),
//       },
//     };
//   }
//   if (date0 && date1) {
//     jfilter = {
//       ...jfilter,
//       createdat: {
//         [Op.gte]: moment(date0).format('YYYY-MM-DD HH:mm:ss'),
//         [Op.lte]: moment(date1).format('YYYY-MM-DD HH:mm:ss'),
//       },
//     };
//   }
//   if (searchkey) {
//     jfilter = {
//       ...jfilter,
//       email: {
//         [Op.like]: `%${searchkey}%`,
//       },
//     };
//   }
//   console.log('jfilter', jfilter);

module.exports = router;

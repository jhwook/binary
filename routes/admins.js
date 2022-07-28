var express = require('express');
let { respok, resperr } = require('../utils/rest');
const jwt = require('jsonwebtoken');
const { softauth, auth, adminauth } = require('../utils/authMiddleware');
const db = require('../models');
var crypto = require('crypto');
const LOGGER = console.log;
let { Op } = db.Sequelize;
const moment = require('moment');
const cliredisa = require('async-redis').createClient();

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

router.get('/count/visit', (req, res) => {
  let jfilter = {};
  let start_date = moment().startOf('days');
  let end_date = moment().endOf('days');

  db['loginhistories']
    .count({
      where: {
        createdat: {
          [Op.gte]: start_date.format('YYYY-MM-DD HH:mm:ss'),
          [Op.lte]: end_date.format('YYYY-MM-DD HH:mm:ss'),
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

router.get('/user/levels', async (req, res) => {
  let start_month = moment().subtract('months').startOf('month');
  let end_month = moment().subtract('months').endOf('month');
  // 로그인 횟수, 베팅 수, 베팅 금액, 수익, 손실, 원금
  let result = {};
  for (let i = 0; i < 4; i++) {
    let login_count_month = 0;
    let bet_count_month = 0;
    let bet_total_amount_month = 0;
    let total_profit_amount_month = 0;
    let total_loss_amount_month = 0;
    let total_balance = 0;
    await db['users']
      .findAll({
        where: { active: 1, level: i },
        raw: true,
      })
      .then(async (resp) => {
        let promises = resp.map(async (el) => {
          let { id } = el;
          await db['loginhistories']
            .count({
              where: {
                createdat: {
                  [Op.gte]: start_month,
                  [Op.lte]: end_month,
                },
                uid: id,
              },
              raw: true,
              // distinct: true,
              // col: 'uid',
            })
            .then((resp) => {
              login_count_month += resp;
            });
          await db['betlogs']
            .count({
              where: {
                createdat: {
                  [Op.gte]: start_month,
                  [Op.lte]: end_month,
                },
                uid: id,
              },
              raw: true,
            })
            .then((resp) => {
              bet_count_month += resp;
            });
          await db['betlogs']
            .findAll({
              where: {
                createdat: {
                  [Op.gte]: start_month,
                  [Op.lte]: end_month,
                },
                uid: id,
              },
              raw: true,
              attributes: [
                [db.Sequelize.fn('SUM', db.Sequelize.col('amount')), 'sum'],
              ],
            })
            .then((resp) => {
              let [{ sum }] = resp;
              if (sum) {
                sum = sum / 10 ** 6;
                bet_total_amount_month += sum;
              } else {
              }
            });

          await db['betlogs']
            .findAll({
              where: {
                createdat: {
                  [Op.gte]: start_month,
                  [Op.lte]: end_month,
                },
                status: 0,
                uid: id,
              },
            })
            .then((resp) => {
              resp.map((bet) => {
                let { amount } = bet;
                amount = amount / 10 ** 6;
                total_profit_amount_month += amount;
              });
            });

          await db['balances']
            .findOne({
              where: {
                typestr: 'LIVE',
                uid: id,
              },
              raw: true,
            })
            .then((resp) => {
              let { total } = resp;
              total = total / 10 ** 6;
              total_balance += total;
            });
        });
        await Promise.all(promises);
        result[i] = {
          login_count_month,
          bet_count_month,
          bet_total_amount_month,
          total_profit_amount_month,
          total_loss_amount_month: total_profit_amount_month,
          total_balance,
        };
      });
  }
  respok(res, null, null, {
    result,
  });
  // DIAMOND
  // GOLD
  // SILVER
  // BRONZE
});

router.get('/assets', (req, res) => {
  let { group, searchkey } = req.query;
  let jfilter = {};
  if (group) {
    jfilter['groupstr'] = group;
  }
  if (searchkey) {
    jfilter = { name: { [Op.like]: `%${searchkey}%` } };
  }
  db['assets']
    .findAll({
      where: { ...jfilter },
      raw: true,
    })
    .then(async (resp) => {
      let promises = resp.map(async (el) => {
        let { APISymbol } = el;
        let currentPrice = await cliredisa.hget(
          'STREAM_ASSET_PRICE',
          APISymbol
        );
        console.log(APISymbol, currentPrice);
        el['currentPrice'] = currentPrice;
      });
      await Promise.all(promises);
      respok(res, null, null, { resp });
    });
});

router.get(
  '/referrals/:isadmin/:offset/:limit/:orderkey/:orderval',
  async (req, res) => {
    let { isadmin, offset, limit, orderkey, orderval } = req.params;
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
    let jfilter2 = {};
    if (isadmin === 1) {
      jfilter2 = {
        ...jfilter2,
        isadmin: 1,
      };
    }
    if (isadmin === 0) {
      jfilter2 = {
        ...jfilter2,
        isbranch: 1,
      };
    }
    let refererList = [];
    await db['users']
      .findAll({
        where: { ...jfilter2 },
        raw: true,
      })
      .then((resp) => {
        resp.map((el) => {
          refererList.push(el.id);
        });
      });
    console.log('refererList', refererList);
    db['referrals']
      .findAll({
        where: {
          referer_uid: {
            [Op.in]: refererList,
          },
        },
        raw: true,
      })
      .then(async (resp) => {
        let promises = resp.map(async (el) => {
          let { referral_uid, referer_uid } = el;
          el['referral_user'] = await db['users'].findOne({
            where: { id: referral_uid },
            raw: true,
          });
          await db['betlogs']
            .findAll({
              where: { uid: referral_uid, type: 'LIVE' },
              raw: true,
              attributes: [
                [db.Sequelize.fn('SUM', db.Sequelize.col('amount')), 'sum'],
              ],
            })
            .then((resp) => {
              let [{ sum }] = resp;
              sum = sum / 10 ** 6;
              el['trade_amount'] = sum;
            });
          await db['betlogs']
            .findAll({
              where: { uid: referral_uid, type: 'LIVE', status: 1 },
              raw: true,
              attributes: [
                [db.Sequelize.fn('SUM', db.Sequelize.col('amount')), 'sum'],
              ],
            })
            .then((resp) => {
              let [{ sum }] = resp;
              sum = sum / 10 ** 6;
              el['profit_amount'] = sum;
            });
          await db['logfees']
            .findAll({
              where: {
                payer_uid: referral_uid,
                recipient_uid: referer_uid,
              },
              raw: true,
              attributes: [
                [db.Sequelize.fn('SUM', db.Sequelize.col('feeamount')), 'sum'],
              ],
            })
            .then((resp) => {
              let [{ sum }] = resp;
              if (!sum) {
                sum = 0;
              }
              el['total_feeamount'] = sum.toFixed(2);
            });
          await db['userwallets']
            .findOne({
              where: { uid: referral_uid },
              raw: true,
            })
            .then((resp) => {
              el['wallet_address'] = resp.walletaddress;
            });
        });
        await Promise.all(promises);
        respok(res, null, null, { resp });
      });
  }
);

router.get(
  '/transactions/:isadmin/:offset/:limit/:orderkey/:orderval',
  async (req, res) => {
    let { isadmin, offset, limit, orderkey, orderval } = req.params;
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
    let jfilter2 = {};
    if (isadmin === 1) {
      jfilter2 = {
        ...jfilter2,
        isadmin: 1,
      };
    }
    if (isadmin === 0) {
      jfilter2 = {
        ...jfilter2,
        isbranch: 1,
      };
    }

    let refererList = [];
    await db['users']
      .findAll({
        where: { ...jfilter2 },
        raw: true,
      })
      .then((resp) => {
        resp.map((el) => {
          refererList.push(el.id);
        });
      });
    console.log('refererList', refererList);
    db['transactions']
      .findAndCountAll({
        where: {
          ...jfilter,
          uid: {
            [Op.in]: refererList,
          },
        },
        offset,
        limit,
        raw: true,
      })
      .then(async (resp) => {
        // console.log(resp);
        let promises = resp.rows.map(async (el) => {
          let { uid } = el;
          el['user_info'] = await db['users'].findOne({
            where: {
              id: uid,
            },
            raw: true,
          });
        });
        await Promise.all(promises);
        respok(res, null, null, { resp });
      });
  }
);
// router.get('/referrals/:iswho/:offset/:limit/:orderkey/:orderval', async (req, res) => {

// })

//  [
//    {
//      id: 10,
//      createdat: 2022-06-28T07:17:35.000Z,
//      updatedat: null,
//      referer_uid: 82,
//      referral_uid: 84,
//      level: null,
//      active: null
//    },
//    {
//      id: 11,
//      createdat: 2022-07-15T06:24:16.000Z,
//      updatedat: null,
//      referer_uid: 82,
//      referral_uid: 113,
//      level: null,
//      active: null
//    }
//  ]

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

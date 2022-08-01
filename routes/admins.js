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
const fs = require('fs');
const { upload } = require('../utils/multer');
const { web3 } = require('../configs/configweb3');
const WEB_URL = 'https://options1.net/resource';
const { I_LEVEL } = require('../configs/userlevel');

var router = express.Router();
async function createJWT(jfilter) {
  let userwallet;
  let userinfo = await db['users'].findOne({
    where: {
      ...jfilter,
    },
    attributes: [
      'id',
      'firstname',
      'lastname',
      'email',
      'phone',
      'level',
      'referercode',
      'isadmin',
      'isbranch',
      'profileimage',
      'countryNum',
    ],
    raw: true,
  });

  await db['userwallets']
    .findOne({
      attributes: ['walletaddress'],
      where: {
        uid: userinfo.id,
      },
      raw: true,
    })
    .then(async (result) => {
      if (!result) {
        let walletgen = await web3.eth.accounts.create(
          userinfo.id + 'BINARY@##12'
        );
        await db['userwallets'].create({
          uid: userinfo.id,
          walletaddress: walletgen.address,
          privatekey: walletgen.privateKey,
        });
        userwallet = walletgen.address;
      } else {
        userwallet = result.walletaddress;
      }
    });

  if (!userinfo) {
    return false;
  }
  let token = jwt.sign(
    {
      type: 'JWT',
      ...userinfo,
      wallet: userwallet,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '3h',
      // expiresIn: '24h',
      issuer: 'EXPRESS',
    }
  );
  return {
    tokenId: token,
    ...userinfo,
  };
}

router.post('/notification', (req, res) => {
  let {} = req.body;
  let { browser, os, platform } = req.useragent;
  let { countryNum, phone, password, email, token, refcode } = req.body;
  let jwttoken;
});

router.post('/add/branch', async (req, res) => {
  let transacion = await db.Sequelize.transaction();
  let { browser, os, platform } = req.useragent;
  let { countryNum, phone, password, email, token, refcode } = req.body;
  let jwttoken;

  if (!email || !password) {
    resperr(res, 'INVALID-DATA');
    return;
  }
  try {
    await db.sequelize.transaction(async (t) => {
      let respond = await db['users'].findOne({
        where: { email: email },
        transaction: t,
      });
      if (respond) {
        resperr(res, 'EMAIL-EXIST');
        return;
      }
      let new_acc = await db['users'].create(
        {
          email: email,
          password,
        },
        {
          transaction: t,
        }
      );
      let refcodegen = await generateRefCode('' + new_acc.id);
      await db['users'].update(
        {
          referercode: String(refcodegen),
        },
        {
          where: { id: new_acc.id },
          transaction: t,
        }
      );
      await db['balances'].bulkCreate(
        [
          {
            uid: new_acc.id,
            typestr: 'DEMO',
          },
          {
            uid: new_acc.id,
            typestr: 'LIVE',
          },
        ],
        {
          transaction: t,
        }
      );
    });
  } catch (err) {
    respok(res, 'FAILED');
  }
  //TOKEN GENERATE
  jwttoken = createJWT({ email: email, password });
  let jtoken = await jwttoken;
  if (jtoken) {
    if (refcode) {
      let referer = await db['users'].findOne({
        where: { referercode: refcode },
        raw: true,
      });
      if (referer) {
        if (referer.isadmin == 1) {
          await db['referrals']
            .create({
              referer_uid: referer.id,
              referral_uid: jtoken.id,
            })
            .then(async (_) => {
              await db['users'].update(
                {
                  isbranch: 1,
                },
                {
                  where: {
                    id: jtoken.id,
                  },
                }
              );
            });
        } else {
          await db['referrals'].create({
            referer_uid: referer.id,
            referral_uid: jtoken.id,
          });
        }
      } else {
        resperr(res, 'INVALID-CODE');
        return;
      }
    }
    await db['userwallets']
      .findOne({
        where: {
          uid: jtoken.id,
        },
      })
      .then(async (res) => {
        if (!res) {
          let walletgen = await web3.eth.accounts.create(
            jtoken.id + 'BINARY@##12'
          );
          await db['userwallets'].create({
            uid: jtoken.id,
            walletaddress: walletgen.address,
            privatekey: walletgen.privateKey,
          });
        }
      });
    let ipaddr = requestIp.getClientIp(req).replace('::ffff:', '');
    let ipinfo = lookup(ipaddr);
    await db['loginhistories'].create({
      uid: jtoken.id,
      ipaddress: ipaddr,
      deviceos: platform + ' / ' + os,
      browser: browser,
      country: ipinfo.country,
      status: ipinfo.city,
    });
    _jtoken = await createJWT({ id: jtoken.id });
    respok(res, 'TOKEN_CREATED', null, { result: _jtoken });
    return;
  } else {
    resperr(res, 'USER-NOT-FOUND');
    return;
  }
});

router.patch('/toggle/:tablename/:val', (req, res) => {
  let { tablename, val } = req.params;
  let { id } = req.query;
  let jfilter = { id: id };
  let updateFilter = { active: val };
  db[tablename]
    .update(updateFilter, {
      where: {
        ...jfilter,
      },
    })
    .then((resp) => {
      respok(res, 'OK');
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
router.get('/userinfo/:id', async (req, res) => {
  let { id } = req.params;
  await db['users']
    .findOne({
      where: { id },
      raw: true,
    })
    .then(async (user) => {
      // 수익률
      user['profit_rate'] = await db['betlogs']
        .findAll({
          where: { uid: id, type: 'LIVE' },
          raw: true,
        })
        .then((resp) => {
          if (resp) {
            let profit_amount = 0; // win, lose
            let total_bet_amount = 0;
            let profit_rate;
            resp.map((el) => {
              let { status, amount } = el;
              amount = amount / 10 ** 6;
              total_bet_amount += amount;
              if (status === 1) {
                // lose
                profit_amount += amount;
              }
            });
            if (total_bet_amount === 0) {
              profit_rate = 0;
              return profit_rate;
            } else {
              profit_rate = ((profit_amount / total_bet_amount) * 100).toFixed(
                2
              );
              return profit_rate;
            }
          } else {
          }
        });
      await db['referrals']
        .findOne({ where: { referral_uid: id }, raw: true })
        .then(async (resp) => {
          if (resp) {
            let referer_user = await db['users'].findOne({
              where: { id: resp.referer_uid },
              raw: true,
            });
            user['referer_user'] = referer_user;
          } else {
          }
        });
      let [{ sum_deposit }] = await db['transactions'].findAll({
        where: { uid: id, typestr: 'DEPOSIT' },
        raw: true,
        attributes: [
          [db.Sequelize.fn('SUM', db.Sequelize.col('amount')), 'sum_deposit'],
        ],
      });
      user['sum_deposit'] = sum_deposit / 10 ** 6;
      let [{ sum_withdraw }] = await db['transactions'].findAll({
        where: { uid: id, typestr: 'WITHDRAW' },
        raw: true,
        attributes: [
          [db.Sequelize.fn('SUM', db.Sequelize.col('amount')), 'sum_withdraw'],
        ],
      });
      user['sum_withdraw'] = sum_withdraw / 10 ** 6;
      user['usd_amount'] = await db['balances']
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
            user['user_wallet_address'] = resp.walletaddress;
          }
        });
      await db['transactions']
        .count({
          where: {
            uid: id,
          },

          raw: true,
        })
        .then((resp) => {
          user['transactions_count'] = resp;
        });

      respok(res, null, null, { resp: user });
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
          el['sum_deposit'] = sum_deposit / 10 ** 6;
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
          el['sum_withdraw'] = sum_withdraw / 10 ** 6;
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
          await db['transactions']
            .count({
              where: {
                uid: id,
              },

              raw: true,
            })
            .then((resp) => {
              el['transactions_count'] = resp;
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
          ...jfilter,
        },
        raw: true,
        offset,
        limit,
        order: [[orderkey, orderval]],
      })
      .then(async (resp) => {
        // console.log(resp);
        let promises = resp.rows.map(async (el) => {
          let {
            startingPrice,
            endPrice,
            totalLowAmount,
            totalHighAmount,
            expiry,
          } = el;
          startingPrice = Number(startingPrice);
          endPrice = Number(endPrice);
          if (startingPrice === endPrice) {
            el['outcome'] = 'DRAW';
            el['profit'] = 0;
          } else if (startingPrice > endPrice) {
            el['outcome'] = 'LOW';
            await db['logfees']
              .findAll({
                where: { typestr: 'FEE_TO_ADMIN', bet_expiry: expiry },
                raw: true,
                attributes: [
                  [
                    db.Sequelize.fn('SUM', db.Sequelize.col('feeamount')),
                    'sum',
                  ],
                ],
              })
              .then((resp) => {
                let [{ sum }] = resp;
                el['profit'] = sum / 10 ** 6;
              });
          } else {
            el['outcome'] = 'HIGH';
            await db['logfees']
              .findAll({
                where: { typestr: 'FEE_TO_ADMIN', bet_expiry: expiry },
                raw: true,
                attributes: [
                  [
                    db.Sequelize.fn('SUM', db.Sequelize.col('feeamount')),
                    'sum',
                  ],
                ],
              })
              .then((resp) => {
                let [{ sum }] = resp;
                el['profit'] = sum / 10 ** 6;
              });
          }
          el['asset'] = await db['assets'].findOne({
            where: { id: el.assetId },
            raw: true,
          });

          return el;
        });
        await Promise.all(promises);
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
      .findAndCountAll({
        where: { active: 1, level: i },
        raw: true,
      })
      .then(async (resp) => {
        let promises = resp.rows.map(async (el) => {
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
        result[I_LEVEL[i]] = {
          total_user_count: resp.count,
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
  '/referrals/:isbranch/:type/:offset/:limit/:orderkey/:orderval',
  async (req, res) => {
    let { isbranch, type, offset, limit, orderkey, orderval } = req.params;
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
    // let jfilter2 = {};
    // if (isadmin === 1) {
    //   jfilter2 = {
    //     ...jfilter2,
    //     isadmin: 1,
    //   };
    // }
    // if (isadmin === 0) {
    //   jfilter2 = {
    //     ...jfilter2,
    //     isbranch: 1,
    //   };
    // }
    // let refererList = [];
    // await db['users']
    //   .findAll({
    //     where: { ...jfilter2 },
    //     raw: true,
    //   })
    //   .then((resp) => {
    //     resp.map((el) => {
    //       refererList.push(el.id);
    //     });
    //   });
    // console.log('refererList', refererList);
    db['users']
      .findAndCountAll({
        where: {
          isbranch,
          isadmin: 0,
        },
        offset,
        limit,
        raw: true,
        order: [[orderkey, orderval]],
      })
      .then(async (resp) => {
        if (+isbranch === 1) {
          let referer_user = await db['users'].findOne({
            where: { isadmin: 1 },
            raw: true,
          });
          let promises = resp.rows.map(async (el) => {
            let { id } = el;
            // el['referral_user'] = await db['users'].findOne({
            //   where: { id: referral_uid },
            //   raw: true,
            // });

            await db['betlogs']
              .findAll({
                where: { uid: id, type: 'LIVE' },
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
                where: { uid: id, type: 'LIVE', status: 1 },
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
                  payer_uid: id,
                  recipient_uid: referer_user.id,
                },
                raw: true,
                attributes: [
                  [
                    db.Sequelize.fn('SUM', db.Sequelize.col('feeamount')),
                    'sum',
                  ],
                ],
              })
              .then((resp) => {
                let [{ sum }] = resp;
                if (!sum) {
                  sum = 0;
                } else {
                  sum = sum / 10 ** 6;
                }
                el['total_feeamount'] = sum.toFixed(2);
              });
            await db['userwallets']
              .findOne({
                where: { uid: id },
                raw: true,
              })
              .then((resp) => {
                if (resp) {
                  el['wallet_address'] = resp.walletaddress;
                }
              });
            if (type === 0) {
              //withdraw
              await db['transactions']
                .findAll({
                  where: { uid: id, typestr: 'WITHDRAW' },
                  raw: true,
                  attributes: [
                    [db.Sequelize.fn('SUM', db.Sequelize.col('amount')), 'sum'],
                  ],
                })
                .then((resp) => {
                  let [{ sum }] = resp;
                  el['sum_withdraw'] = sum.toFixed(2);
                });
            } else if (type === 1) {
              await db['transactions']
                .findAll({
                  where: { uid: id, typestr: 'DEPOSIT' },
                  raw: true,
                  attributes: [
                    [db.Sequelize.fn('SUM', db.Sequelize.col('amount')), 'sum'],
                  ],
                })
                .then((resp) => {
                  let [{ sum }] = resp;
                  el['sum_deposit'] = sum.toFixed(2);
                });
            }
            return el;
          });
          await Promise.all(promises);
        } else if (+isbranch === 2) {
          let referer_user_list = await findAll({
            where: { isadmin: 2 },
            raw: true,
          });
          let promises = resp.rows.map(async (el) => {
            let { id } = el;
            // el['referral_user'] = await db['users'].findOne({
            //   where: { id: referral_uid },
            //   raw: true,
            // });

            await db['betlogs']
              .findAll({
                where: { uid: id, type: 'LIVE' },
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
                where: { uid: id, type: 'LIVE', status: 1 },
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
                  payer_uid: id,
                  recipient_uid: {
                    [Op.in]: referer_user_list,
                  },
                },
                raw: true,
                attributes: [
                  [
                    db.Sequelize.fn('SUM', db.Sequelize.col('feeamount')),
                    'sum',
                  ],
                ],
              })
              .then((resp) => {
                let [{ sum }] = resp;

                if (!sum) {
                  sum = 0;
                } else {
                  sum = sum / 10 ** 6;
                }
                el['total_feeamount'] = sum.toFixed(2);
              });
            await db['userwallets']
              .findOne({
                where: { uid: id },
                raw: true,
              })
              .then((resp) => {
                if (resp) {
                  el['wallet_address'] = resp.walletaddress;
                }
              });
            if (type === 0) {
              //withdraw
              await db['transactions']
                .findAll({
                  where: { uid: id, typestr: 'WITHDRAW' },
                  raw: true,
                  attributes: [
                    [db.Sequelize.fn('SUM', db.Sequelize.col('amount')), 'sum'],
                  ],
                })
                .then((resp) => {
                  let [{ sum }] = resp;
                  el['sum_withdraw'] = sum.toFixed(2);
                });
            } else if (type === 1) {
              await db['transactions']
                .findAll({
                  where: { uid: id, typestr: 'DEPOSIT' },
                  raw: true,
                  attributes: [
                    [db.Sequelize.fn('SUM', db.Sequelize.col('amount')), 'sum'],
                  ],
                })
                .then((resp) => {
                  let [{ sum }] = resp;
                  el['sum_deposit'] = sum.toFixed(2);
                });
            }
            return el;
          });
          await Promise.all(promises);
        }

        respok(res, null, null, { resp });
      });
  }
);

router.get(
  '/transactions/:isadmin/:type/:offset/:limit/:orderkey/:orderval',
  async (req, res) => {
    let { isadmin, type, offset, limit, orderkey, orderval } = req.params;
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
    jfilter = {
      ...jfilter,
      type: +type,
    };
    console.log('jfilter', jfilter);
    let jfilter2 = {};
    if (isadmin === 1) {
      jfilter2 = {
        ...jfilter2,
        typestr: 'MAIN',
      };
    }
    if (isadmin === 0) {
      jfilter2 = {
        ...jfilter2,
        typestr: 'BRANCH',
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
        order: [[orderkey, orderval]],
        raw: true,
      })
      .then(async (resp) => {
        // console.log(resp);
        let promises = resp.rows.map(async (el) => {
          let { id, uid, typestr, amount } = el;
          amount = amount / 10 ** 6;
          el['amount'] = amount;
          el['user_info'] = await db['users'].findOne({
            where: {
              id: uid,
            },
            raw: true,
          });
          await db['transactions']
            .findAll({
              where: {
                typestr,
                uid,
                id: {
                  [Op.lte]: id,
                },
              },
              raw: true,
              attributes: [
                [db.Sequelize.fn('SUM', db.Sequelize.col('amount')), 'sum'],
              ],
            })
            .then((resp) => {
              let [{ sum }] = resp;
              sum = sum / 10 ** 6;
              el['cumulative_amount'] = sum;
            });
          el['user_balance'] = await db['balances']
            .findOne({
              where: {
                uid,
                typestr: 'LIVE',
              },
              raw: true,
            })
            .then((resp) => {
              resp.total = resp.total / 10 ** 6;
              resp.avail = resp.avail / 10 ** 6;
              return resp;
            });
          el['wallet_address'] = await db['userwallets']
            .findOne({
              where: { uid },
              raw: true,
            })
            .then((resp) => {
              return resp.walletaddress;
            });
        });
        await Promise.all(promises);
        respok(res, null, null, { resp });
      });
  }
);

router.get(
  '/notifications/:offset/:limit/:orderkey/:orderval',
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
    db['notifications']
      .findAll({
        where: {
          ...jfilter,
        },
        offset,
        limit,
        order: [[orderkey, orderval]],
        raw: true,
      })
      .then((resp) => {
        respok(res, null, null, { resp });
      });
  }
);

router.post('/enroll/notification', upload.single('img'), (req, res) => {
  let { title, content, writer, enrollDate, exposure } = req.body;
  db['notifications']
    .create({
      title,
      content,
      writer_name: writer,
      enrollDate,
      exposure,
    })
    .then((resp) => {
      respok(res, 'OK');
    });
});
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

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
const axios = require('axios');
const { convaj, generaterefcode } = require('../utils/common');

var router = express.Router();
const ISFINITE = Number.isFinite;


const getUserList = async (isadmin) => {
  let isbranch
  let list = [];
  if (isadmin === 1) {
    list = [1]
  }
  if (isadmin === 2) {
    list = [0, 1, 2]
  }
  if (isadmin === 3) {
    list = [2]
  }

  let userList = [];

  await db['users'].findAll({
    where: {isbranch: {[Op.in]: list}},
    raw: true,
    attributes: ['id']
  }).then((resp) => {
    resp.map((el) => {
      userList.push(el.id)
    })
  });
 
  return userList
}
/***************/
const query_count_visits_24h = async (userList) => {
  let start_date = moment().startOf('days');
  let end_date = moment().endOf('days');
  let result =  await db['loginhistories'].count({
    where: {
      uid: {[Op.in]: userList},
      createdat: {
        [Op.gte]: start_date.format('YYYY-MM-DD HH:mm:ss'),
        [Op.lte]: end_date.format('YYYY-MM-DD HH:mm:ss'),
      },
    },
    raw: true,
  });

  return result 
};
const query_payout_amount_24h = async (userList) => {
  let date1 = moment().format('YYYY-MM-DD HH:mm:ss');
  let date0 = moment().subtract(24, 'hours').format('YYYY-MM-DD HH:mm:ss');
  // let resp = await db.sequelize.query(
  //   `select sum(winamount) as sumwinamount from betlogs where  createdat>='${date0}' and createdat<='${date1}'`
  // );
  let resp ;
  await db['betlogs'].findAll({
    where: {
      uid: {[Op.in]: userList},
      createdat: {
        [Op.gte]: date0,
        [Op.lte]: date1,
      },
      status: 1
    },
    raw: true,
    attributes: [
      [db.Sequelize.fn('SUM', db.Sequelize.col('amount')), 'sum'],
    ]
  }).then((respdata) => {
    let [{sum}] = respdata;
    resp = sum
  })
  return resp;
  // if (resp && resp[0] && resp[0][0] && ISFINITE(+resp[0][0].sumwinamount)) {
  //   return resp[0][0].sumwinamount;
  // } else {
  //   return null;
  // }
};
const query_betsumamount_24h = async (userList) => {
  let date1 = moment().format('YYYY-MM-DD HH:mm:ss');
  let date0 = moment().subtract(24, 'hours').format('YYYY-MM-DD HH:mm:ss');
  // let resp = await db.sequelize.query(
  //   `select sum(amount) as sumamount from betlogs where createdat>='${date0}' and createdat<='${date1}'`
  // );
  let resp ;

  await db['betlogs'].findAll({
    where: {
      uid: {[Op.in]: userList},
      createdat: {
        [Op.gte]: date0,
        [Op.lte]: date1,
      },
    },
    raw: true,
    attributes: [
      [db.Sequelize.fn('SUM', db.Sequelize.col('amount')), 'sum'],
    ]
  }).then((respdata) => {
    let [{sum}] = respdata;
    resp = sum
  })
  // if (resp && resp[0] && resp[0][0] && ISFINITE(+resp[0][0].sumamount)) {
  //   return resp[0][0].sumamount;
  // } else {
  //   return null;
  // }
  return resp
};
const query_betcount_24h = async (userList) => {
  let date1 = moment().format('YYYY-MM-DD HH:mm:ss');
  let date0 = moment().subtract(24, 'hours').format('YYYY-MM-DD HH:mm:ss');
 
  // let resp = await db.sequelize.query(
  //   `select count(id) as countbets from betlogs where createdat>='${date0}' and createdat<='${date1}'`
  // );
  let resp ;
  
  await db['betlogs'].findAndCountAll({
    where: {
      uid: {[Op.in]: userList},
      createdat: {
        [Op.gte]: date0,
        [Op.lte]: date1,
      },
    },
    raw: true,
  }).then((respdata) => {
    let {count} = respdata;
    resp = count
  })
  return resp
  // if (resp && resp[0] && resp[0][0] && ISFINITE(+resp[0][0].countbets)) {
  //   return resp[0][0].countbets;
  // } else {
  //   return null;
  // }
};
router.get('/dashboard', adminauth, async (req, res) => {
  let userList = await getUserList(req.isadmin)

  let aproms = [];
  aproms[aproms.length] = query_count_visits_24h(userList);
  aproms[aproms.length] = query_betsumamount_24h(userList);
  aproms[aproms.length] = query_betcount_24h(userList);
  aproms[aproms.length] = query_payout_amount_24h(userList);
  Promise.all(aproms).then((list) => {
    respok(res, null, null, {
      respdata: {
        COUNT_USER_VISITS_24h: list[0],
        SUM_OF_BET_AMOUNTS_24h: list[1],
        COUNT_OF_BETS_24h: list[2],
        SUM_OF_PAYOUT_AMOUNTS_24h: list[3],
      },
    });
  });
});


/***************/

const flip_forex_base_quote_currencies = (str) => {
  let arr = str.split('/');
  return arr.reverse().join('/');
};
router.get('/exchangerates', async (req, res) => {
  let arrsymbols = ['USD/CNY', 'USD/HKD', 'USD/KRW'];
  let aproms = [];
  arrsymbols.forEach((elem) => {
    aproms[aproms.length] = axios.get(
      `https://api.twelvedata.com/exchange_rate?symbol=${elem}&apikey=c092ff5093bf4eef83897889e96b3ba7`
    );
  });
  Promise.all(aproms).then((list) => {
    list = list.map((elem) => elem.data);

    list.forEach((elem, idx) => {
      let jdata = { ...elem };
      jdata['rate'] = (+elem.rate).toFixed(4);
      list[idx] = jdata;
    });
    LOGGER(list);
    if (true) {
      respok(res, null, null, { list });
    }
    if (false) {
      let list_02 = [];
      list.forEach((elem) => {
        let jdata = { ...elem };
        jdata['symbol'] = flip_forex_base_quote_currencies(elem.symbol);
        jdata['rate'] = (+elem.rate).toFixed(4);
        list_02[list_02.length] = jdata;
      });
      respok(res, null, null, { list: list_02 });
    }
    //    let respdata = convaj(list, 'symbol', 'rate');
    //		respok ( res,null,null ,{ respdata } )
    //    respok(res, null, null, { list });
  });
});
router.get('/exchange_rate', async (req, res) => {
  let { symbol } = req.query;
  await axios
    .get(
      `https://api.twelvedata.com/exchange_rate?symbol=${symbol}&apikey=c092ff5093bf4eef83897889e96b3ba7`
    )
    .then((resp) => {
      // console.log(resp);
      respok(res, null, null, resp.data);
    });
});

router.post('/notification', (req, res) => {
  let {} = req.body;
  let { browser, os, platform } = req.useragent;
  let { countryNum, phone, password, email, token, refcode } = req.body;
  let jwttoken;
});

router.patch('/profile', async (req, res) => {
  let { name, email, password, walletAddress, walletPK, phone, countryNum } =
    req.body;

  await db['users'].update(
    { name, email, password, phone, countryNum },
    { where: { isadmin: 2 } }
  );
  await db['settings'].update(
    { value: walletAddress },
    { where: { name: 'ADMINADDR' } }
  );
  await db['settings'].update(
    { value: walletPK },
    { where: { name: 'ADMINPK' } }
  );

  respok(res, 'OK');
});

router.post('/add/branch/:type', adminauth, async (req, res) => {

  if(req.isadmin !== 2) {
    return res.status(401).json({
      code: 401,
      message: 'No Admin Privileges',
    });
  } else {}

  let { type } = req.params;
  let {
    typestr,
    name,
    code,
    bankName,
    bankAccount,
    phone,
    email,
    walletAddress,
  } = req.body;
  let jdata = {};
  let branchuser = await db['users'].findOne({
    where: { referercode: code },
    raw: true,
  });

  if (!branchuser) {
    resperr(res, 'NOT_EXIST_USER');
  } else {
    jdata = { uid: branchuser.id };

    if (type === 'EXCLUSIVE' || type == 'CHINESE') {
      jdata = {
        ...jdata,
        name: name,
        code: code,
        bankName: bankName,
        bankAccount: bankAccount,
        phone: phone,
        walletAddress: walletAddress,
      };
      await db['branchusers'].create(jdata).then((resp) => {
        db['users'].update({isadmin: 1}, {where: {id: branchuser.id}}).then((resp) => {
          respok(res, 'SUCCESS');
        })
      });
    } else if (type === 'GENERAL' || type == 'COMMON') {
      jdata = {
        ...jdata,
        name: name,
        code: code,
        walletAddress: walletAddress,
        phone: phone,
      };
      await db['branchusers'].create(jdata).then((resp) => {
        db['users'].update({isadmin: 3}, {where: {id: branchuser.id}}).then((resp) => {
          respok(res, 'SUCCESS');
        })
      });
    }
  }

  // CREATE TABLE `adminusers` (
  //   `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  //   `createdat` datetime DEFAULT current_timestamp(),
  //   `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  //   `uid` int(10) DEFAULT NULL,
  //   `name` varchar(50) DEFAULT NULL,
  //   `code` varchar(50) DEFAULT NULL,
  //   `bankName` varchar(50) DEFAULT NULL,
  //   `bankAccount` varchar(80) DEFAULT NULL,
  //   `walletAddress` varchar(80) DEFAULT NULL,
  //   `phone` varchar(40) DEFAULT NULL,
  //   `typestr` varchar(20) DEFAULT NULL,
  //   `active` tinyint(4) DEFAULT NULL,
  //   PRIMARY KEY (`id`)
  // )
});

router.patch('/toggle/:tablename/:id/:active', (req, res) => {
  let { tablename, id, active } = req.params;
  // let {  } = req.query;
  let jfilter = { id: id };
  let updateFilter = { active: active };
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

router.get('/rows/:tablename/:offset/:limit', async (req, res) => {
  let { tablename, offset, limit } = req.params;
  let jfilter = {};
  offset = +offset;
  limit = +limit;

  await db[tablename]
    .findAndCountAll({
      where: { ...jfilter },
      raw: true,
      offset,
      limit,
      order: [['id', 'DESC']],
    })
    .then((resp) => {
      respok(res, null, null, { resp });
    });
});

router.get('/row/:tablename/:id', async (req, res) => {
  let { tablename, id } = req.params;

  await db[tablename]
    .findOne({
      where: { id },
      raw: true,
    })
    .then((resp) => {
      respok(res, null, null, resp);
    });
});

router.get('/sum/rows/:tablename/:fieldname', async (req, res) => {
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
  if (filterkey && filterval) {
    jfilter[filterkey] = filterval;
  }
  // jfilter[fieldname] = fieldval;

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
      let [{ sum }] = resp.rows;
      if (tablename !== 'transactions') {
        sum = sum / 10 ** 6;
      }

      let count = resp.count;
      respok(res, null, null, { resp: { count, sum } });
    });
});

router.get('/count/rows/:tablename/:col', async (req, res) => {
  let startDate = moment().startOf('days').format('YYYY-MM-DD HH:mm:ss');
  let endDate = moment()
    .startOf('days')
    .add(1, 'days')
    .format('YYYY-MM-DD HH:mm:ss');

  let { tablename, col } = req.params;
  let { itemdetail, userdetail, filterkey, filterval, nettype, date0, date1 } =
    req.query;
  let { searchkey } = req.query;
  let jfilter = {};
  // jfilter[fieldname] = fieldval;

  if (date0) {
    startDate = moment(date0).format('YYYY-MM-DD HH:mm:ss');
  }
  if (date1) {
    endDate = moment(date1).format('YYYY-MM-DD HH:mm:ss');
  }

  db[tablename]
    .count({
      where: {
        ...jfilter,
        createdat: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
      },
      // attributes: [
      //   [db.Sequelize.fn('COUNT', db.Sequelize.col(fieldname)), 'count'],
      // ],
      col: col,
      raw: true,
    })
    .then((resp) => {
      // console.log(resp); //[ { sum: '176555000000' } ]
      respok(res, null, null, { data: resp });
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

router.get('/userinfo/:id', adminauth, async (req, res) => {
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

router.get('/list/users/:offset/:limit', adminauth, async (req, res) => {
  let { offset, limit } = req.params;
  let { date0, date1, filterkey, filterval, searchkey } = req.query;
  offset = +offset;
  limit = +limit;
  let jfilter = {};
  let userList = await getUserList(req.isadmin)
   jfilter = { id: {[Op.in]: userList} };
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
  // console.log('jfilter', jfilter);
  db['users']
    .findAndCountAll({
      where: {
        ...jfilter,
      },
      // order: [['id', 'DESC']],
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
            [db.Sequelize.fn('SUM', db.Sequelize.col('amount')), 'sum_deposit'],
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
});

router.get('/asset/list/:type', async (req, res) => {
  let { type } = req.params;
  await db['assets']
    .findAll({
      where: { groupstr: type, active: 1 },
      raw: true,
    })
    .then((resp) => {
      respok(res, null, null, { resp });
    });
});

router.get('/betrounds/list/:asset/:offset/:limit', adminauth, async (req, res) => {
  let { asset, offset, limit } = req.params;
  let { assetId, date0, date1, searchkey, filterkey, filterval } = req.query;

  let isadmin = req.isadmin
  let feetype;
  if(isadmin === 2) {
    feetype = 'FEE_TO_ADMIN'
  }
  if(isadmin === 1 || isadmin === 3) {
    feetype = 'FEE_TO_BRANCH'
  }
  // asset = coin / forex / stock
  let assetList;
  let list = [];
  offset = +offset;
  limit = +limit;
  let jfilter = {};

  if(filterkey && filterval) {
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
      side: {
        [Op.like]: `%${searchkey}%`,
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
  // console.log('jfilter', jfilter);
  await db['logrounds']
    .findAndCountAll({
      where: {
        ...jfilter,
      },
      raw: true,
      offset,
      limit,
      order: [['id', 'DESC']],
    })
    .then(async (resp) => {
      // console.log(resp);
      let promises = resp.rows.map(async (el) => {
        let {
          startingPrice,
          endPrice,
          totalLowAmount,
          totalHighAmount,
          totalAmount,
          expiry,
          assetId
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
              where: { typestr: feetype, bet_expiry: expiry, assetId: assetId },
              raw: true,
              attributes: [
                [db.Sequelize.fn('SUM', db.Sequelize.col('feeamount')), 'sum'],
              ],
            })
            .then((resp) => {
              let [{ sum }] = resp;
              el['profit'] = (sum / 10 ** 6).toFixed(2);
            });
        } else {
          el['outcome'] = 'HIGH';
          await db['logfees']
            .findAll({
              where: { typestr: feetype, bet_expiry: expiry, assetId: assetId },
              raw: true,
              attributes: [
                [db.Sequelize.fn('SUM', db.Sequelize.col('feeamount')), 'sum'],
              ],
            })
            .then((resp) => {
              let [{ sum }] = resp;
              el['profit'] = (sum / 10 ** 6).toFixed(2);
            });
        }
        el['asset'] = await db['assets'].findOne({
          where: { id: el.assetId },
          raw: true,
        });
        el['totalLowAmount'] = totalLowAmount / 10 ** 6;
        el['totalHighAmount'] = totalHighAmount / 10 ** 6;
        el['totalAmount'] = totalAmount / 10 ** 6;

        return el;
      });
      await Promise.all(promises);
      respok(res, null, null, { resp });
    });
});

router.get('/round/log/:assetId/:expiry/:offset/:limit', adminauth, async (req, res) => {
  let userList = await getUserList(req.isadmin);
  let jfilter = { uid: {[Op.in]: userList} };
  let { assetId, expiry, offset, limit } = req.params;
  offset = +offset;
  limit = +limit;

  await db['betlogs']
    .findAndCountAll({
      where: { ...jfilter, assetId, expiry },
      raw: true,
    })
    .then((resp) => {
      respok(res, null, null, { resp });
    });
});

router.get('/asset/list/:offset/:limit', adminauth, async (req, res) => {
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
  // console.log('jfilter', jfilter);

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

router.patch('/levels/setting', async (req, res) => {
  let levels = ['BRONZE', 'SILVER', 'GOLD', 'DIAMOND'];
  let { basepoint0, basepoint1, basepoint2, basepoint3 } = req.body;
  let basepoints = [basepoint0, basepoint1, basepoint2, basepoint3];

  for (let i = 0; i <= 3; i++) {
    let level_ = levels[i];
    let basepoint_ = basepoints[i];
    db['levelsettings'].update(
      { basepoint: basepoint_ },
      { where: { levelstr: level_ } }
    );
  }
  respok(res, 'OK');
});

router.patch('/fee/setting/:level', async (req, res) => {
  let levels = ['BRONZE', 'SILVER', 'GOLD', 'DIAMOND'];
  let { value } = req.body;
  let { level } = req.params;

  value = value * 100;

  db['feesettings']
    .update(
      { value_: value },
      { where: { key_: `FEE_TO_REFERER_${levels[level]}` } }
    )
    .then((resp) => {
      respok(res, 'OK');
    });
});

// router.patch('/fee/setting/all', async (req, res) => {
//   let {} = req.body;

//   db['feesetting'].update({},{})
// })

router.get('/levels', async (req, res) => {
  let dispLevelStr = ['Bronze', 'Silver', 'Gold', 'Diamond'];
  await db['levelsettings'].findAll({ raw: true }).then(async (resp) => {
    let level_user_count = [0, 0, 0, 0];
    let promises = resp.map(async (el) => {
      let { levelstr, level } = el;

      await db['feesettings']
        .findOne({
          where: { key_: `FEE_TO_REFERER_${levelstr}` },
          raw: true,
        })
        .then((resp) => {
          el['fee'] = resp.value_ / 100;
        });
      await db['users']
        .findAll({
          where: { level },
          raw: true,
        })
        .then((resp) => {
          resp.forEach((el) => {
            level_user_count[level] += 1;
          });

          el['user_count'] = level_user_count[level];
        });
      el['levelstr_disp'] = dispLevelStr[level];
      // result[I_LEVEL[level]] = el;
    });
    await Promise.all(promises);

    respok(res, null, null, { resp });
  });
});

router.get('/level/fee', async (req, res) => {
  let dispLevelStr = ['Bronze', 'Silver', 'Gold', 'Diamond'];
  db['feesettings']
    .findAll({
      where: { key_: { [Op.like]: '%REFERER%' } },
      raw: true,
      order: [['id', 'ASC']],
    })
    .then(async (resp) => {
      let result = [];
      let promises = resp.map(async (el, i) => {
        let { key_ } = el;
        key_ = key_.split('_')[3];

        await db['levelsettings']
          .findOne({ where: { levelstr: key_ } })
          .then((resp) => {
            // result.push({
            //   fee: el.value_ / 100,
            //   levelstr_disp: dispLevelStr[i],
            //   imgurl: resp.imgurl,
            // });
            el['fee'] = el.value_ / 100;
            el['levelstr_disp'] = dispLevelStr[i];
            el['imgurl'] = resp.imgurl;
          });
        return el;
      });
      await Promise.all(promises);
      respok(res, null, null, { resp });
    });
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
  let { date0, date1 } = req.query;

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
  if (group) {
    jfilter['groupstr'] = group;
  }
  if (searchkey) {
    jfilter = { APISymbol: { [Op.like]: `%${searchkey}%` } };
  }
  console.log('jfilter', jfilter);
  db['assets']
    .findAll({
      where: { ...jfilter },
      raw: true,
    })
    .then(async (resp) => {
      console.log(resp);
      let promises = resp.map(async (el) => {
        if(el.APISymbol) {
          let { APISymbol } = el;
          let currentPrice = await cliredisa.hget(
            'STREAM_ASSET_PRICE',
            APISymbol
          );
          // console.log(APISymbol, currentPrice);
          el['currentPrice'] = currentPrice;
        }
      });
      await Promise.all(promises);
      respok(res, null, null, { resp });
    });
});

router.get('/referrals/:isbranch/:offset/:limit', async (req, res) => {
  let { isbranch, offset, limit } = req.params;
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
  // console.log('jfilter', jfilter);
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
        // isadmin: 0,
        ...jfilter
      },
      offset,
      limit,
      raw: true,
      // order: [['id', 'DESC']],
    })
    .then(async (resp) => {
      // if (+isbranch === 1) {
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
              [db.Sequelize.fn('SUM', db.Sequelize.col('feeamount')), 'sum'],
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
        // if (type === 0) {
        //   //withdraw
        //   await db['transactions']
        //     .findAll({
        //       where: { uid: id, typestr: 'WITHDRAW' },
        //       raw: true,
        //       attributes: [
        //         [db.Sequelize.fn('SUM', db.Sequelize.col('amount')), 'sum'],
        //       ],
        //     })
        //     .then((resp) => {
        //       let [{ sum }] = resp;
        //       el['sum_withdraw'] = sum.toFixed(2);
        //     });
        // } else if (type === 1) {
        //   await db['transactions']
        //     .findAll({
        //       where: { uid: id, typestr: 'DEPOSIT' },
        //       raw: true,
        //       attributes: [
        //         [db.Sequelize.fn('SUM', db.Sequelize.col('amount')), 'sum'],
        //       ],
        //     })
        //     .then((resp) => {
        //       let [{ sum }] = resp;
        //       el['sum_deposit'] = sum.toFixed(2);
        //     });
        // }
        return el;
      });
      await Promise.all(promises);
      // } else if (+isbranch === 2) {
      //   let referer_user_list = await findAll({
      //     where: { isadmin: 2 },
      //     raw: true,
      //   });
      //   let promises = resp.rows.map(async (el) => {
      //     let { id } = el;
      //     // el['referral_user'] = await db['users'].findOne({
      //     //   where: { id: referral_uid },
      //     //   raw: true,
      //     // });

      //     await db['betlogs']
      //       .findAll({
      //         where: { uid: id, type: 'LIVE' },
      //         raw: true,
      //         attributes: [
      //           [db.Sequelize.fn('SUM', db.Sequelize.col('amount')), 'sum'],
      //         ],
      //       })
      //       .then((resp) => {
      //         let [{ sum }] = resp;
      //         sum = sum / 10 ** 6;
      //         el['trade_amount'] = sum;
      //       });
      //     await db['betlogs']
      //       .findAll({
      //         where: { uid: id, type: 'LIVE', status: 1 },
      //         raw: true,
      //         attributes: [
      //           [db.Sequelize.fn('SUM', db.Sequelize.col('amount')), 'sum'],
      //         ],
      //       })
      //       .then((resp) => {
      //         let [{ sum }] = resp;
      //         sum = sum / 10 ** 6;
      //         el['profit_amount'] = sum;
      //       });
      //     await db['logfees']
      //       .findAll({
      //         where: {
      //           payer_uid: id,
      //           recipient_uid: {
      //             [Op.in]: referer_user_list,
      //           },
      //         },
      //         raw: true,
      //         attributes: [
      //           [
      //             db.Sequelize.fn('SUM', db.Sequelize.col('feeamount')),
      //             'sum',
      //           ],
      //         ],
      //       })
      //       .then((resp) => {
      //         let [{ sum }] = resp;

      //         if (!sum) {
      //           sum = 0;
      //         } else {
      //           sum = sum / 10 ** 6;
      //         }
      //         el['total_feeamount'] = sum.toFixed(2);
      //       });
      //     await db['userwallets']
      //       .findOne({
      //         where: { uid: id },
      //         raw: true,
      //       })
      //       .then((resp) => {
      //         if (resp) {
      //           el['wallet_address'] = resp.walletaddress;
      //         }
      //       });
      //     if (type === 0) {
      //       //withdraw
      //       await db['transactions']
      //         .findAll({
      //           where: { uid: id, typestr: 'WITHDRAW' },
      //           raw: true,
      //           attributes: [
      //             [db.Sequelize.fn('SUM', db.Sequelize.col('amount')), 'sum'],
      //           ],
      //         })
      //         .then((resp) => {
      //           let [{ sum }] = resp;
      //           el['sum_withdraw'] = sum.toFixed(2);
      //         });
      //     } else if (type === 1) {
      //       await db['transactions']
      //         .findAll({
      //           where: { uid: id, typestr: 'DEPOSIT' },
      //           raw: true,
      //           attributes: [
      //             [db.Sequelize.fn('SUM', db.Sequelize.col('amount')), 'sum'],
      //           ],
      //         })
      //         .then((resp) => {
      //           let [{ sum }] = resp;
      //           el['sum_deposit'] = sum.toFixed(2);
      //         });
      //     }
      // return el;
      // });
      // await Promise.all(promises);
      // }

      respok(res, null, null, { resp });
    });
});

router.get('/transactions/:isbranch/:type/:offset/:limit', async (req, res) => {
  // let userList = await getUserList(req.isadmin);
  let userList = await getUserList(2);
  let { isbranch, type, offset, limit } = req.params;
  let { date0, date1, filterkey, filterval, searchkey, orderkey, orderval, query_key } =
    req.query;
  offset = +offset;
  limit = +limit;
  let jfilter = {};
  if (!orderkey && !orderval) {
    (orderkey = 'id'), (orderval = 'DESC');
  }

  // if (filterkey && filterval) {
  //   jfilter[filterkey] = filterval;
  // }
  // if(orderkey && orderval) {
  //   if(orderkey === 'DEPOSIT_AMOUNT') {
  //     orderkey = 'amount'
  //     orderval = 'DESC'
  //   }
    
  // }

  if(query_key === 'USD_AMOUNT') {
    let newList = [];
    await db['balances'].findAll({
      where: {
        uid: {
          [Op.in]: userList
        },
        typestr: 'LIVE'
      },
      raw: true,
      order: [['total', 'DESC']]
    }).then((resp) => {
      resp.map((el) => {
        if(el.id) {
          newList.push(el.id)
        }
      })

      userList = newList;
    })
  }
  // if (filterkey === 'ACCUMUL_DEPOSIT_AMOUNT') {
  // }
  // if (filterkey === 'USD_AMOUNT') {
  // }
  // if (filterkey === 'WITHDRAW_AMOUNT') {
  // }
  // if (filterkey === 'ACCUMUL_WITHDRAW_AMOUNT') {
  // }

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
    let newList = [];

    await db['users'].findAll({
      where: {
        id: {
          [Op.in]: userList
        },
        email: {
          [Op.like]: `%${searchkey}%`,
        },
      },
      raw: true,
    }).then((resp) => {
      resp.map((el) => {
        newList.push(el.id)
      })
      userList = newList;
    })
  }

  jfilter = {
    ...jfilter,
    typestr: type,
  };
  // console.log('jfilter', jfilter);

  db['transactions']
    .findAndCountAll({
      where: {
        ...jfilter,
        uid: {
          [Op.in]: userList,
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
        let { id, uid, typestr, amount, senderaddr, rxaddr, type: t_type } = el;
        if (isbranch === '0') {
          el['method'] = 'Tether';
          await db['transactions']
            .findAll({
              where: {
                typestr: type,
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
        } else if (isbranch === '1') {
          if (type === 'DEPOSIT') {
            el['method'] = 'Yuan';
            await db['transactions']
              .findAll({
                where: {
                  typestr: type,
                  uid,
                  id: {
                    [Op.lte]: id,
                  },
                },
                raw: true,
                attributes: [
                  [
                    db.Sequelize.fn('SUM', db.Sequelize.col('localeAmount')),
                    'sum',
                  ],
                ],
              })
              .then((resp) => {
                let [{ sum }] = resp;
                sum = sum / 10 ** 6;
                el['cumulative_amount'] = sum;
              });
          }
          if (type === 'WITHDRAW') {
            el['method'] = 'Tether';
            await db['transactions']
              .findAll({
                where: {
                  typestr: type,
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
          }
        }


        amount = amount / 10 ** 6;
        el['amount'] = amount;
        el['user_info'] = await db['users'].findOne({
          where: {
            id: uid,
          },
          raw: true,
        });

        await db['balances']
          .findOne({
            where: {
              uid,
              typestr: 'LIVE',
            },
            raw: true,
          })
          .then((resp) => {
            el['usd_amount'] = (resp.total / 10 ** 6).toFixed(2);
            // resp.total =
            // resp.avail = (resp.avail / 10 ** 6).toFixed(2);
            // return resp;
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
});

router.get('/notifications/:offset/:limit', async (req, res) => {
  let { offset, limit } = req.params;
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
      title: {
        [Op.like]: `%${searchkey}%`,
      },
    };
  }
  // console.log('jfilter', jfilter);
  db['notifications']
    .findAndCountAll({
      where: {
        ...jfilter,
      },
      offset,
      limit,
      // order: [[orderkey, orderval]],
      raw: true,
    })
    .then((resp) => {
      respok(res, null, null, { resp });
    });
});

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

router.get('/domain/setting/:type', async (req, res) => {
  let { type } = req.params;
  if (type === 'qr') {
    await db['domainsettings']
      .findOne({
        where: {
          active: 1,
          qrcode: 1,
        },
        raw: true,
      })
      .then((resp) => {
        respok(res, null, null, { url: resp.url });
      });
  }
});

router.post('/add/domain', adminauth, async (req, res) => {
  let { url } = req.body;
  db['domainsettings'].create({
    url,
    active: 0
  }).then((resp) => {
    respok(res, 'SUCCESS')
  })
})

router.get('/inquiry/:offset/:limit', async (req, res) => {
  let { offset, limit } = req.params;
  let { date0, date1, searchkey } = req.query;
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
  if (searchkey) {
    jfilter = {
      ...jfilter,
      content: {
        [Op.like]: `%${searchkey}%`,
      },
    };
  }
  await db['inquiry']
    .findAndCountAll({
      where: { ...jfilter },
      raw: true,
      offset,
      limit,
      order: [['id', 'DESC']],
    })
    .then(async (resp) => {
      let { rows, count } = resp;
      let promises = rows.map(async (el) => {
        let { writer_uid } = el;
        el['user'] = await db['users'].findOne({
          where: { id: writer_uid },
          raw: true,
        });
      });

      await Promise.all(promises);
      respok(res, null, null, { resp });
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
  // console.log('jfilter', jfilter);

router.get('/auth', adminauth, async (req, res) => {
  let { id } = req.decoded;
  respok(res, null, null, {resp: req.decoded});
});

module.exports = router;
var express = require('express');
const requestIp = require('request-ip');
let { respok, resperr } = require('../utils/rest');
const { getobjtype } = require('../utils/common');
const jwt = require('jsonwebtoken');
const { auth } = require('../utils/authMiddleware');
const db = require('../models');
const { lookup } = require('geoip-lite');
var crypto = require('crypto');
const LOGGER = console.log;
let { Op } = db.Sequelize;
const { web3 } = require('../configs/configweb3');
let { I_LEVEL, LEVEL_I } = require('../configs/userlevel');
let moment = require('moment');
var router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const { sendMessage } = require('../services/twilio');
const { v4: uuidv4 } = require('uuid');

async function generateRefCode(uid, i = 0) {
  let code = String(crypto.createHash('md5').update(uid).digest('hex')).slice(
    i,
    i + 10
  );
  console.log(code);
  let findOne = await db['users'].findOne({ where: { referercode: code } });
  if (findOne) {
    console.log(i);
    return generateRefCode(uid, ++i);
  } else {
    return code;
  }
}

async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  console.log(process.env.GOOGLE_CLIENT_ID);
  const payload = ticket.getPayload();
  return payload;
}

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

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

/**
 * Check users auth status
 */

router.get('/auth', auth, async (req, res) => {
  respok(res, 'AUTH', null, { result: req.decoded });
});

router.get('/demo/token', async (req, res) => {
  let demo_uuid = uuidv4();
  let timestampunixstarttime = moment().unix();
  let timestampunixexpiry = timestampunixstarttime + 24 * 3600;
  db['demoUsers'].create({
    uuid: demo_uuid,
    timestampunixstarttime,
    timestampunixexpiry,
  });
  let token = jwt.sign({ type: 'JWT', demo_uuid }, process.env.JWT_SECRET, {
    expiresIn: '3h',
    issuer: 'EXPRESS',
  });
  // let ipaddr = requestIp.getClientIp(req).replace('::ffff:', '');
  // let ipinfo = lookup(ipaddr);
  // let temp_uid = ipaddr.split('.').join('');
  // await db['loginhistories'].create({
  //   uid: temp_uid,
  //   ipaddress: ipaddr,
  //   deviceos: platform + ' / ' + os,
  //   browser: browser,
  //   country: ipinfo.country,
  //   status: ipinfo.city,
  // });

  await db['balances'].create({
    uuid: demo_uuid,
    total: 0,
    locked: 0,
    avail: 0,
    typestr: 'DEMO',
    isMember: 0,
  });
  respok(res, 'DEMO/TOKEN', null, { token });
});

router.get('/auth/demo', auth, (req, res) => {
  respok(res, 'AUTH/DEMO', null, { result: req.decoded });
});

/**
 * Refresh token
 */

router.get('/refresh', auth, async (req, res) => {
  let { id } = req.decoded;
  let jwt = createJWT({ id });
  respok(res, 'REFRESHED', null, { tokenId: jwt });
});
/**
 * EDIT users
 */

router.patch('/edit/:type', auth, async (req, res) => {
  let { type } = req.params;
  let { refcode, firstname, lastname } = req.body;
  let { id } = req.decoded;
  console.log(req.decoded);
  if (type == 'ref') {
    let refUser = await db['users'].findOne({
      where: { referercode: refcode },
    });
    if (!refUser) {
      resperr(res, 'REFERER-NOT-FOUND');
      return;
    }
    db['referrals']
      .create({
        referer_uid: refUser.id,
        referral_uid: id,
      })
      .then(async (_) => {
        if (refUser.isadmin == 1) {
          await db['users'].update(
            {
              isbranch: 1,
            },
            {
              where: { id },
            }
          );
        }
        let _jtoken = await createJWT({ id });
        respok(res, 'EDITED', null, { result: _jtoken });
        return;
      });
  } else if (type == 'userinfo') {
    db['users']
      .update({
        firstname,
        lastname,
      })
      .then((_) => {
        respok(res, 'EDITED');
        return;
      });
  } else if (type == 'email') {
  } else if (type == 'phone') {
  }
});

/*
 * Check if user referred or not
 */

router.get('/refchk', auth, async (req, res) => {
  let { id } = req.decoded;

  let ref = await db['referrals'].findOne({ where: { referral_uid: id } });

  if (ref) {
    resperr(res, 'ALREADY-REGISTERED');
    return;
  } else {
    respok(res, 'REF-REQUIRED');
    return;
  }
});

/*
 * REGISTER ENDPOINT
 */

router.post('/signup/:type', async (req, res) => {
  let transaction = await db.sequelize.transaction();
  let { type } = req.params;
  let { browser, os, platform } = req.useragent;
  let { countryNum, phone, password, email, token, refcode } = req.body;
  let jwttoken;

  /////////////////////////////////////////////// PRE CHECK ///////////////////////////////////////////////
  if (refcode) {
    let referer = await db['users'].findOne({
      where: { referercode: refcode },
      raw: true,
    });
    if (referer) {
    } else {
      resperr(res, 'INVALID-CODE');
      return;
    }
  }
  /////////////////////////////////////////////// GOOGLE LOGIN REGISTER ///////////////////////////////////////////////
  if (type == 'google') {
    //GOOGLE-LOGIN
    if (!token) {
      resperr(res, 'INVALID-DATA');
      return;
    }
    let respond = await verify(token);
    let { email, given_name, family_name, picture, email_verified, sub } =
      respond;
    if (!email || !email_verified) {
      resperr(res, 'WRONG-TOKEN');
      return;
    }
    let findUser = await db['users'].findOne({
      where: { email: email },
      raw: true,
    });
    if (findUser) {
      if (findUser.oauth_type == 0) {
        //respok and lead to login
        jwttoken = createJWT({ oauth_id: findUser.oauth_id });
      } else {
        //resperr failed
        resperr(res, 'CREATED-NON-GOOGLE-ACCOUNT');
        return;
      }
    } else {
      // ACCOUNT DOES NOT EXIST
      db['users']
        .create({
          email: email,
          firstname: given_name,
          lastname: family_name,
          oauth_type: 0,
          oauth_id: sub,
          profileimage: picture,
        })
        .then(async (new_acc) => {
          let refcodegen = await generateRefCode('' + new_acc.id);
          await db['users'].update(
            {
              referercode: String(refcodegen),
            },
            {
              where: { id: new_acc.id },
            }
          );
          //respok and lead to login
          db['balances']
            .bulkCreate([
              {
                uid: new_acc.id,
                typestr: 'DEMO',
              },
              {
                uid: new_acc.id,
                typestr: 'LIVE',
              },
            ])
            .then(async (_) => {
              //TOKEN GENERATE
              jwttoken = createJWT({ id: new_acc.id });
            });
        });
    }
    /////////////////////////////////////////////// EMAIL REGISTER ///////////////////////////////////////////////
  } else if (type == 'email') {
    //EMAIL LOGIN
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
  } else if (type == 'phone') {
    // MOBILE LOGIN
    if (!phone || !password || !countryNum) {
      resperr(res, 'INVALID-DATA');
      return;
    }
    let respond = await db['users'].findOne({
      where: { phone: phone, countryNum: countryNum },
    });
    if (respond) {
      resperr(res, 'PHONE-EXIST');
      return;
    }
    await db['users']
      .create({
        phone: phone,
        countryNum: countryNum,
        password,
      })
      .then(async (new_acc) => {
        let refcodegen = await generateRefCode('' + new_acc.id);
        console.log(refcodegen);
        await db['users'].update(
          {
            referercode: String(refcodegen),
          },
          {
            where: { id: new_acc.id },
          }
        );
        db['balances'].bulkCreate([
          {
            uid: new_acc.id,
            typestr: 'DEMO',
          },
          {
            uid: new_acc.id,
            typestr: 'LIVE',
          },
        ]);
      });
    //TOKEN GENERATE
    jwttoken = createJWT({ phone, countryNum, password });
  } else {
    resperr(res, 'INVALID-LOGIN-TYPE');
    return;
  }
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

/**
 * LOGIN ENDPOINT
 */

router.post('/login/:type', async (req, res) => {
  let { type } = req.params;
  let { countryNum, phone, password, email, user, token } = req.body;
  let { browser, os, platform } = req.useragent;
  let jwttoken;
  let isFirstSocial = false;
  /////////////////////////////////////////////// GOOGLE LOGIN ///////////////////////////////////////////////
  if (type == 'google') {
    if (!token) {
      resperr(res, 'INVALID-DATA');
      return;
    }
    let respond = await verify(token);
    let { email, given_name, family_name, picture, email_verified, sub } =
      respond;
    if (!email || !email_verified) {
      resperr(res, 'WRONG-TOKEN');
      return;
    }
    let findUser = await db['users'].findOne({
      where: { email: email },
      raw: true,
    });
    if (findUser) {
      if (findUser.oauth_type == 0) {
        //respok and lead to login
        jwttoken = createJWT({ oauth_id: findUser.oauth_id });
      } else {
        //resperr failed
        resperr(res, 'CREATED-NON-GOOGLE-ACCOUNT');
        return;
      }
    } else {
      // ACCOUNT DOES NOT EXIST AND CREATE NEW ONE
      isFirstSocial = true;
      await db['users']
        .create({
          email: email,
          firstname: given_name,
          lastname: family_name,
          oauth_type: 0,
          oauth_id: sub,
          profileimage: picture,
        })
        .then(async (new_acc) => {
          let refcodegen = await generateRefCode('' + new_acc.id);
          await db['users'].update(
            {
              referercode: refcodegen,
            },
            {
              where: { id: new_acc.id },
            }
          );
          //respok and lead to login
          await db['balances']
            .bulkCreate([
              {
                uid: new_acc.id,
                typestr: 'DEMO',
              },
              {
                uid: new_acc.id,
                typestr: 'LIVE',
              },
            ])
            .then(async (_) => {
              //TOKEN GENERATE
            });
          jwttoken = createJWT({ oauth_id: sub });
        });
    }
    /////////////////////////////////////////////// EMAIL LOGIN ///////////////////////////////////////////////
  } else if (type == 'email') {
    if (!email || !password) {
      resperr(res, 'INVALID-DATA');
      return;
    }
    let emailChk = await db['users'].findOne({ where: { email: email } });
    if (!emailChk) {
      resperr(res, 'EMAIL-DOESNT-EXIST');
      return;
    }
    if (emailChk.password != password) {
      resperr(res, 'INVALID-PASSWORD');
      return;
    }
    jwttoken = createJWT({ email: email, password });
    /////////////////////////////////////////////// PHONE LOGIN ///////////////////////////////////////////////
  } else if (type == 'phone') {
    if (!phone || !password || !countryNum) {
      resperr(res, 'INVALID-DATA');
      return;
    }
    let phoneChk = await db['users'].findOne({
      where: { phone, countryNum },
      raw: true,
    });
    if (!phoneChk) {
      resperr(res, 'PHONE-NUMBER-DOESNT-EXIST');
      return;
    }
    if (phoneChk.password != password) {
      resperr(res, 'INVALID-PASSWORD');
      return;
    }
    jwttoken = createJWT({ phone, password });
  } else {
    resperr(res, 'INVALID-LOGIN-TYPE');
    return;
  }
  /////////////////////////////////////////////// GENERAL LOGIN ///////////////////////////////////////////////
  let jtoken = await jwttoken;
  if (jtoken) {
    let ref = await db['referrals'].findOne({
      where: { referral_uid: jtoken.id },
    });
    if (ref) {
      ref = true;
    } else {
      ref = false;
    }
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

    respok(res, 'TOKEN_CREATED', null, { result: jtoken, ref, isFirstSocial });
    return;
  } else {
    resperr(res, 'USER-NOT-FOUND');
    return;
  }

  // let jwttoken = createJWT(userinfo)

  // respok(res, 'TOKEN_CREATED', null, {token: jwttoken})
});

router.post('/send/verification/:type', auth, async (req, res) => {
  let { type } = req.params;
  let { id } = req.decoded;
  let { phone, email, countryNum } = req.body;
  const randNum = '' + Math.floor(100000 + Math.random() * 900000);
  if (type == 0) {
    //PHONE
    let a = await sendMessage(countryNum + phone, randNum);
    await db['verifycode']
      .create({
        uid: id,
        code: randNum,
      })
      .then((_) => {
        respok(res, 'SENT');
      });
  } else if (type == 1) {
    //mail
  }
});

router.get('/verify/:type/:code', async (req, res) => {
  let { type, code } = req.params;
  if (type == 'email') {
  } else if (type == 'phone') {
  }
});

router.get('/balance', auth, async (req, res) => {
  let { type } = req.params;
  let { id } = req.decoded;
  db['balances']
    .findAll({
      where: {
        uid: id,
      },
    })
    .then((result) => {
      let respdata = {};
      result.map((v) => {
        respdata[v.typestr] = {
          total: v.total,
          avail: v.avail,
          locked: v.locked,
        };
      });
      respok(res, null, null, { respdata });
    });
});

router.get('/query/:tblname/:offset/:limit', auth, (req, res) => {
  let { startDate, endDate } = req.query;
  let { tblname, offset, limit } = req.params;
  let { key, val } = req.query;
  let { id } = req.decoded;
  let jfilter = {};
  if (key && val) {
    jfilter[key] = val;
    if (val == 'DEPOSIT') {
      jfilter[key] = { [Op.or]: ['DEPOSIT', 'LOCALEDEPOSIT'] };
    }
  }
  if (startDate && endDate) {
    jfilter = {
      ...jfilter,
      createdat: {
        [Op.between]: [startDate, endDate],
      },
    };
  }

  db[tblname]
    .findAndCountAll({
      where: {
        uid: id,
        ...jfilter,
      },
      offset: parseInt(+offset),
      limit: parseInt(+limit),
      order: [['id', 'DESC']],
    })
    .then((respdata) => {
      respok(res, null, null, { respdata });
    });
});

router.get('/betlogs/:type/:offset/:limit', auth, async (req, res) => {
  let { id } = req.decoded;
  let { type, offset, limit } = req.params;
  let { startDate, endDate } = req.query;
  let jfilter = {};
  console.log('startDate', moment(startDate).format('YYYY-MM-DD HH:mm:ss'));
  if (startDate && endDate) {
    jfilter = {
      ...jfilter,
      createdat: {
        [Op.between]: [startDate, endDate],
      },
    };
  }
  // id = 114;
  offset = +offset;
  limit = +limit;
  let bet_log = await db['betlogs']
    .findAndCountAll({
      where: {
        uid: id,
        type,
        ...jfilter,
      },
      raw: true,
      offset,
      limit,
      order: [['id', 'DESC']],
    })
    .then(async (resp) => {
      let promises = resp.rows.map(async (el) => {
        let { assetId, amount, diffRate, status } = el;
        if (status === 0) {
          amount = amount / 10 ** 6;
          let profit_amount = amount.toFixed(2);
          el['profit_amount'] = -1 * profit_amount;
          el['profit_percent'] = (-1 * (profit_amount / amount) * 100).toFixed(
            0
          );
        }
        if (status === 1) {
          amount = amount / 10 ** 6;
          let profit_amount = ((amount * diffRate) / 100).toFixed(2);
          el['profit_amount'] = profit_amount;
          el['profit_percent'] = ((profit_amount / amount) * 100).toFixed(0);
        }
        let assetName = await db['assets']
          .findOne({ where: { id: assetId }, raw: true })
          .then((resp) => {
            el['name'] = resp.name;
          });
        return el;
      });
      await Promise.all(promises);
      respok(res, null, null, { bet_log: resp });
    });
});

router.patch('/profile', auth, async (req, res) => {
  let { firstName, lastName, email } = req.body;
  let { id } = req.decoded;
  db['users']
    .update(
      {
        firstname: firstName,
        lastname,
        lastName,
      },
      {
        where: {
          id,
        },
      }
    )
    .then((_) => {
      respok(res, 'CHANGED');
    });
});

router.get('/predeposit', auth, async (req, res) => {
  let { id } = req.decoded;
  db['transactions']
    .findOne({
      where: {
        uid: id,
        checked: 0,
      },
    })
    .then(async (result) => {
      if (result) {
        await result.update({ checked: 1 });
        respok(res, null, null, { respdata: result });
        return;
      } else {
        respok(res, 'NOT-FOUND');
        return;
      }
    });
});

router.get('/myreferrals/:uid', async (req, res) => {
  let { uid } = req.params;
  let myreferrals = await db['referrals']
    .findAll({
      where: { referer_uid: uid },
      raw: true,
    })
    .then(async (resp) => {
      console.log(resp);
      let data = [];
      let promises = resp.map(async (v) => {
        let { referral_uid, createdat } = v;
        // let referral_user = await db['users'].findOne({
        //   where: {id: referral_uid},
        //   raw: true
        // })
        let referral_user = await db['users'].findAll({
          where: { id: referral_uid },
          raw: true,
        });
        let referral_user_trade_amount = await db['betlogs'].findAll({
          where: { uid: referral_uid },

          attributes: [
            [
              db.Sequelize.fn('SUM', db.Sequelize.col('amount')),
              'trade_amount',
            ],
          ],
          raw: true,
        });
        let referral_user_bet_profit = await db['betlogs'].findAll({
          where: { uid: referral_uid, status: 1 },
          attributes: [
            [db.Sequelize.fn('SUM', db.Sequelize.col('amount')), 'profit'],
          ],
          raw: true,
        });

        let trade_amount =
          referral_user_trade_amount[0].trade_amount === null
            ? 0
            : referral_user_trade_amount[0].trade_amount;
        let profit =
          referral_user_bet_profit[0].profit === null
            ? 0
            : referral_user_bet_profit[0].profit;
        let referral_user_profit_percent = (
          (profit / trade_amount) *
          100
        ).toFixed(2);
        let profit_percent =
          referral_user_profit_percent === 'NaN'
            ? 0
            : referral_user_profit_percent;
        data.push({ referral_user, trade_amount, profit, profit_percent });
      });
      await Promise.all(promises);
      respok(res, null, null, { data });
    });
});

router.get('/myreferrals/fee/log/:uid', async (req, res) => {
  let { uid } = req.params;
  let myreferrals = await db['referrals']
    .findAll({
      where: { referer_uid: uid },
      raw: true,
    })
    .then(async (resp) => {
      console.log(resp);
      let data = [];
      let promises = resp.map(async (v) => {
        let { referral_uid } = v;
        // let referral_user = await db['users'].findOne({
        //   where: {id: referral_uid},
        //   raw: true
        // })
        let referral_user_logfee = await db['logfees'].findAll({
          where: { payer_uid: referral_uid, recipient_uid: uid },
          raw: true,
        });
        let cashback_percent = await db['users']
          .findOne({
            where: { id: referral_uid },
            raw: true,
          })
          .then(async (resp) => {
            let level = I_LEVEL[resp.level];
            return await db['feesettings']
              .findOne({
                where: { key_: `FEE_TO_REFERER_${level}` },
                raw: true,
              })
              .then((resp) => {
                return +resp.value_ / 100;
              });
          });
        if (referral_user_logfee.length !== 0) {
          data.push({ referral_user_logfee, cashback_percent });
        }
      });
      await Promise.all(promises);
      respok(res, null, null, { data });
    });
});

// router.get('/')

module.exports = router;

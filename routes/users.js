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
const { sendEmailMessage } = require('../services/nodemailer');
const { v4: uuidv4 } = require('uuid');
const e = require('express');

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
      'language',
      'mailVerified',
      'phoneVerified',
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
    total: 1000000000,
    locked: 0,
    avail: 1000000000,
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
          db['usernoticesettings'].create({
            uid: new_acc.id,
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
        db['usernoticesettings'].create({
          uid: new_acc.id,
        });
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
        db['usernoticesettings'].create({
          uid: new_acc.id,
        });
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
              isRefererBranch: 1,
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
        } else if (referer.isadmin == 3) {
          await db['referrals']
            .create({
              referer_uid: referer.id,
              referral_uid: jtoken.id,
              isRefererBranch: 1,
            })
            .then(async (_) => {
              await db['users'].update(
                {
                  isbranch: 2,
                },
                {
                  where: {
                    id: jtoken.id,
                  },
                }
              );
            });
        } else if (referer.isadmin == 2) {
          await db['referrals'].create({
            referer_uid: referer.id,
            referral_uid: jtoken.id,
            isRefererBranch: 0,
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

    if (findUser.active === 0) {
      resperr(res, 'ACCESS-NOT-ALLOWED');
      return;
    }
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
    let emailChk = await db['users'].findOne({
      where: { email: email },
      raw: true,
    });

    if (emailChk && emailChk.active === 0) {
      resperr(res, 'ACCESS-NOT-ALLOWED');
      return;
    }
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
    if (phoneChk && phoneChk?.active === 0) {
      resperr(res, 'ACCESS-NOT-ALLOWED');
      return;
    }
    /**    if (!phoneChk) {
      resperr(res, 'PHONE-NUMBER-DOESNT-EXIST');
      return;
    } */
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

router.get('/notice/setting', auth, async (req, res) => {
  let { id } = req.decoded;
  await db['usernoticesettings']
    .findOne({
      where: { uid: id },
      raw: true,
    })
    .then((resp) => {
      respok(res, null, null, { resp });
    });
});

router.patch('/notice/set/:field/:val', auth, async (req, res) => {
  let { id } = req.decoded;
  let { field, val } = req.query;
  let jfilter = {};
  jfilter[field] = val;
  await db['usernoticesettings']
    .update({ ...jfilter }, { where: { uid: id } })
    .then((resp) => respok(res, 'CHANGED'));
});

router.patch('/change/password/:type', async (req, res) => {
  let { type } = req.params;
  let { password, confirmPassword, email, countryNum, phone } = req.body;

  if (password !== confirmPassword) {
    resperr(res, 'The password you entered does not match.');
  }
  let user;
  if (type === 'email') {
    user = await db['users'].findOne({
      where: { email: email },
      raw: true,
    });
    db['users']
      .update({ password: password }, { where: { id: user.id } })
      .then((resp) => {
        respok(res, 'successfully changed');
      });
  }
  if (type === 'phone') {
    user = await db['users'].findOne({
      where: { countryNum: countryNum, phone: phone },
      raw: true,
    });
    db['users']
      .update({ password: password }, { where: { id: user.id } })
      .then((resp) => {
        respok(res, 'successfully changed');
      });
  }
});

router.post('/reset/password/:type', async (req, res) => {
  let { type } = req.params;
  let { email, countryNum, phone } = req.body;
  const randNum = '' + Math.floor(100000 + Math.random() * 900000);
  const timenow = moment().unix();
  let expiry = moment().add(10, 'minute').unix();
  if (type === 'email') {
    let user = await db['users']
      .findOne({ where: { email: email }, raw: true })
      .then((resp) => {
        if (!resp) {
          resperr(res, 'NOT_EXIST_USER');
        } else {
          return resp;
        }
      });
    await sendEmailMessage(email, randNum);
    await db['verifycode']
      .create({
        uid: user.id,
        code: randNum,
        type: 'email',
        email: email,
        expiry,
      })
      .then((_) => {
        respok(res, 'SENT');
      });
  } else if (type === 'phone') {
    let user = await db['users']
      .findOne({ where: { countryNum: countryNum, phone: phone }, raw: true })
      .then((resp) => {
        if (!resp) {
          resperr(res, 'NOT_EXIST_USER');
        } else {
          return resp;
        }
      });
    await sendMessage(countryNum + phone, randNum);
    await db['verifycode']
      .create({
        uid: id,
        code: randNum,
        type: 'phone',
        countryNum: countryNum,
        phone: phone,
        expiry,
      })
      .then((_) => {
        respok(res, 'SENT');
      });
  }
});

router.post('/reset/verify/:type/:code', async (req, res) => {
  let timenow = moment().unix();
  let { type, code } = req.params;

  if (type === 'email') {
    await db['verifycode']
      .findOne({
        where: { code, type: 'email' },
        raw: true,
      })
      .then(async (resp) => {
        if (!resp) {
          resperr(res, 'INVALID_CODE');
        } else {
          if (resp.expiry < timenow) {
            resperr(res, 'CODE_EXPIRED');
          } else {
            respok(res, 'VALID_CODE');
          }
        }
      });
  } else if (type === 'phone') {
    await db['verifycode']
      .findOne({
        where: { code, type: 'phone' },
        raw: true,
      })
      .then(async (resp) => {
        if (!resp) {
          resperr(res, 'INVALID_CODE');
        } else {
          if (resp.expiry < timenow) {
            resperr(res, 'CODE_EXPIRED');
          } else {
            respok(res, 'VALID_CODE');
          }
        }
      });
  }
});

router.post('/send/verification/:type', auth, async (req, res) => {
  let { type } = req.params;
  let { id } = req.decoded;
  let { phone, email, countryNum } = req.body;
  const randNum = '' + Math.floor(100000 + Math.random() * 900000);
  const timenow = moment().unix();
  let expiry = moment().add(10, 'minute').unix();
  if (type === 'phone') {
    //PHONE
    console.log(countryNum + phone, randNum);
    let a = await sendMessage(countryNum + phone, randNum);
    await db['verifycode']
      .create({
        uid: id,
        code: randNum,
        type: 'phone',
        countryNum: countryNum,
        phone: phone,
        expiry,
      })
      .then((_) => {
        respok(res, 'SENT');
      });
  } else if (type === 'email') {
    //mail
    await sendEmailMessage(email, randNum);
    await db['verifycode']
      .create({
        uid: id,
        code: randNum,
        type: 'email',
        email: email,
        expiry,
      })
      .then((_) => {
        respok(res, 'SENT');
      });
  }
});

router.post('/verify/:type/:code', auth, async (req, res) => {
  let timenow = moment().unix();
  let jwttoken;
  let { id } = req.decoded;
  let { type, code } = req.params;

  if (type === 'email') {
    await db['verifycode']
      .findOne({
        where: { code, type: 'email' },
        raw: true,
      })
      .then(async (resp) => {
        if (!resp) {
          resperr(res, 'INVALID_CODE');
        } else {
          if (resp.expiry < timenow) {
            resperr(res, 'CODE_EXPIRED');
          } else {
            await db['users']
              .update({ mailVerified: 1, email: resp.email }, { where: { id } })
              .then(async (respdata) => {
                jwttoken = await createJWT({ id, email: resp.email });
              });

            respok(res, 'VALID_CODE', null, { result: jwttoken });
          }
        }
      });
  } else if (type === 'phone') {
    await db['verifycode']
      .findOne({
        where: { code, type: 'phone' },
        raw: true,
      })
      .then(async (resp) => {
        if (!resp) {
          resperr(res, 'INVALID_CODE');
        } else {
          if (resp.expiry < timenow) {
            resperr(res, 'CODE_EXPIRED');
          } else {
            await db['users']
              .update(
                {
                  phoneVerified: 1,
                  phone: resp.phone,
                  countryNum: resp.countryNum,
                },
                { where: { id } }
              )
              .then(async (respdata) => {
                // console.log(resp);
                jwttoken = await createJWT({
                  id,
                  phone: resp.phone,
                  countryNum: resp.countryNum,
                });
              });

            respok(res, 'VALID_CODE', null, { result: jwttoken });
          }
        }
      });
  }
});

router.get('/my/position', auth, async (req, res) => {
  let { id } = req.decoded;
  let date0 = moment().startOf('days').unix();
  let date1 = moment().endOf('days').unix();
  let start = moment().startOf('days');
  let end = moment().endOf('days');

  let id = 114;


  // let { id } = req.decoded;
  // if (Number.isFinite(+id)) {
  // } else {
  //   resperr(res, 'PLEASE-LOGIN');
  //   return;
  // }

  let result = {};
  let today_betamount;
  let today_lose_amount;
  let today_win_amount;

  // await db['']
  let promises = [];

  // let userLevel = ['Bronze', 'Silver', 'Gold', 'Diamond'];
  await db['users']
    .findOne({
      where: { id },
      raw: true,
    })
    .then(async (resp) => {
      result['firstName'] = resp.firstname;
      result['lastName'] = resp.lastname;
      result['level'] = resp.level;
      if (resp.isadmin === 0) {
        await db['feesettings']
          .findOne({
            where: { key_: `FEE_TO_REFERER_${I_LEVEL[resp.level]}` },
            raw: true,
          })
          .then((resp) => {
            result['cashback'] = resp.value_ / 100;
          });
      } else if (resp.isadmin === 1 || resp.isadmin === 3) {
        await db['feesettings']
          .findOne({
            where: { key_: 'FEE_TO_BRANCH' },
            raw: true,
          })
          .then((resp) => {
            result['cashback'] = resp.value_ / 100;
          });
      } else if (resp.isadmin === 2) {
        await db['feesettings']
          .findOne({
            where: { key_: 'FEE_TO_ADMIN' },
            raw: true,
          })
          .then((resp) => {
            result['cashback'] = resp.value_ / 100;
          });
      }
    });


  await db['balances']
    .findOne({
      where: { uid: id, typestr: 'LIVE' },
      raw: true,
    })
    .then((resp) => {
      let { total, avail, locked } = resp;
      result['total'] = (total / 10 ** 6).toFixed(2);
      result['safeBalance'] = (avail / 10 ** 6).toFixed(2);
    });
    
  await db['betlogs']
    .findAll({
      where: {
        uid: id,
        expiry: { [Op.gte]: date0, [Op.lte]: date1 },
        type: 'LIVE',
      },
      raw: true,
    })
    .then((resp) => {
      let today_betamount = 0;
      let today_lose_amount = 0;
      let today_win_amount = 0;

      resp.forEach((bet) => {
        let { status, amount } = bet;
        amount = amount / 10 ** 6;
        today_betamount += amount;
        if (status === 0) {
          today_lose_amount += amount;
        } else if (status === 1) {
          today_win_amount += amount;
        }
      });

      result['today_betamount'] = today_betamount;
      result['today_lose_amount'] = today_lose_amount;
      result['today_win_amount'] = today_win_amount;
      if (today_betamount === 0) {
        result['profit_today'] = 0;
      } else {
        result['profit_today'] = (
          (today_win_amount / today_betamount) *
          100
        ).toFixed(2);
      }
    });

  await db['betlogs']
    .findAll({
      where: { uid: id, type: 'LIVE' },
      raw: true,
    })
    .then(async (resp) => {
      let total_bet_count = 0;
      let total_betamount = 0;
      let total_lose_amount = 0;
      let total_win_amount = 0;

      let min_trade_amount = 0;
      let max_trade_amount = 0;
      let max_trade_profit = 0;
      let max_profit = 0;
      let win_count = 0;

      let total_feeamount = 0;
      await db['logfees']
        .findAll({
          where: { payer_uid: id },
          raw: true,
          attributes: [
            [db.Sequelize.fn('SUM', db.Sequelize.col('feeamount')), 'sum'],
          ],
        })
        .then((resp) => {
          let [{ sum }] = resp;
          total_feeamount = sum / 10 ** 6;
        });

      resp.forEach((bet, i) => {
        let { status, amount, diffRate } = bet;
        amount = amount / 10 ** 6;
        total_bet_count += 1;
        // 최대 베팅금
        if (amount > max_trade_amount) {
          max_trade_amount = amount;
        }
        //최소 베팅금
        if (i === 0 || amount < min_trade_amount) {
          min_trade_amount = amount;
        }

        //최대 수익
        if (
          status === 1 &&
          max_profit < ((amount * diffRate) / 100).toFixed(2)
        ) {
          max_profit = ((amount * diffRate) / 100).toFixed(2);
        }


        total_betamount += amount;

        if (status === 0) {
          total_lose_amount += amount;
        } else if (status === 1) {
          win_count += 1;
          total_win_amount += amount;
        }
      });

      result['deal'] = total_bet_count;
      result['trading_turnover'] = total_betamount;
      // result['total_lose_amount'] = total_lose_amount;
      result['total_win_amount'] = total_win_amount;
      result['total_profit'] = (
        (total_win_amount / total_betamount) *
        100
      ).toFixed(2);

      result['max_trade_amount'] = max_trade_amount;
      result['min_trade_amount'] = min_trade_amount;
      result['max_profit'] = max_profit;
      result['net_turnover'] = (total_win_amount - total_feeamount).toFixed(2);
      result['hedged_trades'] = total_lose_amount;
      result['average_profit'] = (total_win_amount / win_count).toFixed(2);
    });

  await Promise.all(promises);

  respok(res, null, null, { result });
});

router.get('/balance', auth, async (req, res) => {
  let { type } = req.params;
  let id;
  if (req.decoded.id) {
    id = req.decoded.id;
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
  } else {
    let uuid = req.decoded.demo_uuid;
    db['balances']
      .findAll({
        where: {
          uuid,
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
  }
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
      respdata.rows.map((el) => {
        let { amount, localeAmount } = el;
        amount = amount / 10 ** 6;
        localeAmount = localeAmount / 10 ** 6;
        el['amount'] = amount;
        el['localeAmount'] = localeAmount;
      });
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
const KEYS = Object.keys;
const ISFINITE = Number.isFinite;
router.put('/my/info', auth, async (req, res) => {
  let { firstname, lastname, password, language, nickname } = req.body; // , profileimage
  if (KEYS(req.body).length) {
  } else {
    resperr(res, 'REQ-BODY-EMPTY');
    return;
  }
  let { id } = req.decoded;
  if (ISFINITE(+id)) {
  } else {
    resperr(res, 'PLEASE-LOGIN', 58818);
    return;
  }
  delete req.body['id'];
  delete req.body['referercode'];
  delete req.body['uuid'];
  delete req.body['isadmin'];
  delete req.body['isbranch'];
  delete req.body['mailVerified'];
  delete req.body['phoneVerified'];
  delete req.body['active'];

  db['users'].update({ ...req.body }, { where: { id } }).then((resp) => {
    respok(res, 'CHANGED');
  });
});
router.patch('/profile', auth, async (req, res) => {
  let { firstName, lastName, email, password } = req.body;
  let { id } = req.decoded;
  let jwttoken;
  db['users']
    .update(
      {
        firstname: firstName,
        lastname: lastName,
        password: password,
      },
      {
        where: {
          id,
        },
      }
    )
    .then(async (_) => {
      jwttoken = await createJWT({
        id,
        firstname: firstName,
        lastname: lastName,
      });
      respok(res, 'CHANGED', null, { jwttoken });
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

router.get(
  '/myreferrals/:offset/:limit/:orderkey/:orderval', // logfees
  auth,
  async (req, res) => {
    // /:offset/:limit/:orderkey/:orderval
    let { id } = req.decoded;
    let { offset, limit, orderkey, orderval } = req.params;
    offset = +offset;
    limit = +limit;
    // id = 99;
    await db['referrals']
      .findAndCountAll({
        where: { referer_uid: id },
        order: [[orderkey, orderval]],
        offset,
        limit,
        raw: true,
      })
      .then(async (resp) => {
        console.log(resp);
        let { rows, count } = resp;
        let promises = rows.map(async (v) => {
          let { referral_uid, createdat } = v;
          let referral_user = await db['users'].findOne({
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
          let received = await db['logfees']
            .findAll({
              where: {
                recipient_uid: id,
                payer_uid: referral_uid,
              },
              raw: true,
              attributes: [
                [db.Sequelize.fn('SUM', db.Sequelize.col('feeamount')), 'sum'],
              ],
            })
            .then((resp) => {
              let [{ sum }] = resp;
              sum = sum / 10 ** 6;
              return sum;
            });

          let trade_amount =
            referral_user_trade_amount[0].trade_amount === null
              ? 0
              : referral_user_trade_amount[0].trade_amount / 10 ** 6;
          let profit =
            referral_user_bet_profit[0].profit === null
              ? 0
              : referral_user_bet_profit[0].profit / 10 ** 6;
          let referral_user_profit_percent = (
            (profit / trade_amount) *
            100
          ).toFixed(2);
          let profit_percent =
            referral_user_profit_percent === 'NaN'
              ? 0
              : referral_user_profit_percent;
          v['referral_user'] = referral_user;
          v['trade_amount'] = trade_amount;
          v['profit'] = profit;
          v['profit_percent'] = profit_percent;
          v['received'] = received.toFixed(2);
        });
        await Promise.all(promises);
        respok(res, null, null, { resp });
      });
  }
);

router.get(
  '/myreferrals/fee/log/:offset/:limit/:orderkey/:orderval', // logfees
  // '/myreferrals/fee/log/:uid',
  auth,
  async (req, res) => {
    let { id } = req.decoded;
    let { limit, offset, orderkey, orderval } = req.params;
    offset = +offset;
    limit = +limit;

    await db['logfees']
      .findAndCountAll({
        where: { recipient_uid: id, typestr: 'FEE_TO_REFERER' },
        offset,
        limit,
        raw: true,
      })
      .then(async (resp) => {
        let { rows, count } = resp;
        let promises = rows.map(async (el) => {
          let { id: ID, feeamount, betamount, payer_uid } = el;
          console.log('feeamount', ID, feeamount);
          await db['users']
            .findOne({
              where: { id: payer_uid },
              raw: true,
            })
            .then((resp) => {
              el['payer_info'] = resp;
            });
          await db['users']
            .findOne({
              where: { id },
              raw: true,
            })
            .then(async (resp) => {
              let { level } = resp;
              let { value_ } = await db['feesettings'].findOne({
                where: { key_: `FEE_TO_REFERER_${I_LEVEL[level]}` },
                raw: true,
              });
              el['profit'] = (feeamount / 10 ** 6 / (value_ / 10000)).toFixed(
                2
              );
              el['cashback_percent'] = value_ / 100;
            });
          el['feeamount'] = (feeamount / 10 ** 6).toFixed(2);
          el['betamount'] = betamount / 10 ** 6;

          return el;
        });
        await Promise.all(promises);
        respok(res, null, null, { resp });
      });
    // await db['referrals']
    //   .findAndCountAll({
    //     where: { referer_uid: id },
    //     order: [[orderkey, orderval]],
    //     raw: true,
    //   })
    //   .then(async (resp) => {
    //     console.log(resp);
    //     let data = [];
    //     let promises = resp.rows.map(async (v) => {
    //       let { referral_uid } = v;
    //       // let referral_user = await db['users'].findOne({
    //       //   where: {id: referral_uid},
    //       //   raw: true
    //       // })
    //       let referral_user_logfee = await db['log fees'].findAndCountAll({
    //         where: { payer_uid: referral_uid, recipient_uid: id },
    //         offset,
    //         limit,
    //         raw: true,
    //       }).then((resp) => {
    //         let {rows, count} = resp;

    //       });
    //       // let cashback_percent = await db['users']
    //       //   .findOne({
    //       //     where: { id: referral_uid },
    //       //     raw: true,
    //       //   })
    //       //   .then(async (resp) => {
    //       //     let level = I_LEVEL[resp.level];
    //       //     return await db['feesettings']
    //       //       .findOne({
    //       //         where: { key_: `FEE_TO_REFERER_${level}` },
    //       //         raw: true,
    //       //       })
    //       //       .then((resp) => {
    //       //         return +resp.value_ / 100;
    //       //       });
    //       //   });
    //       // if (referral_user_logfee.length !== 0) {
    //       //   data.push({ referral_user_logfee, cashback_percent });
    //       // }
    //     });
    //     await Promise.all(promises);
    //     respok(res, null, null, { data });
    //   });
  }
);
router.get(
  '/branch/:offset/:limit/:orderkey/:orderval',
  auth,
  async (req, res) => {
    let { offset, limit, orderkey, orderval } = req.params;
    let { id } = req.decoded;
    offset = +offset;
    limit = +limit;

    db['referrals']
      .findAndCountAll({
        where: {
          referer_uid: id,
        },
        raw: true,
        offset,
        limit,
        order: [[orderkey, orderval]],
      })
      .then(async (resp) => {
        let { rows, count } = resp;
        let promises = rows.map(async (v) => {
          let { referral_uid, createdat } = v;
          await db['users']
            .findOne({
              where: { id: referral_uid },
              raw: true,
            })
            .then((resp) => {
              v['referral_user'] = resp;
            });
          await db['users']
            .findOne({
              where: { id },
              raw: true,
            })
            .then((resp) => {
              v['recommender'] = resp;
            });

          await db['transactions']
            .findAll({
              where: { uid: referral_uid, typestr: 'WITHDRAW' },
              attributes: [
                [db.Sequelize.fn('SUM', db.Sequelize.col('amount')), 'sum'],
              ],
              raw: true,
            })
            .then((resp) => {
              if (resp) {
                let [{ sum }] = resp;
                v['total_withdraw_amount'] = sum / 10 ** 6;
              } else {
                v['total_withdraw_amount'] = 0;
              }
            });
          await db['transactions']
            .findAll({
              where: { uid: referral_uid, typestr: 'DEPOSIT' },
              attributes: [
                [db.Sequelize.fn('SUM', db.Sequelize.col('amount')), 'sum'],
              ],
              raw: true,
            })
            .then((resp) => {
              if (resp) {
                let [{ sum }] = resp;
                v['total_deposit_amount'] = sum / 10 ** 6;
              } else {
                v['total_deposit_amount'] = 0;
              }
            });
          await db['balances']
            .findOne({
              where: { uid: referral_uid, typestr: 'LIVE' },
              raw: true,
            })
            .then((resp) => {
              let possess;
              possess = resp.total / 10 ** 6;
              if (possess % 10 !== 0) {
                possess = possess.toFixed(2);
              }
              // v['possess'] = (resp.total / 10 ** 6).toFixed(2);
              v['possess'] = possess;
            });
          v['trade_amount'] =
            Number(v.total_deposit_amount) + Number(v.total_withdraw_amount);
        });
        await Promise.all(promises);
        respok(res, null, null, { resp });
      });
  }
);

router.get(
  '/branch/fee/log/:offset/:limit/:orderkey/:orderval', // logfees
  auth,
  async (req, res) => {
    let { offset, limit, orderkey, orderval } = req.params;
    let { id } = req.decoded;
    let { searchkey, startDate, endDate } = req.query;
    let jfilter = {};
    let jfilter2 = {};
    offset = +offset;
    limit = +limit;
    if (startDate) {
      jfilter = {
        ...jfilter,
        createdat: {
          [Op.gte]: moment(startDate).format('YYYY-MM-DD HH:mm:ss'),
        },
      };
    }
    if (endDate) {
      jfilter = {
        ...jfilter,
        createdat: {
          [Op.lte]: moment(endDate).format('YYYY-MM-DD HH:mm:ss'),
        },
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
    let userList = [];
    if (searchkey) {
      await db['users']
        .findAll({
          where: {
            email: {
              [Op.like]: `%${searchkey}%`,
            },
          },
          raw: true,
        })
        .then((resp) => {
          resp.map((user) => {
            let { id } = user;
            userList.push(id);
          });
        });
      jfilter = {
        ...jfilter,
        payer_uid: { [Op.in]: userList },
      };
    }
    db['logfees']
      .findAndCountAll({
        where: { ...jfilter, recipient_uid: id },
        raw: true,
        offset,
        limit,
        order: [[orderkey, orderval]],
      })
      .then(async (resp) => {
        let { rows, count } = resp;
        let promises = rows.map(async (el) => {
          let { payer_uid, assetId, feeamount, betamount } = el;
          await db['users']
            .findOne({
              where: { id: payer_uid },
              raw: true,
            })
            .then((resp) => {
              let { id } = resp;
              el['referral_user'] = resp;
            });
          // await db['users'].findOne({
          //   where: {id},
          //   raw: true,
          // }).then((resp) => {
          //   el['referer_user'] = resp
          // })
          let fee_percent;
          await db['feesettings']
            .findOne({
              where: { key_: 'FEE_TO_BRANCH' },
              raw: true,
            })
            .then((resp) => {
              fee_percent = resp.value_ / 10000;
              el['received_percent'] = resp.value_ / 100;
            });
          await db['assets']
            .findOne({
              where: { id: assetId },
              raw: true,
            })
            .then((resp) => {
              el['assets'] = resp;
            });
          el['received_amount'] = (feeamount / 10 ** 6).toFixed(2);

          el['using'] = (betamount / 10 ** 6).toFixed(2);
          el['profit'] = (feeamount / 10 ** 6 / fee_percent).toFixed(2);
        });
        await Promise.all(promises);
        respok(res, null, null, { resp });
      });
  }
);

router.get('/my/fee/setting', auth, async (req, res) => {
  let { id } = req.decoded;

  let user = await db['users'].findOne({
    where: { id },
    raw: true,
  });

  await db['referrals']
    .findAll({
      where: { referral_uid: id },
      raw: true,
    })
    .then((resp) => {
      resp.map((el) => {
        let { referer_uid, isRefererBranch } = el;
      });
    });
});

// router.get('/')

module.exports = router;

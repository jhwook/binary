var express = require("express");
const requestIp = require("request-ip");
let { respok, resperr } = require("../utils/rest");
const { getobjtype } = require("../utils/common");
const jwt = require('jsonwebtoken');
const { auth } = require('../utils/authMiddleware');
const db = require('../models')
const { lookup } = require('geoip-lite');
var crypto = require('crypto');
const LOGGER = console.log;
let { Op }=db.Sequelize

var router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const { sendMessage } = require("../services/twilio")

async function generateRefCode(uid, i = 0) {
  let code = String(crypto.createHash('md5').update(uid).digest("hex")).slice(i, i + 10);
  console.log(code)
  let findOne = await db['users'].findOne({ where: { referercode: code } })
  if (findOne) {
    console.log(i)
    return generateRefCode(uid, ++i)
  } else {
    return code
  }
}

async function verify(token) {

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  console.log(process.env.GOOGLE_CLIENT_ID)
  const payload = ticket.getPayload();
  return payload
}

async function createJWT(jfilter) {
  console.log(process.env.JWT_SECRET)
  console.log(jfilter);

  let userinfo = await db['users'].findOne({
    where: {
      ...jfilter
    },
    attributes: ['id', 'firstname', 'lastname', 'email', 'phone', 'level', 'referercode', 'isadmin', 'isbranch', 'profileimage', 'countryNum'],
    raw: true
  })
  console.log(userinfo)
  if (!userinfo) { return false }
  let token = jwt.sign({
    type: 'JWT',
    ...userinfo,


  },
    process.env.JWT_SECRET,
    {
      expiresIn: '24h',
      issuer: 'EXPRESS'
    });
  return {
    tokenId: token,
    ...userinfo,
  };
}

// router.get('/:token', async (req, res)=>{
//   let {token} =req.params;
//   //let respond = await verify(token)
//   db['balances'].create({
//     uid: token
//   }).then(x=>{
//     console.log(x.id);
//     respok(res, x.id)
//   })
//   respok(res, respond)
// })
/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/auth", auth, async (req, res) => {
  //console.log("asdfasd", req.decoded)
  respok(res, 'AUTH', null, { result: req.decoded})
})

router.get("/refresh", auth, async(req, res)=>{
  let {id} = req.decoded;
  let jwt = createJWT({id})
  respok(res, 'REFRESHED', null, { tokenId: jwt })
})

router.patch("/edit/:type", auth, async (req, res) => {
  let{type}=req.params;
  let { refcode, firstname, lastname, } = req.body;
  let { id } = req.decoded;
  console.log(req.decoded)
  if (type == 'ref') {
    let refUser = await db['users'].findOne({ where: { referercode: refcode } })
    if(!refUser){resperr(res, 'REFERER-NOT-FOUND'); return;}
    db['referrals'].create({
      referer_uid: refUser.id,
      referral_uid: id
    })
      .then(async _ => {
        if (refUser.isadmin == 1) {
          await db['users'].update({
            isbranch: 1
          }, {
            where: { id }
          })
        }
        let _jtoken = await createJWT({id})
        respok(res, 'EDITED', null, {result: _jtoken})
        return;
      })
  } else if (type == 'userinfo') {
    db['users'].update({
      firstname,
      lastname
    }).then(_ => {
      respok(res, 'EDITED');
      return;
    })
  } else if (type == 'email') {

  } else if (type == 'phone') {

  }
})

router.get("/refchk", auth, async (req, res) => {
  let { id } = req.decoded;

  let ref = await db['referrals'].findOne({ where: { referral_uid: id } });

  if (ref) {
    resperr(res, 'ALREADY-REGISTERED');
    return;
  } else {
    respok(res, 'REF-REQUIRED');
    return;
  }
})
/**
 * REGISTER ENDPOINT
 */
router.post("/signup/:type", async (req, res) => {
  let { type } = req.params;
  let { countryNum, phone, password, email, token, refcode } = req.body;
  let jwttoken;

  /////////////////////////////////////////////// PRE CHECK ///////////////////////////////////////////////
  if (refcode) {
    let referer = await db['users'].findOne({ where: { referercode: refcode }, raw: true })
    if (referer) {
    } else {
      resperr(res, 'INVALID-CODE');
      return;
    }
  }
  /////////////////////////////////////////////// GOOGLE LOGIN REGISTER /////////////////////////////////////////////// 
  if (type == 'google') {                   //GOOGLE-LOGIN
    if (!token) { resperr(res, 'INVALID-DATA'); return; }
    let respond = await verify(token)
    let { email, given_name, family_name, picture, email_verified, sub } = respond;
    if (!email || !email_verified) { resperr(res, 'WRONG-TOKEN'); return; }
    let findUser = await db['users'].findOne({ where: { email: email }, raw: true })
    if (findUser) {
      if (findUser.oauth_type == 0) {
        //respok and lead to login
        jwttoken = createJWT({ oauth_id: findUser.oauth_id });

      } else {
        //resperr failed
        resperr(res, 'CREATED-NON-GOOGLE-ACCOUNT');
        return;
      }
    } else {          // ACCOUNT DOES NOT EXIST

      db['users'].create({
        email: email,
        firstname: given_name,
        lastname: family_name,
        oauth_type: 0,
        oauth_id: sub,
        profileimage: picture
      })
        .then(async (new_acc) => {
          let refcodegen = await generateRefCode("" + new_acc.id)
          await db['users'].update({
            referercode: String(refcodegen)
          }, {
            where: { id: new_acc.id }
          })
          //respok and lead to login
          db['balances'].bulkCreate([{
            uid: new_acc.id,
            typestr: 'DEMO'
          }, {
            uid: new_acc.id,
            typestr: 'LIVE'
          }])
            .then(async _ => {
              //TOKEN GENERATE
              jwttoken = createJWT({ id: new_acc.id });
            })
        })
    }
    /////////////////////////////////////////////// EMAIL REGISTER /////////////////////////////////////////////// 
  } else if (type == 'email') {                    //EMAIL LOGIN
    if (!email || !password) { resperr(res, 'INVALID-DATA'); return; }
    let respond = await db['users'].findOne({ where: { email: email.toLowerCase() } });
    if (respond) { resperr(res, 'EMAIL-EXIST'); return; }
    await db['users'].create({
      email: email.toLowerCase(),
      password
    })
      .then(async (new_acc) => {
        let refcodegen = await generateRefCode("" + new_acc.id)
        console.log(refcodegen)
        await db['users'].update({
          referercode: String(refcodegen)
        }, {
          where: { id: new_acc.id }
        })
        db['balances'].bulkCreate([{
          uid: new_acc.id,
          typestr: 'DEMO'
        }, {
          uid: new_acc.id,
          typestr: 'LIVE'
        }])


      })
    //TOKEN GENERATE
    jwttoken = createJWT({ email: email.toLowerCase(), password })

  } else if (type == 'phone') {                    // MOBILE LOGIN
    if (!phone || !password || !countryNum) { resperr(res, 'INVALID-DATA'); return; }
    let respond = await db['users'].findOne({ where: { phone: phone, countryNum: countryNum } });
    if (respond) { resperr(res, 'PHONE-EXIST'); return; }
    await db['users'].create({
      phone: phone,
      countryNum: countryNum,
      password
    })
      .then(async (new_acc) => {
        let refcodegen = await generateRefCode("" + new_acc.id)
        console.log(refcodegen)
        await db['users'].update({
          referercode: String(refcodegen)
        }, {
          where: { id: new_acc.id }
        })
        db['balances'].bulkCreate([{
          uid: new_acc.id,
          typestr: 'DEMO'
        }, {
          uid: new_acc.id,
          typestr: 'LIVE'
        }])


      })
    //TOKEN GENERATE
    jwttoken = createJWT({ phone, countryNum, password })

  } else {
    resperr(res, 'INVALID-LOGIN-TYPE'); return;
  }

  console.log("asdfasdf", await jwttoken)
  let jtoken = await jwttoken;
  if (jtoken) {
    if (refcode) {
      let referer = await db['users'].findOne({ where: { referercode: refcode }, raw: true })
      if (referer) {
        if (referer.isadmin == 1){
          await db['referrals'].create({
            referer_uid: referer.id,
            referral_uid: jtoken.id,
            
          })
          .then(async _=>{
            await db['users'].update({
              isbranch: 1
            },{
              where:{
                id: jtoken.id
              }
            })
          })
        }else{
          await db['referrals'].create({
            referer_uid: referer.id,
            referral_uid: jtoken.id
          })
      }
      } else {
        resperr(res, 'INVALID-CODE');
        return;
      }
    }
    _jtoken = await createJWT({ id: jtoken.id })
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

router.post("/login/:type", async (req, res) => {
  let { type } = req.params;
  let { countryNum, phone, password, email, user, token } = req.body;
  let { browser, os, platform } = req.useragent;
  let jwttoken;
  let isFirstSocial = false;
  /////////////////////////////////////////////// GOOGLE LOGIN /////////////////////////////////////////////// 
  if (type == 'google') {
    if (!token) { resperr(res, 'INVALID-DATA'); return; }
    let respond = await verify(token)
    let { email, given_name, family_name, picture, email_verified, sub } = respond;
    if (!email || !email_verified) { resperr(res, 'WRONG-TOKEN'); return; }
    let findUser = await db['users'].findOne({ where: { email: email }, raw: true })
    if (findUser) {
      if (findUser.oauth_type == 0) {
        //respok and lead to login
        jwttoken = createJWT({ oauth_id: findUser.oauth_id });
      } else {
        //resperr failed
        resperr(res, 'CREATED-NON-GOOGLE-ACCOUNT');
        return;
      }
    } else {          // ACCOUNT DOES NOT EXIST AND CREATE NEW ONE
      isFirstSocial = true;
      await db['users'].create({
        email: email,
        firstname: given_name,
        lastname: family_name,
        oauth_type: 0,
        oauth_id: sub,
        profileimage: picture,
      })
        .then(async (new_acc) => {
          let refcodegen = await generateRefCode("" + new_acc.id)
          await db['users'].update({
            referercode: refcodegen
          }, {
            where: { id: new_acc.id }
          })
          //respok and lead to login
          await db['balances'].bulkCreate([{
            uid: new_acc.id,
            typestr: 'DEMO'
          }, {
            uid: new_acc.id,
            typestr: 'LIVE'
          }])
            .then(async _ => {
              //TOKEN GENERATE

            })
          jwttoken = createJWT({ oauth_id: sub });
        })
    }
    /////////////////////////////////////////////// EMAIL LOGIN /////////////////////////////////////////////// 
  } else if (type == 'email') {
    if (!email || !password) { resperr(res, 'INVALID-DATA'); return; }
    let emailChk = await db['users'].findOne({ where: { email: email.toLowerCase() } })
    if (!emailChk) { resperr(res, 'EMAIL-DOESNT-EXIST'); return; }
    jwttoken = createJWT({ email: email.toLowerCase(), password })
    /////////////////////////////////////////////// PHONE LOGIN /////////////////////////////////////////////// 
  } else if (type == 'phone') {
    if (!phone || !password || !countryNum) { resperr(res, 'INVALID-DATA'); return; }
    let phoneChk = await db['users'].findOne({ where: { phone, countryNum, password } })
    if (!phoneChk) { resperr(res, 'EMAIL-DOESNT-EXIST'); return; }
    jwttoken = createJWT({ phone, password })
  } else {
    resperr(res, 'INVALID-LOGIN-TYPE');
    return;
  }
  /////////////////////////////////////////////// GENERAL LOGIN ///////////////////////////////////////////////
  let jtoken = await jwttoken;
  if (jtoken) {
    console.log(await jwttoken)
    let ref = await db['referrals'].findOne({ where: { referral_uid: jtoken.id } });
    if (ref) {
      ref = true
    } else {
      ref = false;
    }
    let ipaddr = requestIp.getClientIp(req).replace('::ffff:', '')
    let ipinfo = lookup(ipaddr)
    await db['loginhistories'].create({
      uid: jtoken.id,
      ipaddress: ipaddr,
      deviceos: platform + " / " + os,
      browser: browser,
      country: ipinfo.country,
      status: ipinfo.city

    })

    respok(res, 'TOKEN_CREATED', null, { result: jtoken, ref, isFirstSocial });
    return;
  } else {
    resperr(res, 'USER-NOT-FOUND');
    return;
  }




  // let jwttoken = createJWT(userinfo)

  // respok(res, 'TOKEN_CREATED', null, {token: jwttoken})
})

router.post("/send/verification/:type", auth, async(req, res)=>{
  let {type} = req.params;
  let {id} = req.decoded;
  let {phone, email, countryNum} = req.body;
  const randNum = ""+Math.floor(100000 + Math.random() * 900000);
  if (type == 0){ //PHONE
    let a = await sendMessage(countryNum+phone, randNum);
    await db['verifycode'].create({
      uid: id,
      code: randNum
    })
    .then(_=>{
      respok(res, 'SENT')
    })
  }else if(type == 1){ //mail

  }
  
})

router.get("/verify/:type/:code", async (req, res) => {
  let { type, code } = req.params;
  if (type == 'email') {

  } else if (type == 'phone') {

  }
})

router.get("/balance", auth, async (req, res) => {
  let { type } = req.params;
  let { id } = req.decoded;
  db['balances'].findAll({
    where: {
      uid: id,
    }
  }).then(result => {
    let respdata = {};
    result.map(v => {
      respdata[v.typestr] = {
        total: v.total,
        avail: v.avail,
        locked: v.locked
      }
    })
    respok(res, null, null, { respdata })
  })
})

router.get("/query/:tblname/:offset/:limit", auth, (req, res)=>{
  let {tblname, offset, limit} = req.params;
  let {key, val} = req.query;
  let {id} = req.decoded;
  let jfilter={}
  if(key && val){
    jfilter[key]=val
    if(val=='DEPOSIT'){
      jfilter[key]={[Op.or]:['DEPOSIT', 'LOCALEDEPOSIT']}
    }
  }

  db[tblname].findAndCountAll({
    where:{
      uid: id,
      ...jfilter
    },
    offset: parseInt(+offset),
    limit: parseInt(+limit),
    order:[["id", 'DESC']]
  })
  .then(respdata=>{
    respok(res, null, null, {respdata})
  })
})

router.patch("/profile", auth, async (req, res)=>{
  let { firstName, lastName, email } = req.body;
  let {id} = req.decoded;
  db['users'].update({
    firstname: firstName,
    lastname, lastName
  },{
    where:{
      id
    }
  })
  .then(_=>{
    respok(res, 'CHANGED')
  })
})

module.exports = router;
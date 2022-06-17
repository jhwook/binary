var express = require("express");
let { respok, resperr } = require("../utils/rest");
const { getobjtype } = require("../utils/common");
const jwt = require('jsonwebtoken');
const { auth } = require('../utils/authMiddleware');
const db = require('../models')
const LOGGER = console.log;
var router = express.Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/auth",auth, async (req, res)=>{
    console.log(req.decoded)
  respok(res, 'AUTH')
})

router.post("/signup/:type", async(req, res)=>{
  let {type} = req.params;
  let {phone, password, email, user} = req.body;
  if(type == 'google'){
    if(!user){resperr(res, 'INVALID-DATA'); return;}

  }else if(type == 'email'){
    if(!email || !password){resperr(res, 'INVALID-DATA'); return;}
    let respond = await db['users'].findOne({where:{email: email.toLowerCase()}});
    if(respond){resperr(res, 'EMAIL-EXIST'); return;}
    await db['users'].create({
        email: email.toLowerCase(),
        password
    })
    .then((resp)=>{
        respok(res, 'created')
        return
    })
    .catch(err=>{
        resperr(res, err)
        return
    })
    console.log(email, password, 'created')

  }else if(type == 'phone'){
    if(!phone || !password){resperr(res, 'INVALID-DATA'); return;}

  }else{
    resperr(res, 'INVALID-LOGIN-TYPE')
  }
})

router.post("/login/:type", async (req, res)=>{
  let {type} = req.params;
  let {phone, password, email, user} = req.body;
  let userinfo;
  if(type == 'google'){
    if(!user){resperr(res, 'INVALID-DATA'); return;}
    let respond = await db['users'].findOne({where:{oauth_type: 0, oauth_id: user.googleId}, raw:true});
    if(respond){
        userinfo = respond;
    }else{
        resperr(res, 'USER-NOT-FOUND');
        return;
    }


  }else if(type == 'email'){
    if(!email || !password){resperr(res, 'INVALID-DATA'); return;}
    let respond = await db['users'].findOne({where:{email: email.toLowerCase(), password}, raw:true});
    if(respond){
        userinfo = respond;
    }else{
        resperr(res, 'USER-NOT-FOUND');
        return;
    }
    

  }else if(type == 'phone'){
    if(!phone || !password){resperr(res, 'INVALID-DATA'); return;}
    let respond = await db['users'].findOne({where:{phone, password}, raw:true});
    if(respond){
        userinfo = respond;
    }else{
        resperr(res, 'USER-NOT-FOUND');
        return;
    }

  }else{
    resperr(res, 'INVALID-LOGIN-TYPE');
     return;
  }
  let token = jwt.sign({
    type: 'JWT',
    ...userinfo
  },
  process.env.JWT_SECRET,
  {
    expiresIn: '24h',
    issuer: 'EXPRESS'
  });

  respok(res, 'TOKEN_CREATED', null, {token})
})

router.get("/verify/:type/:code", async(req, res)=>{
  let {type, code} = req.params;
  if(type =='email'){

  }else if(type == 'phone'){

  }
})

module.exports = router;
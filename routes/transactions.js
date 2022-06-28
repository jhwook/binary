var express = require("express");
let { respok, resperr } = require("../utils/rest");
const jwt = require('jsonwebtoken');
const { softauth, auth } = require('../utils/authMiddleware');
const db = require('../models')
var crypto = require('crypto');
const LOGGER = console.log;
const { withdraw }=require("../services/withdrawal");
const { closeTx } = require("../services/closeTx");
const {watchTransfers} = require('../services/trackTx');

var router = express.Router();

router.get("/", function (req, res, next) {
    res.send("respond with a resource");
});

router.post("/v1/:type", (req, res)=>{

})

router.patch("/demo/fund/:amount", auth, async(req, res)=>{
    let { id } = req.decoded;
    let { amount } = req.params;

    db['balances'].findOne({
        where:{
            uid: id,
            typestr: 'DEMO'
        }
    })
    .then(result=>{
        console.log((+result.total + amount))
        if((+result.total + amount)> 1000000000){
            resperr(res, 'TOO-MUCH-DEMO-BALANCE')
        }else{
            result.increment(['avail', 'total'], {by: amount})
            .then(_=>{
                respok(res, null, null, {total: result.total})
            })
        }
    })
})

router.post("/listen/:type", auth, async(req, res)=>{
    let{type} = req.params;
    let {id, wallet} = req.decoded;
    if(!id){resperr(res, 'USER-NOT-FOUND'); return;}
    watchTransfers(wallet, type, id);
    respok(res,'LISTENING-STARTED')
    
})

router.patch("/live/:type/:amount", auth, async(req, res)=>{
    let { type, amount} = req.params;
    let {rxaddr, txhash, tokentype, senderaddr, name, card, bankCode, bankName} = req.body;
    let { id, isadmin, isbranch } = req.decoded;
    console.log("HELLO")
    if(!id){resperr(res, 'NOT-LOGGED-IN'); return;}
    let balance = await db['balances']
            .findOne({
                where:{
                    typestr: 'LIVE',
                    uid: id
                },
                raw:true
            });
    switch(type){
        case "WITHDRAW":
            console.log(amount)
            console.log(balance)
            if(+amount > +balance.avail){
                console.log("HELLO")
                resperr(res, 'NOT-ENOUGH-BALANCE');
                return;
                break;
            }
            console.log("WITHDRAW ON GOING")
            let {value: ADMINADDR} = await db['settings'].findOne({where:{name: 'ADMINADDR'}})
            let {value: ADMINPK} = await db['settings'].findOne({where:{name: 'ADMINPK'}})
            
            let resp = await withdraw({ tokentype: tokentype, userid: id, amount, rxaddr, adminaddr: ADMINADDR, adminpk: ADMINPK });
            respok(res, null, null, { payload: { resp } });
            
            break;
        case "DEPOSIT":
            if(tokentype=="USDC" || tokentype=="USDT"){
                if(!txhash){resperr(res, 'TXHASH-ISSUE'); return;}
                respok(res, 'SUBMITED')
                closeTx({txhash, type:"DEPOSIT", tokentype: tokentype, userid: id, senderaddr, amount})
            }else{
                
                let referer = await db['referrals'].findOne({
                    where:{
                        referral_uid: id
                    },
                    raw: true
                })
                await db['transactions'].create({
                    uid: id,
                    type: 2,
                    typestr: "LOCALEDEPOSIT",
                    status: 0,
                    target_uid: referer.referer_uid,
                    localeAmount: amount,
                    localeUnit: tokentype,
                    name: name,
                    cardNum: card,
                    bankCode: bankCode,
                    bankName: bankName

                })
                .then(_=>{
                    respok(res, 'SUBMITED')
                })
            }
            
            break;
        case "VERIFY":
            if(!isadmin && !isbranch){resperr(res, 'NOT-AN-ADMIN'); return;};

            respok(res, 'ADMIN-VERIFIED');
            return;
            break;
        default:
            break;
    }
})
  module.exports = router;
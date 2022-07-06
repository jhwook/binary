var express = require("express");
const requestIp = require("request-ip");
let { respok, resperr } = require("../utils/rest");
const { getobjtype } = require("../utils/common");
const jwt = require('jsonwebtoken');
const { auth } = require('../utils/authMiddleware');
const db = require('../models')
const { lookup } = require('geoip-lite');
var moment = require('moment');
const e = require("express");
const LOGGER = console.log;

var router = express.Router();

router.post('/join/:type/:assetId/:amount/:dur/:side', auth, async (req, res)=>{
    //side가 0일 경우 LOW, 1일 경우 HIGH로 취급한다.
    
    let { assetId, amount, dur, side, type } = req.params;
    let { id } = req.decoded;
    if(!assetId || !amount || !type ){resperr(res, 'INVALID-DATA'); return;}
    let balance = await db['balances'].findOne({where:{uid: id, typestr: type}, raw: true});
    console.log(
        'BIDDED',
        type,
        `${id}, ${balance.avail}, ${amount}`
    )
    if (Number(balance.avail) < Number(amount)) {resperr(res, 'INSUFICIENT-BALANCE'); return;}
    let starting = moment().add(1, 'minutes').set('second', 0);
    let expiry = moment().add(Number(dur)+1, 'minutes').set('second', 0);
    let t = await db.sequelize.transaction();
    try {
        await db['bets'].create({
            uid: id,
            assetId: assetId,
            amount: amount,
            starting: starting.unix(),
            expiry: expiry.unix(),
            side: side,
            type: type
        },{
            transaction: t
        })
        await db['balances'].increment('avail', {by: -1*amount, where:{typestr: type, uid: id}},{
            transaction: t
        })
        await db['balances'].increment('locked', {by: amount, where:{typestr: type, uid: id}},{
            transaction: t
        })

        await t.commit();

        respok(res, 'BIDDED', null, {expiry: expiry, starting: starting})

        return;
    } catch (error){
        await t.rollback();
        resperr(res, 'UNABLE-TO-BID', null, {error});
        return;
    }
    
        
    
});

router.get("/my/:type", auth, async(req, res)=>{
    let { id } = req.decoded;
    let {type } = req.params;
    if(type == "now"){
        let respdata = await db['bets'].findAll({
            where:{
                uid: id
            },
            include:[{
                model: db['assets']
            }]
        });
        respok(res, null, null, {respdata});
        return;
    } else if (type == "history"){
        let respdata = await db['betlogs'].findAll({
            where:{
                uid: id
            },
            include:[{
                model: db['assets']
            }]
        });
        respok(res, null, null, {respdata});
        return;
    }else{
        resperr(res, 'INVALID-VALUE');
        return;
    }
    
})

router.get("/")
module.exports = router;
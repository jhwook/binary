var express = require("express");
const requestIp = require("request-ip");
let { respok, resperr } = require("../utils/rest");
const { getobjtype } = require("../utils/common");
const jwt = require('jsonwebtoken');
const { auth } = require('../utils/authMiddleware');
const db = require('../models')
const { lookup } = require('geoip-lite');
var moment = require('moment');
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
    await db['bets'].create({
        uid: id,
        assetId: assetId,
        amount: amount,
        starting: starting.unix(),
        expiry: expiry.unix(),
        side: side,
        type: type
    })
    .then(_=>{
        respok(res, 'BIDDED', null, {expiry: expiry, starting: starting})
    })
    
})

module.exports = router;
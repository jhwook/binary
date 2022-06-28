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

router.post('/join/:assetId/:amount/:dur', auth, async (req, res)=>{
    let { assetId, amount, dur } = req.params;
    let { id } = req.decoded;
    if(!assetId || !amount ){resperr(res, 'INVALID-DATA'); return;}
    let balance = await db['balances'].findOne({where:{uid: id}, raw: true});
    if (balance.avail < amount) {resperr(res, 'INSUFICIENT-BALANCE'); return;}
    let starting = moment().add(1, 'minutes').set('second', 0);
    let expiry = moment().add(1, 'minutes').add(dur, 'minutes').set('second', 0);
    await db['bets'].create({
        uid: id,
        assetId: assetId,
        amount: amount,
        starting: starting.unix(),
        expiry: expiry.unix()
    })
    .then(_=>{
        respok(res, 'BIDDED')
    })
    
})

module.exports = router;
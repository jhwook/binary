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
let { Op } = db.Sequelize;

var router = express.Router();

router.get('/v1/rows/:tblname', (req, res)=>{
    let{tblname} = req.params;

    db[tblname].findAll({
        attributes:['code', 'dialcode']
    })
    .then(respdata=>{
        respok(res, null, null, {respdata})
    })
})

router.get('/rows/:tblname', (req, res)=>{
    let{tblname} = req.params;

    console.log(req.query)
    db[tblname].findAll({
        where: req.query
    })
    .then(respdata=>{
        respok(res, null, null, {respdata})
    })
})

router.get("/forex/:type", async(req, res)=>{
    let { type } = req.params;

    respok(res, null, null,{CNYUSD: 0.15})
})


module.exports = router;
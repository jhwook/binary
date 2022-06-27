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

module.exports = router;
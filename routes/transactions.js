var express = require("express");
let { respok, resperr } = require("../utils/rest");
const jwt = require('jsonwebtoken');
const { softauth, auth } = require('../utils/authMiddleware');
const db = require('../models')
var crypto = require('crypto');
const LOGGER = console.log;

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
  module.exports = router;
var express = require("express");
let { respok, resperr } = require("../utils/rest");
const jwt = require('jsonwebtoken');
const { softauth, auth } = require('../utils/authMiddleware');
const db = require('../models')
var crypto = require('crypto');
const LOGGER = console.log;
let { Op } = db.Sequelize

var router = express.Router();

router.get("/", function (req, res, next) {
    res.send("respond with a resource");
});

router.get("/list", softauth, async (req, res)=>{
    let{id} = req.decoded;
    let {group, searchkey} = req.query;
    let jfilter={}
    
    if (group){
        jfilter['groupstr'] = group
    }

    if(searchkey){
        jfilter={name: {[Op.like]: `%${searchkey}%`}}

    }

    db['assets'].findAll({
        where:{
            ...jfilter
        },
        include:[{
            model: db['bookmarks'],
            where:{uid: id||null},
            required: false
        }]
    })
    .then(respdata=>{
        console.log(jfilter)
        respok(res, null, null, {respdata})
    })
})

  module.exports = router;
var express = require("express");
let { respok, resperr } = require("../utils/rest");
const { getobjtype } = require("../utils/common");
const jwt = require('jsonwebtoken');
const { auth } = require('../utils/authMiddleware');
const db = require('../models')
var moment = require('moment');
const LOGGER = console.log;
const cron = require("node-cron");
const axios = require("axios")

cron.schedule('*/1 * * * *', async()=>{
    console.log(
        '@Round Check',
        moment().format('HH:mm:ss'),
        '@binopt'
    );
    const timenow = moment().startOf('minute');
    console.log(timenow.unix())

    await db['bets'].findAll({
        where:{
            starting: timenow.unix()
        }
    })
    .then(async result=>{
        console.log(result.length)
        if(result.length>0){
            await axios.get(`https://yfapi.net/v7/finance/options/0700.HK?date=${timenow.unix()}`, {headers:{'X-API-KEY': 'azOHNJofho3LamfrqB4ef20gS6MSQyhx8iAHT34V'}})
            .then(({data})=>{
                let price = data.optionChain.result[0].quote.regularMarketPrice;
                console.log(price)
                console.log(result)
                result[0].update({
                    startingPrice: data.optionChain.result[0].quote.regularMarketPrice
                })
            })
        }
    })

    await db['bets'].findAll({
        where:{
            expiry: timenow.unix()
        }
    })

})
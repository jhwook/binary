var express = require("express");
const jwt = require('jsonwebtoken');
const { auth } = require('../utils/authMiddleware');
const db = require('../models')
var moment = require('moment');
const LOGGER = console.log;
const cron = require("node-cron");
const axios = require("axios");
let { Op } = db.Sequelize;
const ASSETID_SYMBOL=[
    "___SKIPPER___",
    "BTC-USD",
    "ETH-USD",
    "XRP-USD",
    "EURUSD=X",
    "JPY=X",
    "GBPUSD=X",
    "CAD=X",
    "CHF=X",
    "9988.HK",
    "601398.SS",
    "601288.SS",
    "0700.HK",
    "600519.SS"
]
cron.schedule('*/1 * * * *', async()=>{
    console.log(
        '@Round Checkings',
        moment().format('HH:mm:ss'),
        '@binopt'
    );
    const timenow = moment().startOf('minute');
    console.log(timenow.unix())
    ASSETID_SYMBOL.map(async (v, i)=>{
        if(i==0){return;}
        let exists = await db['bets'].findAll({
            where:{
                assetId: i, 
                [Op.or]:[
                    {starting: timenow.unix()},
                    {expiry: timenow.unix()}
                ]
            },
            raw: true
        }).then(async result=>{
            if (!result)return;
            //let {data} = await axios.get(`https://yfapi.net/v7/finance/options/${v}?date=${timenow.unix()}`, {headers:{'X-API-KEY': 'r9e2WqrJWDbMMeoQQMbd8bp09FGkLFXaMKDZRR3f'}})
            let price = Math.random();//data.optionChain.result[0].quote.regularMarketPrice;
            let status;
            result.map(v=>{
                if (v.starting == timenow.unix()){
                    //await db['assets'].update({currentPrice: price}, {where:{id: i}})
                    await db['bets'].update({startingPrice: price},{where:{id: v.id}})
                } else {
                    if (v.startingPrice==price){
                        status = 2
                    }else if(v.startingPrice>price){ //가격이 떨어짐
                        if(v.side.toUpperCase() == "HIGH"){
                            status = 0
                        }else{
                            status = 1
                        }
                    }else if(v.startingPrice<price){
                        if(v.side.toUpperCase() == "HIGH"){
                            status = 1;
                        }else{
                            status = 0
                        }
                    }else{
                        status=3
                    }
                    db['betlogs'].create({
                        uid: v.uid,
                        assetId: v.assetId,
                        amount: v.amount,
                        starting: v.starting,
                        expiry: v.expiry,
                        startingPrice: v.startingPrice,
                        side: v.side,
                        type: v.type,
                        endingPrice: price,
                        status: status
                    })
                    .then(_=>{
                        db['bets'].destroy({where:{id: v.id}})
                    })
                }
            })
        })
        if(exists){
            await settlebets(i, timenow.unix());
        }else{
            //console.log(exists)
        }

    })

})
/*
    Status
    0-> 짐
    1-> 이김
    2-> 비김
    3-> 짐
*/

const settlebets = async (assetId, expiry) => {
    const t = db.sequelize.transaction();
    try {
    let {winnerTotalAmount} = await db['betlogs'].findAll({
        where:{
            assetId,
            expiry,
            status: 1
        },
        attributes: [
            'id',
            [db.Sequelize.fn('sum', db.Sequelize.col('amount')), 'winnerTotalAmount'],
          ],
          raw: true
    },{
        transaction: t
    });

    let {loserTotalAmount} = await db['betlogs'].findAll({
        where:{
            assetId,
            expiry,
            status: 0
        },
        attributes: [
            'id',
            [db.Sequelize.fn('sum', db.Sequelize.col('amount')), 'loserTotalAmount'],
          ],
          raw: true
    },{
        transaction: t
    });

    await db['betlogs'].findAll({
        where:{
            assetId,
            expiry,
            status: 2
        },
        raw: true
    },{
        transaction: t
    })
    .then(async drawusers=>{
        if (drawusers.length <1){return;}
        drawusers.map(async v=>{
            console.log(v)
            await db['balances'].increment('locked',{by: -1*v.amount, where:{uid: v.uid, typestr: v.type}},{
                transaction: t
            });
            await db['balances'].increment(['avail', 'total'],{by: v.amount, where:{uid: v.uid, typestr: v.type}},{
                transaction: t
            });
        })
    })
    
    await db['betlogs'].findAll({
        where:{
            assetId,
            expiry,
            status: 0
        },
        raw: true
    },{
        transaction: t
    }).then(async losers=>{
        if (losers.length <1){return;}
        losers.map(async v=>{
            await db['balances'].increment(['avail', 'total', 'locked'],{by: -1*v.amount, where:{uid: v.uid, typestr: v.type}},{
                transaction: t
            });
        })
    })

    await db['betlogs'].findAll({
        where:{
            assetId,
            expiry,
            status: 1
        },
        raw: true
    },{
        transaction: t
    }).then(async winners=>{
        if (winners.length <1){return;}
        winners.map(async v=>{
            let earned = Math.ceil(loserTotalAmount * v.amount / winnerTotalAmount) || 0;
            let total = Number(earned) + Number(v.amount)
            await db['balances'].increment('locked',{by: -1*v.amount, where:{uid: v.uid, typestr: v.type}},{
                transaction: t
            });
            await db['balances'].increment('avail',{by: total, where:{uid: v.uid, typestr: v.type}},{
                transaction: t
            });
            await db['balances'].increment('total',{by: +earned, where:{uid: v.uid, typestr: v.type}},{
                transaction: t
            });
        })
        
    })
    await t.commit();
} catch (err) {
    await t.rollback();
    console.log(err)
}

}
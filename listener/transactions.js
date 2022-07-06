const db = require('../models')
const {watchTransfers} = require('../services/trackTx_socket');
let {Op}=db.Sequelize
let moment = require('moment')

module.exports = (io, socket) => {
    socket.on("transactions", async(data, cb)=>{
        let { id, wallet } = socket.decoded;
        let { type } = data;

        await watchTransfers(wallet, type, id, socket);
    })

    socket.on("bet_dep", async(data, cb)=>{
        let {id, wallet} = socket.decoded;
        let { betId, expiry } = data;
        if(!betId){cb("wrong betId"); return;}

        cb("listed")
        console.log(betId)
        setInterval(async ()=>{
            console.log(betId, expiry, moment().unix())
            if (expiry < moment().unix()){
                let bet = await db['betlogs'].findOne({
                    where:{
                        betId: betId
                    }
                })
                if (bet){
                    socket.emit("bet_update", {bet});
                }else{
                    socket.emit("bet_update", "not-found");
                }
                
                //return;
            }else{
                socket.emit("bet_update", "waiting for update")
            }
        }, 5000)
    })

    socket.on("bet_depDep", async(data, cb)=>{
        let {id, wallet} = socket.decoded;
        let {betId} = data;
        if (betId){
            let respdata = await db['bets'].findOne({
                where: {
                    id: betId
                }
            })
        }
        let respdata = await db['bets'].findAll({
            where: {
                uid: id
            },
            include:[{
                model: db['assets']
            }]
        })
        cb(respdata);
        console.log(respdata)
        respdata.map(v=>{
            return setInterval(async ()=>{
                console.log(v.id, v.expiry, moment().unix())
                if (v.expiry < moment().unix()){
                    let bet = await db['betlogs'].findOne({
                        where:{
                            betId: v.id
                        }
                    })
                    if (bet){
                        socket.emit("bet_update", {dbg: false, msg: {bet}});
                        return;
                    }else{
                        socket.emit("bet_update", {dbg: true, msg: "not-found"});
                    }
                    
                    //return;
                }else{
                    socket.emit("bet_update", {dbg: true, msg: {id: v.id, currentPrice: Math.random()}})
                }
            }, 1000)
        })
        
    })

    socket.on("bet", async(data, cb)=>{
        let {id} = socket.decoded
        let respdata = await db['bets'].findAll({
            where: {
                uid: id
            },
            include:[{
                model: db['assets'],
                attributes:['name'],
                nest: true,
            }],
            
            nest: true,
            raw: true
        })
            if(!respdata){return;}
            let currentPrice = Math.random();
            
            let list = await Promise.all(respdata.map( async (v) => {

                let winnerTotal = await db['bets'].findAll({
                    where:{
                        expiry: v.expiry,
                        [Op.or]:[
                            {
                                [Op.and]:[
                                    {startingPrice: {[Op.lt]: currentPrice}},
                                    {side: 'LOW'}
                                ]
                            },{
                                [Op.and]:[
                                    {startingPrice: {[Op.gt]: currentPrice}},
                                    {side: 'HIGH'}
                                ]
                            }
                        ]
                    },
                    attributes:['amount', [db.Sequelize.fn('sum', db.Sequelize.col('amount')), 'winnerTotal']],
                    raw: true
                })
                let loserTotal = await db['bets'].findAll({
                    expiry: v.expiry,
                    where:{
                        [Op.or]:[
                            {
                                [Op.and]:[
                                    {startingPrice: {[Op.gt]: currentPrice}},
                                    {side: 'LOW'}
                                ]
                            },{
                                [Op.and]:[
                                    {startingPrice: {[Op.lt]: currentPrice}},
                                    {side: 'HIGH'}
                                ]
                            }
                        ]
                    },
                    attributes:['amount', [db.Sequelize.fn('sum', db.Sequelize.col('amount')), 'loserTotal']],
                    raw: true
                })
                let winnerTotalAmount = winnerTotal[0].winnerTotal
                let loserTotalAmount = loserTotal[0].loserTotal;
                console.log(winnerTotalAmount, loserTotalAmount)
                let diffRate = 0;

                if(!winnerTotalAmount || !loserTotalAmount){
                    diffRate = 0;
                }else{
                    diffRate = Number(loserTotalAmount)/Number(winnerTotalAmount)
                }
                return {...v, currentPrice: currentPrice, diffRate: diffRate || 0}
                 
            
            })
            )
            console.log( list)
            cb( list);

})
}

/*


GET:: /transactions/branch/list

유저-> 총판 입금 기록 입니다.

Header:: {JWTtoken}

*/
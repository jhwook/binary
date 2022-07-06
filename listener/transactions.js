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

    socket.on("bet", async(data, cb)=>{
        let {id, wallet} = socket.decoded;
        let { betId, expiry } = data;
        setInterval(5000, async (betId)=>{
            if (expiry < moment().unix()){
                let bet = await db['betlogs'].findOne({
                    where:{
                        betId: betId
                    }
                })
                socket.emit("bet_update", {bet});
                return;
            }else{
                socket.emit("bet_update", "waiting for update")
            }
        })
    })
}
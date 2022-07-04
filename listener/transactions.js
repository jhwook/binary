const db = require('../models')
const {watchTransfers} = require('../services/trackTx_socket');
let {Op}=db.Sequelize

module.exports = (io, socket) => {
    socket.on("transactions", async(data, cb)=>{
        let { id, wallet } = socket.decoded;
        let { type } = data;

    })
}
const awaitTransaction = require('await-transaction-mined');
const {web3} = require( '../configs/configweb3');
const db = require('../models');

const TXREQSTATUS_POLL_INTERVAL = 3000
const TXREQSTATUS_BLOCKCOUNT = 1 // 2 // 4 // 6
const TX_POLL_OPTIONS = {
	interval: TXREQSTATUS_POLL_INTERVAL
	, blocksToWait: TXREQSTATUS_BLOCKCOUNT
}
//closeTx({txhash, type:"DEPOSIT", tokentype: tokentype, userid: id, senderaddr, amount})
const closeTx = async (jargs) =>{
    let {txhash, type, tokentype, userid, senderaddr, amount} = jargs;
    awaitTransaction
    .awaitTx(
        web3
        , txhash
        , TX_POLL_OPTIONS)
    .then(async txreceipt =>{
        let {status} = txreceipt;

        switch (type){
            case "DEPOSIT":
                await db['transactions']
                .create({
                    uid: userid,
                    amount: amount,
                    type: 1,
                    typestr: type,
                    unit: tokentype,
                    status: 1,
                    txhash: txhash
                })
                .then(_=>{
                    db['balances']
                    .increment(['total', 'avail'], {by: amount, where:{uid: userid, typestr: 'LIVE'}})
                    .then(_=>{
                        console.log(`DEPOSIT:: UID: ${userid} to ADMIN, amount of ${amount} ${tokentype}`)
                    })
                })
                break;
            default:
                break;
        }
    })
    .catch(err=>{
        console.log(err, jargs.txhash)
    })
}

module.exports ={
    closeTx
}
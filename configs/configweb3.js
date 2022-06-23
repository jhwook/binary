const  {NETTYPE} = require("./net")
let jweb3 = {
    MUMBAI_TESTNET: require('./web3mumbai').web3,
}
let web3 = jweb3[NETTYPE]

module.exports={web3}
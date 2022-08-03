const { web3 } = require('../configs/configweb3');
const { contractaddr } = require('../configs/addresses');
const MIN_TOKEN_AMOUNT_TO_WITHDRAW = 1;
const db = require('../models');
const { abi: abierc20 } = require('../contracts/abi/ERC20');
const GAS_LIMIT_TOKEN = '';
const withdraw = async (jdata) => {
  return new Promise(async (resolve, reject) => {
    let { userid, tokentype, amount, rxaddr, adminaddr, adminpk } = jdata;
    //let {value: ADMINADDR} = await db['settings'].findOne({where:{name: 'ADMINADDR'}})
    //let {value: ADMINPK} = await db['settings'].findOne({where:{name: 'ADMINPK'}})
    console.log('jdata', jdata);
    console.log(adminaddr);
    console.log(tokentype);
    console.log(contractaddr[tokentype]);
    let amt2sendwei = (amount * 10 ** 6).toString();
    // let amt2sendwei = amount.toString();
    const contract = new web3.eth.Contract(abierc20, contractaddr[tokentype]);
    await contract.methods.balanceOf(adminaddr).call(async (err, balance) => {
      console.log(adminaddr, balance);
      if (parseInt(balance) < MIN_TOKEN_AMOUNT_TO_WITHDRAW) {
        return false;
      }

      try {
        contract.methods.balanceOf(adminaddr).call((err, balance) => {
          if (err) {
            console.log(err);
          } else {
            console.log('balance', balance);
          }
        });
        const nonce = await web3.eth.getTransactionCount(adminaddr, 'latest');
        const transaction = {
          from: adminaddr,
          to: contractaddr[tokentype], // faucet address to return USDT_BINARY_CODE
          value: '0', // eth
          gas: '3000000',
          nonce: nonce,
          // optional data field to send message or execute smart contract
          data: contract.methods.transfer(rxaddr, amt2sendwei).encodeABI(),
        };

        const signedTx = await web3.eth.accounts.signTransaction(
          transaction,
          adminpk
        );
        await db['transactions'].create({
          uid: userid,
          amount: amount,
          unit: tokentype,
          type: 0,
          typestr: 'WITHDRAW',
          txhash: signedTx.transactionHash,
          status: 0,
          localeAmount: amount,
          localeUnit: tokentype,
          rxaddr,
        });

        console.log(signedTx);
        web3.eth.sendSignedTransaction(
          signedTx.rawTransaction,
          async function (error, hash) {
            if (error) {
              console.log(error);
              reject({ status: 'ERR', message: error });
            } else {
              console.log(hash);
              await db['balances'].increment(['total', 'avail'], {
                by: -1 * amount,
                where: { uid: userid, typestr: 'LIVE' },
              });
              await db['transactions'].update(
                {
                  status: 1,
                },
                {
                  where: {
                    typestr: 'WITHDRAW',
                    txhash: signedTx.transactionHash,
                  },
                }
              );
              resolve({ status: 'OK', message: hash });
            }
          }
        );
      } catch (err) {
        console.log(err);
      }
    });
  });
};

module.exports = { withdraw };

// CREATE TABLE `networktoken` (
//   `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
//   `createdat` datetime DEFAULT current_timestamp(),
//   `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp(),
//   `name` varchar(11) DEFAULT NULL,
//   `decimal` int(30) DEFAULT NULL,
//   `contractaddress` varchar(80) DEFAULT NULL,
//   `networkidnumber` int(20) unsigned DEFAULT NULL,
//   `nettype` varchar(11) DEFAULT NULL,
//   `uuid` varchar(60) DEFAULT NULL,
//   PRIMARY KEY (`id`)
// );

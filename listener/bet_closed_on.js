const db = require('../models');

module.exports = async (io, socket) => {
// socket.on('bet_closed', async (data) => {
//   // console.log('data',id);
//   let { userSocketId, userId } = data;
//   let timenow = moment().startOf('minute');
//   let now_unix = moment().startOf('minute').unix();
//   let betlogs = await db['betlogs'].findAll({
//     where: { expiry: now_unix, uid: userId },
//     raw: true,
//   })

//    betlogs.map(async (betlog) => {
//         let { status, diffRate, amount, assetName, uid, uuid } = betlog;         // let usersocketid = await cliredisa.hget('USERN AME2SOCKID', uid);        // 						if ( j_ socketdata_issent[ uuid ] ) { ret urn }        //						else {}
//         let profit = 0;
//         if (status === 1) {
//           if (diffRate === 0) {
//             profit = amount / 10 ** 6;
//           } else {
//             profit = (((amount / 10 ** 6) * diffRate) / 100).toFixed(2);
//           }
//         }
//         if (status === 0) {
//           profit = (-1 * amount) / 10 ** 6;
//         }
//         let socketData = {
//           name: assetName,
//           profit: profit,
//           data: betlog,
//         };

//         socket.to(userSocketId).emit('bet_closed', socketData);
//     })

// })

}
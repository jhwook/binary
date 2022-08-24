const db = require('../models');
let { Op } = db.Sequelize;
let moment = require('moment');
const LOGGER = console.log;
const { ASSETID_SYMBOL } = require('../utils/ticker_symbol');
const cliredisa = require('async-redis').createClient();
const cron = require('node-cron');
// let j _sock etdata_issent={}
var count = 0
let KVS_KEYNAME = 'USERNAME2SOCKID';
module.exports = async (io, socket) => {
  const findCloseBets = async () => {
    console.log('count', count);
    if(count !== 0) {
       return
    }
    let timenow = moment().startOf('minute');
    let now_unix = moment().startOf('minute').unix();
    let socketList = await cliredisa.hgetall(KVS_KEYNAME);
    if (socketList) {
      socketList = Object.entries(socketList);
    } else {
      return;
    }     // console.log('socketList', socketList);    // console.log('socketList', socketList);
    for (let i = 0; i < socketList.length; i++) {

      let [userId, userSocketId] = socketList[i];
      // if (socket?.sockets && socket.sockets[userSocketId]) {
      // } else {
      //   cliredisa.hdel(KVS_KEYNAME, userId);
      // }
      // let betlogs = await db['betlogs'].findAll({
      //   where: { expiry: now_unix, uid: userId, isnotisent: 0 },
      //   raw: true,
      // });
      // console.log(userId, betlogs);      //        .then((betlogs) => {
      // if (betlogs.length === 0) {
      //   continue;
      // } // re turn;
      // console.log('======================', userId, userSocketId, betlogs);
      // betlogs.map(async (betlog) => {
        // let { status, diffRate, amount, assetName, uid, uuid } = betlog;         // let usersocketid = await cliredisa.hget('USERN AME2SOCKID', uid);        // 						if ( j_ socketdata_issent[ uuid ] ) { ret urn }        //						else {}
        // let profit = 0;
        // if (status === 1) {
        //   if (diffRate === 0) {
        //     profit = amount / 10 ** 6;
        //   } else {
        //     profit = (((amount / 10 ** 6) * diffRate) / 100).toFixed(2);
        //   }
        // }
        // if (status === 0) {
        //   profit = (-1 * amount) / 10 ** 6;
        // }
        // let socketData = {
        //   name: assetName,
        //   profit: profit,
        //   data: betlog,
        // };
        
        let socketData = {
          name: 'USD/JPY',
          profit: '0.00',
          data: {
            id: 895135,
            createdat: '2022-08-23T05:50:00.000Z',
            updatedat: null,
            uid: 135,
            assetId: 5,
            amount: 100000000,
            starting: 1661233740,
            expiry: 1661233800,
            startingPrice: '137.20300',
            endingPrice: '137.19800',
            side: 'LOW',
            type: 'LIVE',
            status: 1,
            betId: null,
            diffRate: '0',
            uuid: null,
            assetName: 'USD/JPY',
            isnotisent: 0,
            winamount: '0'
          }
        }
        // console.log('bet_closed', socketData, userSocketId, count);
      
          console.log(userId);
          // console.log('socket',)
          socket.to(userSocketId).emit('bet_closed', socketData);
        


        //						j_ socketdata_issent[ uuid ] =1
        // await db['betlogs'].update(
        //   { isnotisent: 1 },
        //   { where: { id: betlog.id } }
        // );
      // });
      //        });
    }
    count++;
  };

  const findCloseBets_test = async () => {
    let timenow = moment().startOf('minute');
    let now_unix = moment().startOf('minute').unix();
  
        let socketData = {
          name: 'USD/JPY',
          profit: '0.00',
          data: {
            id: 895135,
            createdat: '2022-08-23T05:50:00.000Z',
            updatedat: null,
            uid: 135,
            assetId: 5,
            amount: 100000000,
            starting: 1661233740,
            expiry: 1661233800,
            startingPrice: '137.20300',
            endingPrice: '137.19800',
            side: 'LOW',
            type: 'LIVE',
            status: 1,
            betId: null,
            diffRate: '0',
            uuid: null,
            assetName: 'USD/JPY',
            isnotisent: 0,
            winamount: '0'
          }
        }
  console.log('socket', socket.adapter.rooms);
  console.log('socket.id', socket.id);
        socket.to(socket.id).emit('bet_closed', socketData);

   
        count ++
        console.log(count);
  };
  // false &&
cron.schedule('1 * * * * *', () => {
 
    let now_unix = moment().startOf('minute').unix();
    console.log('@betCloseMessage', now_unix);
    findCloseBets();
    // findCloseBets_test();
  }); 
};

/** cron.schedule('1 * * * * *', () => {
  let now_unix = moment().startOf('minute').unix();
  console.log('@betCloseMessage', now_unix);
  findCloseBets();
}); */

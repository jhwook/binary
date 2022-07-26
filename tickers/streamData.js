const cliredisa = require('async-redis').createClient();
const WebSocket = require('ws');
const cron = require('node-cron');
const db = require('../models');

const socket = new WebSocket('wss://ws.finnhub.io?token=c9se572ad3i4aps1soq0');

const getStreamData = async () => {
  await db['assets']
    .findAll({
      where: { active: 1 },
      raw: true,
    })
    .then((resp) => {
      resp.forEach((el) => {
        let { APISymbol, tickerSrc, groupstr, socketAPISymbol } = el;
        let socketSymbol = `${tickerSrc}:${APISymbol}`;
        tickerSrc = tickerSrc.toUpperCase();
        if (groupstr === 'crypto') {
          socketSymbol = `${tickerSrc}:${socketAPISymbol}`;
        }
        // console.log(socketSymbol);
        socket.addEventListener('open', function (event) {
          socket.send(
            JSON.stringify({ type: 'subscribe', symbol: socketSymbol })
            // JSON.stringify({ type: 'subscribe', symbol: 'B' })
            // 'BINANCE:BTCUSDT'
          );
        });
      });
    });
};

// Listen for messages
socket.addEventListener('message', function (event) {
  let resp = JSON.parse(event.data).data;
  if (resp) {
    resp.forEach((v) => {
      let { s, p } = v;
      s = s.split(':')[1];
      p = p.toFixed(5);
      // console.log(s, p);
      cliredisa.hset('STREAM_ASSET_PRICE', s, p);
    });
  }
});

var unsubscribe = function (symbol) {
  socket.send(JSON.stringify({ type: 'unsubscribe', symbol: symbol }));
};

getStreamData();
// const twelvedata_socket = new WebSocket(
//   'wss://ws.twelvedata.com/v1/quotes/price?apikey=c092ff5093bf4eef83897889e96b3ba7'
// );

// const getStreamData = async () => {
//   await db['assets']
//     .findAll({
//       where: { active: 1 },
//       raw: true,
//     })
//     .then((resp) => {
//       let assetListStr = '';
//       resp.map((el, i) => {
//         let { APISymbol } = el;
//         assetListStr = assetListStr + APISymbol + ',';
//         if (i === resp.length - 1) {
//           assetListStr = assetListStr + APISymbol;
//         }
//       });
//       console.log(assetListStr);
//       twelvedata_socket.addEventListener('open', function (event) {
//         twelvedata_socket.send(
//           JSON.stringify({
//             action: 'subscribe',
//             params: {
//               symbols: assetListStr,
//             },
//           })
//         );
//       });

//       twelvedata_socket.addEventListener('message', function (event) {
//         let data = JSON.parse(event.data);

//         if (data.event === 'price') {
//           // console.log(data.symbol, data.price);
//           cliredisa.hset('STREAM_ASSET_PRICE', data.symbol, data.price);
//         }
//       });
//     });
// };
// getStreamData();

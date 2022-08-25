const WebSocket = require('ws');
const cron = require('node-cron');
const db = require('../models');
const socket = new WebSocket('wss://ws.finnhub.io?token=c9se572ad3i4aps1soq0');
const twelvedataSocket = new WebSocket(
  'wss://ws.twelvedata.com/v1/quotes/price?apikey=c092ff5093bf4eef83897889e96b3ba7'
);
socket.addEventListener('open', function (event) {
  // socket.send(JSON.stringify({ type: 'subscribe', symbol: '6699.HK' }));
  // socket.send(JSON.stringify({ type: 'subscribe', symbol: '370.HK' }));
  // socket.send(JSON.stringify({ type: 'subscribe', symbol: '700.HK' }));
  socket.send(JSON.stringify({ type: 'subscribe', symbol: 'BINANCE:BTCUSDT' }));
  // socket.send(JSON.stringify({ type: 'subscribe', symbol: 'IC MARKETS:1' }));
});

// Listen for messages
socket.addEventListener('message', function (event) {
  let resp = JSON.parse(event.data).data;
  if (resp) {
    resp.forEach((v) => {
      let { s, p } = v;
      s = s.split(':')[1];
      p = p.toFixed(5);
      console.log(s, p);
      // cliredisa.hset('STREAM_ASSET_PRICE', s, p);
      // db['tickerprice'].create({
      //   symbol: s,
      //   price: p,
      // });
    });
  }
});

// twelvedataSocket.addEventListener('open', function (event) {
//   twelvedataSocket.send(
//     JSON.stringify({ action: 'subscribe', params: { symbols: 'EUR/USD' } })
//   );
//   // twelvedataSocket.send(
//   //   JSON.stringify({
//   //     action: 'subscribe',
//   //     params: {
//   //       symbols: [{ symbol: 'ETH/USD', exchange: 'Binance' }],
//   //     },
//   //   })
//   // );
// });

// // Listen for messages
// twelvedataSocket.addEventListener('message', function (event) {
//   console.log('Message from server ', JSON.parse(event.data));
// });

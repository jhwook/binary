const { StreamClient, RESTClient } = require('cw-sdk-node');
const rc = new RESTClient();
const cliredisa = require('async-redis').createClient();
const WebSocket = require('ws');
const cron = require('node-cron');
const { ASSETID_REDIS_SYMBOL } = require('../utils/ticker_symbol');

// const ASSETID_REDIS_SYMBOL = [
//   '__SKIPPER__',
//   'btcusdt',
//   'ethusdt',
//   'xrpusdt',
//   'EUR/USD',
//   'USD/JPY',
//   'GBP/USD',
//   'USD/CAD',
//   'USD/CHF',
// ];

const streamClient = new StreamClient({
  creds: {
    // These can also be read from ~/.cw/credentials.yml
    apiKey: 'Q6577RMRUHI8ZEOF2QU0',
    secretKey: 'T9DxZXTFyXvFjrkOOQ9K5bwbtFeWc3tQ0GMt9ERq',
  },
  subscriptions: [
    // Subscription key for all trades from all markets
    'markets:579:trades', // binance btc:usdt
    'markets:588:trades', // binance eth:usdt
    'markets:1128:trades', // binance xrp:usdt
  ],
  logLevel: 'debug',
});

async function run() {
  const markets = await rc.getMarkets();
  const marketCache = {};
  markets.forEach((market) => {
    marketCache[market.id] = market; // Cache all market identifiers
  });

  // Listen for received trades and print them
  streamClient.onMarketUpdate((marketData) => {
    const tradesUpdate = marketData.trades;
    tradesUpdate.forEach((tradeUpdate) => {
      // console.log("tradeUpdate : ", tradeUpdate);
      // 2022-07-14T04:42:23.329Z / '1108.63' / '0.0136'
      let { timestamp, price, amount } = tradeUpdate;
      // 'binance' / 'btcusdt'
      let { exchange, pair } = marketCache[marketData.market.id];

      // timestamp tradeUpdate.timestamp
      // {
      //    externalID: 'ETHUSDT:716151923',
      //    timestamp: 2022-07-14T04:42:23.329Z,
      //    side: 'sell',
      //    price: '1108.63',
      //    amount: '0.0136'
      // }
      cliredisa.hset('STREAM_ASSET_PRICE', pair, price);
      // console.log(
      //   marketCache[marketData.market.id], // access market info from cache
      //   tradeUpdate.side,
      //   'Price: ',
      //   tradeUpdate.price,
      //   'Amount: ',
      //   tradeUpdate.amount
      // );
      // {
      //     id: 579,
      //     exchange: 'binance',
      //     pair: 'btcusdt',
      //     active: true,
      //     route: 'https://api.cryptowat.ch/markets/binance/btcusdt'
      // } buy Price:  20130.1 Amount:  0.40376
    });
  });

  // Connect to stream
  streamClient.connect();
}

run().catch((e) => {
  console.error(e);
});

const socket = new WebSocket('wss://ws.finnhub.io?token=c9se572ad3i4aps1soq0');

// Connection opened -> Subscribe
socket.addEventListener('open', function (event) {
  socket.send(JSON.stringify({ type: 'subscribe', symbol: 'FXCM:USD/CHF' }));
  socket.send(JSON.stringify({ type: 'subscribe', symbol: 'FXCM:USD/CAD' }));
  socket.send(JSON.stringify({ type: 'subscribe', symbol: 'FXCM:USD/JPY' }));
  socket.send(JSON.stringify({ type: 'subscribe', symbol: 'FXCM:EUR/USD' }));
  socket.send(JSON.stringify({ type: 'subscribe', symbol: 'FXCM:GBP/USD' }));
  // socket.send(JSON.stringify({ type: 'subscribe', symbol: 'BINANCE:ETHUSDT' }));
  // socket.send(JSON.stringify({ type: 'subscribe', symbol: 'BINANCE:XRPUSDT' }));
});

// Listen for messages
socket.addEventListener('message', function (event) {
  // console.log('Message from server ', JSON.parse(event.data).data);
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

cron.schedule('0 * * * * *', async () => {
  for (let i = 1; i <= 8; i++) {
    let currentPrice = await cliredisa.hget(
      'STREAM_ASSET_PRICE',
      ASSETID_REDIS_SYMBOL[i]
    );
    cliredisa.hset(
      'STREAM_ASSET_PRICE_PER_MIN',
      ASSETID_REDIS_SYMBOL[i],
      currentPrice
    );
  }
});

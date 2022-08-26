const WebSocket = require('ws');
const cron = require('node-cron');
const db = require('../models');
// const socket = new WebSocket('wss://ws.finnhub.io?token=c9se572ad3i4aps1soq0');
const twelvedataSocket = new WebSocket(
  'wss://ws.twelvedata.com/v1/quotes/price?apikey=c092ff5093bf4eef83897889e96b3ba7'
);
const moment = require('moment');
const cliredisa = require('async-redis').createClient();

const getAssetSymbolList = async () => {
  let assetSymbolList = [];
  await db['assets'].findAll({
    where: { active: 1 },
    raw: true,
  }).then((resp) => {
    resp.map((el) => {
      let { APISymbol } = el;
      assetSymbolList.push(APISymbol);
    })
  })

  let result = assetSymbolList.join()
  console.log(result);

  return result
}


const sendTwelveDataSocketEvent = async () => {
  let symbolList = await getAssetSymbolList();
  twelvedataSocket.addEventListener('open', function (event) {
    twelvedataSocket.send(
      JSON.stringify({ action: 'subscribe', params: { symbols: symbolList } })
    );
    // twelvedataSocket.send(
    //   JSON.stringify({
    //     action: 'subscribe',
    //     params: {
    //       symbols: [{ symbol: 'BTC/USD', exchange: 'Binance' }, { symbol: 'BTC/USD', exchange: 'Bitfinex' }, { symbol: 'BTC/USD', exchange: 'Coinbase Pro' }, { symbol: 'BTC/USD', exchange: 'FTX' }, { symbol: 'EUR/USD' }],
    //     },
    //   })
    // );
  });
  

  // Listen for messages
  twelvedataSocket.addEventListener('message', function (event) {
    let data = JSON.parse(event.data)
    let now = moment().format('HH:mm:ss')
    // let { event, symbol, price } = data
    if(data.event === 'price') {
      // console.log(now, '=>', data.exchange, data.symbol, data.price);
      cliredisa.hset('STREAM_ASSET_PRICE', data.symbol, data.price);
    }
  });
}

sendTwelveDataSocketEvent();

module.exports = { sendTwelveDataSocketEvent };
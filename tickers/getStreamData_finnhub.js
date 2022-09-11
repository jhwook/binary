const WebSocket = require('ws');
const cron = require('node-cron');
const db = require('../models');
const { Op } = db.Sequelize;
// const socket = new WebSocket('wss://ws.finnhub.io?token=c9se572ad3i4aps1soq0');
const finnhubSocket = new WebSocket(
  'wss://ws.finnhub.io?token=cceqv72ad3i6bee15r40'
);
const moment = require('moment');
const cliredisa = require('async-redis').createClient();

const getAssetSymbolList = async () => {
  let assetSymbolList = [];
  await db['assets']
    .findAll({
      where: { active: 1, group: { [Op.in]: [1, 2] } },
      raw: true,
    })
    .then((resp) => {
      resp.map((el) => {
        let { APISymbol, tickerSrc } = el;
        tickerSrc = tickerSrc.toUpperCase();
        assetSymbolList.push(`${tickerSrc}:${APISymbol}`);
      });
    });

  let result = assetSymbolList;
  console.log(result);

  return result;
};

const sendTickerDataSocketEvent = async () => {
  let symbolList = await getAssetSymbolList();

  finnhubSocket.addEventListener('open', function (event) {
    symbolList.forEach((symbol) => {
      finnhubSocket.send(
        JSON.stringify({ type: 'subscribe', symbol: symbol })
        // JSON.stringify({ type: 'subscribe', symbol: 'FXCM:GBP/USD' })
        // JSON.stringify({ type: 'subscribe', symbol: '700.HK' })
        // JSON.stringify({ type: 'subscribe', symbol: 'B' })
        // 'BINANCE:BTCUSDT'
      );
    });
  });

  // Listen for messages
  finnhubSocket.addEventListener('message', function (event) {
    // console.log(JSON.parse(event.data));
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
};

sendTickerDataSocketEvent();

// cron.schedule('0 * * * * *', () => {
//   console.log('@GET Finnhub Data');
//   sendTickerDataSocketEvent();
// })

module.exports = { sendTickerDataSocketEvent };

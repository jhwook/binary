const cron = require('node-cron');
const axios = require('axios');
const db = require('../models');
const moment = require('moment');

const getTickerCandle = async (now) => {
  await db['assets']
    .findAll({
      where: { active: 1 },
      raw: true,
    })
    .then(async (resp) => {
      resp.forEach(async (asset) => {
        let { id, APISymbol } = asset;
        await axios
          .get(
            `https://finnhub.io/api/v1/crypto/candle?symbol=BINANCE:${APISymbol}&resolution=1&from=${now}&to=${now}&token=cceqv72ad3i6bee15r40`
          )
          .then((data) => {
            if (data.data) {
              console.log(APISymbol, data.data);
              let { c, h, l, o, v } = data.data;
              if (c && h && l && o && v) {
                db['tickercandle'].create({
                  symbol: APISymbol,
                  open: o[0],
                  close: c[0],
                  high: h[0],
                  low: l[0],
                  volume: v[0],
                  assetId: id,
                });
              }
            }
          });
      });
    });
};

cron.schedule('0 * * * * *', () => {
  const now = moment().startOf('minute').unix();

  getTickerCandle(now);
});

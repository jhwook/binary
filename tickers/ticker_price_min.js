const cron = require('node-cron');
const axios = require('axios');
const db = require('../models');
const cliredisa = require('async-redis').createClient();

const getTickerPrice = async () => {
  const assetList = await db['assets']
    .findAll({
      where: { active: 1 },
      raw: true,
    })
    .then(async (resp) => {
      resp.forEach(async (el) => {
        let { APISymbol, tickerSrc } = el;
        await axios
          .get(
            `https://api.twelvedata.com/price?symbol=${APISymbol}&exchange=${tickerSrc}&apikey=c092ff5093bf4eef83897889e96b3ba7&source=docs`
          )
          .then((resp) => {
            let { price } = resp.data;
            cliredisa.hset('STREAM_ASSET_PRICE_PER_MIN', APISymbol, price);
            // console.log(APISymbol, tickerSrc, price);
          });
      });
    });
};
cron.schedule('0 * * * * *', async () => {
  getTickerPrice();
});

module.exports = { getTickerPrice };

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
				if ( APISymbol &&  tickerSrc) {}
				else { return }
        await axios
          .get(
            `https://api.twelvedata.com/price?symbol=${APISymbol}&exchange=${tickerSrc}&apikey=c092ff5093bf4eef83897889e96b3ba7`
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

// insert into logfills (market, asset, matchbase,matchfloat,amountbase0, amountfloat0,amountbase1,amountfloat1, buyerusername, sellerusername, price,marketsymbol) values ('USDT', 'XRP',1000000, 1000, 1000000, 1000, 1000000,1000, 'user000', 'user111', 10000000, 'XRP_USDT');
// insert into logfills (market, asset, matchbase,matchfloat,amountbase0, amountfloat0,amountbase1,amountfloat1, buyerusername, sellerusername, price,marketsymbol) values ('USDT', 'XRP',1000000, 1000, 1500000, 500, 1000000,1000, 'user000', 'user111', 10000000, 'XRP_USDT');
// insert into logfills (market, asset, matchbase,matchfloat,amountbase0, amountfloat0,amountbase1,amountfloat1, buyerusername, sellerusername, price,marketsymbol) values ('USDT', 'XRP',450000, 500, 450000, 500, 900000,1000, 'user000', 'user111', 9000000, 'XRP_USDT');
// insert into logfills (market, asset, matchbase,matchfloat,amountbase0, amountfloat0,amountbase1,amountfloat1, buyerusername, sellerusername, price,marketsymbol) values ('USDT', 'XRP',1000000, 1000, 1000000, 1000, 1000000,1000, 'user000', 'user111', 10000000, 'XRP_USDT');
// insert into logfills (market, asset, matchbase,matchfloat,amountbase0, amountfloat0,amountbase1,amountfloat1, buyerusername, sellerusername, price,marketsymbol) values ('USDT', 'XRP',1000000, 1000, 1000000, 1000, 1000000,1000, 'user000', 'user111', 10000000, 'XRP_USDT');
// CREATE TABLE `tickerprice` (
//   `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
//   `createdat` datetime DEFAULT current_timestamp(),
//   `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp(),
//   `symbol` varchar(50) DEFAULT NULL,
//   `price` varchar(40) DEFAULT NULL,
//   `assetId` int(11) unsigned DEFAULT NULL,
//   PRIMARY KEY (`id`)
// )

const cron = require('node-cron');
const db = require('../models');
const cliredisa = require('async-redis').createClient();

const getTickerPrice_sec = async () => {
  await db['assets']
    .findAll({
      where: { active: 1 },
      raw: true,
    })
    .then(async (resp) => {
      let promises = resp.map(async (el) => {
        let { socketAPISymbol } = el;
				if ( socketAPISymbol ) {}
				else { return null  }
        let price = await cliredisa.hget('STREAM_ASSET_PRICE', socketAPISymbol);
        db['tickerprice'].create({
          symbol: socketAPISymbol,
          price: price,
        });
      });
      await Promise.all(promises);
    });
};

cron.schedule('* * * * * *', async () => {
  getTickerPrice_sec();
});

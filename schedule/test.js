// const moment = require('moment');
// const db = require('../models');

// const timenow = moment().startOf('minute').unix();
// const test = async (list) => {
//   const delay = () => {
//     const randomDelay = Math.floor(Math.random() * 4) * 100;
//     return new Promise((resolve) => setTimeout(resolve, randomDelay));
//   };

//   console.log('시작');
//   const promises = list.map(async (data) => {
//     return await delay().then(() => true);
//   });
//   console.log('promises', promises);
//   const results = await Promise.all(promises);
//   console.log('promises', promises);
//   results.forEach((data) => console.log(data));
//   console.log('끝');
// };
const db = require('../models');
const axios = require('axios');
const cron = require('node-cron');
// test([1, 2, 3, 4, 5, 6, 7]);
const {
  calculate_dividendrate,
} = require('../service-rmq/cal_dividendrate-rmq');

const test2 = async () => {
  await axios.get('http://users.options1.net:30708/bets/end').then((resp) => {
    console.log(resp.data);
  });
};
cron.schedule('0 * * * * *', () => {
  test2();
});

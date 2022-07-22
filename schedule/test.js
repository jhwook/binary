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

// test([1, 2, 3, 4, 5, 6, 7]);
const {
  calculate_dividendrate,
} = require('../service-rmq/cal_dividendrate-rmq');

const test2 = async () => {
  let result = await calculate_dividendrate([1], 'LIVE');
  console.log(result);
};

test2();

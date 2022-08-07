var cron = require('node-cron');
var db = require('../models');
var moment = require('moment');
var { Op } = db.Sequelize;

cron.schedule('0 * * * * *', () => {
  let now_unix = moment().unix();
  console.log('@delete_timeout_demoUsers', now_unix);
  db.Sequelize(`DELETE FROM demoUsers WHERE timestampunixexpiry < ${now_unix}`);
  // db['demoUsers'].delete({
  //   where: { timestampunixexpiry: { [Op.lte]: now_unix } },
  // });
});

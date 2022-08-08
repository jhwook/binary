const cron = require('node-cron');
const cliredisa = require('async-redis').createClient();

const socketTest = (io) => {
  // cron.schedule('* * * * * *', () => {
  //   console.log('cron');
  //   socketMessage(io);
  // });
};

const socketMessage = async (io) => {
  let userid = await cliredisa.hget('USERNAME2SOCKID', '95');
  console.log('socketTest============================', userid);
  if (userid) {
    io.to(userid).emit('test2', '제발ㄹㄹㄹㄹㄹㄹㄹㄹ');
  }
};

module.exports = {
  socketTest,
};

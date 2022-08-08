const cliredisa = require('async-redis').createClient();

module.exports = (io, socket) => {
  const socketMessage = async (id, data) => {
    let usersocketid = await cliredisa.hget('USERNAME2SOCKID', String(id));
    console.log(id, typeof id, usersocketid);
    if (usersocketid) {
      socket.to(usersocketid).emit('bet_closed', data);
    }
  };
};

// module.exports = { socketMessage };

const cliredisa = require('async-redis').createClient();

module.exports = (io, socket) => {
  const socketMessage = async (id, data) => {
    console.log('socketid', socket.id);
    console.log('socket.decoded', socket.decoded);

    let usersocketid = await cliredisa.hget('USERNAME2SOCKID', id);

    socket.to(usersocketid).emit('bet_closed', data);
  };
};

// module.exports = { socketMessage };

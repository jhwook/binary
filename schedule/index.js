const jwt = require('jsonwebtoken');
const {
  bindUsernameSocketid,
  unbindsocket,
  deleteSocketid,
} = require('../utils/sockets');

module.exports = (io) => {
  const fs = require('fs');
  const path = require('path');
  const listenersPath = path.resolve(__dirname);
  io.use((socket, next) => {
    const err = new Error('@@@ERR@@@');
    socket.on('connect_error', (err) => {
      console.log('errrrrrrrrrrrrrrr', err);
    });
    // console.log('@@@@@@@@@@@@@@@@@@@@@@@', socket);
    fs.readdir(listenersPath, (err, files) => {
      if (err) {
        process.exit(1);
      }
      // require(path.resolve(__dirname, 'closeBets.js'))(io, socket);
      require(path.resolve(__dirname, 'socketMessage.js'))(io, socket);
      // files.map((fileName) => {
      //   if (fileName === 'closeBets.js') {
      //     require(path.resolve(__dirname, fileName))(io, socket);
      //   }
      // });
    });
    // console.log(socket.handshake);
    if (socket.handshake.query && socket.handshake.query.token) {
      jwt.verify(
        socket.handshake.query.token,
        process.env.JWT_SECRET,
        function (err, decoded) {
          if (err) return next(new Error('Authentication error'));
          console.log('successful', decoded);
          socket.decoded = decoded;
          next();
        }
      );
    } else {
      console.log('Error:: connection');
      // next(new Error('Authentication error'));
      socket.decoded = false;
      // console.log('socket.decoded', socket.decoded);
      next();
    }
  }).on('connection', async (socket) => {
    // console.log(socket.decoded, ' / ', socket.id);
    console.log(socket.sids);

    let userId;
    await jwt.verify(
      socket.handshake.query.token,
      process.env.JWT_SECRET,
      function (err, decoded) {
        if (err) return next(new Error('Authentication error'));
        socket.decoded = decoded;
        if (socket.decoded.id) {
          userId = decoded.id;
        }
        if (socket.decoded.demo_uuid) {
          userId = decoded.demo_uuid;
        }
      }
    );
    // console.log(userId, );
    if (userId) {
      bindUsernameSocketid(userId, socket.id);
    } else {
    }
    console.log(
      `@@@@@@@@@@@@@@@@@@@@@@@@${socket.id},${userId} socket connected`
    );
    // const asyncBlock = async () => {
    //   await client.set("string key", "string val");
    //   const value = await client.get("string key");
    //   console.log(value);
    //   await client.flushall("string key");
    // };

    // fs.readdir(listenersPath, (err, files) => {
    //   if (err) {
    //     process.exit(1);
    //   }
    //   require(path.resolve(__dirname, 'closeBets.js'))(io, socket);
    //   // files.map((fileName) => {
    //   //   if (fileName === 'closeBets.js') {
    //   //     require(path.resolve(__dirname, fileName))(io, socket);
    //   //   }
    //   // });
    // });

    socket.on('disconnect', () => {
      //		unbindIpPortSocket( address , socket.id )
      deleteSocketid(socket.id);
      unbindsocket(userId);

      console.log(`@@@@@@@@@@@@@@@@@@${socket.id} socket DISconnected`);
    });
  });

  io.of('/noauth').on('connection', (socket) => {
    console.log(socket.id);
    fs.readdir(listenersPath, (err, files) => {
      if (err) {
        process.exit(1);
      }
      files.map((fileName) => {
        if (fileName !== 'index.js') {
          require(path.resolve(__dirname, fileName))(io, socket);
        }
      });
    });
  });
};

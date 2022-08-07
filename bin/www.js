var app = require('../app');
var listener = require('../listener');
var schedule = require('../schedule');
var debug = require('debug')('bin-api');
var http = require('http');

require('dotenv').config();
console.log(process.env.JWT_SECRET);
const TESTPORT = 30708;

var PORT = normalizePort(process.env.PORT || TESTPORT);
app.set('port', PORT);

const LOGGER = console.log;

const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    transports: ['websocket', 'polling'],
    credentials: true,
  },
  allowEIO3: true,
});

server.listen(PORT);
server.on('error', onError);
server.on('listening', onListening);
LOGGER(`listening ${PORT} @binary`);
io.on('connection_error', (err) => {
  console.log('errrrrrrrrrrrrrrr', err);
});
listener(io);
schedule(io);
/**
 * Normalize a port into a number, string, or false.
 */
 const https = require('https');
 const fs = require('fs');
 const server_https = https
   .createServer(
     {
       key: fs
         .readFileSync('/etc/nginx/ssl/options1.net/options1.net.key')
         .toString(),
       cert: fs
         .readFileSync('/etc/nginx/ssl/options1.net/options1.net.crt')
         .toString(),
     },
     app
   )
   .listen(TESTPORT + 10);

/** const https = require('https');
const fs = require('fs');
const server_https = https
  .createServer(
    {
      key: fs.readFileSync('../bin-opt/ssl/options1.net.key').toString(),
      cert: fs.readFileSync('../bin-opt/ssl/options1.net.crt').toString(),
    },
    app
  )
  .listen(TESTPORT + 10);
*/
function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}
/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }
  var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}
/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
/**
 * Socket Server Listener
 */

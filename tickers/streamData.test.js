const WebSocket = require('ws');
const cron = require('node-cron');
const db = require('../models');
const socket = new WebSocket('wss://ws.finnhub.io?token=c9se572ad3i4aps1soq0');

socket.addEventListener('open', function (event) {
  socket.send(JSON.stringify({ type: 'subscribe', symbol: 'AAPL' }));
  // socket.send(JSON.stringify({ type: 'subscribe', symbol: 'BINANCE:BTCUSDT' }));
  // socket.send(JSON.stringify({ type: 'subscribe', symbol: 'IC MARKETS:1' }));
});

// Listen for messages
socket.addEventListener('message', function (event) {
  console.log('Message from server ', JSON.parse(event.data));
});

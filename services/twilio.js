require('dotenv').config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);

const sendMessage = (phone, CODE) => {
  client.messages
    .create({
      body: `[BETBIT] Requested access code is [${CODE}]`,
      messagingServiceSid: 'MG0b420f495dc8f54f1e9bdccce50bbd8b',
      from: '+17692468530',
      to: phone,
    })
    .then((message) => {
      return message.sid;
    });
};

module.exports = {
  sendMessage,
};

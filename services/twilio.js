const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);


const sendMessage=(phone, CODE)=>{
    client.messages
    .create({
        body: `[BETBIT] Requested access code is [${CODE}]`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone
    })
    .then(message =>{return message.sid});
}

module.exports={
    sendMessage
}
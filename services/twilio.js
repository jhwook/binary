require('dotenv').config({path: "../.env"})
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const client = require('twilio')(accountSid, authToken);


const sendMessage=(phone, CODE)=>{
    console.log("asdfasdfsadf",phone)
    client.messages
    .create({
        body: `[BETBIT] Requested access code is [${CODE}]`,
        messagingServiceSid: 'MGbd6fe115a5e00934c9b876e2e07748af',   
        from: "+13257398298",
        to: phone
    })
    .then(message =>{
        
        console.log("asdf",message)
        return message.sid});
}

module.exports={
    sendMessage
}
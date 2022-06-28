const accountSid = ""
const authToken = ""
const client = require('twilio')(accountSid, authToken);


const sendMessage=(phone, CODE)=>{
    client.messages
    .create({
        body: `[BETBIT] Requested access code is [${CODE}]`,
        messagingServiceSid: "",   
        from: "+13257398298",
        to: phone
    })
    .then(message =>{
        return message.sid});
}

module.exports={
    sendMessage
}

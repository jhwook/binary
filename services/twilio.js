const accountSid = "ACcc50295831df1a796cc95cad7b6c5e29"
const authToken = "0eb17564b185d63a59efc9742ac85255"
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
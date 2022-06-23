const Web3 = require("web3");

function watchTransfers(){
    const web3ws = new Web3(new Web3.providers.WebsocketProvider('wss://polygon-mumbai.g.alchemy.com/v2/zhUm6jYUggnzx1n9k8XdJHcB0KhH5T7d'));

    const subscription = web3ws.eth.subscribe('pendingTransactions');

    subscription.subscribe((err, res)=>{
        if(err) console.log(err);
    })
    .on('data', async (txHash)=>{
        try {
            const web3http = new Web3('https://polygon-mumbai.g.alchemy.com/v2/zhUm6jYUggnzx1n9k8XdJHcB0KhH5T7d')

            const trx = await web3http.eth.getTransaction(txHash);

            const valid = asdf;
        }
        catch(err){
            
        }
    })
}
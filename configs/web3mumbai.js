const Web3 = require('web3')
const urltestnet = 'https://polygon-mumbai.g.alchemy.com/v2/clKBAnEwDESKnvJde-_hcrEf8Nqu9q3W'
let web3 = new Web3(new Web3.providers.HttpProvider(urltestnet))

module.exports = {web3}
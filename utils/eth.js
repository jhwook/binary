
const Web3 =require( 'web3')
const getweirep=val=> Web3.utils.toWei(val)
const getethrep=val=>Web3.utils.fromWei( val )

module.exports={
  getweirep
  , getethrep
}
  


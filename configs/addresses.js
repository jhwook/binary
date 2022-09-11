const { NETTYPE } = require('./net');

const ADDRESSES = {
  MUMBAI_TESTNET: {
    USDT: '0xB80E60Fef748b0Cd27c795b5f9e26CC2A26E283C',
    USDC: '0x71a3C8c465011207200B9378302aDdA649e35de0',
    USDT_BINOPT: '0x5217fd89b12b61d866359fabf40b706199197af5',
  },
  POLYGON_MAINNET: {
    USDT: 'USDT address',
    USDC: 'USDC address',
  },
};

const contractaddr = ADDRESSES[NETTYPE];

module.exports = { contractaddr };

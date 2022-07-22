const db = require('../models');
const { watchTransfers } = require('../services/trackTx_socket');
let { Op } = db.Sequelize;
let moment = require('moment');
const cliredisa = require('async-redis').createClient();

const ASSETID_REDIS_SYMBOL = [
  '__SKIPPER__',
  'btcusdt',
  'ethusdt',
  'xrpusdt',
  'EUR/USD',
  'USD/JPY',
  'GBP/USD',
  'USD/CAD',
  'USD/CHF',
];

module.exports = (io, socket) => {
  socket.on('transactions', async (data, cb) => {
    if (!socket.decoded) {
      new Error('Authentication error');
    }
    let { id, wallet } = socket.decoded;
    let { type, txId } = data;

    await watchTransfers(wallet, type, id, txId, socket);
  });

  socket.on('bet', async (data, cb) => {
    if (!socket.decoded) {
      new Error('Authentication error');
    }
    let { id } = socket.decoded;
    let respdata = await db['bets'].findAll({
      where: {
        uid: id,
      },
      include: [
        {
          model: db['assets'],
          attributes: ['name'],
          nest: true,
        },
      ],

      nest: true,
      raw: true,
    });
    if (!respdata) {
      return;
    }
    // let currentPrice = Math.random();//현재 시세

    let list = await Promise.all(
      respdata.map(async (v) => {
        let currentPrice = await cliredisa.hget(
          'STREAM_ASSET_PRICE',
          ASSETID_REDIS_SYMBOL[v.assetId]
        );
        let winnerTotal = await db['bets'].findAll({
          where: {
            expiry: v.expiry,
            [Op.or]: [
              {
                [Op.and]: [
                  { startingPrice: { [Op.lt]: currentPrice } },
                  { side: 'LOW' },
                ],
              },
              {
                [Op.and]: [
                  { startingPrice: { [Op.gt]: currentPrice } },
                  { side: 'HIGH' },
                ],
              },
            ],
          },
          attributes: [
            'amount',
            [db.Sequelize.fn('sum', db.Sequelize.col('amount')), 'winnerTotal'],
          ],
          raw: true,
        });
        let loserTotal = await db['bets'].findAll({
          expiry: v.expiry,
          where: {
            [Op.or]: [
              {
                [Op.and]: [
                  { startingPrice: { [Op.gt]: currentPrice } },
                  { side: 'LOW' },
                ],
              },
              {
                [Op.and]: [
                  { startingPrice: { [Op.lt]: currentPrice } },
                  { side: 'HIGH' },
                ],
              },
            ],
          },
          attributes: [
            'amount',
            [db.Sequelize.fn('sum', db.Sequelize.col('amount')), 'loserTotal'],
          ],
          raw: true,
        });
        let winnerTotalAmount = winnerTotal[0].winnerTotal;
        let loserTotalAmount = loserTotal[0].loserTotal;
        // console.log(winnerTotalAmount, loserTotalAmount);
        let diffRate = 0;

        if (!winnerTotalAmount || !loserTotalAmount) {
          diffRate = 0;
        } else {
          diffRate = Number(loserTotalAmount) / Number(winnerTotalAmount);
        }
        return { ...v, currentPrice: currentPrice, diffRate: diffRate || 0 };
      })
    );
    // console.log(list);
    cb(list);
  });
};

// {
//       id: 189549,
//       createdat: 2022-07-21T06:09:15.000Z,
//       updatedat: null,
//       uid: 114,
//       assetId: 7,
//       amount: 15,
//       starting: 1658383740,
//       expiry: 1658383800,
//       startingPrice: '0.1',
//       side: 'HIGH',
//       type: 'LIVE',
//       uuid: null,
//       diffRate: 0.9928909952606635,
//       asset: { name: 'USD/CAD' },
//       currentPrice: 0.30465810658179904
//     },
//     {
//       id: 189553,
//       createdat: 2022-07-21T06:09:15.000Z,
//       updatedat: null,
//       uid: 114,
//       assetId: 8,
//       amount: 75,
//       starting: 1658383740,
//       expiry: 1658383800,
//       startingPrice: '0.1',
//       side: 'HIGH',
//       type: 'LIVE',
//       uuid: null,
//       diffRate: 0.9928909952606635,
//       asset: { name: 'USD/CHF' },
//       currentPrice: 0.30465810658179904
//     }
//   ]

/*


GET:: /transactions/branch/list

유저-> 총판 입금 기록 입니다.

Header:: {JWTtoken}

*/

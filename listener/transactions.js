const db = require('../models');
const { watchTransfers } = require('../services/trackTx_socket');
let { Op } = db.Sequelize;
let moment = require('moment');

module.exports = (io, socket) => {
  socket.on('transactions', async (data, cb) => {
    let { id, wallet } = socket.decoded;
    let { type, txId } = data;

    await watchTransfers(wallet, type, id, txId, socket);
  });

  socket.on('bet', async (data, cb) => {
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
    let currentPrice = Math.random();

    let list = await Promise.all(
      respdata.map(async (v) => {
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
        console.log(winnerTotalAmount, loserTotalAmount);
        let diffRate = 0;

        if (!winnerTotalAmount || !loserTotalAmount) {
          diffRate = 0;
        } else {
          diffRate = Number(loserTotalAmount) / Number(winnerTotalAmount);
        }
        return { ...v, currentPrice: currentPrice, diffRate: diffRate || 0 };
      })
    );
    console.log(list);
    cb(list);
  });
};

/*


GET:: /transactions/branch/list

유저-> 총판 입금 기록 입니다.

Header:: {JWTtoken}

*/

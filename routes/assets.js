var express = require('express');
var router = express.Router();
let { respok, resperr } = require('../utils/rest');
const jwt = require('jsonwebtoken');
const { softauth, auth, adminauth } = require('../utils/authMiddleware');
const db = require('../models');
var crypto = require('crypto');
const LOGGER = console.log;
let { Op } = db.Sequelize;
const axios = require('axios');
const cliredisa = require('async-redis').createClient();
const fs = require('fs');
const { upload_symbol } = require('../utils/multer');
const moment = require('moment');
const WEB_URL = 'https://options1.net/resource';

const { sendTickerDataSocketEvent } = require('../tickers/getStreamData_finnhub.js');

// router.get('/', function (req, res, next) {
//   res.send('respond with a resource');
// });

router.get('/list', softauth, async (req, res) => {
  let id;
  let { group, searchkey, date0, date1 } = req.query;
  let jfilter = {};
  if (group) {
    jfilter['groupstr'] = group;
  }
  if (searchkey) {
    jfilter = { name: { [Op.like]: `%${searchkey}%` } };
  }
  if (date0) {
    startDate = moment(date0).format('YYYY-MM-DD HH:mm:ss');
    jfilter = { ...jfilter, createdat: { [Op.gte]: startDate } };
  }
  if (date1) {
    endDate = moment(date1).format('YYYY-MM-DD HH:mm:ss');
    jfilter = { ...jfilter, createdat: { [Op.lte]: endDate } };
  }

  // if (group === 'stock') {
  //   jfilter = { ...jfilter, active: 1 };
  // }

  if (req.decoded) {
    if (req.decoded.id) {
      db['assets']
        .findAll({
          where: {
            ...jfilter,
          },
          raw: true,
        })

        .then(async (resp) => {
          let promises = resp.map(async (el) => {
            let assetId = el.id;
            await db['bookmarks']
              .findOne({
                where: { assetsId: assetId, uid: req.decoded.id },
                raw: true,
              })
              .then((resp) => {
                if (!resp) {
                  el['bookmark'] = 0;
                } else {
                  el['bookmark'] = 1;
                }
              });
          });
          await Promise.all(promises);

          respok(res, null, null, { resp });
        });
    } else {
      db['assets']
        .findAll({
          where: {
            ...jfilter,
          },

          raw: true,
        })

        .then((resp) => {
          respok(res, null, null, { resp });
          return;
        });
    }
  } else {
    db['assets']
      .findAll({
        where: {
          ...jfilter,
        },

        raw: true,
      })
      .then((resp) => {
        respok(res, null, null, { resp });
      });
  }
});

router.get('/symbols/:type/:offset/:limit', async (req, res) => {
  let { type, offset, limit } = req.params;
  offset = +offset;
  limit = +limit;
  db['twelvedataapisymbols']
    .findAll({
      offset,
      limit,
      raw: true,
    })
    .then((resp) => {
      respok(res, null, null, { resp });
    });
});

router.post('/image/add/:assetId', upload_symbol.single('img'), (req, res) => {
  const imgfile = req.file;
  let imgurl = `${WEB_URL}/symbols/${imgfile.filename}`;
  let { assetId } = req.params;
  db['assets'].update({ imgurl }, { id: assetId }).then((resp) => {
    respok(res, 'OK');
  });
});

const MAP_GROUPS_ALLOWED = { crypto: 1, forex: 1, stock: 1 };

router.post('/add/:type', upload_symbol.single('img'), async (req, res) => {
  // type => crypto / forex / stock
  LOGGER('', req.body);
  const imgfile = req.file;
  console.log('img file@@@@@@@@@@@@@@', req.file);
  let imgurl = `${WEB_URL}/symbols/${imgfile.filename}`;
  let { name, baseAsset, targetAsset, stockSymbol } = req.body;
  if (baseAsset) {
    baseAsset = baseAsset.toUpperCase();
  }
  if (targetAsset) {
    targetAsset = targetAsset.toUpperCase();
  }
  let { type } = req.params;
  let symbol, dispSymbol, APISymbol, socketAPISymbol;
  symbol = `${baseAsset}_${targetAsset}`;
  dispSymbol = `${baseAsset}${targetAsset}`;
 
  let groupstr = type;
  if (MAP_GROUPS_ALLOWED[groupstr]) {
  } else {
    resperr(res, 'NOT-SUPPORTED-GROUP');
    return;
  }
  // let resp = await db['assets'].findOne({
  //   raw: true,
  //   where: { symbol, groupstr },
  // });
  // if (resp) {
  //   resperr(res, 'DATA-DUPLICATE');
  //   return;
  // } else {
  // }
  if (type === 'crypto') {
    // APISymbol = APISymbol.slice(0, -1);
    APISymbol = `${baseAsset}${targetAsset}`;
    db['assets']
      .create({
        group: 1,
        groupstr: 'crypto',
        name,
        baseAsset,
        targetAsset,
        symbol,
        dispSymbol,
        APISymbol,
        socketAPISymbol: dispSymbol,
        imgurl: imgurl,
        active: 0,
      })
      .then((resp) => {
        respok(res, null, null, { resp });
      });
  } else if (type === 'forex') {
    APISymbol = `${baseAsset}/${targetAsset}`;
    db['assets']
      .create({
        group: 2,
        groupstr: 'forex',
        name,
        baseAsset,
        targetAsset,
        symbol,
        dispSymbol,
        APISymbol,
        socketAPISymbol: APISymbol,
        imgurl: imgurl,
        active: 0,
      })
      .then((resp) => {
        respok(res, null, null, { resp });
      });
  } else if (type === 'stock') {
    db['assets']
      .create({
        group: 3,
        groupstr: 'stock',
        name,
        // baseAsset,
        // targetAsset,
        // tickerSrc,
        symbol: stockSymbol,
        dispSymbol: stockSymbol,
        APISymbol: stockSymbol,
        socketAPISymbol: stockSymbol,
        imgurl: imgurl,
        active: 0,
      })
      .then((resp) => {
        respok(res, null, null, { resp });
      });
  } else {
  }
});

router.patch('/setting/:assetId/:active', adminauth, async (req, res) => {
  if(req.isadmin !== 2) {
    return res.status(401).json({
      code: 401,
      message: 'No Admin Privileges',
    });
  } else {}
  
  let { assetId, active } = req.params;
  let { imgurl } = req.query;
  let jupdates = {};
  if (imgurl) {
    jupdates['imgurl'] = imgurl;
  }
  if (active) {
    jupdates['active'] = active;
  }
  db['assets'] //    .update({      ...jupdates,		    })
    .update(jupdates, { where: { id: assetId } })
    .then((resp) => {
      sendTickerDataSocketEvent()
      respok(res, 'successfully modified');
    })
    .catch((err) => {
      LOGGER(err);
      resperr(res, 'INTERNAL-ERR');
      return;
    });
});

router.get('/search', async (req, res) => {
  let { assetSymbol, assetSrc } = req.query;
  let price = await axios
    .get(
      `https://api.twelvedata.com/price?symbol=${assetSymbol}&exchange=${assetSrc}&apikey=c092ff5093bf4eef83897889e96b3ba7&source=docs`
    )
    .then((resp) => {
      if (resp.data) {
        let { price } = resp.data;
        respok(res, 'Can be added', null, { price });
      } else {
        resperr(
          res,
          '**symbol** not found: EUR/US. Please specify it correctly according to API Documentation.'
        );
      }
    });
});

// router.get('/api', async (req, res) => {
//   // await axios
//   //   .get('https://api.twelvedata.com/stocks?exchange=HKEX&?source=docs')
//   //   .then((resp) => {
//   //     resp.data.data.forEach((el) => {
//   //       let { currency, name, symbol } = el;
//   //       db['twelvedataapisymbols'].create({
//   //         symbol: symbol,
//   //         description: name,
//   //         assetkind: 'stock',
//   //       });
//   //     });
//   //   });
//   await axios
//     .get('https://finnhub.io/api/v1/forex/symbol?exchange=fxcm&token=c9se572ad3i4aps1soq0')
//     .then((resp) => {
//       // console.log(resp.data);
//       // respok(res,null,null, resp.data)
//       resp.data.forEach((el) => {
//         let { description, displaySymbol, symbol } = el;
  
//         let targetAsset = displaySymbol.split('/')[0]
//         let baseAsset = displaySymbol.split('/')[1]
//         let vendor = symbol.split(':')[0];
//         let symbol_ = symbol.split(':')[1];
//         console.log(targetAsset,baseAsset,vendor,symbol_);
//         db['finnhubapisymbols'].create({
//           symbol: symbol_,
//           description: description,
//           assetkind: 'forex',
//           exchanges: vendor,
//           targetAsset: targetAsset,
//           baseAsset: baseAsset
//         });
//       });
//     });
// });

router.get('/api/docs/:type/:offset/:limit', async (req, res) => {
  let { type, offset, limit } = req.params;
  let { searchkey } = req.query;
  offset = +offset;
  limit = +limit;
  let jfilter = {};
  if(searchkey) {
    jfilter = {
      ...jfilter,
      description : {
        [Op.like]: `%${searchkey}%`
      },
    }
  }
  if(type === 'crypto' || type === 'forex') {
    await db['finnhubapisymbols'].findAndCountAll({
      where: {
        ...jfilter,
        assetkind: type
      },
      raw: true,
      offset,
      limit,
    }).then((resp) => {
      respok(res, null, null, resp);
    })
  } else if(type === 'stock') {
    await db['twelvedataapisymbols'].findAndCountAll({
      where: {
        ...jfilter,
        assetkind: type
      },
      raw: true,
      offset,
      limit,
    }).then((resp) => {
      respok(res, null, null, resp);
    })
  }
})

router.get('/ticker/price', async (req, res) => {
  let { symbol } = req.query;
  await db['tickerprice']
    .findAll({
      where: { symbol },
      order: [['id', 'DESC']],
      limit: 5000,
    })
    .then((resp) => {
      resp = resp.reverse();
      respok(res, null, null, { resp });
    });
});

module.exports = router;

// CREATE TABLE `twelvedataapisymbols` (
//   `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
//   `createdat` datetime DEFAULT current_timestamp(),
//   `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp(),
//   `symbol` varchar(60) DEFAULT NULL,
//   `displaySymbol` varchar(60) DEFAULT NULL,
//   `description` text DEFAULT NULL,
//   `vendorname` varchar(60) DEFAULT NULL,
//   `assetkind` varchar(60) DEFAULT NULL,
//   `exchanges` varchar(60) DEFAULT NULL,
//   `active` tinyint(4) DEFAULT 1,
//   PRIMARY KEY (`id`)
// )

var express = require('express');
let { respok, resperr } = require('../utils/rest');
const jwt = require('jsonwebtoken');
const { softauth, auth, adminauth } = require('../utils/authMiddleware');
const db = require('../models');
var crypto = require('crypto');
const LOGGER = console.log;
let { Op } = db.Sequelize;
const axios = require('axios');
const cliredisa = require('async-redis').createClient();

var router = express.Router();

// router.get('/', function (req, res, next) {
//   res.send('respond with a resource');
// });

router.get('/list', softauth, async (req, res) => {
  let id;
  let { group, searchkey } = req.query;
  let jfilter = {};
  if (group) {
    jfilter['groupstr'] = group;
  }
  if (searchkey) {
    jfilter = { name: { [Op.like]: `%${searchkey}%` } };
  }
  console.log('jfilter', jfilter);
  console.log(req.decoded);
  if (req.decoded) {
    if (req.decoded.id) {
      id = req.decoded.id;
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
                where: { assetsId: assetId, uid: id },
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

router.post('/add/:type', (req, res) => {
  // type => crypto / forex / stock
  let { name, baseAsset, targetAsset, tickerSrc, imgurl } = req.body;
  let { type } = req.params;
  let symbol, dispSymbol, APISymbol, socketAPISymbol;
  symbol = `${baseAsset}_${targetAsset}`;
  dispSymbol = `${baseAsset}${targetAsset}`;
  APISymbol = `${baseAsset}/${targetAsset}`;
  if (type === 'crypto') {
    APISymbol = APISymbol.slice(0, -1);
    db['assets']
      .create({
        group: 1,
        groupstr: 'crypto',
        name,
        baseAsset,
        targetAsset,
        tickerSrc,
        imgurl,
        symbol,
        dispSymbol,
        APISymbol,
        socketAPISymbol: dispSymbol,
      })
      .then((resp) => {
        respok(res, null, null, { resp });
      });
  } else if (type === 'forex') {
    db['assets']
      .create({
        group: 2,
        groupstr: 'forex',
        name,
        baseAsset,
        targetAsset,
        tickerSrc,
        imgurl,
        symbol,
        dispSymbol,
        APISymbol,
        socketAPISymbol: APISymbol,
      })
      .then((resp) => {
        respok(res, null, null, { resp });
      });
  } else if (type === 'stock') {
  } else {
  }
});

router.patch('/setting/:assetId/:active', async (req, res) => {
  let { assetId, active } = req.params;
  let { imgurl } = req.query;
  let jfilter = {};
  if (imgurl) {
    jfilter['imgurl'] = imgurl;
  }
  if (active) {
    jfilter['active'] = active;
  }
  db['assets']
    .update(
      {
        ...jfilter,
      },
      { where: { id: assetId } }
    )
    .then((resp) => {
      respok(res, 'successfully modified');
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

module.exports = router;

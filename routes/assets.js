var express = require("express");
var router = express.Router();
let { respok, resperr } = require("../utils/rest");
const jwt = require("jsonwebtoken");
const { softauth, auth, adminauth } = require("../utils/authMiddleware");
const db = require("../models");
var crypto = require("crypto");
const LOGGER = console.log;
let { Op } = db.Sequelize;
const axios = require("axios");
const cliredisa = require("async-redis").createClient();
const fs = require("fs");
const { upload_symbol } = require("../utils/multer");
const moment = require("moment");
const WEB_URL = "https://options1.net/resource";
const { findone, findall, createifnoneexistent } = require("../utils/db");
const { v4: uuidv4 } = require("uuid");
const { synthesize_forex_pair_image } = require("../utils/synthesize-image");

const {
  sendTickerDataSocketEvent,
} = require("../tickers/getStreamData_finnhub.js");
const {
  sendTwelveDataSocketEvent,
} = require("../tickers/getStreamData_twelveData.js");

// router.get('/', function (req, res, next) {
//   res.send('respond with a resource');
// });

router.get("/list", softauth, async (req, res) => {
  let start_time = moment()
    .subtract(2, "minute")
    .set("second", 0)
    .format("YYYY-MM-DD HH:mm:ss");
  let end_time = moment()
    .subtract(1, "minute")
    .set("second", 0)
    .format("YYYY-MM-DD HH:mm:ss");
  let id;
  let { group, searchkey, date0, date1 } = req.query;
  let jfilter = {};
  if (group && group !== "crypto") {
    jfilter["groupstr"] = group;
  } else if (group && group === "crypto") {
    jfilter["groupstr"] = "coin";
  }
  if (searchkey) {
    // jfilter = { ...jfilter, [Op.or]: [ { name: { [Op.like]: `%${searchkey}%` }}, { groupstr: { [Op.like]: `%${searchkey}%` }} ]};
    jfilter = { ...jfilter, name: { [Op.like]: `%${searchkey}%` } };
  }
  if (date0) {
    startDate = moment(date0).format("YYYY-MM-DD HH:mm:ss");
    jfilter = { ...jfilter, createdat: { [Op.gte]: startDate } };
  }
  if (date1) {
    endDate = moment(date1).format("YYYY-MM-DD HH:mm:ss");
    jfilter = { ...jfilter, createdat: { [Op.lte]: endDate } };
  }
  console.log(start_time);
  console.log(end_time);

  if (req.decoded) {
    if (req.decoded.id) {
      db["assets"]
        .findAll({
          where: {
            ...jfilter,
            active: 1,
          },
          raw: true,
        })

        .then(async (resp) => {
          let promises = resp.map(async (el) => {
            let assetId = el.id;
            let price = await db["tickerprice"].findAll({
              where: {
                assetId: assetId,
                createdat: {
                  [Op.or]: [start_time, end_time],
                },
              },
              order: [["id", "ASC"]],
              raw: true,
            });

            let [startPrice, endPrice] = price;

            if (endPrice && startPrice) {
              el["close"] = endPrice.price;
              el["change"] = (endPrice.price - startPrice.price).toFixed(2);
            } else {
              price = await db["tickerprice"].findAll({
                where: {
                  assetId: assetId,
                },
                order: [["id", "DESC"]],
                limit: 2,
                raw: true,
              });
              let [startPrice, endPrice] = price;

              if (endPrice && startPrice) {
                el["close"] = endPrice.price;
                el["change"] = endPrice.price - startPrice.price;
              } else {
                el["close"] = 0;
                el["change"] = 0;
              }
            }

            await db["bookmarks"]
              .findOne({
                where: { assetsId: assetId, uid: req.decoded.id },
                raw: true,
              })
              .then((resp) => {
                if (!resp) {
                  el["bookmark"] = 0;
                } else {
                  el["bookmark"] = 1;
                }
              });
          });
          await Promise.all(promises);

          respok(res, null, null, { resp });
        });
    } else {
      db["assets"]
        .findAll({
          where: {
            ...jfilter,
            active: 1,
          },
          raw: true,
        })
        .then(async (resp) => {
          let promises = resp.map(async (el) => {
            let assetId = el.id;
            let price = await db["tickerprice"].findAll({
              where: {
                assetId: assetId,
                createdat: {
                  [Op.or]: [start_time, end_time],
                },
              },
              order: [["id", "ASC"]],
              raw: true,
            });

            let [startPrice, endPrice] = price;

            if (endPrice && startPrice) {
              el["close"] = endPrice.price;
              el["change"] = (endPrice.price - startPrice.price).toFixed(2);
            } else {
              price = await db["tickerprice"].findAll({
                where: {
                  assetId: assetId,
                },
                order: [["id", "DESC"]],
                limit: 2,
                raw: true,
              });
              let [startPrice, endPrice] = price;

              if (endPrice && startPrice) {
                el["close"] = endPrice.price;
                el["change"] = endPrice.price - startPrice.price;
              } else {
                el["close"] = 0;
                el["change"] = 0;
              }
            }
          });
          await Promise.all(promises);
          respok(res, null, null, { resp });
          return;
        });
    }
  } else {
    db["assets"]
      .findAll({
        where: {
          ...jfilter,
          active: 1,
        },

        raw: true,
      })
      .then(async (resp) => {
        let promises = resp.map(async (el) => {
          let assetId = el.id;
          let price = await db["tickerprice"].findAll({
            where: {
              assetId: assetId,
              createdat: {
                [Op.or]: [start_time, end_time],
              },
            },
            order: [["id", "ASC"]],
            raw: true,
          });

          let [startPrice, endPrice] = price;

          if (endPrice && startPrice) {
            el["close"] = endPrice.price;
            el["change"] = (endPrice.price - startPrice.price).toFixed(2);
          } else {
            price = await db["tickerprice"].findAll({
              where: {
                assetId: assetId,
              },
              order: [["id", "DESC"]],
              limit: 2,
              raw: true,
            });
            let [startPrice, endPrice] = price;

            if (endPrice && startPrice) {
              el["close"] = endPrice.price;
              el["change"] = endPrice.price - startPrice.price;
            } else {
              el["close"] = 0;
              el["change"] = 0;
            }
          }
        });
        await Promise.all(promises);
        respok(res, null, null, { resp });
        return;
      });
  }
});
const sharp = require("sharp");
router.post("/test/merge-images/:base/:quote", async (req, res) => {
  let { base, quote } = req.params;
  const file0 = "/var/www/html/resource/flags/KOR.png";
  const file1 = "/var/www/html/resource/flags/EUR.jpeg";
  const fileout = `/var/www/html/tmp/${base}-${quote}.png`;
  let img0 = await sharp(file0);
  let img1 = await sharp(file1);
  img0.composite([{ input: file1 }]).toFile(fileout);
  respok(res);
});
const Jimp = require("jimp");
router.post("/test/merge-two-images/:base/:quote", async (req, res) => {
  let { base, quote } = req.params;
  base = "KRW";
  quote = "JPY";
  let { urllogo: urllogo0 } = await findone("forexcurrencies", {
    symbol: base,
  });
  let { urllogo: urllogo1 } = await findone("forexcurrencies", {
    symbol: quote,
  });
  //	let img0 = await Jimp.read ( urllogo0 )
  // let img1 = await Jimp.read ( urllogo1 )
  //	let img0 = await Jimp.read ( '/var/www/html/resource/flags/KRW.svg' )
  //let img1 = await Jimp.read ( '/var/www/html/resource/flags/JPY.svg' )
  let img0 = await Jimp.read("/var/www/html/resource/flags/KOR.png");
  let img1 = await Jimp.read("/var/www/html/resource/flags/EUR.jpeg");
  img0.composite((await img1.resize(128, 128), 0, 0)); //create and attachment using buffer from edited picture and sending it
  //	await img0.getBufferAsync(Jimp.MIME_PNG)
  await img0.write(`/var/www/html/tmp/${base}-${quote}.png`);
  respok(res);
});
router.post("/synthesize/image", async (req, res) => {
  let { base, target, name } = req.body;
  if (!base || !target || !name) {
    resperr(res, "MISSING ASSETS!");
    return;
  }

  let imgurl = await synthesize_forex_pair_image(base, target);
  let uuid = uuidv4();
  await createifnoneexistent(
    "assets",
    { symbol: `${base}_${target}` },
    {
      name,
      symbol: `${base}_${target}`,
      baseAsset: base,
      targetAsset: target,
      imgurl,
      uuid,
      tickerSrc: "FXCM",
      group: 2,
      groupstr: "forex",
      active: 1,
    }
  );
  respok(res, "Successfully added to assets!");
});
router.post("/image/add/:assetId", upload_symbol.single("img"), (req, res) => {
  const imgfile = req.file;
  let imgurl = `${WEB_URL}/symbols/${imgfile.filename}`;
  let { assetId } = req.params;
  db["assets"].update({ imgurl }, { id: assetId }).then((resp) => {
    respok(res, "OK");
  });
});

const MAP_GROUPS_ALLOWED = { coin: 1, forex: 1, stock: 1 };

router.post("/add/:type", upload_symbol.single("img"), async (req, res) => {
  // type => coin / forex / stock
  LOGGER("", req.body);
  const imgfile = req.file;
  console.log("img file@@@@@@@@@@@@@@", req.file);
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
    resperr(res, "NOT-SUPPORTED-GROUP");
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
  if (type === "coin" || type === "crypto") {
    // APISymbol = APISymbol.slice(0, -1);
    console.log('baseAsset', baseAsset);
    console.log('targetAsset', targetAsset);
    APISymbol = `${baseAsset}${targetAsset}`;
    await db['finnhubapisymbols'].findOne({
      where: { symbol: APISymbol, assetkind: 'coin' },
      raw: true,
    }).then(async (resp) => {
      if(!resp) {
        resperr(res, 'UNSUPPORTED_ASSET')
        return;
      } else {
        await db['assets'].findOne({
          where: { APISymbol: APISymbol }, 
          raw: true,
        }).then((resp) => {
          if(resp) {
            resperr(res, 'EXIST_ASSET');
            return
          } else {
            db["assets"]
            .create({
              group: 1,
              groupstr: "coin",
              name,
              baseAsset,
              targetAsset,
              symbol,
              dispSymbol,
              APISymbol,
              tickerSrc: "Binance",
              socketAPISymbol: dispSymbol,
              imgurl: imgurl,
              active: 0,
            })
            .then((resp) => {
              respok(res, null, null, { resp });
            });
          }
        })
      }
    })
  } else if (type === "forex") {
    APISymbol = `${baseAsset}/${targetAsset}`;
    await db['finnhubapisymbols'].findOne({
      where: { symbol: APISymbol, assetkind: 'forex' },
      raw: true,
    }).then(async (resp) => {
      if(!resp) {
        resperr(res, 'UNSUPPORTED_ASSET')
        return;
      } else {
        await db['assets'].findOne({
          where: { APISymbol: APISymbol }, 
          raw: true,
        }).then((resp) => {
          if(resp) {
            resperr(res, 'EXIST_ASSET');
            return;
          } else {
            db["assets"]
            .create({
              group: 2,
              groupstr: "forex",
              name,
              baseAsset,
              targetAsset,
              symbol,
              dispSymbol,
              APISymbol,
              tickerSrc: "FXCM",
              socketAPISymbol: APISymbol,
              imgurl: imgurl,
              active: 0,
            })
            .then((resp) => {
              respok(res, null, null, { resp });
            });
          }
        })
      }
    })
    
  } else if (type === "stock") {
    await db['twelvedataapisymbols'].findOne({
      where: { symbol: stockSymbol },
      raw: true,
    }).then(async (resp) => {
      if(!resp) {
        resperr(res, 'UNSUPPORTED_ASSET')
        return;
      } else {
        await db['assets'].findOne({
          where: { APISymbol: stockSymbol }, 
          raw: true,
        }).then((resp) => {
          if(resp) {
            resperr(res, 'EXIST_ASSET');
            return;
          } else {
            db["assets"]
            .create({
              group: 3,
              groupstr: "stock",
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
          }
        })
      }
    })
    
  } else {
  }
});

router.patch("/setting/:assetId/:active", adminauth, async (req, res) => {
  if (req.isadmin !== 2) {
    return res.status(401).json({
      code: 401,
      message: "No Admin Privileges",
    });
  } else {
  }

  let { assetId, active } = req.params;
  let { imgurl } = req.query;
  let jupdates = {};
  if (imgurl) {
    jupdates["imgurl"] = imgurl;
  }
  if (active) {
    jupdates["active"] = active;
  }
  db["assets"] //    .update({      ...jupdates,		    })
    .update(jupdates, { where: { id: assetId } })
    .then((resp) => {
      sendTickerDataSocketEvent();
      sendTwelveDataSocketEvent();
      respok(res, "successfully modified");
    })
    .catch((err) => {
      LOGGER(err);
      resperr(res, "INTERNAL-ERR");
      return;
    });
});

router.get("/search", async (req, res) => {
  let { assetSymbol, assetSrc } = req.query;
  let price = await axios
    .get(
      `https://api.twelvedata.com/price?symbol=${assetSymbol}&exchange=${assetSrc}&apikey=c092ff5093bf4eef83897889e96b3ba7&source=docs`
    )
    .then((resp) => {
      if (resp.data) {
        let { price } = resp.data;
        respok(res, "Can be added", null, { price });
      } else {
        resperr(
          res,
          "**symbol** not found: EUR/US. Please specify it correctly according to API Documentation."
        );
      }
    });
});

router.get("/api", async (req, res) => {
  // await axios
  //   .get('https://api.twelvedata.com/stocks?exchange=HKEX&?source=docs')
  //   .then((resp) => {
  //     resp.data.data.forEach((el) => {
  //       let { currency, name, symbol } = el;
  //       db['twelvedataapisymbols'].create({
  //         symbol: symbol,
  //         description: name,
  //         assetkind: 'stock',
  //       });
  //     });
  //   });
  await axios
    .get(
      "https://finnhub.io/api/v1/forex/symbol?exchange=fxcm&token=c9se572ad3i4aps1soq0"
    )
    .then((resp) => {
      // console.log(resp.data);
      // respok(res,null,null, resp.data)
      resp.data.forEach((el) => {
        let { description, displaySymbol, symbol } = el;

        let baseAsset = displaySymbol.split("/")[0];
        let targetAsset = displaySymbol.split("/")[1];
        let vendor = symbol.split(":")[0];
        let symbol_ = symbol.split(":")[1];
        console.log(targetAsset, baseAsset, vendor, symbol_);
        db["finnhubapisymbols"].create({
          symbol: symbol_,
          description: description,
          assetkind: "forex",
          exchanges: vendor,
          targetAsset: targetAsset,
          baseAsset: baseAsset,
        });
      });
    });
});

router.get("/api/docs/:type/:offset/:limit", async (req, res) => {
  let { type, offset, limit } = req.params;
  let { searchkey } = req.query;
  offset = +offset;
  limit = +limit;
  let jfilter = {};
  if (searchkey) {
    jfilter = {
      ...jfilter,
      description: {
        [Op.like]: `%${searchkey}%`,
      },
    };
  }
  if (type === "coin" || type === "forex") {
    await db["finnhubapisymbols"]
      .findAndCountAll({
        where: {
          ...jfilter,
          assetkind: type,
        },
        raw: true,
        offset,
        limit,
      })
      .then(async (resp) => {
        if(type === 'forex') {
          let promises = resp.rows.map(async (el) => {
            let { baseAsset, targetAsset } = el;
            if(baseAsset) {
              let baseAssetData = await db['forexcurrencies'].findOne({
                where: { name: baseAsset },
                raw: true,
              })
              if(baseAssetData) {
                let { urllogo } = baseAssetData
                if(urllogo) {
                  el['baseAsset_imgurl'] = baseAssetData.urllogo;
                }
              }
            }
           
            if(targetAsset) {
              let targetAssetData = await db['forexcurrencies'].findOne({
                where: { name: targetAsset },
                raw: true,
              })
              if(targetAssetData) {
                let { urllogo } = targetAssetData
                if(urllogo) {
                  el['targetAsset_imgurl'] = targetAssetData.urllogo;
                }
              }   
            }
          })
          await Promise.all(promises)
        }
        respok(res, null, null, resp);
      });
  } else if (type === "stock") {
    await db["twelvedataapisymbols"]
      .findAndCountAll({
        where: {
          ...jfilter,
          assetkind: type,
        },
        raw: true,
        offset,
        limit,
      })
      .then((resp) => {
        respok(res, null, null, resp);
      });
  }
});

router.get("/ticker/price", async (req, res) => {
  let { symbol, limit } = req.query;
  if(limit) {
    limit = +limit
  } else {
    limit =5000;
  }

  await db["tickerprice"]
    .findAll({
      where: { symbol },
      order: [["id", "DESC"]],
      limit: limit,
    })
    .then((resp) => {
      resp = resp.reverse();
      respok(res, null, null, { resp });
    });
});

router.get("/time/frame", async (req, res) => {
  
})

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

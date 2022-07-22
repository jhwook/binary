var express = require('express');
let { respok, resperr } = require('../utils/rest');
const jwt = require('jsonwebtoken');
const { softauth, auth, adminauth } = require('../utils/authMiddleware');
const db = require('../models');
var crypto = require('crypto');
const LOGGER = console.log;
let { Op } = db.Sequelize;
const moment = require('moment');

var router = express.Router();

router.get('/sum/rows/:tablename/:fieldname', adminauth, async (req, res) => {
  let startDate = moment().startOf('days').format('YYYY-MM-DD HH:mm:ss');
  let endDate = moment()
    .startOf('days')
    .add(1, 'days')
    .format('YYYY-MM-DD HH:mm:ss');

  let { tablename, fieldname } = req.params;
  let { itemdetail, userdetail, filterkey, filterval, nettype, date0, date1 } =
    req.query;
  let { searchkey } = req.query;
  let jfilter = {};
  // jfilter[fieldname] = fieldval;

  console.log('req.query', req.query);

  if (date0) {
    startDate = moment(date0).format('YYYY-MM-DD HH:mm:ss');
  }
  if (date1) {
    endDate = moment(date1).format('YYYY-MM-DD HH:mm:ss');
  }

  db[tablename]
    .findAndCountAll({
      where: {
        ...jfilter,
        createdat: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
      },
      attributes: [
        [db.Sequelize.fn('SUM', db.Sequelize.col(fieldname)), 'sum'],
      ],
      raw: true,
    })
    .then((resp) => {
      // console.log(resp); //[ { sum: '176555000000' } ]
      respok(res, null, null, { data: resp });
    });
});

router.get('/list/users/:offset/:limit', adminauth, async (req, res) => {
  let { offset, limit } = req.params;
  offset = +offset;
  limit = +limit;
  let jfilter = {};
  //   models.Projects.findAll({
  //     include:[
  //              {
  //                  model: models.User,
  //                  as:'users',
  //                  through: {attributes: ['role'], as: 'role'}
  //              }]
  // }).then(function(result) {
  //      // ...
  // });
  db['users']
    .findAndCountAll({
      where: {
        ...jfilter,
      },
      // include: [
      //   {
      //     model: 'user'
      //   }
      // ],
      offset,
      limit,
      raw: true,
    })
    .then(async (resp) => {
      let promises = resp.rows.map(async (el) => {
        let { id } = el;
        await db['referrals']
          .findOne({ where: { referral_uid: id }, raw: true })
          .then(async (resp) => {
            if (resp) {
              let refer_user = await db['users'].findOne({
                where: { id: resp.referer_uid },
                raw: true,
              });
              el['refer_user'] = refer_user;
            }
          });
        let [{ sum_deposit }] = await db['transactions'].findAll({
          where: { uid: id, typestr: 'DEPOSIT' },
          raw: true,
          attributes: [
            [db.Sequelize.fn('SUM', db.Sequelize.col('amount')), 'sum_deposit'],
          ],
        });
        el['sum_deposit'] = sum_deposit;
        let [{ sum_withdraw }] = await db['transactions'].findAll({
          where: { uid: id, typestr: 'WITHDRAW' },
          raw: true,
          attributes: [
            [
              db.Sequelize.fn('SUM', db.Sequelize.col('amount')),
              'sum_withdraw',
            ],
          ],
        });
        el['sum_withdraw'] = sum_withdraw;
        el['usd_amount'] = await db['balances']
          .findOne({ where: { uid: id, typestr: 'LIVE' }, raw: true })
          .then((resp) => {
            return resp.total / 10 ** 6;
          });
        return el;
      });
      await Promise.all(promises);
      respok(res, null, null, { data: resp });
    });
});

router.get(
  '/betrounds/list/:asset/:offset/:limit',
  adminauth,
  async (req, res) => {
    let { asset, offset, limit } = req.params;
    // asset = crypto / forex / stock
    offset = +offset;
    limit = +limit;
    let assetList = await db['assets'].findAll({
      where: { groupstr: asset },
      raw: true,
    });
    console.log(assetList);
    let list = [];
    assetList.map((v) => {
      list.push(v.id);
    });

    await db['logrounds']
      .findAll({
        where: {
          assetId: {
            [Op.in]: list,
          },
        },
        raw: true,
        offset,
        limit,
        order: [['id', 'DESC']],
      })
      .then(async (resp) => {
        // console.log(resp);
        respok(res, null, null, { data: resp });
      });
  }
);

router.get(
  '/rows/:tablename/:fieldname/:fieldval/:offset/:limit/:orderkey/:orderval',
  async (req, res) => {
    let { tablename, fieldname, fieldval, offset, limit, orderkey, orderval } =
      req.params;
    let {
      itemdetail,
      userdetail,
      filterkey,
      filterval,
      nettype,
      date0,
      date1,
    } = req.query;
    let { searchkey } = req.query;
    console.log('req.query', req.query);

    fieldexists(tablename, fieldname).then(async (resp) => {
      if (resp) {
      } else {
        resperr(res, messages.MSG_DATANOTFOUND);
        return;
      }
      offset = +offset;
      limit = +limit;
      if (ISFINITE(offset) && offset >= 0 && ISFINITE(limit) && limit >= 1) {
      } else {
        resperr(res, messages.MSG_ARGINVALID, null, {
          payload: { reason: 'offset-or-limit-invalid' },
        });
        return;
      }
      if (MAP_ORDER_BY_VALUES[orderval]) {
      } else {
        resperr(res, messages.MSG_ARGINVALID, null, {
          payload: { reason: 'orderby-value-invalid' },
        });
        return;
      }
      let respfield_orderkey = await fieldexists(tablename, orderkey);
      if (respfield_orderkey) {
      } else {
        resperr(res, messages.MSG_ARGINVALID, null, {
          payload: { reason: 'orderkey-invalid' },
        });
        return;
      }
      let jfilter = {};
      jfilter[fieldname] = fieldval;
      if (filterkey && filterval) {
        let respfieldexists = await fieldexists(tablename, filterkey);
        if (respfieldexists) {
        } else {
          resperr(res, messages.MSG_DATANOTFOUND);
          return;
        }
        jfilter[filterkey] = filterval;
      } else {
      }
      if (searchkey) {
        let liker = convliker(searchkey);
        let jfilter_02 = expand_search(tablename, liker);
        jfilter = { ...jfilter, ...jfilter_02 };
        console.log('jfilter', jfilter);
      } else {
      }
      if (date0) {
        jfilter = {
          ...jfilter,
          createdat: {
            [Op.gte]: moment(date0).format('YYYY-MM-DD HH:mm:ss'),
          },
        };
      }
      if (date1) {
        jfilter = {
          ...jfilter,
          createdat: {
            [Op.lte]: moment(date1).format('YYYY-MM-DD HH:mm:ss'),
          },
        };
      }
      if (nettype) {
        jfilter['nettype'] = nettype;
      }
      db[tablename]
        .findAll({
          raw: true,
          where: { ...jfilter },
          offset,
          limit,
          order: [[orderkey, orderval]],
        })
        .then(async (list_00) => {
          let count = await countrows_scalar(tablename, jfilter);
          if (list_00 && list_00.length && list_00[0].itemid) {
            let aproms = [];
            list_00.forEach((elem) => {
              aproms[aproms.length] = queryitemdata_nettype(
                elem.itemid,
                nettype
              );
            });
            Promise.all(aproms).then((list_01) => {
              let list = list_01.map((elem, idx) => {
                return { ...elem, ...list_00[idx] };
              });
              respok(res, null, null, { list: list, payload: { count } });
            });
          } else {
            respok(res, null, null, { list: list_00, payload: { count } });
          }
        });
    });
  }
);

module.exports = router;

var express = require('express');
var router = express.Router();
const { auth, adminauth } = require('../utils/authMiddleware');
const moment = require('moment');

const { respok, resperr } = require('../utils/rest');
const db = require('../models');

router.post('/enroll', auth, (req, res) => {
  let { id } = req.decoded;
  let { title, content } = req.body;
  db['inquiry']
    .create({
      writer_uid: id,
      title,
      content,
      status: 0,
    })
    .then((resp) => {
      respok(res, 'OK');
    });
});

router.get('/:offset/:limit/:orderkey/:orderval', (req, res) => {
  let { offset, limit, orderkey, orderval } = req.params;
  let { date0, date1 } = req.query;

  offset = +offset;
  limit = +limit;
  let jfilter = {};

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
  if (date0 && date1) {
    jfilter = {
      ...jfilter,
      createdat: {
        [Op.gte]: moment(date0).format('YYYY-MM-DD HH:mm:ss'),
        [Op.lte]: moment(date1).format('YYYY-MM-DD HH:mm:ss'),
      },
    };
  }
  db['inquiry']
    .findAndCountAll({
      where: { ...jfilter },
      offset,
      limit,
      order: [[orderkey, orderval]],
      raw: true,
    })
    .then(async (resp) => {
      let promises = resp.rows.map(async (el) => {
        await db['users']
          .findOne({
            where: { id: el.writer_uid },
            raw: true,
          })
          .then((resp) => {
            el['writer_info'] = resp;
          });
      });
      await Promise.all(promises);
      respok(res, null, null, { resp });
    });
});

router.post('/answer/:id', async (req, res) => {
  let { answer } = req.body;
  let { id } = req.params;

  db['inquiry']
    .update(
      {
        answer,
        status: 1,
      },
      {
        where: { id },
      }
    )
    .then((resp) => {
      respok(res, 'OK');
    });
});

module.exports = router;

// CREATE TABLE `inquiry` (
//   `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
//   `createdat` datetime DEFAULT current_timestamp(),
//   `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp(),
//   `type` varchar(80) DEFAULT NULL,
//   `title` varchar(200) DEFAULT NULL,
//   `writer_uid` varchar(200) DEFAULT NULL,
//   `content` varchar(300) DEFAULT NULL,
//   `answer` varchar(300) DEFAULT NULL,
//   `imageurl` varchar(300) DEFAULT NULL,
//   `status` int(11) DEFAULT 0,
//   PRIMARY KEY (`id`)
// );

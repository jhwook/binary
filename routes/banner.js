var express = require('express');
var router = express.Router();

const { respok, resperr } = require('../utils/rest');
const fs = require('fs');
const db = require('../models');
const ejs = require('ejs');
const moment = require('moment');
const { upload } = require('../utils/multer');
const WEB_URL = 'https://options1.net/resource';

// 이미지 업로드
router.post('/enroll', upload.single('img'), async (req, res) => {
  const imgfile = req.file;
  let { type, title, external_link } = req.body;
  console.log(req.file);
  if (imgfile) {
  } else {
    resperr(res, '');
    return;
  }
  db['banners']
    .create({
      imageurl: `${WEB_URL}/banners/${imgfile.filename}`,
      type,
      title,
      external_link,
    })
    .then((_) => {
      respok(res, 'OK');
    });
});

// //edit banner pic
// router.put('/edit_banner_pic', upload.single('img'), async (req, res) => {
//   const imgfile = req.file;
//   let { type, title, id, external_link } = req.body;
//   if (imgfile) {
//   } else {
//     resperr(res, messages.MSG_ARGMISSING);
//     return;
//   }
//   db['banners'].findOne({ where: { id }, active: 1 }).then(async (_) => {
//     db['banners']
//       .update(
//         {
//           imageurl: `${WEB_URL}/banners/${imgfile.filename}`,
//           type,
//           title,
//           external_link,
//         },
//         {
//           where: {
//             id,
//             active: 1,
//           },
//         }
//       )
//       .then((_) => {
//         respok(res, 'OK');
//       });
//   });
// });

// //EditBanner
// router.put('/edit_banner/:id/:isBanner', async (req, res) => {
//   let { id, isBanner } = req.params;

//   db['banners'].findOne({ where: { id }, active: 1 }).then((_) => {
//     db['banners']
//       .update(
//         {
//           isBanner: isBanner,
//         },
//         {
//           where: {
//             id,
//             active: 1,
//           },
//         }
//       )
//       .then((_) => {
//         respok(res, 'OK');
//       });
//   });
// });

// //delete banner
// router.delete('/delete_banner/:id', async (req, res) => {
//   let { id } = req.params;

//   db['banners'].findOne({ where: { id }, active: 1 }).then((_) => {
//     db['banners']
//       .destroy({
//         where: {
//           id,
//           active: 1,
//         },
//       })
//       .then((_) => {
//         respok(res, 'OK');
//       });
//   });
// });

module.exports = router;

// CREATE TABLE `banners` (
//   `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
//   `createdat` datetime DEFAULT current_timestamp(),
//   `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp(),
//   `type` varchar(80) DEFAULT NULL,
//   `title` varchar(200) DEFAULT NULL,
//   `description` varchar(300) DEFAULT NULL,
//   `imageurl` varchar(300) DEFAULT NULL,
//   `active` int(11) DEFAULT 0,
//   `isBanner` int(11) DEFAULT 1,
//   `external_link` varchar(200) DEFAULT NULL,
//   PRIMARY KEY (`id`)
// )

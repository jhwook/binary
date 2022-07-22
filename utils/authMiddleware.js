const jwt = require('jsonwebtoken');
const db = require('../models');
require('dotenv').config();
exports.auth = (req, res, next) => {
  try {
    jwt.verify(
      `${req.headers.authorization}`,
      process.env.JWT_SECRET,
      (err, decoded) => {
        if (err) {
          throw err;
        }
        req.decoded = decoded;
        console.log(req.decoded);
        return next();
      }
    );
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(419).json({
        code: 419,
        message: 'Token Expired.',
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        code: 401,
        message: 'Token Invalid.',
      });
    }
  }
};

exports.softauth = (req, res, next) => {
  try {
    jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    req.decoded = false;
    return next();
  }
};

exports.adminauth = async (req, res, next) => {
  let { id } = jwt.verify(
    `${req.headers.authorization}`,
    process.env.JWT_SECRET,
    (err, decoded) => {
      if (err) {
        throw err;
      }

      return decoded;
    }
  );

  let user = await db['users'].findOne({ where: { id }, raw: true });
  console.log('user.isadmin', user.isadmin);
  console.log('user.isbranch', user.isbranch);
  if (user.isadmin === user.isbranch) {
    return res.status(401).json({
      code: 401,
      message: 'No Admin Privileges',
    });
  }

  return next();
};

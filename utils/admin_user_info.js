const db = require('../models');

const admin = db['users'].findOne({ where: { isadmin: 1 } });

const branch = db['users'].findOne({ where: { isbranch: 1 } });

module.exports = { admin, branch };

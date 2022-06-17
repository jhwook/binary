var DataTypes = require("sequelize").DataTypes;
var __sample_created_updated = require("./_sample_created_updated");
var _balances = require("./balances");
var _bids = require("./bids");
var _logdeposit = require("./logdeposit");
var _logfeepayer = require("./logfeepayer");
var _loginhistories = require("./loginhistories");
var _logwithdraw = require("./logwithdraw");
var _referrals = require("./referrals");
var _users = require("./users");

function initModels(sequelize) {
  var _sample_created_updated = __sample_created_updated(sequelize, DataTypes);
  var balances = _balances(sequelize, DataTypes);
  var bids = _bids(sequelize, DataTypes);
  var logdeposit = _logdeposit(sequelize, DataTypes);
  var logfeepayer = _logfeepayer(sequelize, DataTypes);
  var loginhistories = _loginhistories(sequelize, DataTypes);
  var logwithdraw = _logwithdraw(sequelize, DataTypes);
  var referrals = _referrals(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);


  return {
    _sample_created_updated,
    balances,
    bids,
    logdeposit,
    logfeepayer,
    loginhistories,
    logwithdraw,
    referrals,
    users,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;

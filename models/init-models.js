var DataTypes = require("sequelize").DataTypes;
var __sample_created_updated = require("./_sample_created_updated");
var _assets = require("./assets");
var _balances = require("./balances");
var _bids = require("./bids");
var _bookmarks = require("./bookmarks");
var _country_code = require("./country_code");
var _logdeposit = require("./logdeposit");
var _logfeepayer = require("./logfeepayer");
var _loginhistories = require("./loginhistories");
var _referrals = require("./referrals");
var _settings = require("./settings");
var _transactions = require("./transactions");
var _users = require("./users");
var _userwallets = require("./userwallets");
var _verifycode = require("./verifycode");

function initModels(sequelize) {
  var _sample_created_updated = __sample_created_updated(sequelize, DataTypes);
  var assets = _assets(sequelize, DataTypes);
  var balances = _balances(sequelize, DataTypes);
  var bids = _bids(sequelize, DataTypes);
  var bookmarks = _bookmarks(sequelize, DataTypes);
  var country_code = _country_code(sequelize, DataTypes);
  var logdeposit = _logdeposit(sequelize, DataTypes);
  var logfeepayer = _logfeepayer(sequelize, DataTypes);
  var loginhistories = _loginhistories(sequelize, DataTypes);
  var referrals = _referrals(sequelize, DataTypes);
  var settings = _settings(sequelize, DataTypes);
  var transactions = _transactions(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);
  var userwallets = _userwallets(sequelize, DataTypes);
  var verifycode = _verifycode(sequelize, DataTypes);

  bookmarks.belongsTo(assets, { as: "asset", foreignKey: "assetsId"});
  assets.hasMany(bookmarks, { as: "bookmarks", foreignKey: "assetsId"});
  balances.belongsTo(users, { as: "uid_user", foreignKey: "uid"});
  users.hasMany(balances, { as: "balances", foreignKey: "uid"});
  bookmarks.belongsTo(users, { as: "uid_user", foreignKey: "uid"});
  users.hasMany(bookmarks, { as: "bookmarks", foreignKey: "uid"});
  referrals.belongsTo(users, { as: "referer_u", foreignKey: "referer_uid"});
  users.hasMany(referrals, { as: "referrals", foreignKey: "referer_uid"});
  referrals.belongsTo(users, { as: "referral_u", foreignKey: "referral_uid"});
  users.hasMany(referrals, { as: "referral_u_referrals", foreignKey: "referral_uid"});
  userwallets.belongsTo(users, { as: "uid_user", foreignKey: "uid"});
  users.hasMany(userwallets, { as: "userwallets", foreignKey: "uid"});

  return {
    _sample_created_updated,
    assets,
    balances,
    bids,
    bookmarks,
    country_code,
    logdeposit,
    logfeepayer,
    loginhistories,
    referrals,
    settings,
    transactions,
    users,
    userwallets,
    verifycode,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;

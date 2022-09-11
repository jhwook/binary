'use strict';
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename); // const env = 'production' // 'developmentDesktop20191004' //  //   // process.env.NODE_ENV ||
const config = require('../configs/dbconfig.json'); // ./apiServe // __dirname
// let config
const db = {};

let sequelize;

sequelize = new Sequelize('binopt', 'jhwook', '12344321', {
  dialect: 'mysql',
  allowPublicKeyRetrieval: true,
  logging: false,
  define: { freezeTableName: true, timestamps: false },
});

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db['bookmarks'].hasMany(db['users'], { foreignKey: 'id', sourceKey: 'uid' });
db['users'].belongsTo(db['bookmarks'], { foreignKey: 'id', targetKey: 'uid' });

db['bookmarks'].hasOne(db['assets'], {
  foreignKey: 'id',
  sourceKey: 'assetsId',
});
db['assets'].belongsTo(db['bookmarks'], {
  foreignKey: 'id',
  targetKey: 'assetsId',
});

db['bets'].hasOne(db['assets'], { foreignKey: 'id', sourceKey: 'assetId' });
db['assets'].belongsTo(db['bets'], { foreignKey: 'id', targetKey: 'assetId' });

db['betlogs'].hasOne(db['assets'], { foreignKey: 'id', sourceKey: 'assetId' });
db['assets'].belongsTo(db['betlogs'], {
  foreignKey: 'id',
  targetKey: 'assetId',
});

db['transactions'].hasOne(db['users'], { foreignKey: 'id', sourceKey: 'uid' });
db['users'].belongsTo(db['transactions'], {
  foreignKey: 'id',
  targetKey: 'uid',
});

db['users'].hasMany(db['transactions'], { foreignKey: 'uid', sourceKey: 'id' });
db['transactions'].belongsTo(db['users'], {
  foreignKey: 'uid',
  targetKey: 'id',
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

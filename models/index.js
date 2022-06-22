'use strict';
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename); // const env = 'production' // 'developmentDesktop20191004' //  //   // process.env.NODE_ENV ||
const env = process.env.NODE_ENV || 'development'; //test 'developmentpc' //  // 'development'// 'production' //
const config = require('../configs/dbconfig.json')[env]; // ./apiServe // __dirname
// let config
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], {
    ...config,
    logging: false,
  });
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
      ...config,
      dialect: 'mariadb',
      //    , port : '37375'
      dialectOptions: { timezone: 'Etc/GMT-9' },
      define: { timestamps: false },
      logging: false,
    }
    //  , define: {timestamps: false}
  );
}
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes)
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db['bookmarks'].hasMany(db['users'], {foreignKey:'id', sourceKey: 'uid'})
db['users'].belongsTo(db['bookmarks'], {foreignKey:'id', targetKey:'uid'})

db['bookmarks'].hasMany(db['assets'], {foreignKey:'id', sourceKey: 'assetsId'})
db['assets'].belongsTo(db['bookmarks'], {foreignKey:'id', targetKey:'assetsId'})


db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
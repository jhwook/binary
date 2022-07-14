/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('loginhistories', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    createdat: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.fn('current_timestamp')
    },
    updatedat: {
      type: DataTypes.DATE,
      allowNull: true
    },
    uid: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    ipaddress: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    deviceos: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    browser: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'loginhistories'
  });
};

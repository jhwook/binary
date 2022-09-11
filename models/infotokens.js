/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('infotokens', {
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
    name: {
      type: DataTypes.STRING(11),
      allowNull: true
    },
    decimals: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    },
    contractaddress: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    networkidnumber: {
      type: DataTypes.INTEGER(20).UNSIGNED,
      allowNull: true
    },
    nettype: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    uuid: {
      type: DataTypes.STRING(60),
      allowNull: true
    },
    networkurl: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    logourl: {
      type: DataTypes.STRING(500),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'infotokens'
  });
};

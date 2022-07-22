/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('feesettings', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
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
    key_: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    value_: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    subkey_: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    nettype: {
      type: DataTypes.STRING(60),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'feesettings'
  });
};

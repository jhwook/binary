/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('demoUsers', {
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
    uuid: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true
    },
    timestampunixstarttime: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    timestampunixexpiry: {
      type: DataTypes.BIGINT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'demoUsers'
  });
};

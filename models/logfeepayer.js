/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('logfeepayer', {
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
    branch_uid: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    amount: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'logfeepayer'
  });
};

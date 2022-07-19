/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('logfees', {
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
    payer_uid: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    recipient_uid: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    feeamount: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    typestr: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    betamount: {
      type: DataTypes.STRING(20),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'logfees'
  });
};

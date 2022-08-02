/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('logrounds', {
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
    assetId: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false
    },
    totalLowAmount: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    totalHighAmount: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    expiry: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    startingPrice: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    endPrice: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    uuid: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    lowDiffRate: {
      type: DataTypes.STRING(11),
      allowNull: true
    },
    highDiffRate: {
      type: DataTypes.STRING(11),
      allowNull: true
    },
    totalAmount: {
      type: DataTypes.BIGINT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'logrounds'
  });
};

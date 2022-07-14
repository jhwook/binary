/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('bets', {
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
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false
    },
    assetId: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false
    },
    amount: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    starting: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    expiry: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    startingPrice: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    side: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'bets'
  });
};

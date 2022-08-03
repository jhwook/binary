/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'tickers',
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER(11).UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      createdat: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.fn('current_timestamp'),
      },
      updatedat: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      assetId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING(40),
        allowNull: true,
      },
      symbol: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      periodPrice: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      expiryTime: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      startingTime: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'tickers',
    }
  );
};

/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'tickercandle',
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
      symbol: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      open: {
        type: DataTypes.STRING(40),
        allowNull: true,
      },
      close: {
        type: DataTypes.STRING(40),
        allowNull: true,
      },
      high: {
        type: DataTypes.STRING(40),
        allowNull: true,
      },
      low: {
        type: DataTypes.STRING(40),
        allowNull: true,
      },
      volume: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      assetId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'tickercandle',
    }
  );
};

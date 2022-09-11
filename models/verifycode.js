/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'verifycode',
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
      uid: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        allowNull: false,
      },
      code: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      expiry: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      type: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(60),
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING(60),
        allowNull: true,
      },
      countryNum: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'verifycode',
    }
  );
};

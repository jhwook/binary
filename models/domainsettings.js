/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'domainsettings',
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
      url: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      QRurl: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      active: {
        type: DataTypes.INTEGER(4),
        allowNull: true,
      },
      qrcode: {
        type: DataTypes.INTEGER(4),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'domainsettings',
    }
  );
};

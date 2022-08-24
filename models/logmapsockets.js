/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'logmapsockets',
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
      userid: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      useragent: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      ipaddress: {
        type: DataTypes.STRING(80),
        allowNull: true,
      },
      connectionkey: {
        type: DataTypes.STRING(80),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'logmapsockets',
    }
  );
};

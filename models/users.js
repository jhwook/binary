/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'users',
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
      email: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      countryNum: {
        type: DataTypes.STRING(11),
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      firstname: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      lastname: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      oauth_type: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      oauth_id: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      referercode: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: 'MD5(3)',
      },
      uuid: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      level: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: 0,
      },
      isadmin: {
        type: DataTypes.INTEGER(3).UNSIGNED,
        allowNull: true,
        defaultValue: 0,
      },
      isbranch: {
        type: DataTypes.INTEGER(1),
        allowNull: true,
        defaultValue: 0,
      },
      mailVerified: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: 0,
      },
      phoneVerified: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: 0,
      },
      active: {
        type: DataTypes.INTEGER(1),
        allowNull: true,
        defaultValue: 1,
      },
      password: {
        type: DataTypes.STRING(300),
        allowNull: true,
      },
      profileimage: {
        type: DataTypes.STRING(300),
        allowNull: true,
      },
      typestr: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: 'MAIN',
      },
      language: {
        type: DataTypes.INTEGER(4),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'users',
    }
  );
};

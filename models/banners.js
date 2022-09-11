/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'banners',
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
      startDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      type: {
        type: DataTypes.STRING(80),
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      writer_uid: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING(300),
        allowNull: true,
      },
      pc_imageurl: {
        type: DataTypes.STRING(300),
        allowNull: true,
      },
      mobile_imageurl: {
        type: DataTypes.STRING(300),
        allowNull: true,
      },
      active: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: 0,
      },
      exposure: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: 0,
      },
      exposure_position: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: 0,
      },
      isBanner: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: 1,
      },
      external_link: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'banners',
    }
  );
};

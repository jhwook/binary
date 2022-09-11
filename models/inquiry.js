/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'inquiry',
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
      content: {
        type: DataTypes.STRING(300),
        allowNull: true,
      },
      answer: {
        type: DataTypes.STRING(300),
        allowNull: true,
      },
      imageurl: {
        type: DataTypes.STRING(300),
        allowNull: true,
      },
      status: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: 0,
      },
      replier_uid: {
        type: DataTypes.INTEGER(10),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'inquiry',
    }
  );
};

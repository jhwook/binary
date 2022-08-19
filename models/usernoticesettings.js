/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'usernoticesettings',
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER(11).UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      uid: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        allowNull: true,
        references: {
          model: {
            tableName: 'users',
          },
          key: 'id',
        },
      },
      betend: {
        type: DataTypes.INTEGER(4),
        allowNull: true,
        defaultValue: 1,
      },
      orderrequest: {
        type: DataTypes.INTEGER(4),
        allowNull: true,
        defaultValue: 1,
      },
      emailnotice: {
        type: DataTypes.INTEGER(4),
        allowNull: true,
        defaultValue: 0,
      },
      latestnews: {
        type: DataTypes.INTEGER(4),
        allowNull: true,
      },
      questions: {
        type: DataTypes.INTEGER(4),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'usernoticesettings',
    }
  );
};

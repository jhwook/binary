/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'betlogs',
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
        allowNull: true,
        references: {
          model: {
            tableName: 'users',
          },
          key: 'id',
        },
      },
      assetId: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        allowNull: false,
        references: {
          model: {
            tableName: 'assets',
          },
          key: 'id',
        },
      },
      assetName: {
        type: DataTypes.STRING(40),
        allowNull: true,
      },
      amount: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      starting: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      expiry: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      startingPrice: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      endingPrice: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      side: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      type: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      status: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        allowNull: true,
      },
      betId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      diffRate: {
        type: DataTypes.STRING(11),
        allowNull: true,
      },
      uuid: {
        type: DataTypes.STRING(100),
        allowNull: true,
        references: {
          model: {
            tableName: 'demoUsers',
          },
          key: 'uuid',
        },
      },
    },
    {
      sequelize,
      tableName: 'betlogs',
    }
  );
};

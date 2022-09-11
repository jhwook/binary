/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'referrals',
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
      referer_uid: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        allowNull: false,
        references: {
          model: {
            tableName: 'users',
          },
          key: 'id',
        },
      },
      referral_uid: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        allowNull: false,
        references: {
          model: {
            tableName: 'users',
          },
          key: 'id',
        },
      },
      level: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      active: {
        type: DataTypes.INTEGER(1),
        allowNull: true,
      },
      isRefererBranch: {
        type: DataTypes.INTEGER(4).UNSIGNED,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'referrals',
    }
  );
};

/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('balances', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    uid: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: true,
      references: {
        model: {
          tableName: 'users',
        },
        key: 'id'
      }
    },
    total: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: 0
    },
    locked: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: 0
    },
    avail: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: 0
    },
    typestr: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    isMember: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    uuid: {
      type: DataTypes.STRING(100),
      allowNull: true,
      references: {
        model: {
          tableName: 'demoUsers',
        },
        key: 'uuid'
      }
    }
  }, {
    sequelize,
    tableName: 'balances'
  });
};

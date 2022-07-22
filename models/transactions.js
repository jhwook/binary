/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('transactions', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    createdat: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.fn('current_timestamp')
    },
    updatedat: {
      type: DataTypes.DATE,
      allowNull: true
    },
    uid: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      references: {
        model: {
          tableName: 'users',
        },
        key: 'id'
      }
    },
    amount: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    unit: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    type: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    typestr: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER(3),
      allowNull: true
    },
    verifier: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    target_uid: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: true
    },
    txhash: {
      type: DataTypes.STRING(300),
      allowNull: true,
      unique: true
    },
    localeAmount: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    localeUnit: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    cardNum: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    bankCode: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    bankName: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    checked: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'transactions'
  });
};

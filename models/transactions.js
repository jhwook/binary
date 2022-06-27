const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('transactions', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    createdat: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    updatedat: {
      type: DataTypes.DATE,
      allowNull: true
    },
    uid: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
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
      type: DataTypes.INTEGER,
      allowNull: true
    },
    typestr: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    verifier: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    target_uid: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    txhash: {
      type: DataTypes.STRING(300),
      allowNull: true
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
    }
  }, {
    sequelize,
    tableName: 'transactions',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};

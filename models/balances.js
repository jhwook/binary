const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('balances', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    uid: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
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
    }
  }, {
    sequelize,
    tableName: 'balances',
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
      {
        name: "FK_users_uid",
        using: "BTREE",
        fields: [
          { name: "uid" },
        ]
      },
    ]
  });
};

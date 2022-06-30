const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('bets', {
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
    assetId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    amount: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true
    },
    starting: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    expiry: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    startingPrice: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    side: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'bets',
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

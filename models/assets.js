const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('assets', {
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
    name: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    symbol: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    baseAsset: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    targetAsset: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    tickerSrc: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    group: {
      type: DataTypes.STRING(40),
      allowNull: true,
      comment: "1: crypto, 2:forex, 3:stock"
    },
    groupstr: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    uuid: {
      type: DataTypes.STRING(60),
      allowNull: true
    },
    imgurl: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    dispSymbol: {
      type: DataTypes.STRING(20),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'assets',
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

const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('betlogs', {
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
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    assetId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'assets',
        key: 'id'
      }
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
    endingPrice: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    side: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    betId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'betlogs',
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
        name: "FK_betlog_uid",
        using: "BTREE",
        fields: [
          { name: "uid" },
        ]
      },
      {
        name: "FK_betlog_assetId",
        using: "BTREE",
        fields: [
          { name: "assetId" },
        ]
      },
    ]
  });
};

const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users', {
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
    email: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    firstname: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    lastname: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    oauth_type: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    oauth_id: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    referercode: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: "MD5(3)"
    },
    uuid: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    isadmin: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    isbranch: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    isverified: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1
    },
    password: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    profileimage: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    typestr: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: "MAIN"
    }
  }, {
    sequelize,
    tableName: 'users',
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

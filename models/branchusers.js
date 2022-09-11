/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('branchusers', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
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
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    bankName: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    bankAccount: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    walletAddress: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    typestr: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    active: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    uuid: {
      type: DataTypes.STRING(60),
      allowNull: true
    },
    myreferercode: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    referercode: {
      type: DataTypes.STRING(60),
      allowNull: true
    },
    rootuserid: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'branchusers'
  });
};

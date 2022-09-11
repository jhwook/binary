/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('userwallets', {
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
    walletaddress: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    privatekey: {
      type: DataTypes.STRING(300),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'userwallets'
  });
};

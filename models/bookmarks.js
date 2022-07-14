/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('bookmarks', {
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
      allowNull: true,
      references: {
        model: {
          tableName: 'users',
        },
        key: 'id'
      }
    },
    assetsId: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: true,
      references: {
        model: {
          tableName: 'assets',
        },
        key: 'id'
      }
    },
    active: {
      type: DataTypes.INTEGER(1),
      allowNull: true
    },
    typestr: {
      type: DataTypes.STRING(40),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'bookmarks'
  });
};

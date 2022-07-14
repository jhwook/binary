/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('betlogs', {
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
    assetId: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      references: {
        model: {
          tableName: 'assets',
        },
        key: 'id'
      }
    },
    amount: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    starting: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    expiry: {
      type: DataTypes.BIGINT,
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
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: true
    },
    betId: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'betlogs'
  });
};

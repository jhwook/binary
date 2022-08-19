/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('logdaily', {
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
    sumbets: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    sumbetswinside: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    sumbetsloseside: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    sumfeeadmin: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    sumfeebranch: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    sumfeeuser: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    countbets: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    },
    countbetshigh: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    },
    countbetslow: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    },
    sumdeposits: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    sumwithdraws: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    countdeposits: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    },
    countwithdraws: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    },
    datestr: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    starttimeunix: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    endtimeunix: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    nettype: {
      type: DataTypes.STRING(60),
      allowNull: true
    },
    active: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'logdaily'
  });
};

/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'levelsettings',
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      createdat: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.fn('current_timestamp'),
      },
      updatedat: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      levelstr: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      level: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      basepoint: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        allowNull: true,
      },
      imgurl: {
        type: DataTypes.STRING(300),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'levelsettings',
    }
  );
};

// insert into levelsettings (levelstr, level, basepoint) values ('BRONZE', 0, 10);
// insert into levelsettings (levelstr, level, basepoint) values ('SILVER', 1, 30);
// insert into levelsettings (levelstr, level, basepoint) values ('GOLD', 2, 50);
// insert into levelsettings (levelstr, level, basepoint) values ('DIAMOND', 3, 100);

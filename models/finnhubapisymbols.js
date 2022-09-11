module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'finnhubapisymbols',
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER(11).UNSIGNED,
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
      symbol: {
        type: DataTypes.STRING(60),
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      vendorname: {
        type: DataTypes.STRING(60),
        allowNull: true,
      },
      assetkind: {
        type: DataTypes.STRING(60),
        allowNull: true,
      },
      exchanges: {
        type: DataTypes.STRING(60),
        allowNull: true,
      },
      active: {
        type: DataTypes.INTEGER(4),
        allowNull: true,
        defaultValue: 1,
      },
      baseAsset: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      targetAsset: {
        type: DataTypes.STRING(20),
        allowNull: true,
      }
    },
    {
      sequelize,
      tableName: 'finnhubapisymbols',
    }
  );
};

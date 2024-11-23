const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize("AuthAppBee", "postgres", "123456", {
  host: "localhost",
  dialect: "postgres",
});

const User = sequelize.define(
  "User",
  {
    email: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.STRING,
    },
    phone: {
      type: DataTypes.STRING,
    },
    age: {
      type: DataTypes.INTEGER,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "user",
    timestamps: false,
  }
);

module.exports = {
  sequelize,
  User,
};

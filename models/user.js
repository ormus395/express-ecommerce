const { Sequelize, DataTypes } = require("sequelize");
const database = require("../util/database");

const User = database.define("user", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: DataTypes.STRING,
  email: DataTypes.STRING,
  password: DataTypes.STRING,
  passwordResetToken: DataTypes.STRING,
  tokenExp: DataTypes.DATE,
});

module.exports = User;

const { Sequelize, Model, DataTypes } = require("sequelize");
const database = require("../util/database");

const Product = database.define("product", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },

  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  price: {
    type: DataTypes.DOUBLE,
    allowNull: false,
  },

  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Product;

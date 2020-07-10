const Sequelize = require("sequelize");
const database = require("../util/database");

const Cart = database.define("cart", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
});

module.exports = Cart;

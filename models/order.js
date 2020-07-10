const Sequelize = require("sequelize");
const database = require("../util/database");

const Order = database.define("order", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
});

module.exports = Order;

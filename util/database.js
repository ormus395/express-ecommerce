const Sequelize = require("sequelize");
const keys = require("../keys/db");

const sequelize = new Sequelize("node_complete", keys.username, keys.password, {
  dialect: "mysql",
  host: "localhost",
});

module.exports = sequelize;

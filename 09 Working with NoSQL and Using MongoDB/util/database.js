// Connecting to the database using Sequelize

const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("node_complete", "root", "MySQL@123456789", {
  // database, username, password
  dialect: "mysql", // database type
  host: "localhost", // host of the database
});

module.exports = sequelize;

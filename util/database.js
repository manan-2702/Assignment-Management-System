const Sequilize = require("sequelize");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
console.log(process.env.PASSWORD);
const sequilize = new Sequilize(
  process.env.DATABASENAME,
  process.env.ROOT,
  process.env.PASSWORD,
  {
    dialect: "mysql",
    host: process.env.HOST,
  }
);

module.exports = sequilize;

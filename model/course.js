const Sequilize = require("sequelize");

const sequelize = require("../util/database.js");

const Course = sequelize.define("course", {
  id: {
    type: Sequilize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: Sequilize.STRING,
    allowNull: false,
  },
  number: {
    type: Sequilize.INTEGER,
    allowNull: false,
    unique: true,
  },
});

module.exports = Course;

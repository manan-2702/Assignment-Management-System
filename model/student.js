const Sequilize = require("sequelize");

const sequelize = require("../util/database.js");

const Student = sequelize.define("student", {
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
  email: {
    type: Sequilize.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: Sequilize.STRING,
    allowNull: false,
  },
});

module.exports = Student;

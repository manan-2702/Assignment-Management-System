const Sequilize = require("sequelize");

const sequelize = require("../util/database.js");

const Assignment = sequelize.define("assignment", {
  id: {
    type: Sequilize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  assignment_path: {
    type: Sequilize.STRING,
    allowNull: false,
  },
  assignment_name: {
    type: Sequilize.STRING,
    allowNull: false,
  },
  points: {
    type: Sequilize.INTEGER,
    allowNull: false,
  },
  dueDate: {
    type: Sequilize.DATE,
    allowNull: false,
  },
});

module.exports = Assignment;

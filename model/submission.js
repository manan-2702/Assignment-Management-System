const Sequilize = require("sequelize");

const sequelize = require("../util/database.js");

const Submission = sequelize.define("submission", {
  id: {
    type: Sequilize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  file_path: {
    type: Sequilize.STRING,
    allowNull: false,
  },
  points: {
    type: Sequilize.INTEGER,
    allowNull: false,
  },
  submissionDate: {
    type: Sequilize.DATE,
    allowNull: false,
  },
});

module.exports = Submission;

const Sequilize = require("sequelize");

const sequelize = require("../util/database.js");

const Enrollment = sequelize.define("enrollment", {
  id: {
    type: Sequilize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
});

module.exports = Enrollment;

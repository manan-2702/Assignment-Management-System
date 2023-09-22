const Sequilize = require("sequelize");

const sequilize = require("../util/database");

const Faculty = sequilize.define("faculty", {
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

module.exports = Faculty;

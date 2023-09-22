const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const secret = process.env.JWT_SECRET;

const authenticate = async (req, res, next) => {
  const token = req.body.token || req.query.token || req.headers.authorization;
  if (!token) {
    res.status(400).send({
      status: "failed",
      msg: "Token not found",
    });
  } else {
    try {
      const decode = jwt.verify(token, secret);
      req.user = decode;
    } catch (error) {
      res.status(400).send({
        status: "failed",
        msg: "Invalid Token",
      });
    }
    return next();
  }
};

module.exports = authenticate;

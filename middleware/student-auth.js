const studentAuth = async (req, res, next) => {
  const role = req.body.role;
  if (!role) {
    res.status(400).send({
      status: "failed",
      msg: "Role not found",
    });
  } else {
    if (role !== "student") {
      res.status(400).send({
        status: "failed",
        msg: "Not a student",
      });
    }
    next();
  }
};

module.exports = studentAuth;

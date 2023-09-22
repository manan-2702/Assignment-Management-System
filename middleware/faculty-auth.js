const facultyAuth = async (req, res, next) => {
  const role = req.body.role;
  if (!role) {
    res.status(400).send({
      status: "failed",
      msg: "Role not found",
    });
  } else {
    if (role !== "faculty") {
      res.status(400).send({
        status: "failed",
        msg: "Not a faculty",
      });
    }
    next();
  }
};

module.exports = facultyAuth;

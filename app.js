const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const sequelize = require("./util/database");
const multer = require("multer");

const studentRoute = require("./routes/student");
const facultyRoute = require("./routes/faculty");

const Faculty = require("./model/faculty");
const Course = require("./model/course");
const Student = require("./model/student");
const Enrollment = require("./model/enrollment");
const Submission = require("./model/submission");
const Assignment = require("./model/assignment");

dotenv.config();

const app = express();
const PORT = process.env.PORT || process.env.NODE_DOCKER_PORT || 8000;

// const fileStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "./assignments/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, new Date().getTime() + "-" + file.originalname);
//   },
// });

// const fileFilter1 = (req, file, cb) => {
//   if (
//     file.mimetype === "assignment/pdf" ||
//     file.mimetype === "assignment/doc" ||
//     file.mimetype === "assignment/xlsx"
//   ) {
//     cb(null, true);
//   } else {
//     cb(null, false);
//   }
// };

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// app.use(multer().array());
// console.log(req);
// app.use(
//   multer({ storage: fileStorage, fileFilter: fileFilter1 }).single("assignment")
// );

// app.use(
//   multer({
//     dest: "assignments/",
//     filename: new Date().getTime() + "-" + req.file,
//   }).single("assignment")
// );

// app.use("/assignments", express.static(path.join(__dirname, "assignments")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/student", studentRoute);
app.use("/faculty", facultyRoute);

//Course Model
Course.belongsTo(Faculty, {
  foreignKey: "faculty_id",
  onDelete: "CASCADE",
  constraints: true,
});
Faculty.hasMany(Course, { foreignKey: "faculty_id" });
Course.hasMany(Enrollment, { foreignKey: "course_id" });

//Enrollment Model
Enrollment.belongsTo(Student, {
  foreignKey: "student_id",
  onDelete: "CASCADE",
  constraints: true,
});
Enrollment.belongsTo(Course, {
  foreignKey: "course_id",
  onDelete: "CASCADE",
  constraints: true,
});

//Assignment Model
Assignment.belongsTo(Course, {
  foreignKey: "course_id",
  onDelete: "CASCADE",
  constraints: true,
});
Assignment.hasMany(Submission, { foreignKey: "assignment_id" });

//Submission Model
Submission.belongsTo(Assignment, {
  foreignKey: "assignment_id",
  onDelete: "CASCADE",
  constraints: true,
});
Submission.belongsTo(Student, {
  foreignKey: "student_id",
  onDelete: "CASCADE",
  constraints: true,
});

sequelize
  .sync()
  .then((result) => {
    console.log(result[0]);
    app.listen(3000 || PORT, () => {
      console.log("Server Started");
    });
  })
  .catch((err) => {
    console.log(err);
  });

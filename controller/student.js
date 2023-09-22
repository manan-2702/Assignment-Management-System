const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Student = require("../model/student");
const Course = require("../model/course");
const Enrollment = require("../model/enrollment");
const bcrypt = require("bcryptjs");
const Assignment = require("../model/assignment");
const Submission = require("../model/submission");

exports.studentSignup = async (req, res) => {
  const { name, email, password } = req.body;
  if (name && email && password) {
    const user = await Student.findOne({ where: { email: email } });
    if (user) {
      res.status(500).send({ status: "failed", msg: "Email already exists" });
    } else {
      // const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, 10);
      try {
        const user = await Student.create({
          name: name,
          email: email,
          password: hashedPassword,
        });
        res.status(200).json(user.toJSON());
      } catch (err) {
        res.status(500).send({ status: "failed", msg: "Unable to register" });
      }
    }
  } else {
    res.status(500).send({ status: "failed", msg: "All fields are required" });
  }
};

exports.studentLogin = async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  if (email && password) {
    try {
      const user = await Student.findOne({ where: { email: email } });
      if (user != null) {
        const check = await bcrypt.compare(password, user.password);
        if (check) {
          const token = jwt.sign(
            { studentId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
          );
          res.send({ status: "success", data: { user }, token: token });
        } else {
          res.status(500).send({
            status: "failed",
            msg: "Email or Password is not valid",
          });
        }
      } else {
        res.status(500).send({
          status: "failed",
          msg: "Email or Password is not valid",
        });
      }
    } catch (err) {
      console.log(err);
    }
  } else {
    res.status(500).send({
      status: "failed",
      msg: "Enter all the feilds",
    });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll();
    res.status(200).json({
      status: "success",
      msg: "Courses found successfully",
      data: courses,
    });
  } catch (error) {
    res.status(500).send({
      status: "failed",
      msg: "Unable to find the courses",
    });
  }
};

exports.postEnrollInCourse = async (req, res) => {
  const { id, c_id } = req.body;
  if (id && c_id) {
    const student = await Student.findOne({ where: { id: id } });
    const course = await Course.findOne({ where: { id: c_id } });
    if (student && course) {
      const enrollExists = await Enrollment.findOne({
        where: { course_id: c_id, student_id: id },
      });
      if (enrollExists) {
        res.status(500).send({
          status: "failed",
          msg: "Already Enrolled in the course",
        });
      } else {
        try {
          const enrollment = await Enrollment.create({
            course_id: c_id,
            student_id: id,
          });
          res.status(200).json({
            status: "success",
            msg: "Enrollment successfully",
            data: enrollment.toJSON(),
          });
        } catch (error) {
          console.log(error);
          res.status(500).send({
            status: "failed",
            msg: "Unable to enroll",
          });
        }
      }
    } else {
      res.status(500).send({
        status: "failed",
        msg: "Student or course doesn't exists",
      });
    }
  } else {
    res.status(500).send({
      status: "failed",
      msg: "student id and course id not found",
    });
  }
};

exports.getEnrolledCourses = async (req, res) => {
  const { id } = req.body;
  if (id) {
    const student = await Student.findOne({ where: { id: id } });
    if (student) {
      try {
        const enrollment = await Enrollment.findAll({
          where: { student_id: id },
        });
        res.status(200).json({
          status: "success",
          msg: "Courses found successfully",
          data: enrollment,
        });
      } catch (error) {
        res.status(500).send({
          status: "failed",
          msg: "Unable to find the courses",
        });
      }
    } else {
      res.status(500).send({
        status: "failed",
        msg: "Student doesn't exists",
      });
    }
  } else {
    res.status(500).send({
      status: "failed",
      msg: "student id not found",
    });
  }
};

exports.getAssignments = async (req, res) => {
  const { id } = req.body;
  if (id) {
    const course = await Course.findOne({ where: { id: id } });
    if (course) {
      try {
        const assignments = await Assignment.findAll({
          where: { course_id: id },
        });
        res.status(200).json({
          status: "success",
          msg: "Assignments found successfully",
          data: assignments,
        });
      } catch (error) {}
    } else {
      res.status(500).send({
        status: "failed",
        msg: "Course not found",
      });
    }
  } else {
    res.status(500).send({
      status: "failed",
      msg: "Course id not found",
    });
  }
};

exports.getAssignmentDetail = async (req, res) => {
  const { id } = req.body;
  if (id) {
    try {
      const assignment = await Assignment.findOne({ where: { id: id } });
      if (assignment) {
        res.status(200).json({
          status: "success",
          msg: "Assignment detail found successfully",
          data: assignment,
        });
      } else {
        res.status(500).send({
          status: "failed",
          msg: "Assignment not found",
        });
      }
    } catch (error) {}
  } else {
    res.status(500).send({
      status: "failed",
      msg: "Assignment id not found",
    });
  }
};

exports.postSubmitAssignment = async (req, res) => {
  const { a_id, submissionDate, s_id } = req.body;
  const oldSubmission = await Submission.findOne({
    where: { student_id: s_id, assignment_id: a_id },
  });
  if (!oldSubmission) {
    const assignment_path = req.file.path;
    if (a_id && submissionDate && s_id && assignment_path) {
      const student = await Student.findOne({ where: { id: s_id } });
      const assignment = await Assignment.findOne({ where: { id: a_id } });
      if (student && assignment) {
        try {
          const submission = await Submission.create({
            file_path: assignment_path,
            submissionDate: submissionDate,
            points: 0,
            assignment_id: a_id,
            student_id: s_id,
          });
          res.status(200).json({
            status: "success",
            msg: "Assignment Submission successfully",
            data: submission.toJSON(),
          });
        } catch (error) {
          res.status(500).send({
            status: "failed",
            msg: "Unable to submit",
          });
        }
      }
    } else {
      res.status(500).send({
        status: "failed",
        msg: "Details not found",
      });
    }
  } else {
    res.status(500).send({
      status: "failed",
      msg: "Assignment already submitted once",
    });
  }
};

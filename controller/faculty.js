const jwt = require("jsonwebtoken");
const Faculty = require("../model/faculty");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const Course = require("../model/course");
const Assignment = require("../model/assignment");
const Submission = require("../model/submission");
const fileHelper = require("../util/file");
const Enrollment = require("../model/enrollment");
const Student = require("../model/student");
const dotenv = require("dotenv");
const e = require("cors");

// const redis = require("redis");

// redisClient.on("error", (err) => console.log("Redis Client Error", err));
// redisClient.connect();

dotenv.config({ path: "./.env" });
dotenv.config({ path: "./.env" });
const redis = require("redis");
const redisClient = redis.createClient();
redisClient.connect();
redisClient.on("connect", (err) => {
  console.log("connected to redis");
});

nodemailer.createTestAccount((err, account) => {
  if (err) {
    console.error("Failed to create a testing account. " + err.message);
    return process.exit(1);
  }
});

const transporter = nodemailer.createTransport({
  host: process.env.NODEMAILERHOST,
  port: 587,
  auth: {
    user: process.env.NODEMAILERUSER,
    pass: process.env.NODEMAILERPASS,
  },
});

exports.facultySignup = async (req, res) => {
  const { name, email, password } = req.body;
  if (name && email && password) {
    const user = await Faculty.findOne({ where: { email: email } });
    if (user) {
      res.status(500).send({ status: "failed", msg: "Email already exists" });
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      try {
        const user = await Faculty.create({
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

exports.facultyLogin = async (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    try {
      const user = await Faculty.findOne({ where: { email: email } });
      if (user != null) {
        const check = await bcrypt.compare(password, user.password);
        if (check) {
          const token = jwt.sign(
            { faculty_Id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
          );
          res.send({
            status: "success",
            data: { user },
            user: "faculty",
            token: token,
          });
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

exports.postCreateCourse = async (req, res) => {
  const { name, number, f_id } = req.body;
  if (name && number && f_id) {
    const course = await Course.findOne({ where: { number: number } });
    if (course != null) {
      res.status(500).send({
        status: "failed",
        msg: "Course already exists",
      });
    } else {
      try {
        const course = await Course.create({
          name: name,
          number: number,
          faculty_id: f_id,
        });
        res.status(200).json({
          status: "success",
          msg: "Course created successfully",
          data: course.toJSON(),
        });
      } catch (err) {
        res
          .status(500)
          .send({ status: "failed", msg: "Unable to register course" });
      }
    }
  } else {
    res.status(500).send({
      status: "failed",
      msg: "Incomplete details",
    });
  }
};

exports.getCourses = async (req, res) => {
  const { id } = req.body;
  if (id) {
    const faculty = await Faculty.findOne({ where: { id: id } });
    if (faculty) {
      try {
        const courses = await Course.findAll({ where: { faculty_id: id } });
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
    } else {
      res.status(500).send({
        status: "failed",
        msg: "Faculty doesn't exists",
      });
    }
  } else {
    res.status(500).send({
      status: "failed",
      msg: "faculty id not found",
    });
  }
};

exports.patchUpdateCourse = async (req, res) => {
  const { id, name, number } = req.body;
  if (id && name && number) {
    const course = await Course.findOne({ where: { id: id } });
    if (course) {
      try {
        course.set({
          name: name,
          number: number,
        });
        await course.save();
        res.status(200).json({
          status: "success",
          msg: "Course updated successfully",
          data: course.toJSON(),
        });
      } catch (err) {
        res
          .status(500)
          .send({ status: "failed", msg: "Unable to update course" });
      }
    } else {
      res.status(500).send({
        status: "failed",
        msg: "Course not found",
      });
    }
  } else {
    res.status(500).send({
      status: "failed",
      msg: "Course details missing",
    });
  }
};

exports.deleteCourse = async (req, res) => {
  const { id } = req.body;
  if (id) {
    const course = await Course.findOne({ where: { id: id } });
    if (course) {
      try {
        await course.destroy();
        res.status(200).json({
          status: "success",
          msg: "Course deleted successfully",
        });
      } catch (err) {
        res
          .status(500)
          .send({ status: "failed", msg: "Unable to delete course" });
      }
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

exports.getEnrolledStudents = async (req, res) => {
  const { student_ids } = req.body;
  if (student_ids) {
    try {
      const students = await Student.findAll({ where: { id: student_ids } });
      res.status(200).json({
        status: "success",
        msg: "Enrolled Students found successfully",
        data: students,
      });
    } catch (error) {
      res.status(500).send({
        status: "failed",
        msg: "Unable to get enrolled students",
      });
    }
  } else {
    res.status(500).send({
      status: "failed",
      msg: "Student ids missing",
    });
  }
};

exports.postCreateAssignment = async (req, res, next) => {
  const { assignment_name, points, dueDate, c_id } = req.body;
  const assignment_path = req.file.path;
  // console.log(assignment_path);
  if (assignment_name && assignment_path && points && dueDate && c_id) {
    const course = await Course.findByPk(c_id);
    if (course) {
      try {
        const assignment = await Assignment.create({
          assignment_name: assignment_name,
          assignment_path: assignment_path,
          points: points,
          dueDate: dueDate,
          course_id: c_id,
        });
        const enrollment = await Enrollment.findAll({
          where: { course_id: c_id },
        });
        const student_id = enrollment.map(
          (enrollment) => enrollment.student_id
        );
        // console.log(student_id);
        const student_data = await Student.findAll({
          where: { id: student_id },
        });
        const student_email = student_data.map(
          (student_data) => student_data.email
        );
        const student_name = student_data.map(
          (student_data) => student_data.name
        );
        // console.log(student_email);
        for (var i = 0; i < student_email.length; i++) {
          transporter.sendMail({
            from: "Classroom",
            to: student_email[i],
            subject: "New Assignment Added !!!",
            html: `
          <p>Hi ${student_name[i]},</p>

          <p>You have new assignment available for your ${course.name}</p>
          <p>Due date for the assignment is ${dueDate}. Submit it before the</p>
          <p>due date.</p>

          <p>Assignment Link-> <a href="http://localhost:3000/student/submit-assignment">link</a></p>

          <p>Best of Luck !!!</p>

          <p>Regards,</p>
          <p></>Team Classroom Assignment</p>
          `,
          });
        }
        let keyname = JSON.stringify(req.body);
        let getCacheData = await redisClient.get(keyname);
        if (getCacheData) {
          console.log("getting cached data");
          let responseArray = JSON.parse(getCacheData);
          res.status(200).json({
            status: "success",
            msg: "Assignment created successfully",
            data: responseArray,
          });
        } else {
          // console.log("setting cache data");
          redisClient.set(keyname, JSON.stringify(assignment));
          res.status(200).json({
            status: "success",
            msg: "Assignment created successfully",
            data: assignment.toJSON(),
          });
        }
      } catch (error) {
        console.log(error);
        res.status(500).send({
          status: "failed",
          msg: "Unable to add assignment",
        });
      }
    } else {
      res.status(500).send({
        status: "failed",
        msg: "Course not found",
      });
    }
  } else {
    res.status(500).send({
      status: "failed",
      msg: "Input data missing",
    });
  }
};

exports.patchUpdateAssignment = async (req, res) => {
  const { id, assignment_name, points, dueDate } = req.body;
  const assignment_path = req.file.path;
  if (id && assignment_name && assignment_path && points && dueDate) {
    const assignment = await Assignment.findByPk(id);
    if (assignment) {
      try {
        if (assignment.assignment_path) {
          fileHelper.deleteFile(assignment.assignment_path);
        }
        assignment.set({
          assignment_name: assignment_name,
          assignment_path: assignment_path,
          points: points,
          dueDate: dueDate,
        });
        await assignment.save();
        let keyname = JSON.stringify(req.body);
        redisClient.set(keyname, JSON.stringify(assignment));
        res.status(200).json({
          status: "success",
          msg: "Assignment updated successfully",
          data: assignment.toJSON(),
        });
      } catch (error) {
        console.log(error);
        res.status(500).send({
          status: "failed",
          msg: "Unable to update assignment",
        });
      }
    } else {
      res.status(500).send({
        status: "failed",
        msg: "Assignment not found",
      });
    }
  } else {
    res.status(500).send({
      status: "failed",
      msg: "Input data missing",
    });
  }
};

exports.getCourseAssignments = async (req, res) => {
  const { id } = req.body;
  if (id) {
    const course = await Course.findByPk(id);
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
      } catch (error) {
        res.status(500).send({
          status: "failed",
          msg: "Unable to find the assignments",
        });
      }
    } else {
      res.status(500).send({
        status: "failed",
        msg: "Course doesn't exists",
      });
    }
  } else {
    res.status(500).send({
      status: "failed",
      msg: "course id not found",
    });
  }
};

exports.deleteAssignment = async (req, res) => {
  const { id } = req.body;
  if (id) {
    const assignment = await Assignment.findByPk(id);
    if (assignment) {
      try {
        if (assignment.assignment_path) {
          fileHelper.deleteFile(assignment.assignment_path);
        }
        await assignment.destroy();
        res.status(200).json({
          status: "success",
          msg: "Assignment deleted successfully",
        });
      } catch (err) {
        res
          .status(500)
          .send({ status: "failed", msg: "Unable to delete assignment" });
      }
    } else {
      res.status(500).send({
        status: "failed",
        msg: "Assignment not found",
      });
    }
  } else {
    res.status(500).send({
      status: "failed",
      msg: "Assignment id not found",
    });
  }
};

exports.getSubmissions = async (req, res) => {
  const { id } = req.body;
  if (id) {
    const assignment = await Assignment.findByPk(id);
    if (assignment) {
      try {
        const submissions = await Submission.findAll({
          where: { assignment_id: id },
        });
        res.status(200).json({
          status: "success",
          msg: "Submitted assignments found successfully",
          data: submissions,
        });
      } catch (error) {
        res.status(500).send({
          status: "failed",
          msg: "Unable to find Submitted assignments",
        });
      }
    } else {
      res.status(500).send({
        status: "failed",
        msg: "Assignment not found",
      });
    }
  } else {
    res.status(500).send({
      status: "failed",
      msg: "Assignment id not found",
    });
  }
};

exports.getSubmissionsBySubmissionDate = async (req, res) => {
  const { id } = req.body;
  if (id) {
    const assignment = await Assignment.findByPk(id);
    if (assignment) {
      try {
        const submissions = await Submission.findAll({
          where: { assignment_id: id },
          order: [["submissionDate", "ASC"]],
        });
        res.status(200).json({
          status: "success",
          msg: "Submitted assignments found successfully",
          data: submissions,
        });
      } catch (error) {
        res.status(500).send({
          status: "failed",
          msg: "Unable to find Submitted assignments",
        });
      }
    } else {
      res.status(500).send({
        status: "failed",
        msg: "Assignment not found",
      });
    }
  } else {
    res.status(500).send({
      status: "failed",
      msg: "Assignment id not found",
    });
  }
};

exports.getSubmissionsByPoints = async (req, res) => {
  const { id } = req.body;
  if (id) {
    const assignment = await Assignment.findByPk(id);
    if (assignment) {
      try {
        const submissions = await Submission.findAll({
          where: { assignment_id: id },
          order: [["points", "DESC"]],
        });
        res.status(200).json({
          status: "success",
          msg: "Submitted assignments found successfully",
          data: submissions,
        });
      } catch (error) {
        res.status(500).send({
          status: "failed",
          msg: "Unable to find Submitted assignments",
        });
      }
    } else {
      res.status(500).send({
        status: "failed",
        msg: "Assignment not found",
      });
    }
  } else {
    res.status(500).send({
      status: "failed",
      msg: "Assignment id not found",
    });
  }
};

exports.patchAssignSubmissionPoints = async (req, res) => {
  const { id, points } = req.body;
  if (id && points) {
    const submission = await Submission.findByPk(id);
    if (submission) {
      try {
        submission.set({
          points: points,
        });
        await submission.save();
        res.status(200).json({
          status: "success",
          msg: "Points assigned successfully",
          data: submission,
        });
      } catch (error) {
        res.status(500).send({
          status: "failed",
          msg: "unable to assign points",
        });
      }
    } else {
      res.status(500).send({
        status: "failed",
        msg: "Submitted assignment not found",
      });
    }
  } else {
    res.status(500).send({
      status: "failed",
      msg: "Submission id not found",
    });
  }
};

exports.getStudentReport = async (req, res) => {
  const { id, s_id } = req.body;
  if (id) {
    const assignments = await Assignment.findAll({ where: { id: id } });
    if (assignments) {
      try {
        const submissions = await Submission.findAll({
          where: { student_id: s_id },
        });
        res.status(200).json({
          status: "success",
          msg: "Submitted assignments found successfully",
          data: submissions,
        });
      } catch (error) {
        res.status(500).send({
          status: "failed",
          msg: "Unable to find Submitted assignments",
        });
      }
    } else {
      res.status(500).send({
        status: "failed",
        msg: "Assignment not found",
      });
    }
  } else {
    res.status(500).send({
      status: "failed",
      msg: "Assignment id not found",
    });
  }
};

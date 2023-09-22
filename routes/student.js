const express = require("express");
const multer = require("multer");

const studentController = require("../controller/student");
const authenticate = require("../middleware/auth");
const studentAuth = require("../middleware/student-auth");
const router = express.Router();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "assignments/");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getTime() + "-" + file.originalname);
  },
});
const upload = multer({
  storage: fileStorage,
});

router.post("/signup", studentController.studentSignup);

router.post("/login", studentController.studentLogin);

router.get(
  "/get-all-courses",
  studentAuth,
  authenticate,
  studentController.getAllCourses
);

router.get(
  "/get-enrolled-courses",
  studentAuth,
  authenticate,
  studentController.getEnrolledCourses
);

router.post(
  "/enroll-in-course",
  studentAuth,
  authenticate,
  studentController.postEnrollInCourse
);

router.get(
  "/assignments",
  studentAuth,
  authenticate,
  studentController.getAssignments
);

router.get(
  "/assignment-details",
  studentAuth,
  authenticate,
  studentController.getAssignmentDetail
);

router.post(
  "/submit-assignment",
  upload.single("assignment"),
  studentAuth,
  authenticate,
  studentController.postSubmitAssignment
);

module.exports = router;

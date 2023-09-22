const express = require("express");
const multer = require("multer");

const facultyController = require("../controller/faculty");
const router = express.Router();
const authenticate = require("../middleware/auth");
const facultyAuth = require("../middleware/faculty-auth");

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

router.post("/signup", facultyController.facultySignup);

router.post("/login", facultyController.facultyLogin);

router.get("/courses", facultyAuth, authenticate, facultyController.getCourses);

router.post(
  "/create-course",
  facultyAuth,
  authenticate,
  facultyController.postCreateCourse
);

router.patch(
  "/update-course/:id", // course id
  facultyAuth,
  authenticate,
  facultyController.patchUpdateCourse
);

router.delete(
  "/delete-course",
  facultyAuth,
  authenticate,
  facultyController.deleteCourse
);

router.get(
  "/get-enrolled-students",
  facultyAuth,
  authenticate,
  facultyController.getEnrolledStudents
);

router.post(
  "/create-assignment",
  upload.single("assignment"),
  facultyAuth,
  authenticate,
  facultyController.postCreateAssignment
);

router.patch(
  "/update-assignment/:id", //assignment
  upload.single("assignment"),
  facultyAuth,
  authenticate,
  facultyController.patchUpdateAssignment
);

router.get(
  "/get-assignments",
  facultyAuth,
  authenticate,
  facultyController.getCourseAssignments
);

router.delete(
  "/delete-assignment",
  facultyAuth,
  authenticate,
  facultyController.deleteAssignment
);

router.get(
  "/get-submissions/:id", //assignment id
  facultyAuth,
  authenticate,
  facultyController.getSubmissions
);

router.get(
  "/get-submissions-subDate/:id", //assignment id
  facultyAuth,
  authenticate,
  facultyController.getSubmissionsBySubmissionDate
);

router.get(
  "/get-submissions-points/:id", //assignment id
  facultyAuth,
  authenticate,
  facultyController.getSubmissionsByPoints
);

router.patch(
  "/assign-points/:id", //assignment id
  facultyAuth,
  authenticate,
  facultyController.patchAssignSubmissionPoints
);

router.get(
  "/get-submissions-report/:id", //student id
  facultyAuth,
  authenticate,
  facultyController.getStudentReport
);

module.exports = router;

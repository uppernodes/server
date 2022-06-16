import express from "express";
const router = express.Router();

import { nanoid } from "nanoid";

import {
  get,
  create,
  update,
  getCourseById,
  getCoursesByInstructorId,
  deleteCourse,
  uploadImage,
  deleteImage,
  uploadVideo,
  deleteVideo,
  addLesson
} from "../controller/course";

router.post("/create", create);
router.put("/:slug", update)
router.get("/:slug", get);


router.post("/lesson/:slug/:instructorId", addLesson);

router.post("/upload-image", uploadImage);
router.post("/delete-image", deleteImage);

router.post("/upload-video/:instructorId", uploadVideo);
router.post("/delete-video", deleteVideo);

router.get("/course/:_id", getCourseById);
router.get("/courses/instructor", getCoursesByInstructorId);

router.delete("/:id", deleteCourse); // delete course (the _id of the request must be equal of the course.creator._id)

export default router;

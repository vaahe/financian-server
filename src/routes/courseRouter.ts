import express from 'express';
import { createCourse, deleteCourse, getCourseById, getCourses, updateCourse } from '../controllers/courseController';
import { uploadFiles } from '../middlewares/uploadMiddleware';

const router = express.Router();

router.get('/', getCourses);
router.post('/', uploadFiles, createCourse);

router.get('/:id', getCourseById);
router.patch(':id', updateCourse);
router.delete('/:id', deleteCourse);

export default router;
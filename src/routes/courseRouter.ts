import express from 'express';

import { uploadFiles } from '../middlewares/uploadMiddleware';
import { createCourse, deleteCourse, getCourseById, getCourses, updateCourse } from '../controllers/courseController';
import { validateCreateCourse, validateDeleteCourse, validateGetCourse, validateUpdateCourse } from '../middlewares/validations/courseValidation';

const router = express.Router();

router.get('/', getCourses);
router.post('/', uploadFiles, validateCreateCourse, createCourse);

router.get('/:id', validateGetCourse, getCourseById);
router.patch(':id', validateUpdateCourse, updateCourse);
router.delete('/:id', validateDeleteCourse, deleteCourse);

export default router;
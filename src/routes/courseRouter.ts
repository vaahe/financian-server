import express from 'express';

import { uploadFiles } from '../middlewares/uploadMiddleware';
import { createCourse, deleteCourse, getCourseById, getCourses, updateCourse } from '../controllers/courseController';
import { validateCreateCourse, validateDeleteCourse, validateGetCourse, validateUpdateCourse } from '../middlewares/validations/courseValidation';
import { authMiddleware, checkAdmin } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(authMiddleware);
router.get('/', getCourses);
router.get('/:id', validateGetCourse, getCourseById);

router.use(checkAdmin);
router.post('/', uploadFiles, validateCreateCourse, createCourse);
router.patch(':id', validateUpdateCourse, updateCourse);
router.delete('/:id', validateDeleteCourse, deleteCourse);

export default router;
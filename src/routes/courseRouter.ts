import express from 'express';

import { uploadFiles } from '../middlewares/uploadMiddleware';
import { createCourse, deleteCourse, getCourseById, getCourseByUserId, getCourses, updateCourse } from '../controllers/courseController';
import { validateCreateCourse, validateDeleteCourse } from '../middlewares/validations/courseValidation';
import { authMiddleware, checkAdmin } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/', getCourses);
router.get('/:id', getCourseById);
router.get('/user/:userId', authMiddleware, getCourseByUserId);

router.use(checkAdmin);
router.post('/', uploadFiles, validateCreateCourse, createCourse);
router.patch('/:id', uploadFiles, updateCourse);
router.delete('/:id', validateDeleteCourse, deleteCourse);

export default router;
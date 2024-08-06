import { Router } from "express";
import { createComment, deleteComment, getCommentsByCourseId, updateComment } from "../controllers/commentsController";
import { validateCreateComment, validateDeleteComment, validateUpdateComment } from "../middlewares/validations/commentValidation";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.get('/:courseId', getCommentsByCourseId);

router.use(authMiddleware);
router.post('/', validateCreateComment, createComment);
router.put('/:id', validateUpdateComment, updateComment);
router.delete('/:id', validateDeleteComment, deleteComment);

export default router;
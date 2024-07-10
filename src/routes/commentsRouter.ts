import { Router } from "express";
import { createComment, deleteComment, updateComment } from "../controllers/commentsController";
import { validateCreateComment, validateDeleteComment, validateUpdateComment } from "../middlewares/validations/commentValidation";

const router = Router();

router.post('/', validateCreateComment, createComment);
router.put('/:id', validateUpdateComment, updateComment);
router.delete('/:id', validateDeleteComment, deleteComment);

export default router;
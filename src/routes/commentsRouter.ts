import { Router } from "express";
import { createComment, deleteComment, updateComment } from "../controllers/commentsController";

const router = Router();

router.post('/', createComment);
router.put('/:id', updateComment);
router.delete('/:id', deleteComment);

export default router;
import { deleteUser, getUser, getUsers, updateUser } from "../controllers/userController";
import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { uploadFiles } from "../middlewares/uploadMiddleware";
import { validateDeleteUser } from "../middlewares/validations/userValidation";

const router: Router = Router();

router.get('/', getUsers);
router.delete('/:id', validateDeleteUser, deleteUser);
router.patch('/:id', uploadFiles, updateUser);

router.get('/me', authMiddleware, getUser);

export default router;
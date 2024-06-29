import { createUser, deleteUser, getUser, getUsers, updateUser } from "../controllers/userController";
import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { uploadFiles } from "../middlewares/uploadMiddleware";

const router: Router = Router();

router.get('/', getUsers);
router.post('/', createUser);
router.delete('/:id', deleteUser);
router.patch('/:id', uploadFiles, updateUser);

router.use(authMiddleware);
router.get('/me', getUser);

export default router;
import { createUser, deleteUser, getUser, getUsers, updateUser } from "../controllers/userController";
import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { uploadFiles } from "../middlewares/uploadMiddleware";
import { validateDeleteUser, validateUpdateUser } from "../middlewares/validations/userValidation";

const router: Router = Router();

router.get('/', getUsers);
// router.post('/', validateCreateUser, createUser);
router.delete('/:id', validateDeleteUser, deleteUser);
router.patch('/:id', validateUpdateUser, uploadFiles, updateUser);

router.use(authMiddleware);
router.get('/me', getUser);

export default router;
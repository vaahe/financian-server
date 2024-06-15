import { createUser, deleteUser, getUser, getUsers, updateUser } from "../controllers/userController";
import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";

const router: Router = Router();

router.get('/', getUsers);
router.post('/', createUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

router.use(authMiddleware);
router.get('/me', getUser);

export default router;
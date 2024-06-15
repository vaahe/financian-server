import { Router } from "express";
import { refreshToken } from "../controllers/refreshController";

const router: Router = Router();

router.post('/', refreshToken);

export default router;
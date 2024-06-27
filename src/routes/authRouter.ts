import { Router } from "express";
import { logOut, signIn, signUp, verify } from "../controllers/authController";
import rateLimit from "express-rate-limit";
import { authMiddleware } from "../middlewares/authMiddleware";

const router: Router = Router();

const loginRateLimit = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100,
    message: 'Too many login attempts. Please try again later.',
});

router.post('/logout', authMiddleware, logOut);
router.post('/signin', loginRateLimit, signIn);
router.post('/signup', signUp);
router.post('/verify', verify);

export default router;
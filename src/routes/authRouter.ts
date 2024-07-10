import { Router } from "express";

import { validate } from "../middlewares/validationMiddleware";
import { authMiddleware } from "../middlewares/authMiddleware";
import { logOut, signIn, signUp, verify } from "../controllers/authController";
import { loginRateLimit, validateSignIn, validateSignUp, validateVerify } from "../middlewares/validations/authValidation";

const router: Router = Router();

router.post('/signup', validateSignUp, signUp);
router.post('/signin', validateSignIn, loginRateLimit, signIn);

router.post('/verify', validateVerify, verify);
router.post('/logout', authMiddleware, logOut);

export default router;
import { Router } from "express";

import { authMiddleware } from "../middlewares/authMiddleware";
import { logOut, refreshToken, requestVerification, signIn, signUp, verify } from "../controllers/authController";
import { loginRateLimit, validateSignIn, validateSignUp, validateVerify } from "../middlewares/validations/authValidation";

const router: Router = Router();

router.post('/signup', validateSignUp, signUp);
router.post('/verify', validateVerify, verify);
router.post('/signin', validateSignIn, loginRateLimit, signIn);
router.post('/logout', authMiddleware, logOut);
router.post('/refresh', authMiddleware, refreshToken);
router.post('/request-verification', requestVerification);

export default router;
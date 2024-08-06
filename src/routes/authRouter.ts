import passport from 'passport';
import { Router } from "express";

import { authMiddleware } from "../middlewares/authMiddleware";
import { googleAuth, logOut, refreshToken, requestVerification, signIn, signUp, verify } from "../controllers/authController";
import { loginRateLimit, validateSignIn, validateSignUp, validateVerify } from "../middlewares/validations/authValidation";

const router: Router = Router();

router.post('/signup', validateSignUp, signUp);
router.post('/verify', validateVerify, verify);
router.post('/signin', validateSignIn, loginRateLimit, signIn);
router.post('/logout', logOut);
router.post('/refresh', refreshToken);
router.post('/request-verification', authMiddleware, requestVerification);


router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: 'http://localhost:3000/signin'
}), googleAuth);


export default router;
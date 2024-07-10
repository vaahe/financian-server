import Joi from "joi";
import rateLimit from "express-rate-limit";
import { validate } from "../validationMiddleware";

const passwordSchema = Joi.string()
    .min(8)
    .pattern(new RegExp('(?=.*[A-Z])'))
    .pattern(new RegExp('(?=.*[0-9])'))
    .pattern(new RegExp('(?=.*[!@#$%^&*])'))
    .required();

const signInSchema = Joi.object({
    email: Joi.string().email().required(),
    password: passwordSchema
});

const signUpSchema = Joi.object({
    email: Joi.string().email().required(),
    password: passwordSchema,
    repeatPassword: Joi.ref('password')
});

const verifySchema = Joi.object({
    email: Joi.string().email().required(),
    verificationCode: Joi.string().required()
});

export const loginRateLimit = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100,
    message: 'Too many login attempts. Please try again later.',
});

export const validateVerify = validate(verifySchema);
export const validateSignIn = validate(signInSchema);
export const validateSignUp = validate(signUpSchema);
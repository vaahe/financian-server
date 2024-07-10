import Joi from 'joi';
import { validate } from '../validationMiddleware';

const createUserSchema = Joi.object({
    fullName: Joi.string().optional(),
    imageUrl: Joi.string().optional(),
    phoneNumber: Joi.string().optional(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
});

const getUserSchema = Joi.object({
    userId: Joi.string().uuid().required()
});

const updateUserSchema = Joi.object({
    id: Joi.string().uuid().required(),
    imageUrl: Joi.string().optional(),
    fullName: Joi.string().optional(),
    phoneNumber: Joi.string().optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().min(6).optional(),
});

const deleteUserSchema = Joi.object({
    id: Joi.string().uuid().required()
});

export const validateGetUser = validate(getUserSchema);
export const validateCreateUser = validate(createUserSchema);
export const validateUpdateUser = validate(updateUserSchema);
export const validateDeleteUser = validate(deleteUserSchema);
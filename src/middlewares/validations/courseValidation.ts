import Joi from 'joi';
import { validate } from '../validationMiddleware';

const getCourseSchema = Joi.object({
    id: Joi.string().uuid().required()
});

const createCourseSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().required(),
    rating: Joi.number().min(0).max(5).required(),
    category: Joi.string().required(),
    duration: Joi.number().integer().required(),
    videoCount: Joi.number().integer().required(),
    updatedAt: Joi.date().optional(),
    comments: Joi.string().optional(), // JSON string
    orders: Joi.string().optional(),   // JSON string
    videos: Joi.string().optional(),   // JSON string
});

const updateCourseSchema = Joi.object({
    id: Joi.string().uuid().required(),
    title: Joi.string().optional(),
    description: Joi.string().optional(),
    price: Joi.number().optional(),
    rating: Joi.number().min(0).max(5).optional(),
    category: Joi.string().optional(),
    duration: Joi.number().integer().optional(),
    videoCount: Joi.number().integer().optional(),
    updatedAt: Joi.date().optional(),
    comments: Joi.string().optional(), // JSON string
    orders: Joi.string().optional(),   // JSON string
});

const deleteCourseSchema = Joi.object({
    id: Joi.string().uuid().required()
});

export const validateGetCourse = validate(getCourseSchema);
export const validateDeleteCourse = validate(deleteCourseSchema);
export const validateCreateCourse = validate(createCourseSchema);
export const validateUpdateCourse = validate(updateCourseSchema);
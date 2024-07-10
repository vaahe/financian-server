import Joi from 'joi';
import { validate } from '../validationMiddleware';

const createCommentSchema = Joi.object({
    content: Joi.string().required(),
    courseId: Joi.string().uuid().required(),
    authorId: Joi.string().uuid().required()
});

const updateCommentSchema = Joi.object({
    id: Joi.string().uuid().required(),
    content: Joi.string().required()
});

const deleteCommentSchema = Joi.object({
    id: Joi.string().uuid().required()
});


export const validateCreateComment = validate(createCommentSchema);
export const validateUpdateComment = validate(updateCommentSchema);
export const validateDeleteComment = validate(deleteCommentSchema);
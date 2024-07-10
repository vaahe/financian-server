import Joi from "joi";
import { validate } from "../validationMiddleware";

const createIntentSchema = Joi.object({
    userId: Joi.string().uuid().required(),
    courseId: Joi.string().uuid().required(),
    name: Joi.string().required(),
    price: Joi.number().min(0).required()
});

const createOrderSchema = Joi.object({
    userId: Joi.string().uuid().required(),
    courseId: Joi.string().required()
});

export const validateCreateOrder = validate(createOrderSchema);
export const validateCreateIntent = validate(createIntentSchema);
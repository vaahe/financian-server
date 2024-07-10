import { Router } from "express";
import { createOrder, createPaymentIntent } from "../controllers/paymentController";
import { validateCreateIntent, validateCreateOrder } from "../middlewares/validations/paymentValidation";

const router = Router();

router.post('/', validateCreateIntent, createPaymentIntent);
router.post('/order', validateCreateOrder, createOrder);
// router.post('/webhook', stripeWebHook);

export default router;
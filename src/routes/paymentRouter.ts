import { Router } from "express";
import { validateCreateIntent, validateCreateOrder } from "../middlewares/validations/paymentValidation";
import { capturePaypalOrder, createOrder, createPaymentIntent, createPaypalOrder } from "../controllers/paymentController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.use(authMiddleware);
router.post('/stripe', validateCreateIntent, createPaymentIntent);
router.post('/stripe/order', validateCreateOrder, createOrder);
// router.post('/webhook', stripeWebHook);

router.post('/paypal/create-order', createPaypalOrder);
router.post('/paypal/capture-order', capturePaypalOrder);

export default router;
import { Router } from "express";
import { createOrder, createPaymentIntent } from "../controllers/paymentController";

const router = Router();

router.post('/', createPaymentIntent);
router.post('/order', createOrder);
// router.post('/webhook', stripeWebHook);

export default router;
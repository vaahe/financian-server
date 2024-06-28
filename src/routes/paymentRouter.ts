import { Router } from "express";
import { createPaymentIntent, stripeWebHook } from "../controllers/paymentController";

const router = Router();

router.post('/', createPaymentIntent);
router.post('/webhook', stripeWebHook);

export default router;
import { Request, Response } from "express";
import Stripe from "stripe";
import { PrismaClient } from "../prisma/generated/client";

const prisma = new PrismaClient;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20'
});

export const createPaymentIntent = async (req: Request, res: Response) => {
    const { courseId, userId } = req.body;

    if (!courseId || !userId) {
        return res.status(400).json({ message: "Bad request. Check CourseID or UserId" });
    }

    try {
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!course || !user) {
            return res.status(400).json({ message: "Invalid course or user" });
        }

        console.log(course);
        const amountInCents = Math.round(course.price * 100); // Convert to cents

        if (amountInCents < 50) {
            return res.status(400).json({ message: "Amount must be at least $0.50" });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'usd',
            metadata: { userId, courseId },
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'never'
            }
        });

        await prisma.order.create({
            data: { userId, courseId }
        });

        return res.status(200).json({ paymentIntentId: paymentIntent.id, clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error(error);

        if (error instanceof Stripe.errors.StripeError) {
            return res.status(500).json({ message: error.message });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const stripeWebHook = async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: `Webhook error: ${error}` });
    }

    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { userId, courseId } = paymentIntent.metadata;

        try {
            await prisma.order.create({
                data: { userId, courseId }
            });
        } catch (error) {
            console.error("Error creating order: ", error);
        }
    }

    return res.status(200).json({ received: true });
}
import Stripe from "stripe";
import { Request, Response } from "express";
import { PrismaClient } from "../../prisma/generated/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20'
});

const prisma = new PrismaClient();

export const createPaymentIntent = async (req: Request, res: Response) => {
    const { userId, courseId, name, price } = req.body;

    console.log({ userId, courseId, name, price });

    try {
        // const user = await prisma.user.findUnique({ where: { id: userId } });
        // if (!user) {
        //     return res.status(404).json({ message: "User not found." });
        // }

        // const course = await prisma.course.findUnique({ where: { id: courseId } });
        // if (!course) {
        //     return res.status(404).json({ message: "Course not found." });
        // }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: price * 100,
            currency: 'usd',
            payment_method_types: ['card'],
            metadata: { userId, courseId },
        });

        // const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

        // Send verification code to user's email
        // const user = await prisma.user.findUnique({ where: { id: userId } });
        // if (user) {
        //     await sendVerificationCode(user.email, verificationCode);
        // } else {
        //     return res.status(404).json({ message: "User not found." });
        // }

        return res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const createOrder = async (req: Request, res: Response) => {
    try {
        const { userId, courseId } = req.body;

        const createdOrder = await prisma.order.create({
            data: {
                userId,
                courseId,
            },
        });

        return res.json({ message: 'Order created successfully', order: createdOrder });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to create order' });
    }
};
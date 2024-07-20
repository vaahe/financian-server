import { NextFunction, Request, Response } from 'express';
import { client } from '../../config/paypalConfig';
import * as paypal from '@paypal/checkout-server-sdk';
import { PrismaClient } from '../../prisma/generated/client';

const prisma = new PrismaClient();

export const createPaypalOrder = async (req: Request, res: Response, next: NextFunction) => {
    const { courseId } = req.body;

    try {
        const course = await prisma.course.findUnique({ where: { id: courseId } });

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'USD',
                    value: course.price.toString(),
                    breakdown: {
                        item_total: {
                            currency_code: 'USD',
                            value: course.price.toString()
                        },
                        shipping: {
                            currency_code: 'USD',
                            value: '0.00' // Optional: Include shipping cost if applicable
                        },
                        handling: {
                            currency_code: 'USD',
                            value: '0.00' // Optional: Include handling cost if applicable
                        },
                        tax_total: {
                            currency_code: 'USD',
                            value: '0.00' // Optional: Include tax if applicable
                        },
                        insurance: {
                            currency_code: 'USD',
                            value: '0.00' // Optional: Include insurance cost if applicable
                        },
                        shipping_discount: {
                            currency_code: 'USD',
                            value: '0.00' // Optional: Include shipping discount if applicable
                        },
                        discount: {
                            currency_code: 'USD',
                            value: '0.00' // Optional: Include discount if applicable
                        }
                    }
                },
                items: [
                    {
                        name: 'Item 1',
                        unit_amount: {
                            currency_code: 'USD',
                            value: course.price.toString()
                        },
                        quantity: '1',
                        category: 'DIGITAL_GOODS'
                    }
                ]
            }]
        });

        const orderResponse = await client().execute(request);
        return res.status(201).json({ paypalOrderId: orderResponse.result.id });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const capturePaypalOrder = async (req: Request, res: Response) => {
    const { orderId, courseId, userId } = req.body;
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    // request.requestBody({
    //     payment_source: ''
    // });

    try {
        const capture = await client().execute(request);

        if (capture.result.status !== 'COMPLETED') {
            return res.status(400).json({ message: "Payment not completed" });
        }

        const order = await prisma.order.create({ data: { userId, courseId } });

        return res.status(200).json({ order, capture: capture.result });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
import nodemailer from 'nodemailer';
import redis from '../redis/redisClient';

export const generateVerificationCode = (): string => {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

export const setVerificationCode = async (email: string, code: string): Promise<void> => {
    const key = `verificationCode:${email}`;
    const expirationTime = 3600; // 1 hour in seconds
    console.log(key, code);
    try {
        await redis.set(key, code, {
            EX: expirationTime
        });
    } catch (error) {
        console.error(error);
        throw new Error('Internal server error');
    }
}

export const getVerificationCode = async (email: string): Promise<string | null> => {
    const key = `verificationCode:${email}`;

    try {
        const value = await redis.get(key);
        console.log(`Retrieving key: ${key}, Value: ${value}`);
        return value;
    } catch (error) {
        console.error(error);
        throw new Error('Internal server error');
    }
}

export const deleteVerificationCode = async (email: string): Promise<void> => {
    const key = `verificationCode:${email}`;

    try {
        const result = await redis.del(key);

        if (result === 0) {
            console.warn(`No verification code found for email: ${email}`);
        } else {
            console.log(`Verification code for ${email} deleted successfully`);
        }
    } catch (error) {
        console.error(error);
        throw new Error("Internal server error");
    }
}

export const sendEmail = async (to: string, subject: string, text: string) => {
    let mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text
    };

    await transporter.sendMail(mailOptions);
};

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendPaymentVerificationCode = async (email: string, code: string) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verification Code for Card Details',
            text: `Your verification code is ${code}. Use this code to complete your transaction.`,
        });

        console.log('Verification code email sent to:', email);
    } catch (error) {
        console.error('Error sending verification code email:', error);
        throw new Error('Could not send verification code email');
    }
}
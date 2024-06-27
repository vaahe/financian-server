import nodemailer from 'nodemailer';
import redis from '../redis/redisClient';

export const generateVerificationCode = (): string => {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

export const setVerificationCode = async (email: string, code: string): Promise<void> => {
    const key = `verificationCode:${email}`;
    const expirationTime = 3600; // 1 hour in seconds

    try {
        await redis.set(key, code, 'EX', expirationTime);
    } catch (error) {
        console.error(error);
        throw new Error('Internal server error');
    }
}

export const getVerificationCode = async (email: string): Promise<string | null> => {
    const key = `verificaitonCode:${email}`;

    try {
        const value = await redis.get(key);
        return value;
    } catch (error) {
        console.error(error);
        throw new Error('Internal server error');
    }

}


export const sendEmail = async (to: string, subject: string, text: string) => {
    let transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
    });

    let mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text
    };

    await transporter.sendMail(mailOptions);
};
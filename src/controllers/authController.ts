import { NextFunction, Request, Response } from "express";
import * as bcrypt from 'bcrypt';
import { PrismaClient } from "../prisma/generated/client";

import { generateAccessToken, generateRefreshToken } from "../utils/jwtUtils";
import { generateVerificationCode, getVerificationCode, setVerificationCode, sendEmail, deleteVerificationCode } from "../config/mailConfig";

const prisma = new PrismaClient();

const verifyPassword = async (inputPassword: string, storedHash: string): Promise<boolean> => {
    return bcrypt.compare(inputPassword, storedHash);
};

const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

export const signIn = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordValid = await verifyPassword(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 30 * 60 * 1000
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 1 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({ message: 'Login successful' })
    } catch (error) {
        console.error('Error during sign-in:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const signUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password, repeatPassword } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        if (password !== repeatPassword) {
            return res.status(404).json({
                message: 'Passwords don\'t match'
            });
        }

        const verificationCode = generateVerificationCode();
        await setVerificationCode(email, verificationCode);
        await sendEmail(email, "Verification code", `Your verification code is ${verificationCode}`);

        const hashedPassword = await hashPassword(password);

        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                fullName: '',
                imageUrl: '',
                phoneNumber: '',
                isVerified: false
            }
        });

        return res.status(200).json({ message: `Verification code is sent to ${email}. Please verify.` });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const logOut = async (req: Request, res: Response) => {
    try {
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        });

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        });

        return res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const verify = async (req: Request, res: Response) => {
    try {
        const { email, verificationCode } = req.body;

        if (!email || !verificationCode) {
            return res.status(400).json({ message: 'Email and verification code are required' });
        }

        const code = await getVerificationCode(email);

        if (!code || code !== verificationCode) {
            return res.status(403).json({ message: 'Invalid or expired verification code' });
        }

        await prisma.user.update({
            where: { email },
            data: { isVerified: true }
        });

        await deleteVerificationCode(email);

        return res.status(200).json({ message: 'User verified successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
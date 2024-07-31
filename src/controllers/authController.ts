import { NextFunction, Request, Response } from "express";

import { PrismaClient } from "../prisma/generated/client";
import { hashPassword, verifyPassword } from '../utils/authUtils';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwtUtils";
import { generateVerificationCode, getVerificationCode, setVerificationCode, sendEmail, deleteVerificationCode } from "../config/mailConfig";

const prisma = new PrismaClient();

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

        return res.status(200).json({ message: 'Login successful', id: user.id })
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

export const requestVerification = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (!existingUser) {
            return res.status(404).json({ message: 'User doesn\'t exists.' });
        }

        if (existingUser.isVerified) {
            return res.status(409).json({ message: 'Email is verified already.' });
        }

        const verificationCode = generateVerificationCode();
        await setVerificationCode(email, verificationCode);
        await sendEmail(email, "Verification code", `Your verification code is ${verificationCode}`);

        return res.status(200).json({ message: `Verification code is sent to ${email}. Please verify.` });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const refreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
        return res.status(401).json({ message: "Unauthorized: No refresh token provided" });
    }

    const decodedToken = verifyRefreshToken(refreshToken);

    if (!decodedToken) {
        return res.status(403).json({ message: "Forbidden: Invalid refresh token" });
    }

    const user = await prisma.user.findUnique({ where: { id: decodedToken.userId } });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const newAccessToken = generateAccessToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 60 * 1000
    });

    res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({ message: "Tokens refreshed" });
}

export const googleAuth = async (req: any, res: Response) => {
    const { id } = req.user;

    try {
        const user = await prisma.user.findUnique({
            where: { id }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
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

        res.redirect(`http://localhost:3000/auth/callback?token=${accessToken}`);
        // return res.status(200).json({ user });
    } catch (error) {
        res.status(403).json({ message: 'Forbidden: Invalid access token' });
    }
};
import { Request, Response } from "express";
import * as bcrypt from 'bcrypt';
import { PrismaClient } from "../prisma/generated/client";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../utils/jwtUtils";

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

export const signUp = async (req: Request, res: Response) => {
    try {
        const { email, password, repeatPassword } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });

        if (user) {
            return res.status(404).json({ message: 'User already exists' });
        }

        if (password !== repeatPassword) {
            return res.status(404).json({
                message: 'Passwords don\'t match'
            });
        }

        const hashedPassword = await hashPassword(password);
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                fullName: '',
                imageUrl: '',
                phoneNumber: ''
            }
        });

        return res.status(200).json({ message: 'Register successful', user: newUser });
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
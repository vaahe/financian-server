import * as bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from "express";

import { TUser } from '../types';
import { PrismaClient } from '../prisma/generated/client';

const prisma: PrismaClient = new PrismaClient();

const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

const userExists = async (id: string): Promise<boolean> => {
    const user = await prisma.user.findUnique({ where: { id } });
    return Boolean(user);
}

export const createUser = async (req: Request, res: Response) => {
    try {
        const { fullName, email, password, phoneNumber, imageUrl } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const hashedPassword = await hashPassword(password);
        const newUser: TUser = await prisma.user.create({
            data: {
                fullName, email, password: hashedPassword, phoneNumber, imageUrl
            }
        });

        return res.status(200).json({ user: newUser });
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

type DecodedToken = {
    userId: string,
    iat: number,
    exp: number,
};

interface GetUserRequest extends Request {
    user?: DecodedToken
}

export const getUser = async (req: GetUserRequest, res: Response, next: NextFunction) => {
    const userId: any = req?.user?.userId;

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users: TUser[] = await prisma.user.findMany();

        return res.status(200).json({ users });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const existingUser = await userExists(id);
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        await prisma.user.delete({ where: { id } });

        return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const updateUser = async (req: Request, res: Response) => {
    const { id } = req.params;

    console.log(id);
    try {
        const existingUser = await userExists(id);
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newData = req.body;

        let hashedPassword;
        if (newData.password) {
            const { password } = newData;
            hashedPassword = await hashPassword(password);
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { ...newData, password: hashedPassword }
        });

        return res.status(200).json({ updatedUser });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
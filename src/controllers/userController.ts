import { NextFunction, Request, Response } from "express";
import { hashPassword, userExists } from '../utils/userUtils';
import { User, PrismaClient } from '../prisma/generated/client';
import { verifyAccessToken } from "../utils/jwtUtils";

declare module 'express-serve-static-core' {
    interface Request {
        newUser?: User;
    }
}

type TUser = User;
type DecodedToken = {
    userId: string,
    iat: number,
    exp: number,
};

const prisma: PrismaClient = new PrismaClient();

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fullName, imageUrl, phoneNumber, email, password, } = req.body;
        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const hashedPassword = await hashPassword(password);
        const newUser: TUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                fullName: fullName || "",
                imageUrl: imageUrl || "",
                phoneNumber: phoneNumber || "",
                isVerified: false,
            }
        });

        req.newUser = newUser;
        next();
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

interface GetUserRequest extends Request {
    user?: DecodedToken
}

export const getUser = async (req: GetUserRequest, res: Response, next: NextFunction) => {
    const { accessToken } = req.cookies;

    try {
        const decodedToken = verifyAccessToken(accessToken);
        const userId = decodedToken?.userId;

        console.log({ decodedToken, userId });

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

    try {
        const existingUser = await userExists(id);

        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newData = req.body;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const avatar = files && files['avatar'] ? files['avatar'][0] : null;

        let hashedPassword;

        if (newData.password) {
            const { password } = newData;
            hashedPassword = await hashPassword(password);
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                ...newData,
                imageUrl: avatar && avatar.filename,
                password: hashedPassword
            }
        });

        return res.status(200).json({ updatedUser });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}